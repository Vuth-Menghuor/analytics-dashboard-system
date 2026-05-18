<script setup lang="ts">
import AnalyticsOverviewPage from "~/components/analytics/AnalyticsOverviewPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});
</script>

<template>
  <AnalyticsOverviewPage />
</template>
