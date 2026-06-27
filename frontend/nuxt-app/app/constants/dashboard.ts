import type { NavItem } from "~/types/dashboard";

export const dashboardNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: "LayoutDashboard",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Students",
    path: "/students",
    icon: "Users",
    priority: "high",
    roles: ["manager", "partner"],
  },
  {
    label: "Institutes",
    path: "/institutes",
    icon: "Building2",
    priority: "high",
    roles: ["manager", "partner"],
  },
  {
    label: "Courses",
    path: "/courses",
    icon: "BookOpen",
    priority: "high",
    roles: ["manager", "partner"],
  },
  {
    label: "Administration",
    path: "/users",
    icon: "Shield",
    priority: "high",
    roles: ["manager"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "Settings",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
];
