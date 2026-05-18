<script setup lang="ts">
import type { AnalyticsTable } from "~/types/analytics";

defineProps<{
  table: AnalyticsTable;
}>();
</script>

<template>
  <DashboardDataTable v-bind="table" min-width="920px">
    <template #cell-action>
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-eye"
        label="View"
      />
    </template>
  </DashboardDataTable>
</template>
