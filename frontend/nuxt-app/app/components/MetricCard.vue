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
    :ui="{ body: 'grid gap-3.5 p-5' }"
  >
    <span class="metric-icon">
      <IconByName :name="metric.icon" />
    </span>
    <div>
      <p class="metric-label">{{ metric.label }}</p>
      <p class="metric-value">{{ metric.value }}</p>
      <p class="metric-trend" :class="trendTone">{{ metric.trend }}</p>
    </div>
  </UCard>
</template>
