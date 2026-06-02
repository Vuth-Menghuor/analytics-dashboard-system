<script setup lang="ts">
import PartnerRequestsPage from "~/components/admin/PartnerRequestsPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});
</script>

<template>
  <PartnerRequestsPage />
</template>
