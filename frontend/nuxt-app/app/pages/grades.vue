<script setup lang="ts">
import AnalyticsWorkspacePage from "~/components/dashboard/AnalyticsWorkspacePage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});
</script>

<template>
  <AnalyticsWorkspacePage page-key="grades" />
</template>
