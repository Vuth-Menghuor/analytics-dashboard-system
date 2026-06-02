<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import type { AnalyticsTable } from "~/types/analytics";

defineProps<{
  table: AnalyticsTable;
}>();

const { t } = useI18n();
</script>

<template>
  <DashboardDataTable v-bind="table" min-width="920px">
    <template #cell-action>
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-eye"
        :label="t('text.view')"
      />
    </template>
  </DashboardDataTable>
</template>
