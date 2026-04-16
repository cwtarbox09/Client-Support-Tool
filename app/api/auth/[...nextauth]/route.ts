import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

// Create a new handler per request so setup-time config changes are picked up
// without restarting the dev server.
export async function GET(req: Request, ctx: { params: { nextauth: string[] } }) {
  const handler = NextAuth(getAuthOptions())
  return handler(req, ctx)
}

export async function POST(req: Request, ctx: { params: { nextauth: string[] } }) {
  const handler = NextAuth(getAuthOptions())
  return handler(req, ctx)
}
