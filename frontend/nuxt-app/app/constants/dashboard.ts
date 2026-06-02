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
    label: "Courses",
    path: "/courses",
    icon: "BookOpen",
    priority: "high",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "User Activity",
    path: "/activity",
    icon: "Activity",
    priority: "medium",
    roles: ["manager", "partner", "visitor"],
  },
  {
    label: "Learning Analytics",
    path: "/learning-performance",
    icon: "GraduationCap",
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
    label: "Administration",
    path: "/users",
    icon: "Shield",
    priority: "high",
    roles: ["manager"],
  },
  {
    label: "Profile",
    path: "/profile",
    icon: "UserRound",
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
