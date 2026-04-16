import NextAuth from "next-auth"
import { getAuthOptions } from "@/lib/auth"

// Build a fresh handler on each request so config file changes are
// picked up immediately after the setup wizard completes.
export async function GET(req: Request, ctx: { params: { nextauth: string[] } }) {
  return NextAuth(req as Parameters<typeof NextAuth>[0], ctx as Parameters<typeof NextAuth>[1], getAuthOptions())
}

export async function POST(req: Request, ctx: { params: { nextauth: string[] } }) {
  return NextAuth(req as Parameters<typeof NextAuth>[0], ctx as Parameters<typeof NextAuth>[1], getAuthOptions())
}
