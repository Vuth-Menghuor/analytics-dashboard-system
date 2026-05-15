<script setup lang="ts">
import type { AccountSettingsFormState } from "~/constants/accountSettings";
import type { AuthRole } from "~/types/auth";

defineProps<{
  formState: AccountSettingsFormState;
  role: AuthRole;
}>();
</script>

<template>
  <section class="grid gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">Notifications</h3>
      <p class="mt-1 text-sm text-slate-500">
        Choose which alerts are useful for this account role.
      </p>
    </div>

    <div
      class="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white p-5"
    >
      <UCheckbox
        v-model="formState.notifyEmail"
        label="Email notifications"
        description="Receive important account updates by email."
        class="py-3 first:pt-0"
        color="primary"
      />

      <UCheckbox
        v-if="role === 'manager'"
        v-model="formState.notifyApproval"
        label="Partner approval requests"
        description="Notify when a partner account needs review."
        class="py-3"
        color="primary"
      />

      <UCheckbox
        v-if="role !== 'visitor'"
        v-model="formState.notifyReports"
        label="Report update notification"
        description="Notify when dashboard or institute reports change."
        class="py-3"
        color="primary"
      />

      <UCheckbox
        v-model="formState.accessRequests"
        label="Access request status"
        description="Track partner access or role change requests."
        class="py-3"
        color="primary"
      />

      <UCheckbox
        v-if="role !== 'visitor'"
        v-model="formState.dataExports"
        label="Data export finished"
        description="Notify when report exports are ready."
        class="py-3"
        color="primary"
      />

      <UCheckbox
        v-model="formState.securityAlerts"
        label="Security alerts"
        description="Warn me about sign-in and session changes."
        class="py-3"
        color="primary"
      />

      <UCheckbox
        v-if="role !== 'partner'"
        v-model="formState.notifySystem"
        label="System alert notification"
        description="Receive platform announcements and system alerts."
        class="py-3 last:pb-0"
        color="primary"
      />
    </div>
  </section>
</template>
