<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
</script>

<template>
  <main class="auth-shell">
    <section class="auth-card policy-card">
      <h1>{{ t("text.termsConditions") }}</h1>
      <p>
        {{ t("text.termsConditionsDescription") }}
      </p>
      <UButton to="/login" color="primary" variant="solid" :label="t('text.backToLogin')" />
    </section>
  </main>
</template>
