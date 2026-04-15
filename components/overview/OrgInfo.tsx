import { Building2, Globe, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { OrgInfo as OrgInfoType } from "@/lib/types"

interface OrgInfoProps {
  org: OrgInfoType | null
}

export function OrgInfo({ org }: OrgInfoProps) {
  if (!org) return null

  return (
    <div className="card">
      <div className="card-header flex items-center gap-2">
        <Building2 className="h-4 w-4 text-slate-500" />
        <h2 className="font-semibold text-slate-900">Organization</h2>
      </div>
      <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
            Display Name
          </p>
          <p className="text-sm font-semibold text-slate-900">{org.displayName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
            Domains
          </p>
          <div className="flex flex-wrap gap-1">
            {org.domains.slice(0, 4).map((d) => (
              <span key={d} className="badge-blue flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {d}
              </span>
            ))}
            {org.domains.length > 4 && (
              <span className="badge-gray">+{org.domains.length - 4} more</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
            Tenant Created
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(org.createdDateTime)}
          </div>
        </div>
      </div>
    </div>
  )
}
