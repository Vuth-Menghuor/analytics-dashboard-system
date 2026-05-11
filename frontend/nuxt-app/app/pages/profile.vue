<script setup lang="ts">
const auth = useAuthStore();
const profile = computed(() => auth.user);
const twoFactorEnabled = ref(true);
</script>

<template>
  <div v-if="profile" class="page-stack">
    <PageHeader
      eyebrow="High priority"
      title="User Profile"
      copy="Manage account identity, contact details, role visibility, and notification preferences."
    />

    <section class="grid two">
      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Profile Details</h2>
        <div class="form-grid">
          <UFormField label="Full name">
            <UInput :model-value="profile.name" class="w-full" readonly />
          </UFormField>
          <UFormField label="Email">
            <UInput :model-value="profile.email" class="w-full" readonly />
          </UFormField>
          <UFormField label="Role">
            <UInput :model-value="profile.role" class="w-full" readonly />
          </UFormField>
          <UFormField label="Timezone">
            <UInput model-value="Asia/Phnom Penh" class="w-full" readonly />
          </UFormField>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Access Summary</h2>
        <div class="settings-row">
          <div>
            <strong>{{ profile.role }}</strong>
            <p>Active dashboard access</p>
          </div>
          <span class="status">Active</span>
        </div>
        <div class="settings-row">
          <div>
            <strong>Two-factor authentication</strong>
            <p>Extra protection for account sign-in</p>
          </div>
          <USwitch
            v-model="twoFactorEnabled"
            aria-label="Two-factor authentication enabled"
          />
        </div>
      </UCard>
    </section>
  </div>
</template>
