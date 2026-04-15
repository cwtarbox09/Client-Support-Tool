"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { MonitorSmartphone, AlertTriangle } from "lucide-react"
import { cn, formatNumber, getComplianceColor, getPlatformColor } from "@/lib/utils"
import type { DeviceStats as DeviceStatsType } from "@/lib/types"

interface DeviceStatsProps {
  devices: DeviceStatsType | null
}

const COMPLIANCE_LABELS: Record<string, string> = {
  compliant: "Compliant",
  nonCompliant: "Non-Compliant",
  inGracePeriod: "Grace Period",
  unknown: "Unknown",
  notApplicable: "Not Applicable",
  error: "Error",
}

const COMPLIANCE_COLORS: Record<string, string> = {
  compliant: "#22c55e",
  nonCompliant: "#ef4444",
  inGracePeriod: "#f59e0b",
  unknown: "#94a3b8",
  notApplicable: "#6366f1",
  error: "#f43f5e",
}

// Custom tooltip for pie chart
function ComplianceTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { total: number } }> }) {
  if (!active || !payload?.[0]) return null
  const { name, value, payload: item } = payload[0]
  const pct = item.total > 0 ? Math.round((value / item.total) * 100) : 0
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="font-semibold">{name}</p>
      <p>{formatNumber(value)} devices ({pct}%)</p>
    </div>
  )
}

function PlatformTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.[0]) return null
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p>{formatNumber(payload[0].value)} devices</p>
    </div>
  )
}

export function DeviceStats({ devices }: DeviceStatsProps) {
  if (!devices) {
    return (
      <div className="card p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-slate-400">Device data unavailable</p>
      </div>
    )
  }

  if (devices.error) {
    return (
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Intune Devices</h2>
        </div>
        <div className="card-body">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">{devices.error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Build compliance pie data
  const complianceData = (
    Object.entries(devices.compliance) as Array<[string, number]>
  )
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: COMPLIANCE_LABELS[key] ?? key,
      value: count,
      color: COMPLIANCE_COLORS[key] ?? "#94a3b8",
      total: devices.total,
    }))

  // Build platform bar data
  const platformData = (
    Object.entries(devices.byPlatform) as Array<[string, number]>
  )
    .filter(([, count]) => count > 0)
    .map(([platform, count]) => ({
      name: platform,
      count,
      color: getPlatformColor(platform),
    }))
    .sort((a, b) => b.count - a.count)

  const compliantPct =
    devices.total > 0
      ? Math.round((devices.compliance.compliant / devices.total) * 100)
      : 0

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Intune Devices</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatNumber(devices.total)}
          </span>
          <span className="text-xs text-slate-500">total</span>
        </div>
      </div>

      <div className="card-body space-y-5">
        {/* Compliance section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Compliance Status
            </p>
            <span
              className={cn(
                "badge font-bold",
                compliantPct >= 90 ? "badge-green" : compliantPct >= 75 ? "badge-amber" : "badge-red"
              )}
            >
              {compliantPct}% compliant
            </span>
          </div>

          {devices.total > 0 ? (
            <div className="flex gap-4 items-center">
              {/* Donut chart */}
              <div className="flex-shrink-0" style={{ width: 100, height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={46}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {complianceData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ComplianceTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-1.5">
                {complianceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-slate-900">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No devices enrolled</p>
          )}
        </div>

        {/* Platform breakdown */}
        {platformData.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Platform Distribution
            </p>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<PlatformTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={32}>
                    {platformData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
