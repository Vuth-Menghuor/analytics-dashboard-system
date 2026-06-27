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
  isGoogleEmailVerified,
  isSubmitting,
  isPartner,
  isVisitor,
  primaryButtonLabel,
  schoolInstitutes,
  selectedRole,
  stateProvinces,
  submitStatus,
  submitStatusType,
  totalSteps,
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

        <template v-if="isVisitor">
          <div class="google-verification-panel">
            <span class="google-verification-copy">
              {{ t("auth.createVisitorWithGoogle") }}
            </span>
            <div ref="googleButtonRef" class="google-signin-button" />
            <span
              v-if="isGoogleEmailVerified"
              class="google-verification-success"
            >
              {{ t("auth.verifiedGoogleEmail", { email: form.email }) }}
            </span>
          </div>

          <UFormField :label="t('auth.email')" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              :placeholder="t('auth.enterEmailAddress')"
              readonly
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

          <UFormField :label="t('auth.schoolInstituteName')" class="field">
            <USelect
              v-model="form.institutionName"
              :items="schoolInstitutes"
              class="w-full"
              :placeholder="t('auth.selectSchoolInstitute')"
              required
            />
          </UFormField>
        </template>

        <template v-else-if="currentStep === 2">
          <UFormField :label="t('auth.username')" class="field">
            <UInput
              v-model="form.name"
              class="w-full"
              type="text"
              :placeholder="t('auth.enterUsername')"
              required
            />
          </UFormField>

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
