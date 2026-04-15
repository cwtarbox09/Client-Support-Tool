/**
 * Mapping of Microsoft SKU part numbers to human-readable product names.
 * Updated to include current M365, O365, EMS, and add-on licenses.
 */
export const SKU_NAMES: Record<string, string> = {
  // Microsoft 365 Business
  O365_BUSINESS_ESSENTIALS: "Microsoft 365 Business Basic",
  SMB_BUSINESS: "Microsoft 365 Apps for Business",
  O365_BUSINESS_PREMIUM: "Microsoft 365 Business Standard",
  SPB: "Microsoft 365 Business Premium",

  // Microsoft 365 Enterprise
  SPE_E3: "Microsoft 365 E3",
  SPE_E5: "Microsoft 365 E5",
  SPE_E5_NOPSTNCONF: "Microsoft 365 E5 (no Teams Audio Conferencing)",
  SPE_F1: "Microsoft 365 F1",
  SPE_F3: "Microsoft 365 F3",

  // Office 365 Enterprise
  STANDARDPACK: "Office 365 E1",
  ENTERPRISEPACK: "Office 365 E3",
  ENTERPRISEPREMIUM: "Office 365 E5",
  DESKLESSPACK: "Office 365 F3",
  ENTERPRISEPREMIUM_NOPSTNCONF: "Office 365 E5 (no Audio Conf)",
  DEVELOPERPACK_E3: "Office 365 E3 Developer",

  // Microsoft 365 Apps
  OFFICESUBSCRIPTION: "Microsoft 365 Apps for Enterprise",
  O365_BUSINESS: "Microsoft 365 Apps for Business",

  // Exchange Online
  EXCHANGESTANDARD: "Exchange Online Plan 1",
  EXCHANGEENTERPRISE: "Exchange Online Plan 2",
  EXCHANGE_S_DESKLESS: "Exchange Online Kiosk",
  EXCHANGEARCHIVE_ADDON: "Exchange Online Archiving",

  // SharePoint Online
  SHAREPOINTSTANDARD: "SharePoint Online Plan 1",
  SHAREPOINTENTERPRISE: "SharePoint Online Plan 2",

  // Teams
  TEAMS_EXPLORATORY: "Microsoft Teams Exploratory",
  TEAMS_FREE: "Microsoft Teams Free",
  Teams_Phone_Standard: "Teams Phone Standard",
  MCOTEAMS_ESSENTIALS: "Teams Essentials",

  // Intune & EMS
  INTUNE_A: "Microsoft Intune",
  INTUNE_A_D: "Microsoft Intune Device",
  EMS: "Enterprise Mobility + Security E3",
  EMSPREMIUM: "Enterprise Mobility + Security E5",
  INTUNE_SMB: "Microsoft Intune for SMB",

  // Azure AD / Entra ID
  AAD_PREMIUM: "Microsoft Entra ID P1",
  AAD_PREMIUM_P2: "Microsoft Entra ID P2",
  AAD_SMB: "Microsoft Entra ID P1 (SMB)",

  // Security & Compliance
  ATP_ENTERPRISE: "Microsoft Defender for Office 365 P1",
  THREAT_INTELLIGENCE: "Microsoft Defender for Office 365 P2",
  DEFENDER_ENDPOINT_P1: "Microsoft Defender for Endpoint P1",
  MDATP_XPLAT: "Microsoft Defender for Endpoint P2",
  ATA: "Microsoft Defender for Identity",
  WINDEFATP: "Microsoft Defender for Endpoint",
  CLDAPP: "Microsoft Defender for Cloud Apps",
  INFORMATION_PROTECTION_COMPLIANCE: "Microsoft Purview E5 Compliance",
  MICROSOFTDEFENDERFOROFFICE365PLAN1: "Defender for Office 365 Plan 1",
  RIGHTSMANAGEMENT: "Azure Information Protection P1",
  RIGHTSMANAGEMENT_ADHOC: "Azure Information Protection Free",

  // Power Platform
  POWER_BI_PRO: "Power BI Pro",
  POWER_BI_PREMIUM_PER_USER: "Power BI Premium Per User",
  FLOW_FREE: "Power Automate Free",
  POWERFLOW_P1: "Power Automate per user plan",
  POWERAPPS_PER_USER: "Power Apps per user plan",
  DYN365_ENTERPRISE_PLAN1: "Dynamics 365 Customer Engagement Plan",

  // Project & Visio
  PROJECTPREMIUM: "Project Plan 5",
  PROJECTPROFESSIONAL: "Project Plan 3",
  PROJECTESSENTIALS: "Project Plan 1",
  VISIOCLIENT: "Visio Plan 2",
  VISIOONLINE_PLAN1: "Visio Plan 1",

  // Voice & Calling
  MCOSTANDARD: "Skype for Business Online Plan 2",
  MCOPSTN1: "Teams Domestic Calling Plan",
  MCOPSTN2: "Teams International Calling Plan",
  MCOMEETADV: "Audio Conferencing",

  // Developer
  DEVELOPERPACK: "Office 365 E3 Developer",
  WINDOWS_STORE: "Windows Store for Business",

  // Education
  STANDARDWOFFPACK_IW_STUDENT: "Office 365 A1 Plus for Students",
  STANDARDWOFFPACK_IW_FACULTY: "Office 365 A1 Plus for Faculty",
  M365EDU_A3_STUDENT: "Microsoft 365 A3 for Students",
  M365EDU_A5_STUDENT: "Microsoft 365 A5 for Students",
  M365EDU_A3_FACULTY: "Microsoft 365 A3 for Faculty",
  M365EDU_A5_FACULTY: "Microsoft 365 A5 for Faculty",

  // Copilot
  Microsoft_365_Copilot: "Microsoft 365 Copilot",
  COPILOT_STUDIO_IN_A_DAY_ADD_ON: "Copilot Studio",
  Copilot_For_Security_CU: "Microsoft Copilot for Security",

  // Misc
  WINDOWS_TSC: "Windows 365 Cloud PC",
  CPC_E_2C_4GB_64GB: "Windows 365 Enterprise 2vCPU 4GB 64GB",
}

export function getSkuDisplayName(skuPartNumber: string): string {
  return SKU_NAMES[skuPartNumber] ?? skuPartNumber.replace(/_/g, " ")
}
