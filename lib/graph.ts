import type {
  OrgInfo,
  LicenseSku,
  Subscription,
  UserStats,
  DeviceStats,
  SecureScore,
  DeviceComplianceCounts,
  DevicePlatformCounts,
} from "./types"
import { getSkuDisplayName } from "./skuNames"

const GRAPH_V1 = "https://graph.microsoft.com/v1.0"
const GRAPH_BETA = "https://graph.microsoft.com/beta"

// ─── Core fetch helper ──────────────────────────────────────────────────────

interface GraphError extends Error {
  status: number
  code?: string
}

async function graphFetch(
  url: string,
  token: string,
  options: { beta?: boolean; eventual?: boolean } = {}
): Promise<unknown> {
  const base = options.beta ? GRAPH_BETA : GRAPH_V1
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
  if (options.eventual) {
    headers["ConsistencyLevel"] = "eventual"
  }

  const res = await fetch(fullUrl, { headers, cache: "no-store" })

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = (await res.json()) as { error?: { message?: string; code?: string } }
      message = body.error?.message ?? message
      const err = Object.assign(new Error(message), {
        status: res.status,
        code: body.error?.code,
      }) as GraphError
      throw err
    } catch (e) {
      if ((e as GraphError).status) throw e
      throw Object.assign(new Error(message), { status: res.status }) as GraphError
    }
  }

  return res.json()
}

// Returns null + logs if 403/insufficient perms; re-throws other errors
async function safeGraphFetch<T>(
  url: string,
  token: string,
  options?: { beta?: boolean; eventual?: boolean }
): Promise<T | null> {
  try {
    return (await graphFetch(url, token, options)) as T
  } catch (err: unknown) {
    const e = err as GraphError
    if (e.status === 403 || e.status === 401) {
      console.warn(`[Graph] Permission denied for ${url}: ${e.message}`)
      return null
    }
    throw err
  }
}

// ─── Paginate through @odata.nextLink ───────────────────────────────────────

async function paginateAll<T>(
  startUrl: string,
  token: string,
  options?: { beta?: boolean; eventual?: boolean }
): Promise<T[]> {
  const results: T[] = []
  let url: string | null = startUrl

  while (url) {
    const data = (await graphFetch(url, token, options)) as {
      value: T[]
      "@odata.nextLink"?: string
    }
    results.push(...(data.value ?? []))
    url = data["@odata.nextLink"] ?? null
  }

  return results
}

// ─── Organization ────────────────────────────────────────────────────────────

export async function getOrganization(token: string): Promise<OrgInfo> {
  const data = (await graphFetch(
    "/organization?$select=displayName,verifiedDomains,createdDateTime",
    token
  )) as { value: Array<{
    displayName: string
    verifiedDomains: Array<{ name: string; isDefault: boolean; type: string }>
    createdDateTime: string
  }> }

  const org = data.value[0]
  if (!org) throw new Error("No organization data returned")

  const domains = org.verifiedDomains
    .filter((d) => d.type === "Managed" || d.isDefault)
    .map((d) => d.name)

  const defaultDomain =
    org.verifiedDomains.find((d) => d.isDefault)?.name ?? domains[0] ?? ""

  return {
    displayName: org.displayName,
    domains,
    defaultDomain,
    createdDateTime: org.createdDateTime,
  }
}

// ─── Licenses ────────────────────────────────────────────────────────────────

export async function getSubscribedSkus(token: string): Promise<LicenseSku[]> {
  const data = (await graphFetch(
    "/subscribedSkus?$select=skuId,skuPartNumber,capabilityStatus,consumedUnits,prepaidUnits,appliesTo",
    token
  )) as { value: Array<{
    skuId: string
    skuPartNumber: string
    capabilityStatus: string
    consumedUnits: number
    prepaidUnits: { enabled: number; warning: number; suspended: number; lockedOut: number }
    appliesTo: string
  }> }

  return data.value
    .filter((sku) => sku.appliesTo === "User" || sku.appliesTo === "Company")
    .map((sku) => {
      const purchased = sku.prepaidUnits.enabled + sku.prepaidUnits.warning
      return {
        skuId: sku.skuId,
        skuPartNumber: sku.skuPartNumber,
        displayName: getSkuDisplayName(sku.skuPartNumber),
        purchasedUnits: purchased,
        consumedUnits: sku.consumedUnits,
        availableUnits: Math.max(0, purchased - sku.consumedUnits),
        warningUnits: sku.prepaidUnits.warning,
        suspendedUnits: sku.prepaidUnits.suspended,
        capabilityStatus: sku.capabilityStatus as LicenseSku["capabilityStatus"],
        appliesTo: sku.appliesTo,
      }
    })
    .sort((a, b) => b.purchasedUnits - a.purchasedUnits)
}

// ─── Subscriptions (expiration dates, beta API) ──────────────────────────────

export async function getSubscriptions(token: string): Promise<Subscription[]> {
  const data = await safeGraphFetch<{ value: Array<{
    id: string
    offerName: string
    skuPartNumber?: string
    status: string
    totalLicenses: number
    nextLifecycleDateTime: string | null
    createdDateTime: string
    isTrial: boolean
  }> }>(
    "/directory/subscriptions",
    token,
    { beta: true }
  )

  if (!data) return []

  return data.value.map((sub) => ({
    id: sub.id,
    offerName: sub.offerName,
    skuPartNumber: sub.skuPartNumber,
    status: sub.status,
    totalLicenses: sub.totalLicenses,
    nextLifecycleDateTime: sub.nextLifecycleDateTime,
    createdDateTime: sub.createdDateTime,
    isTrial: sub.isTrial,
  }))
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function getUserCount(
  token: string,
  filter?: string
): Promise<number | null> {
  const filterParam = filter ? `&$filter=${encodeURIComponent(filter)}` : ""
  const result = await safeGraphFetch<number>(
    `/users/$count?$search=""${filterParam}`,
    token,
    { eventual: true }
  )
  // $count returns a plain number or a JSON number
  if (result === null) return null
  return typeof result === "number" ? result : Number(result)
}

export async function getUserStats(token: string): Promise<UserStats> {
  const errors: string[] = []

  const [total, guests, disabled, licensed] = await Promise.all([
    getUserCount(token).catch((e) => { errors.push(`Total users: ${e.message}`); return null }),
    getUserCount(token, "userType eq 'Guest'").catch((e) => { errors.push(`Guest users: ${e.message}`); return null }),
    getUserCount(token, "accountEnabled eq false").catch((e) => { errors.push(`Disabled users: ${e.message}`); return null }),
    getUserCount(token, "assignedLicenses/$count ne 0").catch((e) => { errors.push(`Licensed users: ${e.message}`); return null }),
  ])

  return {
    total: total ?? 0,
    guests: guests ?? 0,
    disabled: disabled ?? 0,
    licensed: licensed ?? 0,
    errors,
  }
}

// ─── Devices (Intune) ────────────────────────────────────────────────────────

export async function getDeviceStats(token: string): Promise<DeviceStats> {
  interface RawDevice {
    complianceState: string
    operatingSystem: string
  }

  let devices: RawDevice[]

  try {
    devices = await paginateAll<RawDevice>(
      "/deviceManagement/managedDevices?$select=complianceState,operatingSystem&$top=500",
      token
    )
  } catch (err: unknown) {
    const e = err as GraphError
    if (e.status === 403 || e.status === 401) {
      return {
        total: 0,
        compliance: { compliant: 0, nonCompliant: 0, inGracePeriod: 0, unknown: 0, notApplicable: 0, error: 0 },
        byPlatform: { Windows: 0, iOS: 0, Android: 0, macOS: 0, Other: 0 },
        error: "Intune permissions not granted or Intune not licensed",
      }
    }
    if (e.status === 404) {
      return {
        total: 0,
        compliance: { compliant: 0, nonCompliant: 0, inGracePeriod: 0, unknown: 0, notApplicable: 0, error: 0 },
        byPlatform: { Windows: 0, iOS: 0, Android: 0, macOS: 0, Other: 0 },
        error: "Intune is not configured for this tenant",
      }
    }
    throw err
  }

  const compliance: DeviceComplianceCounts = {
    compliant: 0,
    nonCompliant: 0,
    inGracePeriod: 0,
    unknown: 0,
    notApplicable: 0,
    error: 0,
  }

  const byPlatform: DevicePlatformCounts = {
    Windows: 0,
    iOS: 0,
    Android: 0,
    macOS: 0,
    Other: 0,
  }

  for (const device of devices) {
    const state = device.complianceState?.toLowerCase() ?? "unknown"
    if (state === "compliant") compliance.compliant++
    else if (state === "noncompliant") compliance.nonCompliant++
    else if (state === "ingracePeriod" || state === "ingraceperiod") compliance.inGracePeriod++
    else if (state === "notapplicable") compliance.notApplicable++
    else if (state === "error") compliance.error++
    else compliance.unknown++

    const os = device.operatingSystem?.toLowerCase() ?? ""
    if (os.includes("windows")) byPlatform.Windows++
    else if (os.includes("ios")) byPlatform.iOS++
    else if (os.includes("android")) byPlatform.Android++
    else if (os.includes("macos") || os.includes("mac os")) byPlatform.macOS++
    else byPlatform.Other++
  }

  return { total: devices.length, compliance, byPlatform }
}

// ─── Secure Score ─────────────────────────────────────────────────────────────

export async function getSecureScore(token: string): Promise<SecureScore | null> {
  const data = await safeGraphFetch<{ value: Array<{
    currentScore: number
    maxScore: number
    createdDateTime: string
    enabledServices: string[]
  }> }>(
    "/security/secureScores?$top=1",
    token
  )

  const score = data?.value?.[0]
  if (!score) return null

  return {
    currentScore: score.currentScore,
    maxScore: score.maxScore,
    percentage: Math.round((score.currentScore / score.maxScore) * 100),
    createdDateTime: score.createdDateTime,
    enabledServices: score.enabledServices ?? [],
  }
}

// ─── Aggregate overview fetch ─────────────────────────────────────────────────

export async function fetchOverviewData(token: string) {
  const errors: string[] = []

  const [orgResult, skusResult, subsResult, usersResult, devicesResult, scoreResult] =
    await Promise.allSettled([
      getOrganization(token),
      getSubscribedSkus(token),
      getSubscriptions(token),
      getUserStats(token),
      getDeviceStats(token),
      getSecureScore(token),
    ])

  const org = orgResult.status === "fulfilled" ? orgResult.value : null
  if (orgResult.status === "rejected") errors.push(`Organization: ${orgResult.reason?.message}`)

  const skus = skusResult.status === "fulfilled" ? skusResult.value : []
  if (skusResult.status === "rejected") errors.push(`Licenses: ${skusResult.reason?.message}`)

  const subscriptions = subsResult.status === "fulfilled" ? subsResult.value : []

  const users = usersResult.status === "fulfilled" ? usersResult.value : null
  if (usersResult.status === "rejected") errors.push(`Users: ${usersResult.reason?.message}`)

  const devices = devicesResult.status === "fulfilled" ? devicesResult.value : null
  if (devicesResult.status === "rejected") errors.push(`Devices: ${devicesResult.reason?.message}`)

  const secureScore = scoreResult.status === "fulfilled" ? scoreResult.value : null

  return {
    org,
    skus,
    subscriptions,
    users,
    devices,
    secureScore,
    errors,
    fetchedAt: new Date().toISOString(),
  }
}
