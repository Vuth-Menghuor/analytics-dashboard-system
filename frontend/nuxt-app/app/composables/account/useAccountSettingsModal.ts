import { useAccountSettingsForm } from "~/composables/account/useAccountSettingsForm";
import { useUserProfile } from "~/composables/account/useUserProfile";
import {
  accountRoleCapabilities,
  accountSettingsInitialFormState,
  accountSettingsSectionAliases,
  accountSettingsSections,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import { accessRoleCards } from "~/constants/auth";
import type { AuthRole } from "~/types/auth";

const roleMetaByValue = Object.fromEntries(
  accessRoleCards.map((role) => [role.value, role]),
) as Record<string, (typeof accessRoleCards)[number]>;

type AccountSettingsModalOptions = {
  initialSection: Ref<string>;
  open: Ref<boolean>;
};

export const useAccountSettingsModal = ({
  initialSection,
  open,
}: AccountSettingsModalOptions) => {
  const { displayEmail, displayName, email, handleSave, name, userInitial } =
    useAccountSettingsForm(open);
  const { avatarSrc, displayRole } = useUserProfile();
  const colorMode = useColorMode();

  const activeSection = ref("overview");
  const isDiscardOpen = ref(false);
  const isDeleteOpen = ref(false);

  const formState = reactive<AccountSettingsFormState>({
    ...accountSettingsInitialFormState,
  });

  const activeRole = computed<AuthRole>(() =>
    ["manager", "partner", "visitor"].includes(displayRole.value)
      ? (displayRole.value as AuthRole)
      : "visitor",
  );

  const activeRoleMeta = computed(() => {
    return (
      roleMetaByValue[activeRole.value] ?? {
        label: activeRole.value,
        access: "Account access",
        description: "Role information unavailable",
        icon: "i-lucide-shield",
        value: activeRole.value,
      }
    );
  });

  const roleCapabilities = computed(
    () => accountRoleCapabilities[activeRole.value],
  );

  const visibleSections = computed(() =>
    accountSettingsSections.filter((section) => {
      if (section.value === "security") {
        return roleCapabilities.value.canEditSecurity;
      }
      if (section.value === "preferences") {
        return roleCapabilities.value.canEditPreferences;
      }
      if (section.value === "notifications") {
        return roleCapabilities.value.canEditNotifications;
      }

      return true;
    }),
  );

  function normalizeSection(section: string) {
    const mappedSection = accountSettingsSectionAliases[section];

    if (mappedSection) return mappedSection;

    return visibleSections.value.some((item) => item.value === section)
      ? section
      : "overview";
  }

  watch(
    () => open.value,
    (isOpen) => {
      if (!isOpen) return;

      activeSection.value = normalizeSection(initialSection.value);
      formState.displayName = name.value || displayName.value;
      formState.email = email.value || displayEmail.value;
      formState.position = activeRoleMeta.value.label;
      formState.institution =
        displayRole.value === "visitor"
          ? "Public access"
          : formState.institution;
      formState.reportSignature = name.value || displayName.value;
      formState.newPassword = "";
      formState.confirmPassword = "";
      formState.theme = colorMode.preference;
    },
    { immediate: true },
  );

  watch(
    () => formState.theme,
    (theme) => {
      colorMode.preference = theme;
    },
  );

  function saveAndClose(close: () => void) {
    name.value = formState.displayName.trim();
    email.value = formState.email.trim();
    handleSave(close);
  }

  return {
    activeRole,
    activeRoleMeta,
    activeSection,
    avatarSrc,
    displayEmail,
    displayName,
    formState,
    isDeleteOpen,
    isDiscardOpen,
    roleCapabilities,
    saveAndClose,
    userInitial,
    visibleSections,
  };
};
