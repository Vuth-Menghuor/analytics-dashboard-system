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

export type AccountSettingsStringFieldKey = {
  [Key in keyof AccountSettingsFormState]: AccountSettingsFormState[Key] extends string
    ? Key
    : never;
}[keyof AccountSettingsFormState];

export type AccountSettingsFormField = {
  label: string;
  key: AccountSettingsStringFieldKey;
  type?: string;
};

export type AccountOverviewDetailItem =
  | {
      label: string;
      key: keyof AccountSettingsFormState;
    }
  | {
      label: string;
      value: string;
    };

export type AccountNotificationOption = {
  key: keyof Pick<
    AccountSettingsFormState,
    | "notifyEmail"
    | "notifyApproval"
    | "notifyReports"
    | "notifySystem"
    | "securityAlerts"
    | "dataExports"
    | "accessRequests"
  >;
  label: string;
  description: string;
  visibleFor?: AuthRole[];
  hiddenFor?: AuthRole[];
};

export const accountSettingsInitialFormState: AccountSettingsFormState = {
  displayName: "",
  username: "moodle.analyst",
  email: "",
  phone: "+855 12 345 678",
  position: "",
  institution: "Institute of Technology of Cambodia",
  reportSignature: "",
  newPassword: "",
  confirmPassword: "",
  language: "en",
  chartType: "bar",
  defaultFilter: "institute",
  notifyEmail: true,
  notifyApproval: true,
  notifyReports: true,
  notifySystem: true,
  securityAlerts: true,
  dataExports: true,
  accessRequests: true,
  theme: "system",
  density: "comfortable",
};

export const accountSettingsSectionAliases: Record<string, AccountSettingsSectionValue> = {
  account: "overview",
  "personal-info": "profile",
  appearance: "preferences",
  role: "overview",
  "role-access": "overview",
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

export const accountOverviewDetailItems: AccountOverviewDetailItem[] = [
  { label: "Email", key: "email" },
  { label: "Phone number", key: "phone" },
  { label: "Password", value: "Enabled" },
  { label: "Username", key: "username" },
  { label: "Institution", key: "institution" },
];

export const accountProfileFields: AccountSettingsFormField[] = [
  { label: "Display name", key: "displayName" },
  { label: "Email", key: "email", type: "email" },
  { label: "Username", key: "username" },
  { label: "Phone", key: "phone", type: "tel" },
  { label: "Institution", key: "institution" },
  { label: "Report signature", key: "reportSignature" },
];

export const accountSecurityFields: AccountSettingsFormField[] = [
  { label: "New password", key: "newPassword", type: "password" },
  { label: "Confirm password", key: "confirmPassword", type: "password" },
];

export const accountNotificationOptions: AccountNotificationOption[] = [
  {
    key: "notifyEmail",
    label: "Email notifications",
    description: "Receive important account updates by email.",
  },
  {
    key: "notifyApproval",
    label: "Partner approval requests",
    description: "Notify when a partner account needs review.",
    visibleFor: ["manager"],
  },
  {
    key: "notifyReports",
    label: "Report update notification",
    description: "Notify when dashboard or institute reports change.",
    hiddenFor: ["visitor"],
  },
  {
    key: "accessRequests",
    label: "Access request status",
    description: "Track partner access or role change requests.",
  },
  {
    key: "dataExports",
    label: "Data export finished",
    description: "Notify when report exports are ready.",
    hiddenFor: ["visitor"],
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "Warn me about sign-in and session changes.",
  },
  {
    key: "notifySystem",
    label: "System alert notification",
    description: "Receive platform announcements and system alerts.",
    hiddenFor: ["partner"],
  },
];
