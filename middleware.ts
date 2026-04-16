import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { isConfigured, getAppConfig } from "@/lib/config"

// Must run in Node.js runtime so we can read the config file from disk.
export const runtime = "nodejs"

const SETUP_PATHS = ["/setup", "/api/setup"]
const AUTH_PATHS  = ["/api/auth"]
const STATIC      = ["/_next", "/favicon.ico"]

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow static assets and NextAuth internals
  if (STATIC.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)))  return NextResponse.next()

  // Always allow the setup wizard and its API routes
  if (SETUP_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // If the app hasn't been configured yet, redirect everything to /setup
  if (!isConfigured()) {
    return NextResponse.redirect(new URL("/setup", req.url))
  }

  // For protected routes, verify the JWT
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/graph")) {
    const config = getAppConfig()
    const token = await getToken({ req, secret: config!.nextAuthSecret })
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
}
