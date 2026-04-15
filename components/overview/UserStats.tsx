import { Users, UserCheck, UserX, Globe } from "lucide-react"
import { cn, formatNumber, getUsagePercent } from "@/lib/utils"
import type { UserStats as UserStatsType } from "@/lib/types"

interface UserStatsProps {
  users: UserStatsType | null
}

function UserMetricRow({
  icon: Icon,
  label,
  value,
  pct,
  total,
  colorClass,
  bgClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  pct?: number
  total?: number
  colorClass: string
  bgClass: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className={cn("p-1.5 rounded-lg flex-shrink-0", bgClass)}>
        <Icon className={cn("h-3.5 w-3.5", colorClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 font-medium">{label}</p>
        {pct !== undefined && total !== undefined && total > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex-1 progress-bar">
              <div
                className={cn("progress-fill", bgClass.replace("bg-", "bg-").replace("-50", "-400"))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">{pct}%</span>
          </div>
        )}
      </div>
      <span className="text-base font-bold tabular-nums text-slate-900">
        {formatNumber(value)}
      </span>
    </div>
  )
}

export function UserStats({ users }: UserStatsProps) {
  if (!users) {
    return (
      <div className="card p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-slate-400">User data unavailable</p>
      </div>
    )
  }

  const licensedPct = getUsagePercent(users.licensed, users.total)
  const guestPct = getUsagePercent(users.guests, users.total)
  const disabledPct = getUsagePercent(users.disabled, users.total)
  const memberCount = users.total - users.guests

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">User Breakdown</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumber(users.total)}
          </span>
          <span className="text-xs text-slate-500">total</span>
        </div>
      </div>

      <div className="card-body">
        <div>
          <UserMetricRow
            icon={UserCheck}
            label="Licensed Users"
            value={users.licensed}
            pct={licensedPct}
            total={users.total}
            colorClass="text-green-600"
            bgClass="bg-green-50"
          />
          <UserMetricRow
            icon={Users}
            label="Member Accounts"
            value={memberCount}
            pct={getUsagePercent(memberCount, users.total)}
            total={users.total}
            colorClass="text-brand-600"
            bgClass="bg-brand-50"
          />
          <UserMetricRow
            icon={Globe}
            label="Guest Accounts"
            value={users.guests}
            pct={guestPct}
            total={users.total}
            colorClass="text-purple-600"
            bgClass="bg-purple-50"
          />
          <UserMetricRow
            icon={UserX}
            label="Disabled Accounts"
            value={users.disabled}
            pct={disabledPct}
            total={users.total}
            colorClass="text-slate-400"
            bgClass="bg-slate-100"
          />
        </div>

        {users.errors.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-[10px] text-amber-600 font-medium">
              Some user stats may be incomplete due to permission limits.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
