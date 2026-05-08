<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";

definePageMeta({ layout: "auth" });

const auth = useAuthStore();
const router = useRouter();

type LoginRole = "manager" | "partner" | "visitor";

const roles: Array<{
  label: string;
  value: LoginRole;
  email: string;
  password: string;
}> = [
  {
    label: "Super Admin",
    value: "manager",
    email: "manager@example.com",
    password: "password",
  },
  {
    label: "Admin",
    value: "partner",
    email: "partner@example.com",
    password: "password",
  },
  {
    label: "User",
    value: "visitor",
    email: "visitor@example.com",
    password: "password",
  },
];

const selectedRole = ref<LoginRole>("manager");
const showPassword = ref(false);

const form = reactive({
  email: roles[0].email,
  password: roles[0].password,
});

const selectedRoleConfig = computed(
  () => roles.find((role) => role.value === selectedRole.value) ?? roles[0],
);

const selectRole = (role: LoginRole) => {
  selectedRole.value = role;
  const nextRole = roles.find((item) => item.value === role);

  if (nextRole) {
    form.email = nextRole.email;
    form.password = nextRole.password;
  }

  auth.error = "";
};

const handleLogin = async () => {
  const user = await auth.login(form);

  await router.replace(auth.dashboardPathFor(user));
};
</script>

<template>
  <main class="login-page">
    <section class="auth-panel">
      <div class="auth-header">
        <h2>Sign In</h2>
        <p>Welcome back! Select the method of login.</p>
      </div>

      <div class="role-switcher" aria-label="Select login role">
        <button
          v-for="role in roles"
          :key="role.value"
          class="role-button"
          :class="{ active: selectedRole === role.value }"
          type="button"
          @click="selectRole(role.value)"
        >
          {{ role.label }}
        </button>
      </div>

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

        <label class="field">
          <span>Password</span>
          <span class="password-field">
            <input
              v-model="form.password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="selectedRoleConfig.password"
              autocomplete="current-password"
              required
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

        <div class="auth-form-row">
          <NuxtLink class="auth-link" to="/login">Forgot Password?</NuxtLink>
        </div>

        <p v-if="auth.error" class="form-error">{{ auth.error }}</p>

        <button class="btn primary" type="submit" :disabled="auth.isLoading">
          {{ auth.isLoading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <p class="auth-switch-copy">
        Don’t have an account? <NuxtLink to="/signup">Sign Up</NuxtLink>
      </p>

      <footer class="auth-footer">
        <span>© 2026 SaasAble</span>
        <NuxtLink to="/login">Privacy Policy</NuxtLink>
        <NuxtLink to="/login">Terms &amp; Conditions</NuxtLink>
      </footer>
    </section>
  </main>
</template>
