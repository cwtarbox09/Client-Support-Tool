import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—"
  try {
    return format(parseISO(dateString), "MMM d, yyyy")
  } catch {
    return dateString
  }
}

export function formatDateRelative(dateString: string | null | undefined): string {
  if (!dateString) return "—"
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export function daysUntil(dateString: string | null | undefined): number | null {
  if (!dateString) return null
  try {
    return differenceInDays(parseISO(dateString), new Date())
  } catch {
    return null
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n)
}

export function getUsagePercent(consumed: number, purchased: number): number {
  if (purchased === 0) return 0
  return Math.min(100, Math.round((consumed / purchased) * 100))
}

export function getUsageColor(percent: number): string {
  if (percent >= 95) return "bg-red-500"
  if (percent >= 80) return "bg-amber-500"
  if (percent >= 50) return "bg-brand-600"
  return "bg-green-500"
}

export function getUsageTextColor(percent: number): string {
  if (percent >= 95) return "text-red-600"
  if (percent >= 80) return "text-amber-600"
  if (percent >= 50) return "text-brand-600"
  return "text-green-600"
}

export function getExpiryStatus(days: number | null): {
  label: string
  color: string
  bg: string
} {
  if (days === null) return { label: "Unknown", color: "text-gray-500", bg: "bg-gray-100" }
  if (days < 0) return { label: "Expired", color: "text-red-700", bg: "bg-red-100" }
  if (days <= 30) return { label: `${days}d`, color: "text-red-700", bg: "bg-red-100" }
  if (days <= 90) return { label: `${days}d`, color: "text-amber-700", bg: "bg-amber-100" }
  return { label: `${days}d`, color: "text-green-700", bg: "bg-green-100" }
}

export function getComplianceColor(state: string): string {
  switch (state) {
    case "compliant":
      return "#22c55e"
    case "noncompliant":
      return "#ef4444"
    case "inGracePeriod":
      return "#f59e0b"
    case "notApplicable":
      return "#6366f1"
    case "unknown":
    default:
      return "#94a3b8"
  }
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    Windows: "#0078d4",
    iOS: "#555555",
    Android: "#3ddc84",
    macOS: "#888888",
    Other: "#94a3b8",
  }
  return colors[platform] ?? "#94a3b8"
}
