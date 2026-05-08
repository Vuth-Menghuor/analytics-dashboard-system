<script setup lang="ts">
definePageMeta({ layout: "auth" });

const {
  auth,
  form,
  handleLogin,
  roles,
  selectedRole,
  selectedRoleConfig,
  selectRole,
} = useLoginForm();
</script>

<template>
  <main class="login-page">
    <section class="login-hero" aria-labelledby="login-hero-title">
      <div class="login-hero-content">
        <h1 id="login-hero-title">Turn activity into clear decisions.</h1>
        <p>
          A focused workspace for managers, admins, and users to monitor
          performance without the clutter.
        </p>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-header">
        <h2>Sign In</h2>
        <p>Sign in with the account issued for your role.</p>
      </div>

      <AuthRoleSwitcher
        :model-value="selectedRole"
        :roles="roles"
        switcher-label="Select login role"
        @update:model-value="selectRole"
      />

      <form class="auth-form" @submit.prevent="handleLogin">
        <label class="field">
          <span>Email</span>
          <input
            v-model="form.email"
            class="input"
            type="email"
            :placeholder="selectedRoleConfig.email"
            autocomplete="email"
            required
          />
        </label>

        <AuthPasswordField
          v-model="form.password"
          label="Password"
          :placeholder="selectedRoleConfig.password"
          autocomplete="current-password"
          required
        />

        <div class="auth-form-row">
          <NuxtLink class="auth-link" to="/login">Forgot Password?</NuxtLink>
        </div>

        <p v-if="auth.error" class="form-error">{{ auth.error }}</p>

        <button class="btn primary" type="submit" :disabled="auth.isLoading">
          {{ auth.isLoading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <p class="auth-switch-copy">
        Need access?
        <NuxtLink to="/signup"
          >Create an account or request partner access</NuxtLink
        >
      </p>

      <AuthFooter link-target="/login" />
    </section>
  </main>
</template>
