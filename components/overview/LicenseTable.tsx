import { AlertTriangle, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react"
import { cn, formatNumber, getUsagePercent, getUsageColor, getUsageTextColor, daysUntil, formatDate, getExpiryStatus } from "@/lib/utils"
import type { LicenseSku, Subscription } from "@/lib/types"

interface LicenseTableProps {
  skus: LicenseSku[]
  subscriptions: Subscription[]
}

function StatusBadge({ status }: { status: LicenseSku["capabilityStatus"] }) {
  if (status === "Enabled") {
    return (
      <span className="badge-green flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    )
  }
  if (status === "Warning") {
    return (
      <span className="badge-amber flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Warning
      </span>
    )
  }
  if (status === "Suspended" || status === "LockedOut") {
    return (
      <span className="badge-red flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        {status}
      </span>
    )
  }
  return <span className="badge-gray">{status}</span>
}

function ExpiryCell({ skuPartNumber, subscriptions }: { skuPartNumber: string; subscriptions: Subscription[] }) {
  const sub = subscriptions.find(
    (s) =>
      s.skuPartNumber === skuPartNumber ||
      s.offerName?.toUpperCase() === skuPartNumber
  )

  if (!sub?.nextLifecycleDateTime) {
    return <span className="text-slate-400">—</span>
  }

  const days = daysUntil(sub.nextLifecycleDateTime)
  const { label, color, bg } = getExpiryStatus(days)

  return (
    <span className={cn("badge", bg, color, "flex items-center gap-1")}>
      <Clock className="h-3 w-3" />
      {formatDate(sub.nextLifecycleDateTime)}
      {days !== null && days <= 90 && (
        <span className="font-bold">({label})</span>
      )}
      {sub.isTrial && <span className="font-semibold">[Trial]</span>}
    </span>
  )
}

export function LicenseTable({ skus, subscriptions }: LicenseTableProps) {
  if (skus.length === 0) {
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">License Inventory</h2>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-500">No license data available.</p>
        </div>
      </div>
    )
  }

  const totalPurchased = skus.reduce((s, sku) => s + sku.purchasedUnits, 0)
  const totalConsumed = skus.reduce((s, sku) => s + sku.consumedUnits, 0)
  const overallPct = getUsagePercent(totalConsumed, totalPurchased)

  // Highlight SKUs with >= 90% usage or expiring within 30 days
  const criticalSkus = skus.filter((sku) => {
    const pct = getUsagePercent(sku.consumedUnits, sku.purchasedUnits)
    const sub = subscriptions.find((s) => s.skuPartNumber === sku.skuPartNumber || s.offerName?.toUpperCase() === sku.skuPartNumber)
    const days = daysUntil(sub?.nextLifecycleDateTime)
    return pct >= 90 || (days !== null && days <= 30)
  })

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">License Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatNumber(totalConsumed)} of {formatNumber(totalPurchased)} licenses assigned ({overallPct}% utilization)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalSkus.length > 0 && (
            <span className="badge-amber flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalSkus.length} need attention
            </span>
          )}
          <span className="badge-blue">{skus.length} SKUs</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>License</th>
              <th className="text-right">Purchased</th>
              <th className="text-right">Assigned</th>
              <th className="text-right">Available</th>
              <th className="w-40">Usage</th>
              <th>Renewal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => {
              const pct = getUsagePercent(sku.consumedUnits, sku.purchasedUnits)
              const barColor = getUsageColor(pct)
              const textColor = getUsageTextColor(pct)
              const isCritical = pct >= 90 || sku.capabilityStatus !== "Enabled"

              return (
                <tr key={sku.skuId} className={cn(isCritical && "bg-amber-50/30")}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{sku.displayName}</span>
                      {sku.warningUnits > 0 && (
                        <span className="badge-amber text-[10px]">
                          {sku.warningUnits} expiring
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{sku.skuPartNumber}</span>
                  </td>
                  <td className="text-right tabular-nums">{formatNumber(sku.purchasedUnits)}</td>
                  <td className="text-right tabular-nums">{formatNumber(sku.consumedUnits)}</td>
                  <td className={cn("text-right tabular-nums font-medium", sku.availableUnits === 0 ? "text-red-600" : "text-slate-700")}>
                    {formatNumber(sku.availableUnits)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 progress-bar">
                        <div
                          className={cn("progress-fill", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-semibold tabular-nums w-9 text-right", textColor)}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <ExpiryCell
                      skuPartNumber={sku.skuPartNumber}
                      subscriptions={subscriptions}
                    />
                  </td>
                  <td>
                    <StatusBadge status={sku.capabilityStatus} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
