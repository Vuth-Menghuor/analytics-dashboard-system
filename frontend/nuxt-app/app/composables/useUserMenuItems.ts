import type { DropdownMenuItem } from "@nuxt/ui";

export const useUserMenuItems = () => {
  const auth = useAuthStore();

  async function handleLogout() {
    await auth.logout();
    await navigateTo("/login");
  }

  const userMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        label: "Profile",
        icon: "i-lucide-user",
        to: "/profile",
      },
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: "/settings",
      },
    ],
    [
      {
        label: "Log out",
        icon: "i-lucide-log-out",
        onSelect: handleLogout,
      },
    ],
  ]);

  return { userMenuItems };
};
