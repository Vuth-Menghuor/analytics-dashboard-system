import type { AuthRole } from "~/types/auth";

export type AccountSettingsSectionValue =
  | "overview"
  | "profile"
  | "security"
  | "preferences"
  | "notifications";

export type AccountSettingsSection = {
  label: string;
  value: AccountSettingsSectionValue;
  icon: string;
  description: string;
};

export type AccountRoleCapabilities = {
  canEditInstitute: boolean;
  canEditSecurity: boolean;
  canDeleteAccount: boolean;
  canSeeAdminAccess: boolean;
  canEditPreferences: boolean;
  canEditNotifications: boolean;
};

export type AccountAccessItem = {
  label: string;
  icon: string;
  muted?: boolean;
};

export type AccountAccessSummary = {
  scopeLabel: string;
  scopeValue: string;
  badgeLabel: string;
  badgeIcon?: string;
  badgeTone: "success" | "neutral";
  capabilities: AccountAccessItem[];
  actions: AccountAccessItem[];
};

export type AccountSettingsOption = {
  label: string;
  value: string;
  icon?: string;
  description?: string;
};

export type AccountSettingsFormState = {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  position: string;
  institution: string;
  reportSignature: string;
  newPassword: string;
  confirmPassword: string;
  language: string;
  chartType: string;
  defaultFilter: string;
  notifyEmail: boolean;
  notifyApproval: boolean;
  notifyReports: boolean;
  notifySystem: boolean;
  securityAlerts: boolean;
  dataExports: boolean;
  accessRequests: boolean;
  theme: string;
  density: string;
};

export const accountSettingsSections: AccountSettingsSection[] = [
  {
    label: "Overview",
    value: "overview",
    icon: "i-lucide-layout-dashboard",
    description: "Account snapshot",
  },
  {
    label: "User Profile",
    value: "profile",
    icon: "i-lucide-id-card",
    description: "Report identity",
  },
  {
    label: "Security",
    value: "security",
    icon: "i-lucide-shield-check",
    description: "Password access",
  },
  {
    label: "Preference",
    value: "preferences",
    icon: "i-lucide-sliders-horizontal",
    description: "UI defaults",
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: "i-lucide-bell-ring",
    description: "Alert settings",
  },
];

export const accountRoleCapabilities: Record<
  AuthRole,
  AccountRoleCapabilities
> = {
  manager: {
    canEditInstitute: true,
    canEditSecurity: true,
    canDeleteAccount: false,
    canSeeAdminAccess: true,
    canEditPreferences: true,
    canEditNotifications: true,
  },
  partner: {
    canEditInstitute: true,
    canEditSecurity: true,
    canDeleteAccount: false,
    canSeeAdminAccess: false,
    canEditPreferences: true,
    canEditNotifications: true,
  },
  visitor: {
    canEditInstitute: false,
    canEditSecurity: false,
    canDeleteAccount: false,
    canSeeAdminAccess: false,
    canEditPreferences: true,
    canEditNotifications: true,
  },
};

export const accountAccessSummaries: Record<AuthRole, AccountAccessSummary> = {
  manager: {
    scopeLabel: "Access scope",
    scopeValue: "All institutes and partner requests",
    badgeLabel: "Admin access",
    badgeTone: "success",
    capabilities: [
      { label: "Manage all institutes", icon: "i-lucide-building-2" },
      { label: "Assign partner accounts", icon: "i-lucide-user-plus" },
      {
        label: "Approve or reject partner requests",
        icon: "i-lucide-clipboard-check",
      },
    ],
    actions: [
      { label: "Manage institutes", icon: "i-lucide-building-2" },
      { label: "Invite partner", icon: "i-lucide-user-plus" },
      { label: "Review requests", icon: "i-lucide-inbox" },
    ],
  },
  partner: {
    scopeLabel: "Assigned institute",
    scopeValue: "{{institution}}",
    badgeLabel: "Active access",
    badgeTone: "success",
    capabilities: [
      { label: "View assigned institute data", icon: "i-lucide-eye" },
      { label: "Update institute profile", icon: "i-lucide-school" },
      {
        label: "Submit and review institute reports",
        icon: "i-lucide-file-check-2",
      },
      {
        label: "Request access changes from a manager",
        icon: "i-lucide-send",
      },
    ],
    actions: [
      { label: "Request access change", icon: "i-lucide-send" },
      { label: "View institute profile", icon: "i-lucide-school" },
      { label: "Contact manager", icon: "i-lucide-message-circle" },
    ],
  },
  visitor: {
    scopeLabel: "Access scope",
    scopeValue: "Public dashboard and basic profile",
    badgeLabel: "Limited access",
    badgeIcon: "i-lucide-lock-keyhole",
    badgeTone: "neutral",
    capabilities: [
      {
        label: "View limited public dashboard data",
        icon: "i-lucide-layout-dashboard",
      },
      { label: "Update basic profile only", icon: "i-lucide-user-pen" },
      {
        label: "Institute reports and private data are locked",
        icon: "i-lucide-lock",
        muted: true,
      },
      {
        label: "User management and approvals are locked",
        icon: "i-lucide-shield-x",
        muted: true,
      },
    ],
    actions: [
      { label: "Request partner access", icon: "i-lucide-send" },
      { label: "View public dashboard", icon: "i-lucide-layout-dashboard" },
    ],
  },
};

export const accountThemeModes: AccountSettingsOption[] = [
  {
    label: "System",
    value: "system",
    icon: "i-lucide-monitor",
    description: "Follow device setting",
  },
  {
    label: "Light",
    value: "light",
    icon: "i-lucide-sun",
    description: "Bright dashboard UI",
  },
  {
    label: "Dark",
    value: "dark",
    icon: "i-lucide-moon",
    description: "Low-light workspace",
  },
];

export const accountDensityOptions: AccountSettingsOption[] = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

export const accountLanguageOptions: AccountSettingsOption[] = [
  { label: "English", value: "en" },
  { label: "Khmer", value: "km" },
];

export const accountChartTypeOptions: AccountSettingsOption[] = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
  { label: "Pie", value: "pie" },
];

export const accountDefaultFilterOptions: AccountSettingsOption[] = [
  { label: "Institute", value: "institute" },
  { label: "Year", value: "year" },
  { label: "Department", value: "department" },
];
