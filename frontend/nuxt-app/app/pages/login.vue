<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  email: 'manager@example.com',
  password: 'password'
})

const handleLogin = async () => {
  const user = await auth.login(form)

  await router.replace(auth.dashboardPathFor(user))
}
</script>

<template>
  <main class="login-page">
    <section class="login-hero">
      <h1>Analytics Dashboard System</h1>
    </section>
    <section class="login-panel">
      <div>
        <span class="brand-mark">A</span>
        <h2>Sign in</h2>
        <p class="muted">Access operational metrics, reports, users, and workspace settings.</p>
      </div>

      <form class="page-stack" @submit.prevent="handleLogin">
        <label class="field">
          <span>Email</span>
          <input v-model="form.email" class="input" type="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input
            v-model="form.password"
            class="input"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <p v-if="auth.error" class="form-error">{{ auth.error }}</p>
        <button class="btn primary" type="submit" :disabled="auth.isLoading">
          {{ auth.isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </section>
  </main>
</template>
