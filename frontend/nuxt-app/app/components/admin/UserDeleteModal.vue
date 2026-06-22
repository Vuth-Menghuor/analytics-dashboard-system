<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import type { AdminUser } from "~/types/admin";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('text.deleteUserQuestion')"
    :description="t('text.deleteUserDescription')"
    :ui="{ content: 'max-w-md rounded-md' }"
  >
    <template #body>
      <div class="delete-warning-panel">
        {{ t("text.deleteUserConfirm", { name: user?.name ?? "" }) }}
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-end gap-2">
        <AppButton action="cancel" @click="close" />
        <AppButton
          action="delete"
          :label="String(translateText('Delete user'))"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.delete-warning-panel {
  border: 1px solid color-mix(in srgb, var(--app-error) 35%, transparent);
  border-radius: 6px;
  padding: 16px;
  background: color-mix(in srgb, var(--app-error) 10%, var(--app-surface));
  color: var(--app-error);
  font-size: 0.875rem;
}

.delete-warning-panel strong {
  color: var(--app-heading);
}
</style>
