export const adminPermissionStats = [
  {
    label: "Route rules",
    value: "Route middleware",
    description: "Protected dashboard routes",
    icon: "i-lucide-route",
  },
  {
    label: "Admin actions",
    value: "Manager only",
    description: "Manager-only operations",
    icon: "i-lucide-lock-keyhole",
  },
  {
    label: "Read access",
    value: "Role based",
    description: "Analytics visibility levels",
    icon: "i-lucide-eye",
  },
] as const;

export const adminPermissionRoleSummaries = [
  { role: "Manager", scope: "Full admin" },
  { role: "Partner", scope: "Institution workspace" },
  { role: "Visitor", scope: "Read-only" },
] as const;

export const adminPermissionModules = [
  {
    label: "Learning analytics",
    routes: "5 pages",
    manager: "Full",
    partner: "Full",
    visitor: "Read",
  },
  {
    label: "Administration",
    routes: "3 pages",
    manager: "Full",
    partner: "Blocked",
    visitor: "Blocked",
  },
  {
    label: "Reports",
    routes: "1 page",
    manager: "Export",
    partner: "Export",
    visitor: "Read",
  },
] as const;

export const adminPermissionRows = [
  {
    permission: "View dashboard",
    manager: true,
    partner: true,
    visitor: true,
    notes: "Role-specific dashboard redirects",
  },
  {
    permission: "View analytics pages",
    manager: true,
    partner: true,
    visitor: true,
    notes: "Dashboard, students, courses, activity, analytics, and reports",
  },
  {
    permission: "Manage users",
    manager: true,
    partner: false,
    visitor: false,
    notes: "User table and account status actions",
  },
  {
    permission: "Manage roles",
    manager: true,
    partner: false,
    visitor: false,
    notes: "Role definitions and access scope",
  },
  {
    permission: "Export reports",
    manager: true,
    partner: true,
    visitor: false,
    notes: "CSV exports from Moodle analytics endpoints",
  },
  {
    permission: "Edit account settings",
    manager: true,
    partner: true,
    visitor: true,
    notes: "Settings are constrained by active role",
  },
] as const;

export const adminPermissionColumns = [
  { key: "permission", label: "Permission", width: "28%", rowHeader: true },
  {
    key: "manager",
    label: "Manager",
    width: "12%",
    type: "status",
    trueLabel: "Allowed",
    falseLabel: "Blocked",
  },
  {
    key: "partner",
    label: "Partner",
    width: "12%",
    type: "status",
    trueLabel: "Allowed",
    falseLabel: "Blocked",
  },
  {
    key: "visitor",
    label: "Visitor",
    width: "12%",
    type: "status",
    trueLabel: "Allowed",
    falseLabel: "Blocked",
  },
  { key: "notes", label: "Notes", width: "36%", tone: "muted" },
] as const;

export const adminRoleStats = [
  {
    label: "Manager",
    value: "Full access",
    description: "Full dashboard and administration access",
    icon: "i-lucide-shield-check",
  },
  {
    label: "Partner",
    value: "Analytics access",
    description: "Institution workspace and analytics access",
    icon: "i-lucide-handshake",
  },
  {
    label: "Visitor",
    value: "Read-only access",
    description: "Read-only public dashboard access",
    icon: "i-lucide-eye",
  },
] as const;

export const adminRoleRows = [
  {
    role: "Manager",
    scope: "All institutes",
    dashboard: "Full access",
    administration: "Users, roles, permissions",
    status: "Active",
  },
  {
    role: "Partner",
    scope: "Assigned institute",
    dashboard: "Analytics and reports",
    administration: "Limited profile settings",
    status: "Active",
  },
  {
    role: "Visitor",
    scope: "Public dashboard",
    dashboard: "Read-only summaries",
    administration: "No admin access",
    status: "Active",
  },
] as const;

export const adminRoleColumns = [
  { key: "role", label: "Role", width: "18%", rowHeader: true },
  { key: "scope", label: "Scope", width: "20%" },
  { key: "dashboard", label: "Dashboard access", width: "22%" },
  { key: "administration", label: "Administration", width: "22%" },
  { key: "status", label: "Status", width: "12%", type: "status" },
] as const;

export const adminRolePolicies = [
  {
    label: "Route protection",
    value: "definePageMeta",
    detail: "Pages declare allowed roles before rendering protected dashboard content.",
  },
  {
    label: "Navigation visibility",
    value: "Sidebar roles",
    detail: "Menu items are filtered by the active user role in the sidebar composable.",
  },
  {
    label: "Account scope",
    value: "Role session",
    detail: "Settings and profile actions stay constrained by the signed-in role.",
  },
] as const;
