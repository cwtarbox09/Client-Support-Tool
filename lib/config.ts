import fs from "fs"
import path from "path"
import crypto from "crypto"

export interface AppConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  nextAuthSecret: string
}

const CONFIG_PATH = path.join(process.cwd(), "app-config.json")

// Module-level cache — only read from disk once per server process.
// saveAppConfig() updates the cache so the new values are picked up immediately.
let _cache: AppConfig | null | undefined = undefined

export function getAppConfig(): AppConfig | null {
  if (_cache !== undefined) return _cache

  // Env vars take precedence over the config file
  if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
    _cache = {
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
      nextAuthSecret:
        process.env.NEXTAUTH_SECRET ??
        crypto.randomBytes(32).toString("hex"),
    }
    return _cache
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8")
    _cache = JSON.parse(raw) as AppConfig
  } catch {
    _cache = null
  }
  return _cache
}

export function saveAppConfig(config: AppConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")
  _cache = config
}

export function isConfigured(): boolean {
  return getAppConfig() !== null
}
