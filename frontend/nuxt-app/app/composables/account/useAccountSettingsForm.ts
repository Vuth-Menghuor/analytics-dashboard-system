import type { Ref } from "vue";
import { useAccountDisplay } from "./useAccountDisplay";

export const useAccountSettingsForm = (open: Ref<boolean>) => {
  const auth = useAuthStore();
  const toast = useToast();
  const { displayEmail, displayName } = useAccountDisplay();

  const name = ref("");
  const email = ref("");
  const userInitial = computed(() => {
    return (name.value || displayName.value).charAt(0).toUpperCase();
  });

  watch(
    () => [auth.user?.name, auth.user?.email, open.value] as const,
    () => {
      name.value = auth.user?.name ?? "";
      email.value = auth.user?.email ?? "";
    },
    { immediate: true },
  );

  function handleSave(close: () => void) {
    auth.updateLocalUser({
      name: name.value.trim() || displayName.value,
      email: email.value.trim() || displayEmail.value,
    });

    toast.add({
      title: "Account settings saved",
      description: "Your account details were updated locally.",
      color: "success",
    });

    close();
  }

  return {
    displayEmail,
    displayName,
    email,
    handleSave,
    name,
    userInitial,
  };
};
