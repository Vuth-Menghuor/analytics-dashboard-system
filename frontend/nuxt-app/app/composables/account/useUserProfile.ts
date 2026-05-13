import { useAccountDisplay } from "./useAccountDisplay";

export const useUserProfile = () => {
  const auth = useAuthStore();
  const { avatarSrc, displayEmail, displayName, displayRole, userInitial } =
    useAccountDisplay({ avatarSize: 112 });

  const profileItems = computed(() => [
    {
      label: "Full name",
      value: displayName.value,
      icon: "i-lucide-user",
    },
    {
      label: "Email address",
      value: displayEmail.value,
      icon: "i-lucide-mail",
    },
    {
      label: "Role",
      value: displayRole.value,
      icon: "i-lucide-shield",
    },
    {
      label: "Account status",
      value: "Active",
      icon: "i-lucide-circle-check",
    },
  ]);

  async function handleLogout(close: () => void) {
    close();
    await auth.logout();
    await navigateTo("/login");
  }

  return {
    avatarSrc,
    displayEmail,
    displayName,
    displayRole,
    handleLogout,
    profileItems,
    userInitial,
  };
};
