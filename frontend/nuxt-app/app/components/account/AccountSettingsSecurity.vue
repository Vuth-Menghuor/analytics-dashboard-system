<script setup lang="ts">
import {
  accountSecurityFields,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";

defineProps<{
  formState: AccountSettingsFormState;
}>();
</script>

<template>
  <section class="grid gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">Security</h3>
      <p class="mt-1 text-sm text-slate-500">
        Protect access to Moodle analytics and local reports.
      </p>
    </div>

    <div class="rounded-md border border-slate-200 bg-white p-5">
      <h4 class="flex items-center gap-2 font-bold text-slate-950">
        <span class="h-5 w-1 rounded bg-slate-300" />
        Password
      </h4>

      <div class="mt-5 grid gap-4">
        <UFormField
          v-for="field in accountSecurityFields"
          :key="field.key"
          :label="field.label"
        >
          <UInput
            v-model="formState[field.key]"
            class="w-full"
            :type="field.type || 'text'"
          />
        </UFormField>
      </div>

      <div
        class="mt-5 flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
      >
        <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0" />
        <p>
          Two-factor authentication can be added later when backend verification
          is connected.
        </p>
      </div>
    </div>
  </section>
</template>
