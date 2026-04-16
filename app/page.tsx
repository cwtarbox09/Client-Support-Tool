import { redirect } from "next/navigation"
import { isConfigured } from "@/lib/config"

export default function Home() {
  // Middleware also handles this, but guard here too so server components
  // never hit getAuthOptions() before setup is done.
  if (!isConfigured()) {
    redirect("/setup")
  }
  redirect("/dashboard")
}
