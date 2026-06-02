<script setup lang="ts">
import type {
  AdminUser,
  AdminUserFormPayload,
  AdminUserRole,
} from "~/types/admin";
import { schoolInstituteOptions } from "~/constants/auth";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  user: AdminUser | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: AdminUserFormPayload];
}>();

const roleItems = [
  { label: "Manager", value: "manager" },
  { label: "Partner", value: "partner" },
  { label: "Visitor", value: "visitor" },
] as const;

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
    :title="isEditing ? 'Edit user' : 'Create user'"
    :description="
      isEditing
        ? 'Update a Laravel application account.'
        : 'Create a Laravel application account.'
    "
    :ui="{ content: 'max-w-xl rounded-md' }"
  >
    <template #body>
      <form class="grid gap-4" @submit.prevent="submit">
        <UFormField label="Name" required>
          <UInput v-model="form.name" autocomplete="name" required />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="form.email"
            autocomplete="email"
            required
            type="email"
          />
        </UFormField>

        <UFormField label="Role" required>
          <USelect v-model="form.role" :items="roleItems" />
        </UFormField>

        <UFormField v-if="form.role === 'partner'" label="Institute">
          <USelect
            v-model="form.institution_name"
            :items="schoolInstituteOptions"
            placeholder="Select institute"
          />
        </UFormField>

        <div
          v-else
          class="rounded-md border border-default bg-muted/20 p-3 text-sm text-muted"
        >
          Managers and visitors use system-wide access. Institute scope is only
          applied to partner accounts.
        </div>

        <UFormField :label="isEditing ? 'New password' : 'Password'" :required="!isEditing">
          <UInput
            v-model="form.password"
            autocomplete="new-password"
            :required="!isEditing"
            type="password"
          />
        </UFormField>

        <UFormField label="Confirm password" :required="!isEditing">
          <UInput
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
        <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
        <UButton
          :loading="loading"
          icon="i-lucide-save"
          :label="isEditing ? 'Save changes' : 'Create user'"
          @click="submit"
        />
      </div>
    </template>
  </UModal>
</template>
