import { useMediaQuery } from "@vueuse/core";
import { useSidebarNavigation } from "~/composables/sidebar/useSidebarNavigation";

export const useDashboardSidebar = () => {
  const auth = useAuthStore();
  const { navigationGroups } = useSidebarNavigation();
  const sidebarOpen = ref(true);
  const isMobileSidebar = useMediaQuery("(max-width: 1023px)");

  const mobileSidebarIcon = computed(() =>
    sidebarOpen.value
      ? "i-lucide-panel-left-close"
      : "i-lucide-panel-left-open",
  );
  const mobileSidebarLabel = computed(() =>
    sidebarOpen.value ? "Close sidebar" : "Open sidebar",
  );

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function closeMobileSidebar() {
    if (isMobileSidebar.value) {
      sidebarOpen.value = false;
    }
  }

  return {
    closeMobileSidebar,
    mobileSidebarIcon,
    mobileSidebarLabel,
    navigationGroups,
    roleDashboardPath: auth.roleDashboardPath,
    sidebarOpen,
    toggleSidebar,
  };
};
