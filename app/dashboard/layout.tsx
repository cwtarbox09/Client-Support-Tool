import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className="min-h-screen"
        style={{ paddingLeft: "var(--sidebar-width)" }}
      >
        {children}
      </div>
    </div>
  )
}
