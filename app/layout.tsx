import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SessionProvider } from "@/components/providers/SessionProvider"

export const metadata: Metadata = {
  title: {
    default: "M365 TAM Dashboard",
    template: "%s | M365 TAM Dashboard",
  },
  description:
    "Technical Account Manager dashboard for Microsoft 365, Entra ID, and Intune environments",
  robots: "noindex, nofollow",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
