<script setup lang="ts">
import { EyeOff } from 'lucide-vue-next'

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
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  countryCode: 'US',
  contact: '',
  password: ''
})

const selectedRoleConfig = computed(() => roles.find((role) => role.value === selectedRole.value) ?? roles[0])
</script>

<template>
  <main class="login-page">
    <section class="auth-panel">
      <div class="auth-header">
        <h2>Sign Up</h2>
        <p>Sign Up for free. No credit card required.</p>
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
          <span>Contact</span>
          <span class="contact-field">
            <select v-model="form.countryCode" class="country-select" aria-label="Country code">
              <option value="US">US</option>
              <option value="KH">KH</option>
              <option value="GB">GB</option>
            </select>
            <input v-model="form.contact" class="input contact-input" type="tel" placeholder="ex. 9876x xxxxx" />
          </span>
        </label>

        <label class="field">
          <span>Password</span>
          <span class="password-field">
            <input v-model="form.password" class="input" type="password" placeholder="Enter password" />
            <button class="password-toggle" type="button" aria-label="Password visibility">
              <EyeOff :size="17" aria-hidden="true" />
            </button>
          </span>
        </label>

        <label class="field">
          <span>Confirm Password</span>
          <span class="password-field">
            <input class="input" type="password" placeholder="Enter confirm password" />
            <button class="password-toggle" type="button" aria-label="Password visibility">
              <EyeOff :size="17" aria-hidden="true" />
            </button>
          </span>
        </label>

        <button class="btn primary" type="button">Sign Up</button>
      </form>

      <p class="auth-switch-copy">Already have an account? <NuxtLink to="/login">Sign In</NuxtLink></p>

      <footer class="auth-footer">
        <span>© 2026 SaasAble</span>
        <NuxtLink to="/signup">Privacy Policy</NuxtLink>
        <NuxtLink to="/signup">Terms &amp; Conditions</NuxtLink>
      </footer>
    </section>
  </main>
</template>
