<script setup lang="ts">
import VisitorDashboardPage from "~/components/dashboard/role/VisitorDashboardPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["visitor"],
});
</script>

<template>
  <VisitorDashboardPage />
</template>
