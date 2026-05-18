import { profileSecurityItems } from "~/constants/profile";

export const useProfilePage = () => {
  const auth = useAuthStore();
  const profile = computed(() => auth.user);

  const avatarInitial = computed(
    () => profile.value?.name?.charAt(0)?.toUpperCase() ?? "U",
  );

  const infoItems = computed(() => [
    {
      label: "Full Name",
      value: profile.value?.name ?? "-",
      icon: "i-lucide-user",
    },
    {
      label: "Email Address",
      value: profile.value?.email ?? "-",
      icon: "i-lucide-mail",
    },
    {
      label: "Role",
      value: profile.value?.role ?? "User",
      icon: "i-lucide-shield",
    },
    {
      label: "Account Status",
      value: "Active",
      icon: "i-lucide-circle-check",
    },
  ]);

  const handleLogout = async () => {
    await auth.logout();
    await navigateTo("/login");
  };

  return {
    avatarInitial,
    handleLogout,
    infoItems,
    profile,
    securityItems: profileSecurityItems,
  };
};
