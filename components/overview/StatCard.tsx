import { type LucideIcon } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string | null
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: {
    label: string
    positive: boolean
  }
  footer?: React.ReactNode
  loading?: boolean
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-brand-600",
  iconBg = "bg-brand-50",
  trend,
  footer,
  loading,
}: StatCardProps) {
  const displayValue =
    value === null
      ? "—"
      : typeof value === "number"
        ? formatNumber(value)
        : value

  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              "badge text-xs",
              trend.positive ? "badge-green" : "badge-red"
            )}
          >
            {trend.label}
          </span>
        )}
      </div>

      <div>
        {loading ? (
          <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
        ) : (
          <p className="stat-value">{displayValue}</p>
        )}
        <p className="stat-label">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {footer && (
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  )
}
