<script setup lang="ts">
import type {
  AdminUser,
  AdminUserFormPayload,
  AdminUserRole,
} from "~/types/admin";
import AppButton from "~/components/common/AppButton.vue";
import AppInput from "~/components/common/AppInput.vue";
import { schoolInstituteOptions } from "~/constants/auth";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: AdminUserFormPayload];
}>();
const { t } = useI18n();
const { translateText } = useTranslateText();

const roleItems = computed(() => [
  { label: String(translateText("Manager")), value: "manager" },
  { label: String(translateText("Partner")), value: "partner" },
  { label: String(translateText("Visitor")), value: "visitor" },
]);

const form = reactive({
  name: "",
  email: "",
  role: "visitor" as AdminUserRole,
  institution_name: "",
  password: "",
  password_confirmation: "",
});

const isEditing = computed(() => Boolean(props.user));

const resetForm = () => {
  form.name = props.user?.name ?? "";
  form.email = props.user?.email ?? "";
  form.role = props.user?.role ?? "visitor";
  form.institution_name = props.user?.institution_name ?? "";
  form.password = "";
  form.password_confirmation = "";
};

watch(
  () => [open.value, props.user?.id],
  () => {
    if (open.value) {
      resetForm();
    }
  },
  { immediate: true },
);

watch(
  () => form.role,
  (role) => {
    if (role !== "partner") {
      form.institution_name = "";
    }
  },
);

const submit = () => {
  const payload: AdminUserFormPayload = {
    name: form.name,
    email: form.email,
    role: form.role,
    institution_name:
      form.role === "partner" ? form.institution_name || null : null,
  };

  if (form.password || !isEditing.value) {
    payload.password = form.password;
    payload.password_confirmation = form.password_confirmation;
  }

  emit("submit", payload);
};
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEditing ? t('text.editUser') : t('text.createUser')"
    :description="
      isEditing
        ? t('text.updateUserDescription')
        : t('text.createUserDescription')
    "
    :ui="{ content: 'max-w-2xl rounded-md admin-user-modal' }"
  >
    <template #body>
      <form class="admin-user-form" @submit.prevent="submit">
        <section class="admin-user-section">
          <div class="admin-user-section-header">
            <span class="admin-user-section-icon">
              <UIcon name="i-lucide-id-card" />
            </span>
            <div>
              <h3>{{ translateText("Account Information") }}</h3>
              <p>{{ translateText("Basic details linked to your account.") }}</p>
            </div>
          </div>

          <div class="admin-user-form-grid">
            <UFormField :label="t('text.name')" required>
              <AppInput
                v-model="form.name"
                class="w-full"
                autocomplete="name"
                required
              />
            </UFormField>

            <UFormField :label="t('text.email')" required>
              <AppInput
                v-model="form.email"
                class="w-full"
                autocomplete="email"
                required
                type="email"
              />
            </UFormField>
          </div>
        </section>

        <section class="admin-user-section">
          <div class="admin-user-section-header">
            <span class="admin-user-section-icon">
              <UIcon name="i-lucide-shield-check" />
            </span>
            <div>
              <h3>{{ translateText("Access Scope") }}</h3>
              <p>{{ translateText("Choose the dashboard role and institute scope.") }}</p>
            </div>
          </div>

          <div class="admin-user-form-grid">
            <UFormField :label="t('text.role')" required>
              <USelect
                v-model="form.role"
                class="admin-user-select w-full"
                :items="roleItems"
              />
            </UFormField>

            <UFormField
              v-if="form.role === 'partner'"
              :label="t('text.institute')"
              required
            >
              <USelect
                v-model="form.institution_name"
                class="admin-user-select w-full"
                :items="schoolInstituteOptions"
                :placeholder="t('text.selectInstitute')"
              />
            </UFormField>

            <div v-else class="admin-user-scope-note">
              <UIcon name="i-lucide-info" />
              <span>{{ t("text.managersVisitorsSystemWide") }}</span>
            </div>
          </div>
        </section>

        <section class="admin-user-section">
          <div class="admin-user-section-header">
            <span class="admin-user-section-icon">
              <UIcon name="i-lucide-lock-keyhole" />
            </span>
            <div>
              <h3>{{ translateText("Security") }}</h3>
              <p>
                {{
                  isEditing
                    ? translateText("Leave password fields empty to keep the current password.")
                    : translateText("Set the initial password for this account.")
                }}
              </p>
            </div>
          </div>

          <div class="admin-user-form-grid">
            <UFormField
              :label="isEditing ? t('text.newPassword') : t('text.password')"
              :required="!isEditing"
            >
              <AppInput
                v-model="form.password"
                class="w-full"
                autocomplete="new-password"
                :required="!isEditing"
                type="password"
              />
            </UFormField>

            <UFormField :label="t('text.confirmPassword')" :required="!isEditing">
              <AppInput
                v-model="form.password_confirmation"
                class="w-full"
                autocomplete="new-password"
                :required="!isEditing"
                type="password"
              />
            </UFormField>
          </div>
        </section>
      </form>
    </template>

    <template #footer="{ close }">
      <div class="admin-user-modal-footer">
        <AppButton action="cancel" @click="close" />
        <AppButton
          action="save"
          :loading="loading"
          :label="isEditing ? t('text.saveChanges') : t('text.createUser')"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.admin-user-form {
  display: grid;
  gap: 18px;
}

.admin-user-section {
  display: grid;
  gap: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--app-surface-soft) 58%, transparent);
}

.admin-user-section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.admin-user-section-icon {
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

.admin-user-section-header h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.25;
}

.admin-user-section-header p {
  margin: 3px 0 0;
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.admin-user-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.admin-user-scope-note {
  display: flex;
  min-height: 36px;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 9px 11px;
  background: var(--app-surface);
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.4;
}

.admin-user-scope-note svg {
  flex: 0 0 auto;
  color: var(--app-primary);
}

.admin-user-select {
  min-height: 36px;
}

.admin-user-select :deep(button) {
  width: 100%;
  min-height: 36px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text);
  box-shadow: none;
}

.admin-user-modal-footer {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
}

:global(.admin-user-modal [data-slot="body"]) {
  background: var(--app-bg);
}

:global(.admin-user-modal [data-slot="header"]),
:global(.admin-user-modal [data-slot="footer"]) {
  background: var(--app-surface);
}

@media (max-width: 640px) {
  .admin-user-form-grid {
    grid-template-columns: 1fr;
  }

  .admin-user-section {
    padding: 14px;
  }

  .admin-user-modal-footer {
    flex-direction: column-reverse;
  }

  .admin-user-modal-footer :deep(.app-button) {
    width: 100%;
  }
}
</style>
