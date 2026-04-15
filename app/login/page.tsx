"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Shield } from "lucide-react"

function LoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    await signIn("azure-ad", { callbackUrl })
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">M365 TAM Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Technical Account Manager Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in to continue</h2>
          <p className="text-slate-400 text-sm mb-6">
            Authenticate with your Microsoft 365 work or school account to access
            tenant data via delegated permissions.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error === "AccessDenied"
                ? "Access was denied. Ensure you have the required permissions."
                : error === "Configuration"
                  ? "Server configuration error. Contact your administrator."
                  : `Authentication error: ${error}`}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-150 shadow-lg shadow-brand-600/25"
          >
            {isSigningIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MicrosoftLogo />
            )}
            {isSigningIn ? "Signing in…" : "Sign in with Microsoft"}
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Required Permissions
            </h3>
            <ul className="space-y-1.5">
              {[
                "Directory.Read.All — Users, groups & directory",
                "Organization.Read.All — Licenses & org info",
                "DeviceManagementManagedDevices.Read.All — Intune devices",
                "SecurityEvents.Read.All — Secure Score",
                "Policy.Read.All — Conditional Access",
              ].map((perm) => (
                <li key={perm} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-3">
              Admin consent is required for directory-level permissions.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          All data is fetched in real-time from Microsoft Graph API using
          delegated authentication. No data is stored.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" className="h-5 w-5" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#00a4ef" />
      <rect x="1" y="11" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}
