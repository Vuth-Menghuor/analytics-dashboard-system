import { useUserMenuItems } from "./useUserMenuItems";

const accountMenuUi = {
  content:
    "w-60 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-0 shadow-lg ring-1 ring-black/5",
  viewport: "divide-y divide-[var(--app-border)] overflow-y-auto py-1",
  group: "p-1",
  item: "h-9 items-center rounded-md px-2.5 py-0 text-xs gap-2.5 text-[var(--app-text)] before:rounded-md data-highlighted:text-[var(--app-heading)] data-highlighted:before:bg-[var(--app-surface-soft)]",
  itemLeadingIcon: "size-3.5 text-[var(--app-muted)]",
  itemWrapper: "min-w-0",
  itemLabel:
    "truncate text-xs font-medium leading-4 text-[var(--app-text)]",
  itemTrailing: "ms-auto inline-flex items-center gap-1",
  itemTrailingKbds: "inline-flex items-center gap-0.5",
  itemTrailingKbdsSize: "sm",
};

export const useAccountMenu = () => {
  const { userMenuItems } = useUserMenuItems({
    onViewProfile: () => {
      navigateTo({ path: "/settings", query: { tab: "profile" } });
    },
    onAccountSettings: () => {
      navigateTo("/settings");
    },
  });

  return {
    accountMenuUi,
    userMenuItems,
  };
};
