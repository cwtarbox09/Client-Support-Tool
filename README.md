# M365 TAM Dashboard

A technical account manager portal for Microsoft 365, Entra ID, and Intune environments. Built with Next.js 14, NextAuth.js, and the Microsoft Graph API using **delegated authentication** — all data is fetched in real-time on behalf of the signed-in user. Nothing is stored server-side.

## Features

- **Overview Dashboard** — license inventory, user counts, Intune device compliance, and Secure Score
- **License Inventory** — purchased vs. consumed per SKU, utilization bars, expiration dates, and status
- **Device Health** — Intune compliance breakdown (compliant / non-compliant / grace period) and platform distribution chart
- **User Breakdown** — total, licensed, guest, and disabled account counts
- **Microsoft Secure Score** — radial gauge with current score vs. max
- **Quick Reference panel** — client-report-ready snapshot of key metrics
- Graceful degradation when permissions are missing (shows partial data with warnings)
- Token refresh handled automatically

Coming soon: Conditional Access, per-user license details, Reports, and more.

---

## Setup

### 1. Register an Azure AD App

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
2. Click **New registration**
3. Name: `TAM Dashboard` (or similar)
4. Supported account types: **Multitenant** (`Accounts in any organizational directory`) if you need to access multiple clients, or **Single tenant** for your own org only
5. Redirect URI: `Web` → `https://your-app.vercel.app/api/auth/callback/azure-ad` (add `http://localhost:3000/api/auth/callback/azure-ad` for local dev)

### 2. Configure API Permissions

Under **API Permissions → Add a permission → Microsoft Graph → Delegated permissions**, add:

| Permission | Purpose |
|---|---|
| `User.Read` | Sign in and read basic profile |
| `Directory.Read.All` | Read users, groups, directory objects |
| `Organization.Read.All` | Read org info and license subscriptions |
| `DeviceManagementManagedDevices.Read.All` | Read Intune managed devices |
| `DeviceManagementConfiguration.Read.All` | Read device compliance policies |
| `SecurityEvents.Read.All` | Read Secure Score |
| `Policy.Read.All` | Read Conditional Access policies (future use) |
| `Reports.Read.All` | Read usage reports (future use) |

> **Admin consent required** — Click **Grant admin consent for [tenant]** after adding permissions.

### 3. Create a Client Secret

**Certificates & secrets → New client secret** — copy the value immediately (it's only shown once).

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
AZURE_AD_CLIENT_ID=<Application (client) ID from the app registration>
AZURE_AD_CLIENT_SECRET=<Client secret value>
AZURE_AD_TENANT_ID=common        # or your specific tenant ID
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a Microsoft 365 work or school account that has the permissions above.

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in **Project Settings → Environment Variables**:
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_CLIENT_SECRET`
   - `AZURE_AD_TENANT_ID`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → set to your Vercel production URL (e.g. `https://your-app.vercel.app`)
4. Add the Vercel URL to the app registration's **Redirect URIs**: `https://your-app.vercel.app/api/auth/callback/azure-ad`
5. Deploy — Vercel auto-detects Next.js

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js v4 with Azure AD provider |
| Data | Microsoft Graph API (delegated) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Architecture Notes

- **Delegated auth** means the app calls Graph API on behalf of the signed-in user — the user's own permissions apply, so they must be a Global Reader or have equivalent read access in the target tenant.
- The access token is stored in a secure JWT session cookie and automatically refreshed using the refresh token.
- All Graph calls are made server-side in Next.js Server Components — the access token is never exposed to the browser.
- The app uses `Promise.allSettled` to fetch all overview sections in parallel and show partial data gracefully when some calls fail.

---

## Adding More Pages

To add a new page (e.g., Conditional Access):

1. Create `app/dashboard/conditional-access/page.tsx`
2. Add Graph API function(s) to `lib/graph.ts`
3. Update the nav item in `components/layout/Sidebar.tsx` (remove `soon: true`)
4. Add any required Graph permissions to `lib/auth.ts` scopes and the Azure AD app registration

The required Graph permission for Conditional Access policies is `Policy.Read.All` (already requested in the auth config).
