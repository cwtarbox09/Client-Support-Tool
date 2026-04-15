import { RefreshCw, Clock, AlertTriangle } from "lucide-react"
import { formatDateRelative } from "@/lib/utils"

interface HeaderProps {
  orgName: string | null
  defaultDomain: string | null
  fetchedAt: string
  hasErrors: boolean
}

export function Header({ orgName, defaultDomain, fetchedAt, hasErrors }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between px-6"
      style={{ height: "var(--header-height)" }}
    >
      {/* Left: Page context */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900">
              {orgName ?? "Overview"}
            </h1>
            {hasErrors && (
              <span className="badge-amber flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Partial data
              </span>
            )}
          </div>
          {defaultDomain && (
            <p className="text-xs text-slate-500 leading-none mt-0.5">{defaultDomain}</p>
          )}
        </div>
      </div>

      {/* Right: Meta info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated {formatDateRelative(fetchedAt)}</span>
        </div>
        <form action="/dashboard" method="GET">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </form>
      </div>
    </header>
  )
}
