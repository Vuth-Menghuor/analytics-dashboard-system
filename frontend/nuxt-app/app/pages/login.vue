<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";

definePageMeta({ layout: "auth" });

const auth = useAuthStore();
const router = useRouter();

type LoginRole = "manager" | "partner" | "visitor";

type RoleConfig = {
  label: string;
  value: LoginRole;
  email: string;
  password: string;
};

const roleConfigByValue: Record<LoginRole, RoleConfig> = {
  manager: {
    label: "Manager",
    value: "manager",
    email: "manager@example.com",
    password: "password",
  },
  partner: {
    label: "Partner",
    value: "partner",
    email: "partner@example.com",
    password: "password",
  },
  visitor: {
    label: "Visitor",
    value: "visitor",
    email: "visitor@example.com",
    password: "password",
  },
};

const roles = Object.values(roleConfigByValue);

const selectedRole = ref<LoginRole>("manager");
const showPassword = ref(false);
const appName = "Analytics Dashboard System";

const form = reactive({
  email: roleConfigByValue.manager.email,
  password: roleConfigByValue.manager.password,
});

const selectedRoleConfig = computed(() => roleConfigByValue[selectedRole.value]);

const selectRole = (role: LoginRole) => {
  selectedRole.value = role;
  const nextRole = roleConfigByValue[role];
  form.email = nextRole.email;
  form.password = nextRole.password;

  auth.error = "";
};

const handleLogin = async () => {
  const user = await auth.login(form);

  await router.replace(auth.dashboardPathFor(user));
};
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
        Visitors can create an account. <NuxtLink to="/signup">Register as Visitor</NuxtLink>
      </p>

      <footer class="auth-footer">
        <span>© 2026 {{ appName }}</span>
        <NuxtLink to="/login">Privacy Policy</NuxtLink>
        <NuxtLink to="/login">Terms &amp; Conditions</NuxtLink>
      </footer>
    </section>
  </main>
</template>
