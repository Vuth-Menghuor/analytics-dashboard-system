<script setup lang="ts">
import PartnerDashboardPage from "~/components/dashboard/role/PartnerDashboardPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["partner"],
});
</script>

<template>
  <PartnerDashboardPage />
</template>
