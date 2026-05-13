import { resolveIconName } from "~/constants/icons";
import { sidebarNavigationGroups } from "~/constants/navigation";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";

export type SidebarNavigationItem = {
  label: string;
  icon?: string;
  to?: string;
  active?: boolean;
  tooltip?: { text: string };
  children?: SidebarNavigationItem[];
};

export type SidebarNavigationGroup = {
  label: string;
  items: SidebarNavigationItem[];
};

export const useSidebarNavigation = () => {
  const route = useRoute();
  const auth = useAuthStore();
  const { navItems } = useDashboardData();

  const navigationItems = computed<SidebarNavigationItem[]>(() =>
    navItems
      .filter((item) => auth.user && item.roles.includes(auth.user.role))
      .map((item) => {
        const path = item.path === "/" ? auth.roleDashboardPath : item.path;
        const children = getItemChildren(item.label);
        const active =
          isActivePath(path) ||
          children.some((child) => child.to && isActivePath(child.to));

        return {
          label: item.label,
          icon: resolveIconName(item.icon, "i-lucide-circle"),
          to: path,
          active,
          tooltip: { text: item.label },
          children,
        };
      }),
  );

  const navigationGroups = computed<SidebarNavigationGroup[]>(() =>
    sidebarNavigationGroups
      .map((group) => ({
        label: group.label,
        items: navigationItems.value.filter((item) =>
          group.itemLabels.includes(item.label || ""),
        ),
      }))
      .filter((group) => group.items.length),
  );

  function isActivePath(path: string) {
    return (
      route.path === path || (path !== "/" && route.path.startsWith(`${path}/`))
    );
  }

  function getItemChildren(label: string): SidebarNavigationItem[] {
    if (label === "User Management") {
      return [
        {
          label: "Users",
          to: "/users",
          active: isActivePath("/users"),
        },
        {
          label: "Roles",
          to: "/roles",
          active: isActivePath("/roles"),
        },
        {
          label: "Permissions",
          to: "/permissions",
          active: isActivePath("/permissions"),
        },
      ];
    }

    return [];
  }

  return { navigationGroups };
};
