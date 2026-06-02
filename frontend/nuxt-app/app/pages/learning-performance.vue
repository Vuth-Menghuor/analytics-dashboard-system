<script setup lang="ts">
import PerformancePage from "~/components/learning/PerformancePage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});
</script>

<template>
  <PerformancePage />
</template>
