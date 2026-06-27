import { resolveIconName } from "~/constants/icons";
import { sidebarNavigationGroups } from "~/constants/navigation";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";
import { getPartnerRequests } from "~/services/admin.service";

export type SidebarNavigationItem = {
  label: string;
  icon?: string;
  to?: string;
  active?: boolean;
  badgeCount?: number;
  tooltip?: { text: string };
  children?: SidebarNavigationItem[];
};

export type SidebarNavigationGroup = {
  label: string;
  items: SidebarNavigationItem[];
};

const visitorNavigationItems: SidebarNavigationItem[] = [
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    to: "/visitor/dashboard",
    tooltip: { text: "Dashboard" },
  },
  {
    label: "Settings",
    icon: "i-lucide-settings",
    to: "/settings",
    tooltip: { text: "Settings" },
  },
];

export const useSidebarNavigation = () => {
  const route = useRoute();
  const auth = useAuthStore();
  const { navItems } = useDashboardData();
  const pendingPartnerRequestCount = ref(0);
  const effectiveRole = computed(() => {
    if (auth.user) {
      return auth.user.role;
    }

    return route.path.startsWith("/visitor") ? "visitor" : null;
  });

  const navigationItems = computed<SidebarNavigationItem[]>(() => {
    if (effectiveRole.value === "visitor") {
      return visitorNavigationItems.map((item) => ({
        ...item,
        active: item.to ? isActivePath(item.to) : false,
      }));
    }

    return navItems
      .filter((item) => {
        if (!effectiveRole.value) {
          return false;
        }

        return item.roles.includes(effectiveRole.value);
      })
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
      });
  });

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
    if (label === "Administration") {
      return [
        {
          label: "Users",
          to: "/users",
          active: isActivePath("/users"),
        },
        {
          label: "Partner Requests",
          to: "/partner-requests",
          active: isActivePath("/partner-requests"),
          badgeCount: pendingPartnerRequestCount.value,
        },
      ];
    }

    return [];
  }

  const fetchPendingPartnerRequestCount = async () => {
    if (effectiveRole.value !== "manager") {
      pendingPartnerRequestCount.value = 0;
      return;
    }

    try {
      const response = await getPartnerRequests({
        status: "pending",
        page: 1,
        perPage: 1,
      });

      pendingPartnerRequestCount.value = response.meta.total;
    } catch {
      pendingPartnerRequestCount.value = 0;
    }
  };

  watch(
    () => effectiveRole.value,
    () => {
      void fetchPendingPartnerRequestCount();
    },
    { immediate: true },
  );

  return { navigationGroups };
};
