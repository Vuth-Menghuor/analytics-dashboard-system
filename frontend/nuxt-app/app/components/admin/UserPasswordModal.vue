<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import AppInput from "~/components/common/AppInput.vue";
import type { AdminUser } from "~/types/admin";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [password: string, passwordConfirmation: string];
}>();
const { t } = useI18n();

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
    :title="t('text.resetPassword')"
    :description="t('text.resetPasswordDescription')"
    :ui="{ content: 'max-w-md rounded-md' }"
  >
    <template #body>
      <form class="grid gap-4" @submit.prevent="submit">
        <div class="rounded-md border border-default p-4 text-sm">
          <p class="font-medium text-highlighted">{{ user?.name }}</p>
          <p class="text-muted">{{ user?.email }}</p>
        </div>

        <UFormField :label="t('text.newPassword')" required>
          <AppInput
            v-model="form.password"
            autocomplete="new-password"
            required
            type="password"
          />
        </UFormField>

        <UFormField :label="t('text.confirmPassword')" required>
          <AppInput
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
        <AppButton action="cancel" @click="close" />
        <AppButton
          :loading="loading"
          icon="i-lucide-key-round"
          :label="t('text.resetPassword')"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
