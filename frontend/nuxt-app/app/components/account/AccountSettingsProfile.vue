<script setup lang="ts">
import {
  accountProfileFields,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import AppInput from "~/components/common/AppInput.vue";
import { useAccountDisplay } from "~/composables/account/useAccountDisplay";
import { api } from "~/services/api";
import { AxiosError } from "axios";
import { avatarValidationError } from "~/utils/avatarUpload";

defineProps<{
  formState: AccountSettingsFormState;
}>();

const { translateText: translate } = useTranslateText();
const auth = useAuthStore();
const { avatarSrc, displayName, userInitial } = useAccountDisplay();
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarError = ref("");
const isUploadingAvatar = ref(false);

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const validationError = avatarValidationError(file);

  if (validationError) {
    avatarError.value = validationError;
    input.value = "";
    return;
  }

  avatarError.value = "";
  isUploadingAvatar.value = true;

  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post<{ user: typeof auth.user.value }>("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data.user) {
      auth.updateLocalUser(data.user);
    }
  } catch (error) {
    const validationError = error instanceof AxiosError
      ? error.response?.data?.errors?.avatar?.[0]
      : null;
    avatarError.value = validationError || "Unable to upload the image. Please try again.";
  } finally {
    isUploadingAvatar.value = false;
    input.value = "";
  }
}
</script>

<template>
  <section class="profile-page">
    <header class="profile-heading"><span class="profile-heading-icon"><UIcon name="i-lucide-user-round" class="size-5" /></span><div><h3>{{ translate("User Profile") }}</h3><p>{{ translate("Manage the identity shown throughout your dashboard.") }}</p></div></header>

    <div class="profile-content">
      <article class="profile-card">
        <div class="profile-card-header">
          <div><h4>{{ translate("Profile details") }}</h4></div>
          <span class="profile-card-chip"><UIcon name="i-lucide-badge-check" class="size-3.5" />{{ translate("Account") }}</span>
        </div>

        <div class="avatar-upload-row">
          <span class="avatar-upload-ring"><UAvatar :src="avatarSrc" :text="userInitial" :alt="displayName" class="avatar-upload-preview" /></span>
          <div class="min-w-0">
            <p class="avatar-upload-title">{{ translate("Profile photo") }}</p>
            <p class="avatar-upload-copy">{{ translate("JPG, PNG, or WebP. Maximum file size: 2 MB.") }}</p>
            <p v-if="avatarError" class="avatar-upload-error">{{ translate(avatarError) }}</p>
          </div>
          <div class="avatar-upload-action">
            <input
              ref="avatarInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="sr-only"
              @change="uploadAvatar"
            >
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-upload"
              :loading="isUploadingAvatar"
              :label="String(translate('Upload photo'))"
              @click="avatarInput?.click()"
            />
          </div>
        </div>

        <div class="profile-form-grid">
          <UFormField
            v-for="field in accountProfileFields.slice(0, 2)"
            :key="field.key"
            :label="String(translate(field.label))"
          >
            <AppInput
              v-model="formState[field.key]"
              class="w-full"
              :type="field.type || 'text'"
            />
          </UFormField>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.profile-page { display: grid; gap: 24px; padding: 28px; }.profile-heading { display: flex; align-items: center; gap: 13px; }.profile-heading-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; background: var(--app-primary-soft); color: var(--app-primary); }.profile-eyebrow, .profile-card-kicker, .avatar-upload-kicker { color: var(--app-primary); font-size: .68rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }.profile-heading h3 { margin: 1px 0 0; color: var(--app-heading); font-size: 1.25rem; font-weight: 750; }.profile-heading p:last-child { margin-top: 4px; color: var(--app-muted); font-size: .86rem; }.profile-content { max-width: 900px; }.profile-card { overflow: hidden; border: 1px solid var(--app-border); border-radius: 14px; background: var(--app-surface); }.profile-card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid var(--app-border); background: linear-gradient(110deg, var(--app-primary-soft), var(--app-surface) 58%); }.profile-card-header h4 { margin-top: 3px; color: var(--app-heading); font-size: .95rem; font-weight: 750; }.profile-card-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 9px; border: 1px solid color-mix(in srgb, var(--app-primary) 20%, var(--app-border)); border-radius: 999px; background: var(--app-surface); color: var(--app-primary); font-size: .7rem; font-weight: 750; }
.avatar-upload-row { display: flex; align-items: center; gap: 14px; margin: 20px 22px 0; padding: 15px; border: 1px dashed color-mix(in srgb, var(--app-primary) 34%, var(--app-border)); border-radius: 12px; background: color-mix(in srgb, var(--app-primary-soft) 45%, var(--app-surface)); }.avatar-upload-ring { display: grid; width: 56px; height: 56px; flex: none; place-items: center; border: 2px solid var(--app-surface); border-radius: 50%; box-shadow: 0 4px 12px color-mix(in srgb, var(--app-heading) 12%, transparent); }.avatar-upload-preview { width: 50px; height: 50px; flex: none; }.avatar-upload-title { margin-top: 2px; color: var(--app-heading); font-size: .85rem; font-weight: 750; }.avatar-upload-copy { margin-top: 2px; color: var(--app-muted); font-size: .72rem; }.avatar-upload-error { margin-top: 4px; color: var(--app-error); font-size: .72rem; }.avatar-upload-action { margin-left: auto; flex: none; }
.profile-form-grid { display: grid; gap: 17px; padding: 22px; }.profile-role-card { display: flex; align-items: center; gap: 11px; padding: 12px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-soft); }.profile-role-icon { display: grid; width: 32px; height: 32px; flex: none; place-items: center; border-radius: 8px; background: var(--app-primary); color: var(--app-on-primary); }.profile-role-card span:nth-child(2) { color: var(--app-heading); }.profile-role-card span:nth-child(2) span:last-child { margin-top: 2px; color: var(--app-muted); }.profile-role-lock { margin-left: auto; color: var(--app-muted); }
@media (min-width: 1024px) { .profile-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }.profile-form-grid :deep([data-slot="root"].lg\:col-span-2) { grid-column: 1 / -1; } @media (max-width: 520px) { .profile-page { padding: 20px; }.profile-card-header { padding: 18px; }.avatar-upload-row { align-items: flex-start; flex-wrap: wrap; margin: 18px 18px 0; }.avatar-upload-action { width: 100%; margin-left: 70px; }.profile-form-grid { padding: 18px; } }
</style>
