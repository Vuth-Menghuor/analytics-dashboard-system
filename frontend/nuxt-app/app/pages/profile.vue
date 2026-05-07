<script setup lang="ts">
const auth = useAuthStore()
const profile = computed(() => auth.user)
</script>

<template>
  <div v-if="profile" class="page-stack">
    <PageHeader
      eyebrow="High priority"
      title="User Profile"
      copy="Manage account identity, contact details, role visibility, and notification preferences."
    />

    <section class="grid two">
      <article class="card card-pad">
        <h2 class="section-title">Profile Details</h2>
        <div class="form-grid">
          <label class="field">
            <span>Full name</span>
            <input class="input" :value="profile.name" />
          </label>
          <label class="field">
            <span>Email</span>
            <input class="input" :value="profile.email" />
          </label>
          <label class="field">
            <span>Role</span>
            <input class="input" :value="profile.role" />
          </label>
          <label class="field">
            <span>Timezone</span>
            <input class="input" value="Asia/Phnom Penh" />
          </label>
        </div>
      </article>

      <article class="card card-pad">
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
          <button class="toggle on" aria-label="Two-factor authentication enabled" />
        </div>
      </article>
    </section>
  </div>
</template>
