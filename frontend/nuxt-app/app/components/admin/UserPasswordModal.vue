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
    :ui="{ content: 'max-w-lg rounded-md admin-password-modal' }"
  >
    <template #body>
      <form class="admin-password-form" @submit.prevent="submit">
        <section class="admin-password-user-card">
          <span class="admin-password-avatar">
            <UIcon name="i-lucide-user-round" />
          </span>
          <div>
            <p class="admin-password-user-name">{{ user?.name }}</p>
            <p class="admin-password-user-email">{{ user?.email }}</p>
          </div>
        </section>

        <section class="admin-password-section">
          <div class="admin-password-section-header">
            <span class="admin-password-section-icon">
              <UIcon name="i-lucide-lock-keyhole" />
            </span>
            <div>
              <h3>{{ t("text.resetPassword") }}</h3>
              <p>{{ t("text.resetPasswordDescription") }}</p>
            </div>
          </div>

          <div class="admin-password-fields">
            <UFormField :label="t('text.newPassword')" required>
              <AppInput
                v-model="form.password"
                class="w-full"
                autocomplete="new-password"
                required
                type="password"
              />
            </UFormField>

            <UFormField :label="t('text.confirmPassword')" required>
              <AppInput
                v-model="form.passwordConfirmation"
                class="w-full"
                autocomplete="new-password"
                required
                type="password"
              />
            </UFormField>
          </div>
        </section>
      </form>
    </template>

    <template #footer="{ close }">
      <div class="admin-password-modal-footer">
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

<style scoped>
.admin-password-form {
  display: grid;
  gap: 16px;
}

.admin-password-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 14px;
  background: var(--app-surface);
}

.admin-password-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface-soft);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.admin-password-user-name {
  margin: 0;
  color: var(--app-heading);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.admin-password-user-email {
  margin: 3px 0 0;
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.admin-password-section {
  display: grid;
  gap: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--app-surface-soft) 58%, transparent);
}

.admin-password-section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.admin-password-section-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.admin-password-section-header h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.25;
}

.admin-password-section-header p {
  margin: 3px 0 0;
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.admin-password-fields {
  display: grid;
  gap: 14px;
}

.admin-password-modal-footer {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
}

:global(.admin-password-modal [data-slot="body"]) {
  background: var(--app-bg);
}

:global(.admin-password-modal [data-slot="header"]),
:global(.admin-password-modal [data-slot="footer"]) {
  background: var(--app-surface);
}

@media (max-width: 520px) {
  .admin-password-user-card {
    align-items: flex-start;
  }

  .admin-password-modal-footer {
    flex-direction: column-reverse;
  }

  .admin-password-modal-footer :deep(.app-button) {
    width: 100%;
  }
}
</style>
