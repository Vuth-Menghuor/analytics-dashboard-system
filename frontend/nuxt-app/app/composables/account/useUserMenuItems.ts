import type { DropdownMenuItem } from "@nuxt/ui";

type UserMenuOptions = {
  onViewProfile: () => void;
  onAccountSettings: () => void;
};

export const useUserMenuItems = (options: UserMenuOptions) => {
  const auth = useAuthStore();

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
        label: "View profile",
        icon: "i-lucide-user",
        kbds: ["meta", "shift", "p"],
        onClick: createOpenHandler(options.onViewProfile),
        onSelect: createOpenHandler(options.onViewProfile),
      },
      {
        label: "Account settings",
        icon: "i-lucide-settings",
        kbds: ["meta", "s"],
        onClick: createOpenHandler(options.onAccountSettings),
        onSelect: createOpenHandler(options.onAccountSettings),
      },
    ],
    [
      {
        label: "Updates",
        icon: "i-lucide-box",
        kbds: ["meta", "a"],
      },
      {
        label: "Log out",
        icon: "i-lucide-log-out",
        kbds: ["option", "shift", "q"],
        onSelect: handleLogout,
      },
    ],
  ]);

  return { userMenuItems };
};
