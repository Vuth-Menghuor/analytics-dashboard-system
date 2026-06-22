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
      <div v-if="scopeLabel" class="toolbar">
        <UBadge color="success" variant="soft">
          {{ scopeLabel }}
        </UBadge>
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
        :class="{ 'analytics-chart-wide': chart.wide }"
      />
    </section>
  </div>
</template>
