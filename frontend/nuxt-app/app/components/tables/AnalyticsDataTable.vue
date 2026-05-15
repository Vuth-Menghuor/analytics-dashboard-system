<script setup lang="ts">
import type { AnalyticsTable } from "~/types/analytics";

defineProps<{
  table: AnalyticsTable;
}>();
</script>

<template>
  <DashboardDataTable
    :title="table.title"
    :icon="table.icon"
    :description="table.description"
    :columns="table.columns"
    :rows="table.rows"
    :row-key="table.rowKey"
    min-width="920px"
  >
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
