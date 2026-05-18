<script setup lang="ts">
import RolesPage from "~/components/admin/RolesPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});
</script>

<template>
  <RolesPage />
</template>
