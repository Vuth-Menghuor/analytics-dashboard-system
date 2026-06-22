<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useAccountSettingsModal } from "~/composables/account/useAccountSettingsModal";

type SettingsTab =
  | "overview"
  | "general"
  | "profile"
  | "security";

const { t } = useI18n();
const { translateText } = useTranslateText();
const route = useRoute();

const activeTab = ref<SettingsTab>("overview");
const settingsOpen = ref(true);
const initialSection = ref("overview");

const {
  activeRoleMeta,
  avatarSrc,
  displayEmail,
  displayName,
  formState,
  saveAndClose,
  userInitial,
} = useAccountSettingsModal({
  initialSection,
  open: settingsOpen,
});

const settingsTabs: {
  label: string;
  value: SettingsTab;
}[] = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "General",
    value: "general",
  },
  {
    label: "User Profile",
    value: "profile",
  },
  {
    label: "Security",
    value: "security",
  },
];

function isSettingsTab(value: unknown): value is SettingsTab {
  return (
    typeof value === "string" &&
    settingsTabs.some((tab) => tab.value === value)
  );
}

function saveSettings() {
  saveAndClose(() => {});
}

function openSettingsTab(section: "profile" | "security") {
  activeTab.value = section;
}

watch(
  () => route.query.tab,
  (tab) => {
    const tabValue = Array.isArray(tab) ? tab[0] : tab;

    if (isSettingsTab(tabValue)) {
      activeTab.value = tabValue;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="t('navigation.workspace')"
      :title="t('navigation.settings')"
      :copy="String(translateText('Manage account overview, profile details, security, and appearance from one place.'))"
    >
      <AppButton
        action="save"
        :label="t('common.saveChanges')"
        @click="saveSettings"
      />
    </PageHeader>

    <section
      class="account-settings-root overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
    >
      <div
        class="flex gap-8 overflow-x-auto border-b border-[var(--app-border)] bg-[var(--app-surface)] px-5 pt-4"
      >
        <button
          v-for="tab in settingsTabs"
          :key="tab.value"
          type="button"
          class="relative shrink-0 pb-4 text-sm font-semibold transition-colors sm:text-base"
          :class="
            activeTab === tab.value
              ? 'text-[var(--app-text)]'
              : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
          "
          @click="activeTab = tab.value"
        >
          {{ translateText(tab.label) }}
          <span
            v-if="activeTab === tab.value"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--app-text)]"
          />
        </button>
      </div>

      <AccountSettingsOverview
        v-if="activeTab === 'overview'"
        :avatar-src="avatarSrc"
        :display-email="displayEmail"
        :display-name="displayName"
        :form-state="formState"
        :role-meta="activeRoleMeta"
        :user-initial="userInitial"
        @navigate="openSettingsTab"
      />

      <AccountSettingsPreferences
        v-else-if="activeTab === 'general'"
        :description="String(translateText('Control the default dashboard experience for your account.'))"
        :form-state="formState"
        :heading="String(translateText('General'))"
      />

      <AccountSettingsProfile
        v-else-if="activeTab === 'profile'"
        :avatar-src="avatarSrc"
        :display-name="displayName"
        :form-state="formState"
        :role-meta="activeRoleMeta"
        :user-initial="userInitial"
      />

      <AccountSettingsSecurity
        v-else-if="activeTab === 'security'"
      />

      <AccountSettingsSecurity v-else />
    </section>
  </div>
</template>
