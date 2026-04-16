import { NextResponse } from "next/server"
import { isConfigured } from "@/lib/config"

export function GET() {
  return NextResponse.json({ configured: isConfigured() })
}
