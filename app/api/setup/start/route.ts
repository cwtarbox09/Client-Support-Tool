import { NextRequest, NextResponse } from "next/server"
import { isConfigured } from "@/lib/config"
import { setSetupState } from "@/lib/setup-state"

// Microsoft Graph Command Line Tools — a Microsoft-owned public client that
// supports device code flow and can request delegated Graph API permissions
// (including Application.ReadWrite.All) when the authenticating user is a
// Global Admin.  Using it here for a one-time, admin-only bootstrap is the
// established pattern for internal tooling.
const BOOTSTRAP_CLIENT_ID = "14d82eec-204b-4c2f-b7e8-296a70dab67e"

interface StartBody {
  tenantId: string  // domain (e.g. contoso.onmicrosoft.com) or GUID
  appUrl: string    // public URL of this app, e.g. https://tool.contoso.com
}

export async function POST(req: NextRequest) {
  if (isConfigured()) {
    return NextResponse.json({ error: "Already configured" }, { status: 400 })
  }

  let body: StartBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { tenantId, appUrl } = body
  if (!tenantId || !appUrl) {
    return NextResponse.json({ error: "tenantId and appUrl are required" }, { status: 400 })
  }

  // Kick off the device code flow
  const dcRes = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/devicecode`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: BOOTSTRAP_CLIENT_ID,
        scope: "Application.ReadWrite.All offline_access",
      }),
    }
  )

  if (!dcRes.ok) {
    const err = await dcRes.json().catch(() => ({}))
    const message =
      (err as { error_description?: string }).error_description ??
      "Failed to initiate device code flow. Check the tenant ID and try again."
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const dc = (await dcRes.json()) as {
    device_code: string
    user_code: string
    verification_uri: string
    expires_in: number
    interval: number
    message: string
  }

  // Persist state server-side so the poll route can use the device_code
  setSetupState({
    deviceCode: dc.device_code,
    tenantId,
    interval: dc.interval,
    expiresAt: Date.now() + dc.expires_in * 1000,
  })

  // Return only what the client needs to display
  return NextResponse.json({
    userCode: dc.user_code,
    verificationUri: dc.verification_uri,
    expiresIn: dc.expires_in,
    interval: dc.interval,
    // Pass appUrl back so the poll route can use it when creating the app reg
    appUrl,
  })
}
