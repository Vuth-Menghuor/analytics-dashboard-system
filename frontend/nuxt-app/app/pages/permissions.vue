<script setup lang="ts">
import PermissionsPage from "~/components/admin/PermissionsPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});
</script>

<template>
  <PermissionsPage />
</template>
