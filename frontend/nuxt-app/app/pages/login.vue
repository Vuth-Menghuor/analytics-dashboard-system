<script setup lang="ts">
definePageMeta({ layout: "auth" });

const {
  accessRoleCards,
  auth,
  form,
  handleLogin,
  isRoleLanding,
  selectAccessRole,
  selectedRole,
  selectedRoleConfig,
} = useLoginForm();
</script>

<template>
  <main class="login-page">
    <section class="login-hero" aria-labelledby="login-hero-title">
      <img class="login-hero-logo" src="/ccun-banner.png" alt="CCUN" />
      <div class="login-hero-content">
        <h1 id="login-hero-title">The simplest way to manage your analytics workspace</h1>
        <p>Enter your credentials to access your account.</p>
      </div>

      <div class="showcase-context">
        <p>Built for secure daily access with clear roles, live dashboard visibility, and a workspace that stays simple for every user.</p>
        <ul>
          <li>Role-based access</li>
          <li>Real-time analytics</li>
          <li>Protected account sessions</li>
        </ul>
      </div>
    </section>

    <section class="auth-panel login-card">
      <template v-if="isRoleLanding">
        <div class="auth-header">
          <h2>Choose your access type</h2>
          <p>Select the role that best matches how you use the dashboard.</p>
        </div>

        <div class="access-role-list" aria-label="Access types">
          <button
            v-for="role in accessRoleCards"
            :key="role.value"
            class="access-role-card"
            type="button"
            @click="selectAccessRole(role.value)"
          >
            <span class="access-role-icon">
              <IconByName :name="role.icon" size="20" />
            </span>
            <span class="access-role-copy">
              <span class="access-role-title">{{ role.label }}</span>
              <span class="access-role-access">{{ role.access }}</span>
              <span class="access-role-description">{{ role.description }}</span>
            </span>
            <IconByName class="access-role-arrow" name="i-lucide-chevron-right" size="18" />
          </button>
        </div>
      </template>

      <template v-else>
        <div class="auth-header">
          <span class="auth-step-meta">{{ selectedRole }} access</span>
          <h2>{{ selectedRoleConfig.label }} Login</h2>
          <p>
            {{
              selectedRole === "manager"
                ? "Sign in with your system administrator account."
                : "Sign in with your approved account."
            }}
          </p>
        </div>

        <div v-if="selectedRole !== 'manager'" class="auth-mode-links">
          <NuxtLink :to="`/login?role=${selectedRole}`" class="active">
            I already have an account
          </NuxtLink>
          <NuxtLink :to="`/signup?role=${selectedRole}`">
            {{
              selectedRole === "partner"
                ? "Create Partner Account"
                : "Create Account"
            }}
          </NuxtLink>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <UFormField label="Email" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              :placeholder="selectedRoleConfig.email"
              autocomplete="email"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            label="Password"
            :placeholder="selectedRoleConfig.password"
            autocomplete="current-password"
            required
          />

          <div class="auth-form-row">
            <label class="remember-control">
              <input v-model="form.remember" type="checkbox" />
              <span>Remember me</span>
            </label>
            <NuxtLink class="auth-link" to="/login">Forgot password?</NuxtLink>
          </div>

          <p v-if="auth.error" class="form-error">{{ auth.error }}</p>

          <UButton
            block
            class="auth-primary-button"
            type="submit"
            size="lg"
            :loading="auth.isLoading"
            :label="auth.isLoading ? 'Signing in...' : 'Sign In'"
          />
        </form>

        <p class="auth-switch-copy">
          <NuxtLink to="/login">Back to access type</NuxtLink>
        </p>
      </template>

      <AuthFooter privacy-to="/privacy" terms-to="/terms" />
    </section>
  </main>
</template>
