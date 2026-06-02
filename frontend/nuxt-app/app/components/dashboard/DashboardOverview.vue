<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import type { AnalyticsPageConfig } from "~/types/analytics";

defineProps<{
  config: AnalyticsPageConfig;
  scopeLabel?: string;
}>();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="config.eyebrow"
      :title="config.title"
      :copy="config.copy"
    >
      <div class="toolbar">
        <UBadge v-if="scopeLabel" color="success" variant="soft">
          {{ scopeLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft">{{ config.endpoint }}</UBadge>
      </div>
    </PageHeader>

    <section class="grid metrics">
      <MetricCard
        v-for="metricItem in config.metrics"
        :key="metricItem.label"
        :metric="metricItem"
      />
    </section>

    <section v-if="config.charts.length" class="grid analytics-chart-grid">
      <AnalyticsChartCard
        v-for="chart in config.charts"
        :key="chart.title"
        :chart="chart"
      />
    </section>
  </div>
</template>
