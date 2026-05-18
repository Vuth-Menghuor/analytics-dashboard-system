<script setup lang="ts">
import SettingsPage from "~/components/settings/SettingsPage.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});
</script>

<template>
  <SettingsPage />
</template>
