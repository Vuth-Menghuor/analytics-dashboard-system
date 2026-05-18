<script setup lang="ts">
import {
  accountNotificationOptions,
  type AccountNotificationOption,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import type { AuthRole } from "~/types/auth";

const props = defineProps<{
  formState: AccountSettingsFormState;
  role: AuthRole;
}>();

const visibleNotificationOptions = computed(() =>
  accountNotificationOptions.filter((option) => {
    if (option.visibleFor) return option.visibleFor.includes(props.role);
    if (option.hiddenFor) return !option.hiddenFor.includes(props.role);

    return true;
  }),
);

const getOptionClass = (option: AccountNotificationOption, index: number) => ({
  "py-3": true,
  "first:pt-0": index === 0,
  "last:pb-0": index === visibleNotificationOptions.value.length - 1,
});
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
        v-for="(option, index) in visibleNotificationOptions"
        :key="option.key"
        v-model="formState[option.key]"
        :label="option.label"
        :description="option.description"
        :class="getOptionClass(option, index)"
        color="primary"
      />
    </div>
  </section>
</template>
