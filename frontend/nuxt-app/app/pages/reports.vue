<script setup lang="ts">
import ReportsPage from "~/components/reports/ReportsPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});
</script>

<template>
  <ReportsPage />
</template>
