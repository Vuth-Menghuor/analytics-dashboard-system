<script setup lang="ts">
import UsersPage from "~/components/admin/UsersPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});
</script>

<template>
  <UsersPage />
</template>
