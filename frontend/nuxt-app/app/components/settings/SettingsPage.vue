<script setup lang="ts">
import PageHeader from "~/components/common/PageHeader.vue";
import { useThemeStore, type ThemeMode } from "~/stores/theme";

const themeStore = useThemeStore();
const auth = useAuthStore();
const { locale, setLocale, t } = useI18n();

const preferences = reactive({
  language: "English",
  density: "Comfortable",
  emailNotifications: true,
  weeklyDigest: true,
  apiBaseUrl: "/api",
});

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: t("text.light"), value: "light" },
  { label: t("text.dark"), value: "dark" },
  { label: t("text.system"), value: "system" },
];

const languageOptions = computed(() => [
  { label: "English", value: "en" },
  { label: "ខ្មែរ", value: "km" },
]);

const densityOptions = computed(() => [
  { label: t("text.compact"), value: "Compact" },
  { label: t("text.comfortable"), value: "Comfortable" },
  { label: "Spacious", value: "Spacious" },
]);
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="t('navigation.workspace')"
      :title="t('navigation.settings')"
      copy="Profile, theme, language, dashboard preferences, notifications, and API configuration."
    />

    <section class="grid settings-grid">
      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-circle-user-round" />
          {{ t("text.profileSettings") }}
        </h2>
        <UFormField :label="t('text.displayName')">
          <UInput :model-value="auth.user?.name ?? ''" readonly />
        </UFormField>
        <UFormField :label="t('auth.email')">
          <UInput :model-value="auth.user?.email ?? ''" readonly />
        </UFormField>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-monitor-cog" />
          {{ t("text.preferences") }}
        </h2>
        <UFormField :label="t('text.themeMode')">
          <USelect
            :model-value="themeStore.mode"
            :items="themeOptions"
            @update:model-value="themeStore.setTheme($event as ThemeMode)"
          />
        </UFormField>
        <UFormField :label="t('common.language')">
          <USelect
            :model-value="locale"
            :items="languageOptions"
            @update:model-value="setLocale(String($event))"
          />
        </UFormField>
        <UFormField :label="t('text.dashboardDensity')">
          <USelect
            v-model="preferences.density"
            :items="densityOptions"
          />
        </UFormField>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-bell" />
          {{ t("common.notifications") }}
        </h2>
        <div class="settings-row">
          <div>
            <strong>{{ t("text.emailNotifications") }}</strong>
            <p>Receive alert emails for report and import status.</p>
          </div>
          <USwitch v-model="preferences.emailNotifications" />
        </div>
        <div class="settings-row">
          <div>
            <strong>{{ t("text.weeklyDigest") }}</strong>
            <p>Send weekly activity, grade, and attendance summaries.</p>
          </div>
          <USwitch v-model="preferences.weeklyDigest" />
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-plug" />
          {{ t("text.apiConfiguration") }}
        </h2>
        <UFormField :label="t('text.apiBaseUrl')">
          <UInput v-model="preferences.apiBaseUrl" />
        </UFormField>
        <UAlert
          color="primary"
          variant="soft"
          icon="i-lucide-info"
          description="This value points the frontend API client to the Laravel backend."
        />
      </UCard>
    </section>
  </div>
</template>
