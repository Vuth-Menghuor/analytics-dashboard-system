<script setup lang="ts">
import { useMetricCard } from "~/composables/dashboard/useMetricCard";
import type { Metric } from "~/types/dashboard";

const props = defineProps<{
  metric: Metric;
}>();
const {
  accentColor,
  accentSoftColor,
  sparklineOption,
  trendDescription,
  trendTone,
  trendValue,
} = useMetricCard(toRef(props, "metric"));
</script>

<template>
  <UCard
    as="article"
    class="metric"
    :ui="{ body: 'metric-body' }"
    :style="{
      '--metric-accent': accentColor,
      '--metric-accent-soft': accentSoftColor,
    }"
  >
    <div class="metric-layout">
      <div class="metric-head">
        <p class="metric-label">{{ metric.label }}</p>
        <span class="metric-icon">
          <IconByName :name="metric.icon" />
        </span>
      </div>
      <div class="metric-main">
        <div class="metric-content">
          <p class="metric-value">{{ metric.value }}</p>
        </div>
        <AppEChart
          class="metric-sparkline"
          :option="sparklineOption"
          height="92px"
          :aria-label="`${metric.label} mini trend line`"
        />
      </div>
    </div>
    <div class="metric-footer">
      <p class="metric-trend">
        <span :class="trendTone">{{ trendValue }}</span>
        {{ trendDescription }}
      </p>
    </div>
  </UCard>
</template>
