<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});

const { data, error, isLoading } = useDashboard();
</script>

<template>
  <StatePanel v-if="isLoading" state="loading" />
  <StatePanel v-else-if="error || !data" state="error" :description="error" />
  <DashboardOverview v-else :config="data" />
</template>
