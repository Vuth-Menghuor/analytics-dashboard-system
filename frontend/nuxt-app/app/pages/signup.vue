<script setup lang="ts">
import { useSignupForm } from "~/composables/auth/useSignupForm";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const {
  actionModeItems,
  currentStep,
  form,
  googleButtonRef,
  goToPreviousStep,
  handlePrimaryAction,
  headerCopy,
  headerTitle,
  idCardPreviewType,
  idCardPreviewUrl,
  isGoogleEmailVerified,
  isSubmitting,
  isPartner,
  isPartnerReviewStep,
  primaryButtonLabel,
  reviewItems,
  schoolInstitutes,
  selectedRole,
  stateProvinces,
  submitStatus,
  submitStatusType,
  totalSteps,
  updateIdCardFile,
} = useSignupForm();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <main class="login-page signup-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <img class="login-hero-logo" src="/ccun-banner.png" alt="CCUN" />
      <div class="login-hero-content">
        <h1 id="signup-hero-title">{{ t("auth.signupHeroTitle") }}</h1>
        <p>{{ t("auth.signupHeroDescription") }}</p>
      </div>

      <div class="showcase-context">
        <p>{{ t("auth.signupShowcaseDescription") }}</p>
        <ul>
          <li>{{ t("auth.visitorAccessSetup") }}</li>
          <li>{{ t("auth.partnerReviewFlow") }}</li>
          <li>{{ t("auth.organizedProfileDetails") }}</li>
        </ul>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-header">
        <span class="auth-step-meta"
          >{{ t("auth.stepOf", { current: currentStep, total: totalSteps }) }}</span
        >
        <h2>{{ translateText(headerTitle) }}</h2>
        <p>{{ translateText(headerCopy) }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handlePrimaryAction">
        <div class="auth-mode-links">
          <NuxtLink
            v-for="item in actionModeItems"
            :key="item.to"
            :to="item.to"
            :class="{ active: item.to.includes('/signup') }"
          >
            {{ translateText(item.label) }}
          </NuxtLink>
        </div>

        <template v-if="selectedRole === 'visitor'">
          <UFormField :label="t('auth.fullName')" class="field">
            <UInput
              v-model="form.fullName"
              class="w-full"
              type="text"
              :placeholder="t('auth.enterFullName')"
              required
            />
          </UFormField>

          <UFormField :label="t('auth.email')" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              :placeholder="t('auth.enterEmailAddress')"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            :label="t('auth.password')"
            :placeholder="t('auth.enterPassword')"
            autocomplete="new-password"
            required
          />

          <AuthPasswordField
            v-model="form.confirmPassword"
            :label="t('auth.confirmPassword')"
            :placeholder="t('auth.confirmPassword')"
            autocomplete="new-password"
            :hide-label="t('auth.hidePasswordConfirmation')"
            :show-label="t('auth.showPasswordConfirmation')"
            required
          />
        </template>

        <template v-else-if="currentStep === 1">
          <UFormField :label="t('auth.stateProvince')" class="field">
            <USelect
              v-model="form.stateProvince"
              :items="stateProvinces"
              :placeholder="t('auth.selectStateProvince')"
              class="w-full"
              required
            />
          </UFormField>
        </template>

        <template v-else-if="currentStep === 2">
          <div class="auth-form-grid">
            <UFormField :label="t('auth.firstName')" class="field">
              <UInput
                v-model="form.firstName"
                class="w-full"
                type="text"
                :placeholder="t('auth.enterFirstName')"
                required
              />
            </UFormField>

            <UFormField :label="t('auth.lastName')" class="field">
              <UInput
                v-model="form.lastName"
                class="w-full"
                type="text"
                :placeholder="t('auth.enterLastName')"
                required
              />
            </UFormField>
          </div>

          <UFormField :label="t('auth.email')" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              :placeholder="t('auth.enterEmailAddress')"
              :readonly="isGoogleEmailVerified"
              required
            />
          </UFormField>

          <div class="google-verification-panel">
            <span class="google-verification-copy">
              {{ t("auth.verifyPartnerEmail") }}
            </span>
            <div ref="googleButtonRef" class="google-signin-button" />
            <span
              v-if="isGoogleEmailVerified"
              class="google-verification-success"
            >
              {{ t("auth.verifiedGoogleEmail", { email: form.email }) }}
            </span>
          </div>

          <UFormField :label="t('auth.phoneNumber')" class="field">
            <UInput
              v-model="form.phoneNumber"
              class="w-full"
              type="tel"
              :placeholder="t('auth.enterPhoneNumber')"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            :label="t('auth.password')"
            :placeholder="t('auth.enterPassword')"
            autocomplete="new-password"
            required
          />

          <AuthPasswordField
            v-model="form.confirmPassword"
            :label="t('auth.confirmPassword')"
            :placeholder="t('auth.confirmPassword')"
            autocomplete="new-password"
            :hide-label="t('auth.hidePasswordConfirmation')"
            :show-label="t('auth.showPasswordConfirmation')"
            required
          />
        </template>

        <template v-else-if="currentStep === 3">
          <UFormField :label="t('auth.schoolInstituteName')" class="field">
            <USelect
              v-model="form.institutionName"
              :items="schoolInstitutes"
              class="w-full"
              :placeholder="t('auth.selectSchoolInstitute')"
              required
            />
          </UFormField>

          <div class="id-card-upload-group">
            <UFormField
              :label="t('auth.instituteAffiliationDocument')"
              :help="t('auth.instituteAffiliationDocumentHelp')"
              class="field"
            >
              <input
                class="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                required
                @change="
                  updateIdCardFile(($event.target as HTMLInputElement).files)
                "
              />
              <span v-if="form.idCard" class="file-input-meta">
                {{ form.idCard.name }}
              </span>
            </UFormField>
          </div>
        </template>

        <template v-else-if="isPartnerReviewStep">
          <div class="review-panel">
            <div v-for="item in reviewItems" :key="item.label">
              <span>{{ translateText(item.label) }}</span>
              <strong>{{ item.value || t("auth.notProvided") }}</strong>
            </div>
          </div>

          <section
            class="id-card-preview"
            :aria-label="t('auth.instituteAffiliationDocumentPreview')"
          >
            <div class="id-card-preview-header">
              <span>{{ t("auth.instituteAffiliationDocument") }}</span>
              <strong>{{ form.idCard?.name || t("auth.notUploaded") }}</strong>
            </div>

            <img
              v-if="idCardPreviewUrl && idCardPreviewType === 'image'"
              class="id-card-preview-media"
              :src="idCardPreviewUrl"
              :alt="t('auth.uploadedInstituteAffiliationDocumentPreview')"
            />
            <object
              v-else-if="idCardPreviewUrl"
              class="id-card-preview-media"
              :data="idCardPreviewUrl"
              :type="form.idCard?.type || 'application/pdf'"
            >
              <a :href="idCardPreviewUrl" target="_blank" rel="noreferrer">
                {{ t("auth.openUploadedAffiliationDocument") }}
              </a>
            </object>
            <div v-else class="id-card-preview-empty">
              {{ t("auth.affiliationDocumentPreviewUnavailable") }}
            </div>
          </section>
        </template>

        <p
          v-if="submitStatus"
          :class="submitStatusType === 'error' ? 'form-error' : 'auth-success'"
        >
          {{ translateText(submitStatus) }}
        </p>

        <div
          class="auth-actions"
          :class="{ split: isPartner && currentStep > 1 }"
        >
          <UButton
            v-if="isPartner && currentStep > 1"
            block
            color="neutral"
            variant="outline"
            type="button"
            :label="t('auth.back')"
            @click="goToPreviousStep"
          />
          <UButton
            block
            class="auth-primary-button"
            type="submit"
            :loading="isSubmitting"
            :label="String(translateText(primaryButtonLabel))"
          />
        </div>
      </form>

      <p class="auth-switch-copy">
        <NuxtLink to="/login">{{ t("auth.backToAccessType") }}</NuxtLink>
      </p>

      <AuthFooter privacy-to="/privacy" terms-to="/terms" />
    </section>
  </main>
</template>
