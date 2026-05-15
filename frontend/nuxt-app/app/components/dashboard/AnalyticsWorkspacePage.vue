<script setup lang="ts">
const props = defineProps<{
  pageKey: string;
}>();

const { data, error, isLoading, refresh } = useAnalytics(props.pageKey);
const filterValues = ref<Record<string, string>>({});
</script>

<template>
  <div class="page-stack">
    <StatePanel
      v-if="isLoading"
      state="loading"
      title="Loading analytics"
      description="Preparing mock Moodle data."
    />
    <StatePanel
      v-else-if="error || !data"
      state="error"
      :description="error"
    />

    <template v-else>
      <PageHeader
        :eyebrow="data.eyebrow"
        :title="data.title"
        :copy="data.copy"
      >
        <div class="toolbar">
          <UBadge color="primary" variant="soft">{{ data.endpoint }}</UBadge>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            label="Refresh"
            @click="refresh"
          />
        </div>
      </PageHeader>

      <AnalyticsFilterBar v-model="filterValues" :filters="data.filters" />

      <section class="grid metrics">
        <MetricCard
          v-for="metricItem in data.metrics"
          :key="metricItem.label"
          :metric="metricItem"
        />
      </section>

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard
          v-for="chart in data.charts"
          :key="chart.title"
          :chart="chart"
        />
      </section>

      <AnalyticsDataTable
        v-if="data.table && data.table.rows.length"
        :table="data.table"
      />
      <StatePanel
        v-else-if="data.table"
        state="empty"
        :title="data.emptyTitle"
        :description="data.emptyDescription"
      />
    </template>
  </div>
</template>
