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
  icon: string;
  description: string;
}[] = [
  {
    label: "Overview",
    value: "overview",
    icon: "i-lucide-layout-dashboard",
    description: "Account snapshot",
  },
  {
    label: "General",
    value: "general",
    icon: "i-lucide-palette",
    description: "Appearance",
  },
  {
    label: "User Profile",
    value: "profile",
    icon: "i-lucide-id-card",
    description: "Your identity",
  },
  {
    label: "Security",
    value: "security",
    icon: "i-lucide-shield-check",
    description: "Account access",
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

    <section class="account-settings-root settings-workspace">
      <aside class="settings-navigation">
        <div class="settings-role-badge">
          <UIcon :name="activeRoleMeta.icon" class="size-4" />
          <span>{{ translateText(activeRoleMeta.label) }}</span>
        </div>

        <nav class="settings-tab-list" :aria-label="t('navigation.settings')">
          <button
            v-for="tab in settingsTabs"
            :key="tab.value"
            type="button"
            class="settings-tab"
            :class="{ 'is-active': activeTab === tab.value }"
            :aria-current="activeTab === tab.value ? 'page' : undefined"
            @click="activeTab = tab.value"
          >
            <span class="settings-tab-icon">
              <UIcon :name="tab.icon" class="size-4" />
            </span>
            <span class="min-w-0 text-left">
              <span class="settings-tab-label">{{ translateText(tab.label) }}</span>
              <span class="settings-tab-description">{{ translateText(tab.description) }}</span>
            </span>
            <UIcon
              v-if="activeTab === tab.value"
              name="i-lucide-chevron-right"
              class="settings-tab-chevron size-4"
            />
          </button>
        </nav>

      </aside>

      <div class="settings-content">
        <Transition name="settings-fade" mode="out-in">
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
            :form-state="formState"
          />

          <AccountSettingsSecurity v-else />
        </Transition>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-workspace {
  display: grid;
  min-height: 620px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  background: var(--app-surface);
  color: var(--app-text);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--app-heading) 6%, transparent);
  grid-template-columns: 252px minmax(0, 1fr);
}

.settings-navigation {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 14px;
  border-right: 1px solid var(--app-border);
  background: var(--app-surface-soft);
}

.settings-tab-description { color: var(--app-muted); font-size: .72rem; line-height: 1.35; }

.settings-role-badge { display: flex; align-items: center; gap: 7px; width: fit-content; margin: 0 8px; padding: 6px 9px; border: 1px solid var(--app-border); border-radius: 999px; background: var(--app-surface); color: var(--app-muted); font-size: .72rem; font-weight: 700; }
.settings-tab-list { display: grid; gap: 4px; }
.settings-tab { display: grid; align-items: center; gap: 10px; width: 100%; padding: 10px 9px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--app-muted); grid-template-columns: 30px minmax(0, 1fr) auto; transition: background .18s ease, border-color .18s ease, color .18s ease; }
.settings-tab:hover { background: color-mix(in srgb, var(--app-surface) 72%, transparent); color: var(--app-heading); }
.settings-tab:focus-visible { outline: 2px solid var(--app-primary); outline-offset: 2px; }
.settings-tab.is-active { border-color: color-mix(in srgb, var(--app-primary) 22%, var(--app-border)); background: var(--app-primary-soft); color: var(--app-primary); }
.settings-tab-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 7px; background: var(--app-surface); color: var(--app-muted); }
.settings-tab.is-active .settings-tab-icon { background: var(--app-primary); color: var(--app-on-primary); }
.settings-tab-label { display: block; color: inherit; font-size: .82rem; font-weight: 700; }
.settings-tab-description { display: block; margin-top: 1px; }
.settings-tab.is-active .settings-tab-description { color: var(--app-primary); opacity: .76; }
.settings-tab-chevron { opacity: .7; }
.settings-content { min-width: 0; background: var(--app-bg); }
.settings-fade-enter-active, .settings-fade-leave-active { transition: opacity .16s ease, transform .16s ease; }
.settings-fade-enter-from, .settings-fade-leave-to { opacity: 0; transform: translateY(4px); }

@media (max-width: 800px) {
  .settings-workspace { display: block; min-height: 0; }
  .settings-navigation { gap: 12px; padding: 16px; border-right: 0; border-bottom: 1px solid var(--app-border); }
  .settings-tab-list { display: flex; overflow-x: auto; padding-bottom: 2px; }
  .settings-tab { width: 150px; flex: none; }
  .settings-tab-chevron, .settings-tab-description { display: none; }
}
</style>
