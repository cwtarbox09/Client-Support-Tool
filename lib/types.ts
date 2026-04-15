// Organization
export interface OrgInfo {
  displayName: string
  domains: string[]
  defaultDomain: string
  createdDateTime: string
  tenantType?: string
}

// Licenses
export interface LicenseSku {
  skuId: string
  skuPartNumber: string
  displayName: string
  purchasedUnits: number
  consumedUnits: number
  availableUnits: number
  warningUnits: number
  suspendedUnits: number
  capabilityStatus: "Enabled" | "Warning" | "Suspended" | "Deleted" | "LockedOut"
  appliesTo: string
}

// Subscriptions (license expiration)
export interface Subscription {
  id: string
  offerName: string
  skuPartNumber?: string
  status: string
  totalLicenses: number
  nextLifecycleDateTime: string | null
  createdDateTime: string
  isTrial: boolean
}

// Users
export interface UserStats {
  total: number
  licensed: number
  guests: number
  disabled: number
  mfaRegistered?: number
  mfaCapable?: number
  errors: string[]
}

// Devices (Intune)
export interface DeviceComplianceCounts {
  compliant: number
  nonCompliant: number
  inGracePeriod: number
  unknown: number
  notApplicable: number
  error: number
}

export interface DevicePlatformCounts {
  Windows: number
  iOS: number
  Android: number
  macOS: number
  Other: number
}

export interface DeviceStats {
  total: number
  compliance: DeviceComplianceCounts
  byPlatform: DevicePlatformCounts
  error?: string
}

// Security Score
export interface SecureScore {
  currentScore: number
  maxScore: number
  percentage: number
  createdDateTime: string
  enabledServices: string[]
}

// Full overview data
export interface OverviewData {
  org: OrgInfo | null
  skus: LicenseSku[]
  subscriptions: Subscription[]
  users: UserStats | null
  devices: DeviceStats | null
  secureScore: SecureScore | null
  errors: string[]
  fetchedAt: string
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}
