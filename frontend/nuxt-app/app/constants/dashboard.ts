import type {
  GenderInstitution,
  Metric,
  NavItem,
  Report,
  User,
  WeeklyTrafficPoint,
} from "~/types/dashboard";
import { appColors } from "~/constants/colors";

export const dashboardNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Student Analytics",
    path: "/students",
    icon: "Users",
    priority: "high",
    roles: ["manager", "partner"],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: "ChartNoAxesCombined",
    priority: "medium",
    roles: ["manager", "partner"],
  },
  {
    label: "Course Analytics",
    path: "/courses",
    icon: "BookOpen",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Learning Activity",
    path: "/activity",
    icon: "Activity",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Assignment Analytics",
    path: "/assignments",
    icon: "FileBarChart",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Quiz Analytics",
    path: "/quizzes",
    icon: "CircleHelp",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Grade Analytics",
    path: "/grades",
    icon: "GraduationCap",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Attendance",
    path: "/attendance",
    icon: "CalendarCheck",
    priority: "medium",
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
    roles: ["manager", "partner", "visitor"],
  },
];

export const dashboardMetrics: Metric[] = [
  {
    label: "Total Students",
    value: "12,847",
    trend: "+12.5% from last month",
    icon: "Users",
    color: appColors.primaryHover,
    sparkline: [48, 52, 51, 57, 63, 68, 74, 81],
  },
  {
    label: "Total Institutions",
    value: "24",
    trend: "+2% new this year",
    icon: "Building2",
    color: appColors.purple,
    sparkline: [18, 18, 19, 20, 21, 21, 23, 24],
  },
  {
    label: "Departments",
    value: "156",
    trend: "+8% across all institutions",
    icon: "BookOpen",
    color: appColors.success,
    sparkline: [120, 126, 130, 128, 139, 145, 149, 156],
  },
  {
    label: "Active Users",
    value: "1,283",
    trend: "+4.3% currently online",
    icon: "UserRoundCheck",
    color: appColors.warning,
    sparkline: [780, 860, 840, 930, 1020, 1085, 1160, 1283],
  },
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

export const genderByInstitution: GenderInstitution[] = [
  {
    institution: "ITC",
    male: 2520,
    female: 1680,
    total: 4200,
    malePercent: 60,
    femalePercent: 40,
  },
  {
    institution: "RUPP",
    male: 2090,
    female: 1710,
    total: 3800,
    malePercent: 55,
    femalePercent: 45,
  },
  {
    institution: "NUM",
    male: 1450,
    female: 1450,
    total: 2900,
    malePercent: 50,
    femalePercent: 50,
  },
  {
    institution: "URDSE",
    male: 720,
    female: 480,
    total: 1200,
    malePercent: 60,
    femalePercent: 40,
  },
  {
    institution: "NPIC",
    male: 454,
    female: 293,
    total: 747,
    malePercent: 60.8,
    femalePercent: 39.2,
  },
];
