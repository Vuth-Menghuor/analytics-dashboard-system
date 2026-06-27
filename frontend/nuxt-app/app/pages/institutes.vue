<script setup lang="ts">
import InstitutesPage from "~/components/institutes/InstitutesPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});
</script>

<template>
  <InstitutesPage />
</template>
