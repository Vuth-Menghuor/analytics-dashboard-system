<script setup lang="ts">
import ManagerDashboardPage from "~/components/dashboard/role/ManagerDashboardPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});
</script>

<template>
  <ManagerDashboardPage />
</template>
