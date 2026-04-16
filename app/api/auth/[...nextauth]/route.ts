import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { getAuthOptions } from "@/lib/auth"

const seenAuthCodes = new Map<string, number>()
const AUTH_CODE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function pruneSeenAuthCodes(now: number) {
  seenAuthCodes.forEach((expiresAt, code) => {
    if (expiresAt <= now) seenAuthCodes.delete(code)
  })
}

// Create a new handler per request so setup-time config changes are picked up
// without restarting the dev server.
export async function GET(req: Request, ctx: { params: { nextauth: string[] } }) {
  const url = new URL(req.url)
  const isAzureCallback =
    ctx.params.nextauth?.[0] === "callback" && ctx.params.nextauth?.[1] === "azure-ad"
  const code = url.searchParams.get("code")

  // Some deployments/proxies can replay the callback request.
  // Azure authorization codes are single-use, so a replay always fails with AADSTS54005.
  // Short-circuit duplicate callbacks before NextAuth attempts token exchange again.
  if (isAzureCallback && code) {
    const now = Date.now()
    pruneSeenAuthCodes(now)

    if (seenAuthCodes.has(code)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    seenAuthCodes.set(code, now + AUTH_CODE_TTL_MS)
  }

  const handler = NextAuth(getAuthOptions())
  return handler(req, ctx)
}

export async function POST(req: Request, ctx: { params: { nextauth: string[] } }) {
  const handler = NextAuth(getAuthOptions())
  return handler(req, ctx)
}
