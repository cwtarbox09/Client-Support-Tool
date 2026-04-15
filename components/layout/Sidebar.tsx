"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Key,
  Users,
  MonitorSmartphone,
  Shield,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  soon?: boolean
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Licenses", href: "/dashboard/licenses", icon: Key, soon: true },
  { label: "Users", href: "/dashboard/users", icon: Users, soon: true },
  { label: "Devices", href: "/dashboard/devices", icon: MonitorSmartphone, soon: true },
  { label: "Conditional Access", href: "/dashboard/conditional-access", icon: Shield, soon: true },
  { label: "Security", href: "/dashboard/security", icon: ShieldCheck, soon: true },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3, soon: true },
]

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings, soon: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name ?? "User"
  const userEmail = session?.user?.email ?? ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-slate-900 flex flex-col z-30 select-none">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/40">
            <Building2 className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none">TAM Dashboard</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">M365 · Entra · Intune</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
          const Icon = item.icon

          if (item.soon) {
            return (
              <div
                key={item.href}
                className="nav-item-disabled group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                title="Coming soon"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-[9px] font-semibold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Soon
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "text-white bg-brand-600 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/8"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
              {item.badge && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-white/5 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Config
          </p>
          {bottomItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.href}
                className="nav-item-disabled group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-[9px] font-semibold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Soon
                </span>
              </div>
            )
          })}
        </div>
      </nav>

      {/* User area */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="flex-shrink-0 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
