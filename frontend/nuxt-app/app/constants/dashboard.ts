import type { Metric, NavItem, Report, User, WeeklyTrafficPoint } from "~/types/dashboard";

export const dashboardNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "User Profile",
    path: "/profile",
    icon: "UserCircle",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "User Management",
    path: "/users",
    icon: "Users",
    priority: "high",
    roles: ["manager"],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: "ChartNoAxesCombined",
    priority: "medium",
    roles: ["manager", "partner"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "FileBarChart",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "Settings",
    priority: "medium",
    roles: ["manager"],
  },
];

export const dashboardMetrics: Metric[] = [
  { label: "Total Students", value: "12,847", trend: "+12.5% from last month", icon: "Users" },
  { label: "Total Institutions", value: "24", trend: "+2% new this year", icon: "Building2" },
  { label: "Departments", value: "156", trend: "+8% across all institutions", icon: "BookOpen" },
  { label: "Active Users", value: "1,283", trend: "+4.3% currently online", icon: "UserRoundCheck" },
];

export const dashboardUsers: User[] = [
  {
    id: 1,
    name: "Maya Chen",
    email: "maya@company.com",
    role: "Admin",
    status: "Active",
    lastSeen: "Today",
  },
  {
    id: 2,
    name: "Jon Bell",
    email: "jon@company.com",
    role: "Analyst",
    status: "Active",
    lastSeen: "Yesterday",
  },
  {
    id: 3,
    name: "Ari Patel",
    email: "ari@company.com",
    role: "Manager",
    status: "Pending",
    lastSeen: "Invited",
  },
  {
    id: 4,
    name: "Nora Kim",
    email: "nora@company.com",
    role: "Viewer",
    status: "Active",
    lastSeen: "May 6",
  },
];

export const dashboardReports: Report[] = [
  {
    id: 1,
    name: "Executive KPI Summary",
    owner: "Maya Chen",
    cadence: "Weekly",
    status: "Ready",
  },
  {
    id: 2,
    name: "Acquisition Funnel",
    owner: "Jon Bell",
    cadence: "Daily",
    status: "Ready",
  },
  {
    id: 3,
    name: "Retention Cohorts",
    owner: "Ari Patel",
    cadence: "Monthly",
    status: "Draft",
  },
];

export const weeklyTraffic: WeeklyTrafficPoint[] = [
  { label: "Mon", value: 54 },
  { label: "Tue", value: 68 },
  { label: "Wed", value: 75 },
  { label: "Thu", value: 62 },
  { label: "Fri", value: 88 },
  { label: "Sat", value: 42 },
  { label: "Sun", value: 57 },
];
