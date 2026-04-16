"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Shield, Copy, Check, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

type Step =
  | "form"          // enter tenant domain + app URL
  | "waiting"       // showing device code, polling for sign-in
  | "creating"      // creating app registration
  | "done"          // success

export default function SetupPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("form")
  const [tenantId, setTenantId] = useState("")
  const [appUrl, setAppUrl] = useState("")
  const [formError, setFormError] = useState("")

  // Device code data
  const [userCode, setUserCode] = useState("")
  const [verificationUri, setVerificationUri] = useState("")
  const [pollInterval, setPollInterval] = useState(5)
  const [copied, setCopied] = useState(false)

  const [statusMessage, setStatusMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-detect the app URL from the browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin)
    }
  }, [])

  // Redirect if already configured
  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then((data: { configured: boolean }) => {
        if (data.configured) router.replace("/")
      })
      .catch(() => {})
  }, [router])

  // Cleanup poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function handleStart() {
    setFormError("")
    if (!tenantId.trim()) {
      setFormError("Please enter your tenant domain or ID.")
      return
    }
    if (!appUrl.trim()) {
      setFormError("Please enter the URL this app is hosted at.")
      return
    }

    const res = await fetch("/api/setup/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: tenantId.trim(), appUrl: appUrl.trim() }),
    })
    const data = (await res.json()) as {
      userCode?: string
      verificationUri?: string
      interval?: number
      error?: string
    }

    if (!res.ok || data.error) {
      setFormError(data.error ?? "Failed to start setup. Check the tenant ID and try again.")
      return
    }

    setUserCode(data.userCode!)
    setVerificationUri(data.verificationUri!)
    const interval = data.interval ?? 5
    setPollInterval(interval)
    setStep("waiting")
    startPolling(interval)
  }

  function startPolling(interval: number) {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      const res = await fetch("/api/setup/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appUrl: appUrl.trim() }),
      })
      const data = (await res.json()) as {
        status: "pending" | "success" | "error" | "already_configured"
        message?: string
      }

      if (data.status === "pending") return

      if (pollRef.current) clearInterval(pollRef.current)

      if (data.status === "success" || data.status === "already_configured") {
        setStep("creating")
        // Brief pause so the user sees "Creating…" before redirecting
        setTimeout(() => setStep("done"), 800)
        return
      }

      // Error
      setErrorMessage(data.message ?? "An unknown error occurred.")
      setStep("form")
    }, interval * 1000)
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(userCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleRestart() {
    if (pollRef.current) clearInterval(pollRef.current)
    setStep("form")
    setUserCode("")
    setVerificationUri("")
    setErrorMessage("")
    setFormError("")
    setStatusMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">M365 TAM Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">First-time setup</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* ── Step: Form ── */}
          {step === "form" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Connect your Microsoft 365 tenant</h2>
                <p className="text-slate-400 text-sm">
                  Sign in as a Global Admin once to let this tool create its own
                  app registration. You&apos;ll never need to visit Azure Portal.
                </p>
              </div>

              {(errorMessage || formError) && (
                <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage || formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Tenant domain or ID
                  </label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="contoso.onmicrosoft.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    App URL
                  </label>
                  <input
                    type="text"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://tool.contoso.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-detected from your browser. Change this if the app is behind a proxy.
                  </p>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-150 shadow-lg shadow-brand-600/25"
              >
                Begin Setup
              </button>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500 leading-relaxed">
                  You&apos;ll be asked to sign in with a Global Admin account to
                  grant <span className="text-slate-300">Application.ReadWrite.All</span>.
                  This is used once to register the app, then never again.
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Waiting for device code auth ── */}
          {step === "waiting" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Sign in as Global Admin</h2>
                <p className="text-slate-400 text-sm">
                  Open the link below in any browser, enter the code, and sign in
                  with your Microsoft 365 Global Admin account.
                </p>
              </div>

              {/* Verification URL */}
              <a
                href={verificationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-brand-600/10 border border-brand-500/30 text-brand-300 hover:bg-brand-600/20 transition-colors text-sm font-medium"
              >
                <span>{verificationUri}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0 ml-2" />
              </a>

              {/* Code display */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Enter this code
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl bg-white/10 border border-white/20">
                    <span className="text-3xl font-mono font-bold tracking-[0.25em] text-white select-all">
                      {userCode}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    title="Copy code"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                <span>Waiting for you to sign in…</span>
              </div>

              <button
                onClick={handleRestart}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                ← Start over
              </button>
            </div>
          )}

          {/* ── Step: Creating app registration ── */}
          {(step === "creating") && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
              <p className="text-white font-semibold">Creating app registration…</p>
              <p className="text-slate-400 text-sm text-center">
                Setting up your app in Azure AD. This only takes a moment.
              </p>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === "done" && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Setup complete!</p>
                <p className="text-slate-400 text-sm mt-1">
                  Your app registration has been created and configured.
                </p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="mt-2 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 shadow-lg shadow-brand-600/25"
              >
                Sign in to get started
              </button>
              <p className="text-xs text-slate-500 text-center max-w-xs">
                The first sign-in will show a Microsoft consent screen — click
                &quot;Accept&quot; to grant the required permissions for your organisation.
              </p>
            </div>
          )}

        </div>

        {step === "form" && (
          <p className="text-center text-xs text-slate-500 mt-6">
            Setup only runs once. Credentials are stored in{" "}
            <code className="font-mono">app-config.json</code> on the server.
          </p>
        )}
      </div>
    </div>
  )
}
