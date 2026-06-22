<script setup lang="ts">
import UserActivityPage from "~/components/activity/UserActivityPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});
</script>

<template>
  <UserActivityPage />
</template>
