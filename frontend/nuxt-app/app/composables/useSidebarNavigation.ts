import type { NavigationMenuItem } from "@nuxt/ui";
import { resolveIconName } from "~/constants/icons";
import { sidebarNavigationGroups } from "~/constants/navigation";

export type SidebarNavigationGroup = {
  label: string;
  items: NavigationMenuItem[];
};

export const useSidebarNavigation = () => {
  const route = useRoute();
  const auth = useAuthStore();
  const { navItems } = useDashboardData();

  const navigationItems = computed<NavigationMenuItem[]>(() =>
    navItems
      .filter((item) => auth.user && item.roles.includes(auth.user.role))
      .map((item) => {
        const path = item.path === "/" ? auth.roleDashboardPath : item.path;

        return {
          label: item.label,
          icon: resolveIconName(item.icon, "i-lucide-circle"),
          to: path,
          active: isActivePath(path),
          tooltip: { text: item.label },
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
    return route.path === path || (path !== "/" && route.path.startsWith(`${path}/`));
  }

  return { navigationGroups };
};
