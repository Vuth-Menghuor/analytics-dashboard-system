<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardOverview from "~/components/dashboard/DashboardOverview.vue";

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
