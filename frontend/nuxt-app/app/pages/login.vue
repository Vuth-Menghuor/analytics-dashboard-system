<script setup lang="ts">
import { useLoginForm } from "~/composables/auth/useLoginForm";

definePageMeta({ layout: "auth" });

const {
  accessRoleCards,
  auth,
  form,
  handleLogin,
  isRoleLanding,
  partnerRequestSubmitted,
  selectAccessRole,
  selectedRole,
  selectedRoleConfig,
  visitorAccountCreated,
} = useLoginForm();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <main class="login-page">
    <section class="login-hero" aria-labelledby="login-hero-title">
      <img class="login-hero-logo" src="/ccun-banner.png" alt="CCUN" />
      <div class="login-hero-content">
        <h1 id="login-hero-title">{{ t("auth.heroTitle") }}</h1>
        <p>{{ t("auth.heroDescription") }}</p>
      </div>

      <div class="showcase-context">
        <p>{{ t("auth.showcaseDescription") }}</p>
        <ul>
          <li>{{ t("auth.roleBasedAccess") }}</li>
          <li>{{ t("auth.realTimeAnalytics") }}</li>
          <li>{{ t("auth.protectedAccountSessions") }}</li>
        </ul>
      </div>
    </section>

    <section class="auth-panel login-card">
      <template v-if="isRoleLanding">
        <div class="auth-header">
          <h2>{{ t("auth.accessType") }}</h2>
          <p>{{ t("auth.accessTypeDescription") }}</p>
        </div>

        <div class="access-role-list" :aria-label="t('auth.accessTypes')">
          <button
            v-for="role in accessRoleCards"
            :key="role.value"
            class="access-role-card"
            type="button"
            @click="selectAccessRole(role.value)"
          >
            <span class="access-role-icon">
              <UIcon v-if="role.value === 'manager'" name="i-lucide-shield-check" />
              <UIcon v-else-if="role.value === 'partner'" name="i-lucide-school" />
              <UIcon v-else name="i-lucide-eye" />
            </span>
            <span class="access-role-copy">
              <span class="access-role-title">{{ translateText(role.label) }}</span>
              <span class="access-role-access">{{ translateText(role.access) }}</span>
              <span class="access-role-description">{{ translateText(role.description) }}</span>
            </span>
            <UIcon class="access-role-arrow" name="i-lucide-chevron-right" />
          </button>
        </div>
      </template>

      <template v-else>
        <div class="auth-header">
          <span class="auth-step-meta">
            {{ t("auth.roleAccess", { role: selectedRole }) }}
          </span>
          <h2>{{ t("auth.roleLogin", { role: translateText(selectedRoleConfig.label) }) }}</h2>
          <p>
            {{
              selectedRole === "manager"
                ? t("auth.managerLoginDescription")
                : t("auth.standardLoginDescription")
            }}
          </p>
        </div>

        <div v-if="selectedRole !== 'manager'" class="auth-mode-links">
          <NuxtLink :to="`/login?role=${selectedRole}`" class="active">
            {{ t("auth.alreadyHaveAccount") }}
          </NuxtLink>
          <NuxtLink :to="`/signup?role=${selectedRole}`">
            {{
              selectedRole === "partner"
                ? t("auth.createPartnerAccount")
                : t("auth.createAccount")
            }}
          </NuxtLink>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <p v-if="partnerRequestSubmitted" class="auth-success">
            {{ t("auth.partnerRequestSubmitted") }}
          </p>
          <p v-if="visitorAccountCreated" class="auth-success">
            {{ t("auth.visitorAccountCreated") }}
          </p>

          <UFormField :label="t('auth.email')" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              :placeholder="t('auth.enterEmailAddress')"
              autocomplete="email"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            :label="t('auth.password')"
            :placeholder="t('auth.enterPassword')"
            autocomplete="current-password"
            required
          />

          <div class="auth-form-row">
            <label class="remember-control">
              <input v-model="form.remember" type="checkbox" />
              <span>{{ t("auth.rememberMe") }}</span>
            </label>
            <NuxtLink class="auth-link" to="/login">
              {{ t("auth.forgotPassword") }}
            </NuxtLink>
          </div>

          <p v-if="auth.error" class="form-error">{{ auth.error }}</p>

          <UButton
            block
            class="auth-primary-button"
            type="submit"
            size="lg"
            :loading="auth.isLoading"
            :label="auth.isLoading ? t('auth.signingIn') : t('auth.signIn')"
          />
        </form>

        <p class="auth-switch-copy">
          <NuxtLink to="/login">{{ t("auth.backToAccessType") }}</NuxtLink>
        </p>
      </template>

      <AuthFooter privacy-to="/privacy" terms-to="/terms" />
    </section>
  </main>
</template>
