<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

type SignupRole = 'manager' | 'partner' | 'visitor'

const roles: Array<{ label: string; value: SignupRole; emailPlaceholder: string; namePlaceholder: string }> = [
  {
    label: 'Super Admin',
    value: 'manager',
    emailPlaceholder: 'Enter manager email',
    namePlaceholder: 'Enter manager name'
  },
  {
    label: 'Admin',
    value: 'partner',
    emailPlaceholder: 'Enter partner email',
    namePlaceholder: 'Enter partner name'
  },
  {
    label: 'User',
    value: 'visitor',
    emailPlaceholder: 'Enter visitor email',
    namePlaceholder: 'Enter visitor name'
  }
]

const selectedRole = ref<SignupRole>('manager')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const appName = 'Analytics Dashboard System'

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const selectedRoleConfig = computed(() => roles.find((role) => role.value === selectedRole.value) ?? roles[0])
</script>

<template>
  <main class="login-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <div class="login-hero-content">
        <h1 id="signup-hero-title">Start with the right role from day one.</h1>
        <p>
          Set up a focused account for the exact workspace you need, from
          operations oversight to day-to-day reporting.
        </p>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-brand">
        <img
          class="brand-mark logo-mark"
          src="/itc-logo.png"
          alt="Institute of Technology of Cambodia logo"
        />
        <span>{{ appName }}</span>
      </div>

      <div class="auth-header">
        <h2>Sign Up</h2>
        <p>Create your account and choose your access level.</p>
      </div>

      <div class="role-switcher" aria-label="Select account role">
        <button
          v-for="role in roles"
          :key="role.value"
          class="role-button"
          :class="{ active: selectedRole === role.value }"
          type="button"
          @click="selectedRole = role.value"
        >
          {{ role.label }}
        </button>
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
          <input v-model="form.email" class="input" type="email" :placeholder="selectedRoleConfig.emailPlaceholder" />
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

        <button class="btn primary" type="button">Sign Up</button>
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
