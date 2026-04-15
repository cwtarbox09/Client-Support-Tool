"use client"

import { ShieldCheck, TrendingUp } from "lucide-react"
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts"
import { cn, formatDate } from "@/lib/utils"
import type { SecureScore } from "@/lib/types"

interface SecureScoreCardProps {
  score: SecureScore | null
}

function getScoreColor(pct: number): string {
  if (pct >= 80) return "#22c55e"
  if (pct >= 60) return "#3b82f6"
  if (pct >= 40) return "#f59e0b"
  return "#ef4444"
}

function getScoreLabel(pct: number): { label: string; className: string } {
  if (pct >= 80) return { label: "Excellent", className: "text-green-600" }
  if (pct >= 60) return { label: "Good", className: "text-blue-600" }
  if (pct >= 40) return { label: "Fair", className: "text-amber-600" }
  return { label: "Poor", className: "text-red-600" }
}

export function SecureScoreCard({ score }: SecureScoreCardProps) {
  if (!score) {
    return (
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Secure Score</h2>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-400">
            Secure Score data unavailable. Ensure SecurityEvents.Read.All permission is granted.
          </p>
        </div>
      </div>
    )
  }

  const scoreColor = getScoreColor(score.percentage)
  const { label, className: labelClass } = getScoreLabel(score.percentage)

  const chartData = [
    { value: score.percentage, fill: scoreColor },
  ]

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Microsoft Secure Score</h2>
        </div>
        <span className="text-xs text-slate-400">
          Updated {formatDate(score.createdDateTime)}
        </span>
      </div>

      <div className="card-body">
        <div className="flex items-center gap-6">
          {/* Radial gauge */}
          <div className="flex-shrink-0 relative" style={{ width: 110, height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: "#f1f5f9" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
                {score.percentage}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tabular-nums text-slate-900">
                {Math.round(score.currentScore)}
              </span>
              <span className="text-slate-400 text-sm">/ {Math.round(score.maxScore)} pts</span>
            </div>
            <span className={cn("text-sm font-semibold", labelClass)}>{label}</span>

            <div className="mt-3 space-y-1.5">
              {score.enabledServices.slice(0, 4).map((svc) => (
                <div key={svc} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                  {svc}
                </div>
              ))}
              {score.enabledServices.length > 4 && (
                <p className="text-xs text-slate-400">
                  +{score.enabledServices.length - 4} more services
                </p>
              )}
            </div>
          </div>
        </div>

        {score.percentage < 60 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Score below 60%. Review the Security portal for quick-win improvements.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
