<script setup lang="ts">
definePageMeta({ layout: "auth" });

const {
  actionModeItems,
  currentStep,
  form,
  goToPreviousStep,
  handlePrimaryAction,
  headerCopy,
  headerTitle,
  idCardPreviewType,
  idCardPreviewUrl,
  isPartner,
  isPartnerReviewStep,
  primaryButtonLabel,
  reviewItems,
  schoolInstitutes,
  selectedRole,
  stateProvinces,
  submitStatus,
  totalSteps,
  updateIdCardFile,
} = useSignupForm();
</script>

<template>
  <main class="login-page signup-page">
    <section class="login-hero signup-hero" aria-labelledby="signup-hero-title">
      <img class="login-hero-logo" src="/ccun-banner.png" alt="CCUN" />
      <div class="login-hero-content">
        <h1 id="signup-hero-title">Start managing your analytics workspace</h1>
        <p>Create your account and keep every dashboard workflow in one place.</p>
      </div>

      <div class="showcase-context">
        <p>Create the right account for your workflow, then move into a guided dashboard experience designed for clean reporting.</p>
        <ul>
          <li>Visitor access setup</li>
          <li>Partner review flow</li>
          <li>Organized profile details</li>
        </ul>
      </div>
    </section>

    <section class="auth-panel login-card">
      <div class="auth-header">
        <span class="auth-step-meta"
          >Step {{ currentStep }} of {{ totalSteps }}</span
        >
        <h2>{{ headerTitle }}</h2>
        <p>{{ headerCopy }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handlePrimaryAction">
        <div class="auth-mode-links">
          <NuxtLink
            v-for="item in actionModeItems"
            :key="item.to"
            :to="item.to"
            :class="{ active: item.to.includes('/signup') }"
          >
            {{ item.label }}
          </NuxtLink>
        </div>

        <template v-if="selectedRole === 'visitor'">
          <UFormField label="Full Name" class="field">
            <UInput
              v-model="form.fullName"
              class="w-full"
              type="text"
              placeholder="Enter full name"
              required
            />
          </UFormField>

          <UFormField label="Email" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              placeholder="Enter email address"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            label="Password"
            placeholder="Enter password"
            autocomplete="new-password"
            required
          />

          <AuthPasswordField
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            autocomplete="new-password"
            hide-label="Hide password confirmation"
            show-label="Show password confirmation"
            required
          />
        </template>

        <template v-else-if="currentStep === 1">
          <UFormField label="State / Province" class="field">
            <USelect
              v-model="form.stateProvince"
              :items="stateProvinces"
              placeholder="Select state / province"
              class="w-full"
              required
            />
          </UFormField>
        </template>

        <template v-else-if="currentStep === 2">
          <div class="auth-form-grid">
            <UFormField label="First Name" class="field">
              <UInput
                v-model="form.firstName"
                class="w-full"
                type="text"
                placeholder="Enter first name"
                required
              />
            </UFormField>

            <UFormField label="Last Name" class="field">
              <UInput
                v-model="form.lastName"
                class="w-full"
                type="text"
                placeholder="Enter last name"
                required
              />
            </UFormField>
          </div>

          <UFormField label="Email" class="field">
            <UInput
              v-model="form.email"
              class="w-full"
              type="email"
              placeholder="Enter email address"
              required
            />
          </UFormField>

          <UFormField label="Phone Number" class="field">
            <UInput
              v-model="form.phoneNumber"
              class="w-full"
              type="tel"
              placeholder="Enter phone number"
              required
            />
          </UFormField>

          <AuthPasswordField
            v-model="form.password"
            label="Password"
            placeholder="Enter password"
            autocomplete="new-password"
            required
          />

          <AuthPasswordField
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            autocomplete="new-password"
            hide-label="Hide password confirmation"
            show-label="Show password confirmation"
            required
          />
        </template>

        <template v-else-if="currentStep === 3">
          <UFormField label="School / Institute Name" class="field">
            <USelect
              v-model="form.institutionName"
              :items="schoolInstitutes"
              class="w-full"
              placeholder="Select school / institute"
              required
            />
          </UFormField>

          <div class="id-card-upload-group">
            <UFormField
              label="Institute Affiliation Document"
              help="Upload proof that you work with or are connected to the selected institute."
              class="field"
            >
              <input
                class="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                required
                @change="
                  updateIdCardFile(($event.target as HTMLInputElement).files)
                "
              />
              <span v-if="form.idCard" class="file-input-meta">
                {{ form.idCard.name }}
              </span>
            </UFormField>
          </div>
        </template>

        <template v-else-if="isPartnerReviewStep">
          <div class="review-panel">
            <div v-for="item in reviewItems" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value || "Not provided" }}</strong>
            </div>
          </div>

          <section
            class="id-card-preview"
            aria-label="Institute affiliation document preview"
          >
            <div class="id-card-preview-header">
              <span>Institute Affiliation Document</span>
              <strong>{{ form.idCard?.name || "Not uploaded" }}</strong>
            </div>

            <img
              v-if="idCardPreviewUrl && idCardPreviewType === 'image'"
              class="id-card-preview-media"
              :src="idCardPreviewUrl"
              alt="Uploaded institute affiliation document preview"
            />
            <object
              v-else-if="idCardPreviewUrl"
              class="id-card-preview-media"
              :data="idCardPreviewUrl"
              :type="form.idCard?.type || 'application/pdf'"
            >
              <a :href="idCardPreviewUrl" target="_blank" rel="noreferrer">
                Open uploaded affiliation document
              </a>
            </object>
            <div v-else class="id-card-preview-empty">
              Affiliation document preview unavailable
            </div>
          </section>
        </template>

        <p v-if="submitStatus" class="auth-success">{{ submitStatus }}</p>

        <div class="auth-actions" :class="{ split: isPartner && currentStep > 1 }">
          <UButton
            v-if="isPartner && currentStep > 1"
            block
            color="neutral"
            variant="outline"
            type="button"
            label="Back"
            @click="goToPreviousStep"
          />
          <UButton block class="auth-primary-button" type="submit" :label="primaryButtonLabel" />
        </div>
      </form>

      <p class="auth-switch-copy">
        <NuxtLink to="/login">Back to access type</NuxtLink>
      </p>

      <AuthFooter privacy-to="/privacy" terms-to="/terms" />
    </section>
  </main>
</template>
