<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager']
})
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Medium priority"
      title="Settings"
      copy="Configure workspace defaults, security posture, and notification behavior."
    />

    <section class="grid two">
      <article class="card card-pad">
        <h2 class="section-title">Workspace</h2>
        <label class="field">
          <span>Workspace name</span>
          <input class="input" value="Analytics Dashboard System" />
        </label>
        <label class="field">
          <span>Default currency</span>
          <select class="input">
            <option>USD</option>
            <option>KHR</option>
            <option>EUR</option>
          </select>
        </label>
      </article>

      <article class="card card-pad">
        <h2 class="section-title">Preferences</h2>
        <div class="settings-row">
          <div>
            <strong>Email summaries</strong>
            <p>Daily digest for dashboard movement</p>
          </div>
          <button class="toggle on" aria-label="Email summaries enabled" />
        </div>
        <div class="settings-row">
          <div>
            <strong>Report approvals</strong>
            <p>Require approval before sharing</p>
          </div>
          <button class="toggle" aria-label="Report approvals disabled" />
        </div>
      </article>
    </section>
  </div>
</template>
