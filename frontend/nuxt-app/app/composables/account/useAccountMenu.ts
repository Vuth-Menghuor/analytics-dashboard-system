import AccountSettingsModal from "~/components/account/AccountSettingsModal.vue";
import { useUserMenuItems } from "./useUserMenuItems";

const accountMenuUi = {
  content:
    "w-60 rounded-lg border border-slate-200 bg-white p-0 shadow-lg ring-1 ring-slate-950/5",
  viewport: "divide-y divide-slate-100 overflow-y-auto py-1",
  group: "p-1",
  item: "h-9 items-center rounded-md px-3 py-0 text-sm gap-3 text-slate-700 before:rounded-md data-highlighted:text-slate-900 data-highlighted:before:bg-slate-100",
  itemLeadingIcon: "size-4 text-slate-500",
  itemWrapper: "min-w-0",
  itemLabel: "truncate text-sm font-medium leading-none text-slate-700",
  itemTrailing: "ms-auto inline-flex items-center gap-1",
  itemTrailingKbds: "inline-flex items-center gap-0.5",
  itemTrailingKbdsSize: "sm",
};

export const useAccountMenu = () => {
  const overlay = useOverlay();
  const accountSettingsOverlay = overlay.create(AccountSettingsModal);
  const { userMenuItems } = useUserMenuItems({
    onViewProfile: () => {
      accountSettingsOverlay.open({ initialSection: "profile" });
    },
    onAccountSettings: () => {
      accountSettingsOverlay.open({ initialSection: "account" });
    },
  });

  return {
    accountMenuUi,
    userMenuItems,
  };
};
