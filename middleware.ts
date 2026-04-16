import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const SETUP_PATHS = ["/setup", "/api/setup"]
const AUTH_PATHS = ["/api/auth"]
const STATIC = ["/_next", "/favicon.ico"]

function hasRuntimeConfig() {
  return Boolean(
    process.env.AZURE_AD_CLIENT_ID &&
      process.env.AZURE_AD_CLIENT_SECRET &&
      process.env.NEXTAUTH_SECRET
  )
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow static assets and NextAuth internals
  if (STATIC.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // Always allow the setup wizard and its API routes
  if (SETUP_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // Middleware runs in the Edge runtime, so only rely on env vars here.
  // Detailed setup checks (including file-based config) happen in route/page code.
  if (!hasRuntimeConfig()) {
    return NextResponse.redirect(new URL("/setup", req.url))
  }

  // Protect dashboard routes and API graph routes.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/graph")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
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
