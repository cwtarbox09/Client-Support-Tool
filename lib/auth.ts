import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { getAppConfig } from "./config"

/**
 * Required delegated Microsoft Graph API permissions:
 *
 * User.Read                              - Sign in and read user profile
 * Directory.Read.All                     - Read all directory data (users, groups, SKUs)
 * Organization.Read.All                  - Read organization info and subscriptions
 * DeviceManagementManagedDevices.Read.All - Read Intune managed devices
 * DeviceManagementConfiguration.Read.All - Read device compliance policies
 * SecurityEvents.Read.All                - Read security events (Secure Score)
 * Policy.Read.All                        - Read conditional access policies (future)
 * Reports.Read.All                       - Read usage reports
 */

export function getAuthOptions(): NextAuthOptions {
  const config = getAppConfig()
  if (!config) {
    throw new Error("App is not configured — visit /setup to complete first-time setup.")
  }

  return {
    providers: [
      AzureADProvider({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        tenantId: config.tenantId,
        authorization: {
          params: {
            scope: [
              "openid",
              "profile",
              "email",
              "offline_access",
              "User.Read",
              "Directory.Read.All",
              "Organization.Read.All",
              "DeviceManagementManagedDevices.Read.All",
              "DeviceManagementConfiguration.Read.All",
              "SecurityEvents.Read.All",
              "Policy.Read.All",
              "Reports.Read.All",
            ].join(" "),
          },
        },
      }),
    ],

    callbacks: {
      async jwt({ token, account }) {
        // On initial sign in, persist the access token and refresh token
        if (account) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          return token
        }

        // Token is still valid
        if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
          return token
        }

        // Token has expired — try to refresh
        if (token.refreshToken) {
          try {
            const params = new URLSearchParams({
              client_id: config.clientId,
              client_secret: config.clientSecret,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            })

            const response = await fetch(
              `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
              }
            )

            const refreshed = await response.json()
            if (!response.ok) throw refreshed

            return {
              ...token,
              accessToken: refreshed.access_token,
              expiresAt: Math.floor(Date.now() / 1000 + refreshed.expires_in),
              refreshToken: refreshed.refresh_token ?? token.refreshToken,
            }
          } catch (error) {
            console.error("Failed to refresh access token:", error)
            return { ...token, error: "RefreshAccessTokenError" }
          }
        }

        return token
      },

      async session({ session, token }) {
        session.accessToken = token.accessToken as string | undefined
        session.error = token.error as string | undefined
        return session
      },
    },

    pages: {
      signIn: "/login",
      error: "/login",
    },

    session: {
      strategy: "jwt",
      maxAge: 8 * 60 * 60, // 8 hours
    },

    secret: config.nextAuthSecret,
  }
}
