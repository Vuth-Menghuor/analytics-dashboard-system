<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const appName = 'Analytics Dashboard System'
const visitorEmailPlaceholder = 'Enter visitor email'

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})
</script>

<template>
  <main class="login-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <div class="login-hero-content">
        <h1 id="signup-hero-title">Create a visitor account.</h1>
        <p>
          Sign up to access your dashboard and start tracking the reports
          available to your account.
        </p>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-header">
        <h2>Visitor Sign Up</h2>
        <p>Create your account to continue.</p>
      </div>

      <form class="auth-form">
        <div class="auth-form-grid">
          <label class="field">
            <span>First Name</span>
            <input v-model="form.firstName" class="input" type="text" placeholder="Enter first name" />
          </label>

          <label class="field">
            <span>Last Name</span>
            <input v-model="form.lastName" class="input" type="text" placeholder="Enter last name" />
          </label>
        </div>

        <label class="field">
          <span>Email</span>
          <input v-model="form.email" class="input" type="email" :placeholder="visitorEmailPlaceholder" />
        </label>

        <label class="field">
          <span>Password</span>
          <span class="password-field">
            <input
              v-model="form.password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              autocomplete="new-password"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="17" aria-hidden="true" />
              <Eye v-else :size="17" aria-hidden="true" />
            </button>
          </span>
        </label>

        <label class="field">
          <span>Confirm Password</span>
          <span class="password-field">
            <input
              v-model="form.confirmPassword"
              class="input"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Enter confirm password"
              autocomplete="new-password"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" :size="17" aria-hidden="true" />
              <Eye v-else :size="17" aria-hidden="true" />
            </button>
          </span>
        </label>

        <button class="btn primary" type="button">Create Visitor Account</button>
      </form>

      <p class="auth-switch-copy">Already have an account? <NuxtLink to="/login">Sign In</NuxtLink></p>

      <footer class="auth-footer">
        <span>© 2026 {{ appName }}</span>
        <NuxtLink to="/signup">Privacy Policy</NuxtLink>
        <NuxtLink to="/signup">Terms &amp; Conditions</NuxtLink>
      </footer>
    </section>
  </main>
</template>
