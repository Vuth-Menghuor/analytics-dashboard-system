<script setup lang="ts">
definePageMeta({ layout: "auth" });

const {
  currentStep,
  departments,
  form,
  goToPreviousStep,
  handlePrimaryAction,
  institutes,
  isPartnerStepTwo,
  positions,
  primaryButtonLabel,
  roles,
  selectedRole,
  selectRole,
  submitStatus,
} = useSignupForm();
</script>

<template>
  <main class="login-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <img class="login-hero-logo" src="/ccun-banner.png" alt="CCUN" />
      <div class="login-hero-content">
        <h1 id="signup-hero-title">Turn activity into clear decisions.</h1>
        <p>
          A focused workspace for managers, admins, and users to monitor
          performance without the clutter.
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
          <AuthRoleSwitcher
            class="register-switcher"
            :model-value="selectedRole"
            :roles="roles"
            switcher-label="Select registration role"
            @update:model-value="selectRole"
          />
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

          <AuthPasswordField
            v-model="form.password"
            label="Password"
            placeholder="Enter password"
            autocomplete="new-password"
          />

          <AuthPasswordField
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            autocomplete="new-password"
            hide-label="Hide password confirmation"
            show-label="Show password confirmation"
          />
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
            @click="goToPreviousStep"
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

      <AuthFooter link-target="/signup" />
    </section>
  </main>
</template>
