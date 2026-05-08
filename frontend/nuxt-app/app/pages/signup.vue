<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";

definePageMeta({ layout: "auth" });

type RegistrationRole = "visitor" | "partner";

const router = useRouter();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const appName = "Analytics Dashboard System";
const selectedRole = ref<RegistrationRole>("visitor");
const currentStep = ref(1);
const submitStatus = ref("");

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  institute: "",
  department: "",
  position: "",
  message: "",
});

const roles: Array<{ label: string; value: RegistrationRole }> = [
  { label: "Visitor", value: "visitor" },
  { label: "Partner", value: "partner" },
];

const institutes = [
  "Institute of Technology of Cambodia",
  "Royal University of Phnom Penh",
  "National University of Management",
];
const departments = [
  "Computer Science",
  "Information Technology",
  "Data Analytics",
  "Business Intelligence",
];
const positions = ["Lecturer", "Researcher", "Coordinator", "Department Lead"];

const isPartnerStepTwo = computed(
  () => selectedRole.value === "partner" && currentStep.value === 2,
);
const primaryButtonLabel = computed(() => {
  if (selectedRole.value === "partner" && currentStep.value === 1) {
    return "Next";
  }

  return selectedRole.value === "visitor" ? "Create Account" : "Submit";
});

const selectRole = (role: RegistrationRole) => {
  selectedRole.value = role;
  currentStep.value = 1;
  submitStatus.value = "";
};

const handlePrimaryAction = async () => {
  submitStatus.value = "";

  if (selectedRole.value === "partner" && currentStep.value === 1) {
    currentStep.value = 2;
    return;
  }

  if (selectedRole.value === "visitor") {
    submitStatus.value = "Visitor account created. Redirecting to login.";
    await router.push("/login");
    return;
  }

  submitStatus.value =
    "Partner request submitted and pending manager approval.";
};
</script>

<template>
  <main class="login-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <div class="login-hero-content">
        <h1 id="signup-hero-title">Create your account.</h1>
        <p>
          Visitor accounts open immediately. Partner accounts include institute
          details and wait for manager approval.
        </p>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-header">
        <span class="auth-step-meta"
          >Step {{ currentStep }} of
          {{ selectedRole === "partner" ? 2 : 1 }}</span
        >
        <h2>{{ isPartnerStepTwo ? "Basic Information" : "Create Account" }}</h2>
        <p>
          {{
            selectedRole === "visitor"
              ? "Create a read-only visitor account."
              : "Request partner access for manager review."
          }}
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handlePrimaryAction">
        <div class="field">
          <span>Register As</span>
          <div
            class="role-switcher register-switcher"
            aria-label="Select registration role"
          >
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
        </div>

        <template v-if="!isPartnerStepTwo">
          <div class="auth-form-grid">
            <label class="field">
              <span>First Name</span>
              <input
                v-model="form.firstName"
                class="input"
                type="text"
                placeholder="Enter first name"
              />
            </label>

            <label class="field">
              <span>Last Name</span>
              <input
                v-model="form.lastName"
                class="input"
                type="text"
                placeholder="Enter last name"
              />
            </label>
          </div>

          <label class="field">
            <span>Email Address</span>
            <input
              v-model="form.email"
              class="input"
              type="email"
              placeholder="Enter email address"
            />
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
                placeholder="Confirm password"
                autocomplete="new-password"
              />
              <button
                class="password-toggle"
                type="button"
                :aria-label="
                  showConfirmPassword
                    ? 'Hide password confirmation'
                    : 'Show password confirmation'
                "
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff
                  v-if="showConfirmPassword"
                  :size="17"
                  aria-hidden="true"
                />
                <Eye v-else :size="17" aria-hidden="true" />
              </button>
            </span>
          </label>
        </template>

        <template v-else>
          <label class="field">
            <span>Institute</span>
            <select v-model="form.institute" class="input">
              <option value="" disabled>Select institute</option>
              <option
                v-for="institute in institutes"
                :key="institute"
                :value="institute"
              >
                {{ institute }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Department</span>
            <select v-model="form.department" class="input">
              <option value="" disabled>Select department</option>
              <option
                v-for="department in departments"
                :key="department"
                :value="department"
              >
                {{ department }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Position</span>
            <select v-model="form.position" class="input">
              <option value="" disabled>Select position</option>
              <option
                v-for="position in positions"
                :key="position"
                :value="position"
              >
                {{ position }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Optional Message / Request</span>
            <textarea
              v-model="form.message"
              class="input auth-textarea"
              placeholder="Add a short request for the manager"
            />
          </label>
        </template>

        <p v-if="submitStatus" class="auth-success">{{ submitStatus }}</p>

        <div class="auth-actions" :class="{ split: isPartnerStepTwo }">
          <button
            v-if="isPartnerStepTwo"
            class="btn"
            type="button"
            @click="currentStep = 1"
          >
            Back
          </button>
          <button class="btn primary" type="submit">
            {{ primaryButtonLabel }}
          </button>
        </div>
      </form>

      <p class="auth-switch-copy">
        Already have an account? <NuxtLink to="/login">Sign In</NuxtLink>
      </p>

      <footer class="auth-footer">
        <span>© 2026 {{ appName }}</span>
        <NuxtLink to="/signup">Privacy Policy</NuxtLink>
        <NuxtLink to="/signup">Terms &amp; Conditions</NuxtLink>
      </footer>
    </section>
  </main>
</template>
