import type { DropdownMenuItem } from "@nuxt/ui";

type UserMenuOptions = {
  onViewProfile: () => void;
  onAccountSettings: () => void;
};

export const useUserMenuItems = (options: UserMenuOptions) => {
  const auth = useAuthStore();
  const { t } = useI18n();

  function openAfterMenuClose(callback: () => void) {
    setTimeout(callback, 0);
  }

  function createOpenHandler(callback: () => void) {
    return (event?: Event) => {
      event?.preventDefault();
      openAfterMenuClose(callback);
    };
  }

  async function handleLogout() {
    await auth.logout();
    await navigateTo("/login");
  }

  const userMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: t("account.viewProfile"),
        icon: "i-lucide-user",
        kbds: ["meta", "shift", "p"],
        onClick: createOpenHandler(options.onViewProfile),
        onSelect: createOpenHandler(options.onViewProfile),
      },
      {
        label: t("account.settings"),
        icon: "i-lucide-settings",
        kbds: ["meta", "s"],
        onClick: createOpenHandler(options.onAccountSettings),
        onSelect: createOpenHandler(options.onAccountSettings),
      },
    ],
    [
      {
        label: t("common.logout"),
        icon: "i-lucide-log-out",
        kbds: ["option", "shift", "q"],
        onSelect: handleLogout,
      },
    ],
  ]);

  return { userMenuItems };
};
