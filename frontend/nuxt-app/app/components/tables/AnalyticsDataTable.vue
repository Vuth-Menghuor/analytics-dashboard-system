<script setup lang="ts">
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppButton from "~/components/common/AppButton.vue";
import type { AnalyticsTable } from "~/types/analytics";

defineProps<{
  table: AnalyticsTable;
}>();

const { t } = useI18n();
</script>

<template>
  <AppDataTable v-bind="table" min-width="920px">
    <template #cell-action>
      <AppButton
        action="view"
        :label="t('text.view')"
      />
    </template>
  </AppDataTable>
</template>
