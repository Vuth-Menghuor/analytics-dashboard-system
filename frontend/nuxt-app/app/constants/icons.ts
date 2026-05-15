export const iconNameMap: Record<string, string> = {
  Activity: "i-lucide-activity",
  Ban: "i-lucide-ban",
  Bell: "i-lucide-bell",
  BookOpen: "i-lucide-book-open",
  Building2: "i-lucide-building-2",
  CalendarCheck: "i-lucide-calendar-check",
  ChartNoAxesCombined: "i-lucide-chart-no-axes-combined",
  Check: "i-lucide-check",
  ChevronDown: "i-lucide-chevron-down",
  CircleHelp: "i-lucide-circle-help",
  Clock: "i-lucide-clock-3",
  DollarSign: "i-lucide-dollar-sign",
  Download: "i-lucide-download",
  Eye: "i-lucide-eye",
  FileBarChart: "i-lucide-file-bar-chart",
  FolderTree: "i-lucide-folder-tree",
  GraduationCap: "i-lucide-graduation-cap",
  LayoutDashboard: "i-lucide-layout-dashboard",
  LogOut: "i-lucide-log-out",
  Menu: "i-lucide-menu",
  Plus: "i-lucide-plus",
  Search: "i-lucide-search",
  Settings: "i-lucide-settings",
  Shield: "i-lucide-shield",
  TrendingUp: "i-lucide-trending-up",
  UserCircle: "i-lucide-circle-user-round",
  UserRoundCheck: "i-lucide-user-round-check",
  Users: "i-lucide-users",
  X: "i-lucide-x",
};

export function resolveIconName(
  name: string,
  fallback = "i-lucide-circle-help",
) {
  return name.startsWith("i-") ? name : (iconNameMap[name] ?? fallback);
}
