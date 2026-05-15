<script setup lang="ts">
import type { AnalyticsPageConfig } from "~/types/analytics";

defineProps<{
  config: AnalyticsPageConfig;
}>();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="config.eyebrow"
      :title="config.title"
      :copy="config.copy"
    >
      <UBadge color="primary" variant="soft">{{ config.endpoint }}</UBadge>
    </PageHeader>

    <section class="grid metrics">
      <MetricCard
        v-for="metricItem in config.metrics"
        :key="metricItem.label"
        :metric="metricItem"
      />
    </section>

    <section class="grid analytics-chart-grid">
      <AnalyticsChartCard
        v-for="chart in config.charts"
        :key="chart.title"
        :chart="chart"
      />
    </section>
  </div>
</template>
