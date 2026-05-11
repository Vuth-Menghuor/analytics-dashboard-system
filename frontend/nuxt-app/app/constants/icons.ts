export const iconNameMap: Record<string, string> = {
  Bell: "i-lucide-bell",
  BookOpen: "i-lucide-book-open",
  ChartNoAxesCombined: "i-lucide-chart-no-axes-combined",
  Check: "i-lucide-check",
  ChevronDown: "i-lucide-chevron-down",
  CircleHelp: "i-lucide-circle-help",
  DollarSign: "i-lucide-dollar-sign",
  Download: "i-lucide-download",
  FileBarChart: "i-lucide-file-bar-chart",
  FolderTree: "i-lucide-folder-tree",
  LayoutDashboard: "i-lucide-layout-dashboard",
  LogOut: "i-lucide-log-out",
  Menu: "i-lucide-menu",
  Plus: "i-lucide-plus",
  Search: "i-lucide-search",
  Settings: "i-lucide-settings",
  TrendingUp: "i-lucide-trending-up",
  UserCircle: "i-lucide-circle-user-round",
  Users: "i-lucide-users",
  X: "i-lucide-x",
};

export function resolveIconName(
  name: string,
  fallback = "i-lucide-circle-help",
) {
  return name.startsWith("i-") ? name : (iconNameMap[name] ?? fallback);
}
