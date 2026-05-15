<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});
</script>

<template>
  <AnalyticsWorkspacePage page-key="activity" />
</template>
