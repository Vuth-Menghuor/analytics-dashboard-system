type AccountDisplayOptions = {
  avatarSize?: number;
};

export const useAccountDisplay = (options: AccountDisplayOptions = {}) => {
  const auth = useAuthStore();
  const avatarSize = options.avatarSize ?? 96;

  const displayName = computed(() => auth.user?.name || "Account User");
  const displayEmail = computed(() => auth.user?.email || "");
  const displayRole = computed(() => auth.user?.role || "User");
  const userInitial = computed(() => displayName.value.charAt(0).toUpperCase());
  const avatarSrc = computed<string | undefined>(() => {
    const apiAvatarUrl = auth.user?.avatarUrl || auth.user?.avatar_url;

    if (apiAvatarUrl) {
      if (/^https?:\/\//.test(apiAvatarUrl)) {
        return apiAvatarUrl;
      }

      return new URL(apiAvatarUrl, String(useRuntimeConfig().public.apiBaseUrl)).toString();
    }

    return undefined;
  });

  return {
    avatarSrc,
    displayEmail,
    displayName,
    displayRole,
    userInitial,
  };
};
