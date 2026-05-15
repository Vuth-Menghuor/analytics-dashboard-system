<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});

const preferences = reactive({
  theme: "System",
  language: "English",
  density: "Comfortable",
  emailNotifications: true,
  weeklyDigest: true,
  apiBaseUrl: "/api",
});
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Workspace"
      title="Settings"
      copy="Profile, theme, language, dashboard preferences, notifications, and API configuration placeholders."
    />

    <section class="grid settings-grid">
      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-circle-user-round" />
          Profile Settings
        </h2>
        <UFormField label="Display name">
          <UInput model-value="Moodle Analytics User" />
        </UFormField>
        <UFormField label="Email">
          <UInput model-value="user@example.com" />
        </UFormField>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-monitor-cog" />
          Preferences
        </h2>
        <UFormField label="Theme mode">
          <USelect v-model="preferences.theme" :items="['Light', 'Dark', 'System']" />
        </UFormField>
        <UFormField label="Language">
          <USelect v-model="preferences.language" :items="['English', 'Khmer']" />
        </UFormField>
        <UFormField label="Dashboard density">
          <USelect v-model="preferences.density" :items="['Compact', 'Comfortable', 'Spacious']" />
        </UFormField>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-bell" />
          Notifications
        </h2>
        <div class="settings-row">
          <div>
            <strong>Email notifications</strong>
            <p>Receive alert emails for report and import status.</p>
          </div>
          <USwitch v-model="preferences.emailNotifications" />
        </div>
        <div class="settings-row">
          <div>
            <strong>Weekly digest</strong>
            <p>Send weekly activity, grade, and attendance summaries.</p>
          </div>
          <USwitch v-model="preferences.weeklyDigest" />
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'settings-panel' }">
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-plug" />
          API Configuration
        </h2>
        <UFormField label="API base URL">
          <UInput v-model="preferences.apiBaseUrl" />
        </UFormField>
        <UAlert
          color="primary"
          variant="soft"
          icon="i-lucide-info"
          description="Mock services can be replaced with $fetch or useFetch calls when the backend endpoints are ready."
        />
      </UCard>
    </section>
  </div>
</template>
