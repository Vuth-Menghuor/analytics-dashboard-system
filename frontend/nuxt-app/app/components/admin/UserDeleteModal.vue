<script setup lang="ts">
import type { AdminUser } from "~/types/admin";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <UModal
    v-model:open="open"
    title="Delete user?"
    description="This removes the Laravel application account. Moodle analytics data is not changed."
    :ui="{ content: 'max-w-md rounded-md' }"
  >
    <template #body>
      <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Delete <strong>{{ user?.name }}</strong> from system user management?
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
        <UButton
          color="error"
          icon="i-lucide-trash-2"
          label="Delete user"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
