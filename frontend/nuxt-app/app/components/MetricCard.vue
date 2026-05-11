<script setup lang="ts">
import type { Metric } from "~/types/dashboard";

const props = defineProps<{
  metric: Metric;
}>();

const trendTone = computed(() =>
  props.metric.trend.trim().startsWith("-") ? "negative" : "positive",
);
</script>

<template>
  <UCard
    as="article"
    class="metric"
    :ui="{ body: 'metric-body' }"
  >
    <div class="metric-head">
      <p class="metric-label">{{ metric.label }}</p>
      <span class="metric-icon">
        <IconByName :name="metric.icon" />
      </span>
    </div>
    <div class="metric-content">
      <p class="metric-value">{{ metric.value }}</p>
      <p class="metric-trend">
        <span :class="trendTone">{{ metric.trend.split(" ")[0] }}</span>
        {{ metric.trend.split(" ").slice(1).join(" ") }}
      </p>
    </div>
  </UCard>
</template>
