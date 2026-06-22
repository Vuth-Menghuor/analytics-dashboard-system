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
    :ui="{ content: 'max-w-xl rounded-md' }"
  >
    <template #body>
      <form class="grid gap-4" @submit.prevent="submit">
        <UFormField :label="t('text.name')" required>
          <AppInput v-model="form.name" autocomplete="name" required />
        </UFormField>

        <UFormField :label="t('text.email')" required>
          <AppInput
            v-model="form.email"
            autocomplete="email"
            required
            type="email"
          />
        </UFormField>

        <UFormField :label="t('text.role')" required>
          <USelect v-model="form.role" :items="roleItems" />
        </UFormField>

        <UFormField v-if="form.role === 'partner'" :label="t('text.institute')">
          <USelect
            v-model="form.institution_name"
            :items="schoolInstituteOptions"
            :placeholder="t('text.selectInstitute')"
          />
        </UFormField>

        <div
          v-else
          class="rounded-md border border-default bg-muted/20 p-3 text-sm text-muted"
        >
          {{ t("text.managersVisitorsSystemWide") }}
        </div>

        <UFormField :label="isEditing ? t('text.newPassword') : t('text.password')" :required="!isEditing">
          <AppInput
            v-model="form.password"
            autocomplete="new-password"
            :required="!isEditing"
            type="password"
          />
        </UFormField>

        <UFormField :label="t('text.confirmPassword')" :required="!isEditing">
          <AppInput
            v-model="form.password_confirmation"
            autocomplete="new-password"
            :required="!isEditing"
            type="password"
          />
        </UFormField>
      </form>
    </template>

    <template #footer="{ close }">
      <div class="flex w-full justify-end gap-2">
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
