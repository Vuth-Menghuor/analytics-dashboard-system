<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});

const defaultCurrency = ref("USD");
const emailSummariesEnabled = ref(true);
const reportApprovalsEnabled = ref(false);
const workspaceName = ref("Analytics Dashboard System");
const currencyOptions = ["USD", "KHR", "EUR"];
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Medium priority"
      title="Settings"
      copy="Configure workspace defaults, security posture, and notification behavior."
    />

    <section class="grid two">
      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Workspace</h2>
        <div class="form-stack">
          <UFormField label="Workspace name">
            <UInput v-model="workspaceName" class="w-full" />
          </UFormField>
          <UFormField label="Default currency">
            <USelect
              v-model="defaultCurrency"
              :items="currencyOptions"
              class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Preferences</h2>
        <div class="settings-row">
          <div>
            <strong>Email summaries</strong>
            <p>Daily digest for dashboard movement</p>
          </div>
          <USwitch
            v-model="emailSummariesEnabled"
            aria-label="Email summaries enabled"
          />
        </div>
        <div class="settings-row">
          <div>
            <strong>Report approvals</strong>
            <p>Require approval before sharing</p>
          </div>
          <USwitch
            v-model="reportApprovalsEnabled"
            aria-label="Report approvals disabled"
          />
        </div>
      </UCard>
    </section>
  </div>
</template>
