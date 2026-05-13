import type { Ref } from "vue";
import type {
  SidebarNavigationGroup,
  SidebarNavigationItem,
} from "./useSidebarNavigation";

export const useSidebarNavigationState = (
  groups: Ref<SidebarNavigationGroup[]>,
  onNavigate: () => void,
) => {
  const openItems = ref(new Set<string>());

  function getItemKey(groupLabel: string, item: SidebarNavigationItem) {
    return `${groupLabel}:${item.label}`;
  }

  watch(
    groups,
    (nextGroups) => {
      const nextOpenItems = new Set(openItems.value);

      nextGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (item.children?.length && item.active) {
            nextOpenItems.add(getItemKey(group.label, item));
          }
        });
      });

      openItems.value = nextOpenItems;
    },
    { immediate: true },
  );

  function onNavigationClick(event: MouseEvent) {
    const target = event.target;

    if (target instanceof Element && target.closest("a")) {
      onNavigate();
    }
  }

  function isItemOpen(groupLabel: string, item: SidebarNavigationItem) {
    return openItems.value.has(getItemKey(groupLabel, item));
  }

  function toggleItem(groupLabel: string, item: SidebarNavigationItem) {
    const itemKey = getItemKey(groupLabel, item);
    const nextOpenItems = new Set(openItems.value);

    if (nextOpenItems.has(itemKey)) {
      nextOpenItems.delete(itemKey);
    } else {
      nextOpenItems.add(itemKey);
    }

    openItems.value = nextOpenItems;
  }

  return {
    isItemOpen,
    onNavigationClick,
    toggleItem,
  };
};
