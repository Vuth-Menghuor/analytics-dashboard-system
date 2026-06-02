<script setup lang="ts">
import type { AdminUser } from "~/types/admin";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [password: string, passwordConfirmation: string];
}>();

const form = reactive({
  password: "",
  passwordConfirmation: "",
});

watch(open, () => {
  if (open.value) {
    form.password = "";
    form.passwordConfirmation = "";
  }
});

const submit = () => {
  emit("submit", form.password, form.passwordConfirmation);
};
</script>

<template>
  <UModal
    v-model:open="open"
    title="Reset password"
    description="Set a new Laravel application password for this user."
    :ui="{ content: 'max-w-md rounded-md' }"
  >
    <template #body>
      <form class="grid gap-4" @submit.prevent="submit">
        <div class="rounded-md border border-default p-4 text-sm">
          <p class="font-medium text-highlighted">{{ user?.name }}</p>
          <p class="text-muted">{{ user?.email }}</p>
        </div>

        <UFormField label="New password" required>
          <UInput
            v-model="form.password"
            autocomplete="new-password"
            required
            type="password"
          />
        </UFormField>

        <UFormField label="Confirm password" required>
          <UInput
            v-model="form.passwordConfirmation"
            autocomplete="new-password"
            required
            type="password"
          />
        </UFormField>
      </form>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
        <UButton
          :loading="loading"
          icon="i-lucide-key-round"
          label="Reset password"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
