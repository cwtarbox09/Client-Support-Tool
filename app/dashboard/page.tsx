import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import {
  Users,
  UserCheck,
  MonitorSmartphone,
  Key,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react"

import { authOptions } from "@/lib/auth"
import { fetchOverviewData } from "@/lib/graph"
import { formatNumber, getUsagePercent } from "@/lib/utils"

import { Header } from "@/components/layout/Header"
import { StatCard } from "@/components/overview/StatCard"
import { LicenseTable } from "@/components/overview/LicenseTable"
import { DeviceStats } from "@/components/overview/DeviceStats"
import { UserStats } from "@/components/overview/UserStats"
import { SecureScoreCard } from "@/components/overview/SecureScoreCard"
import { OrgInfo } from "@/components/overview/OrgInfo"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.error === "RefreshAccessTokenError") {
    redirect("/login?error=SessionExpired")
  }

  const accessToken = session.accessToken

  if (!accessToken) {
    redirect("/login?error=NoToken")
  }

  // Fetch all overview data in parallel
  const data = await fetchOverviewData(accessToken)

  const { org, skus, subscriptions, users, devices, secureScore, errors, fetchedAt } = data

  // Compute top-line stats
  const totalLicenses = skus.reduce((s, sku) => s + sku.purchasedUnits, 0)
  const usedLicenses = skus.reduce((s, sku) => s + sku.consumedUnits, 0)
  const activeSKUs = skus.filter((s) => s.capabilityStatus === "Enabled").length
  const licenseUtilPct = getUsagePercent(usedLicenses, totalLicenses)

  // SKUs needing attention (>= 90% or warning/suspended)
  const attentionSKUs = skus.filter(
    (s) =>
      getUsagePercent(s.consumedUnits, s.purchasedUnits) >= 90 ||
      s.capabilityStatus !== "Enabled"
  )

  return (
    <>
      <Header
        orgName={org?.displayName ?? null}
        defaultDomain={org?.defaultDomain ?? null}
        fetchedAt={fetchedAt}
        hasErrors={errors.length > 0}
      />

      <main className="p-6 space-y-6 animate-fade-in">
        {/* Global error banner */}
        {errors.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Some data could not be retrieved
              </p>
              <ul className="mt-1 space-y-0.5">
                {errors.map((err, i) => (
                  <li key={i} className="text-xs text-amber-700">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Organization info bar */}
        <OrgInfo org={org} />

        {/* Top stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={users?.total ?? null}
            subtitle={users ? `${formatNumber(users.guests)} guests` : undefined}
            icon={Users}
            iconColor="text-brand-600"
            iconBg="bg-brand-50"
          />
          <StatCard
            title="Licensed Users"
            value={users?.licensed ?? null}
            subtitle={
              users && users.total > 0
                ? `${getUsagePercent(users.licensed, users.total)}% of total`
                : undefined
            }
            icon={UserCheck}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            title="Enrolled Devices"
            value={devices?.total ?? null}
            subtitle={
              devices && devices.total > 0
                ? `${formatNumber(devices.compliance.compliant)} compliant`
                : devices?.error
                  ? "Intune not available"
                  : undefined
            }
            icon={MonitorSmartphone}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            title="License Seats"
            value={totalLicenses > 0 ? totalLicenses : null}
            subtitle={
              totalLicenses > 0
                ? `${formatNumber(usedLicenses)} used (${licenseUtilPct}%) · ${activeSKUs} SKUs`
                : undefined
            }
            icon={Key}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            trend={
              attentionSKUs.length > 0
                ? { label: `${attentionSKUs.length} need review`, positive: false }
                : licenseUtilPct < 80
                  ? { label: "Healthy", positive: true }
                  : undefined
            }
          />
        </div>

        {/* License attention banner */}
        {attentionSKUs.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {attentionSKUs.length} license{attentionSKUs.length > 1 ? "s" : ""} require
                attention
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {attentionSKUs.map((s) => s.displayName).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* License inventory */}
        <LicenseTable skus={skus} subscriptions={subscriptions} />

        {/* Devices + Users side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DeviceStats devices={devices} />
          <UserStats users={users} />
        </div>

        {/* Secure Score */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SecureScoreCard score={secureScore} />

          {/* Quick reference card */}
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-slate-900">Quick Reference</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Key metrics at a glance for client reporting
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Tenant",
                    value: org?.displayName ?? "—",
                  },
                  {
                    label: "Primary Domain",
                    value: org?.defaultDomain ?? "—",
                  },
                  {
                    label: "Total Users",
                    value: users ? formatNumber(users.total) : "—",
                  },
                  {
                    label: "Licensed Users",
                    value:
                      users
                        ? `${formatNumber(users.licensed)} (${getUsagePercent(users.licensed, users.total)}%)`
                        : "—",
                  },
                  {
                    label: "Managed Devices",
                    value: devices ? formatNumber(devices.total) : "—",
                  },
                  {
                    label: "Device Compliance",
                    value:
                      devices && devices.total > 0
                        ? `${Math.round((devices.compliance.compliant / devices.total) * 100)}%`
                        : "—",
                  },
                  {
                    label: "Total License Seats",
                    value: totalLicenses > 0 ? formatNumber(totalLicenses) : "—",
                  },
                  {
                    label: "License Utilization",
                    value: totalLicenses > 0 ? `${licenseUtilPct}%` : "—",
                  },
                  {
                    label: "Secure Score",
                    value: secureScore
                      ? `${Math.round(secureScore.currentScore)} / ${Math.round(secureScore.maxScore)} (${secureScore.percentage}%)`
                      : "—",
                  },
                  {
                    label: "Active License SKUs",
                    value: activeSKUs > 0 ? activeSKUs.toString() : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate" title={value}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
