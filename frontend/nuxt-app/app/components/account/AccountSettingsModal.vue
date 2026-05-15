<script setup lang="ts">
import { useAccountSettingsForm } from "~/composables/account/useAccountSettingsForm";
import { useUserProfile } from "~/composables/account/useUserProfile";
import {
  accountRoleCapabilities,
  accountSettingsSections,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import { accessRoleCards } from "~/constants/auth";
import type { AuthRole } from "~/types/auth";

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(
  defineProps<{
    initialSection?: string;
  }>(),
  {
    initialSection: "overview",
  },
);

const { displayEmail, displayName, email, handleSave, name, userInitial } =
  useAccountSettingsForm(open);
const { avatarSrc, displayRole } = useUserProfile();
const colorMode = useColorMode();

const activeSection = ref("overview");
const isDiscardOpen = ref(false);
const isDeleteOpen = ref(false);

const formState = reactive<AccountSettingsFormState>({
  displayName: "",
  username: "moodle.analyst",
  email: "",
  phone: "+855 12 345 678",
  position: "",
  institution: "Institute of Technology of Cambodia",
  reportSignature: "",
  newPassword: "",
  confirmPassword: "",
  language: "en",
  chartType: "bar",
  defaultFilter: "institute",
  notifyEmail: true,
  notifyApproval: true,
  notifyReports: true,
  notifySystem: true,
  securityAlerts: true,
  dataExports: true,
  accessRequests: true,
  theme: "system",
  density: "comfortable",
});

const roleMetaByValue = Object.fromEntries(
  accessRoleCards.map((role) => [role.value, role]),
) as Record<string, (typeof accessRoleCards)[number]>;

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
    if (section.value === "security")
      return roleCapabilities.value.canEditSecurity;
    if (section.value === "preferences")
      return roleCapabilities.value.canEditPreferences;
    if (section.value === "notifications")
      return roleCapabilities.value.canEditNotifications;
    return true;
  }),
);

function normalizeSection(section: string) {
  if (section === "account") return "overview";
  if (section === "personal-info") return "profile";
  if (section === "appearance") return "preferences";
  if (section === "role" || section === "role-access") return "overview";

  return visibleSections.value.some((item) => item.value === section)
    ? section
    : "overview";
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return;

    activeSection.value = normalizeSection(props.initialSection);
    formState.displayName = name.value || displayName.value;
    formState.email = email.value || displayEmail.value;
    formState.position = activeRoleMeta.value.label;
    formState.institution =
      displayRole.value === "visitor" ? "Public access" : formState.institution;
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
</script>

<template>
  <UModal
    v-model:open="open"
    title="Account settings"
    description="Manage dashboard account details."
    :ui="{
      content:
        'w-[90vw] max-w-[1080px] overflow-hidden rounded-md bg-white ring-1 ring-slate-200',
      body: '!overflow-hidden !p-0 sm:!p-0',
      header: 'hidden',
    }"
  >
    <template #body="{ close }">
      <div
        class="grid h-[760px] max-h-[90vh] bg-[#f5f7fb] text-[#172033] lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <AccountSettingsSidebar
          v-model:active-section="activeSection"
          v-model:delete-open="isDeleteOpen"
          :avatar-src="avatarSrc"
          :can-delete-account="roleCapabilities.canDeleteAccount"
          :display-email="displayEmail"
          :display-name="displayName"
          :sections="visibleSections"
          :user-initial="userInitial"
        />

        <main class="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
          <div class="settings-scrollbar min-h-0 overflow-y-auto">
            <Transition name="settings-fade" mode="out-in">
              <AccountSettingsOverview
                v-if="activeSection === 'overview'"
                key="overview"
                :active-role="activeRole"
                :avatar-src="avatarSrc"
                :display-email="displayEmail"
                :display-name="displayName"
                :form-state="formState"
                :role-meta="activeRoleMeta"
                :user-initial="userInitial"
              />
              <AccountSettingsProfile
                v-else-if="activeSection === 'profile'"
                key="profile"
                :avatar-src="avatarSrc"
                :display-name="displayName"
                :form-state="formState"
                :role-meta="activeRoleMeta"
                :user-initial="userInitial"
              />
              <AccountSettingsSecurity
                v-else-if="activeSection === 'security'"
                key="security"
                :form-state="formState"
              />
              <AccountSettingsPreferences
                v-else-if="activeSection === 'preferences'"
                key="preferences"
                :form-state="formState"
                :role="activeRole"
              />
              <AccountSettingsNotifications
                v-else
                key="notifications"
                :form-state="formState"
                :role="activeRole"
              />
            </Transition>
          </div>

          <footer
            class="flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4"
          >
            <UButton
              color="neutral"
              variant="outline"
              label="Cancel"
              class="rounded-md"
              @click="isDiscardOpen = true"
            />
            <UButton
              icon="i-lucide-save"
              label="Save Changes"
              class="rounded-md bg-primary hover:bg-primary-hover"
              @click="saveAndClose(close)"
            />
          </footer>
        </main>
      </div>

      <AccountSettingsConfirmModals
        v-model:discard-open="isDiscardOpen"
        v-model:delete-open="isDeleteOpen"
        :close-settings="close"
      />
    </template>
  </UModal>
</template>

<style scoped>
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 120ms ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}

.settings-scrollbar {
  scrollbar-color: #cbd5e1 transparent;
  scrollbar-width: thin;
}

.settings-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.settings-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.settings-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.settings-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
