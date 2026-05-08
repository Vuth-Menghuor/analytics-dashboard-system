<script setup lang="ts">
import type { Metric } from "~/types/dashboard";

defineProps<{
  metric: Metric;
}>();
</script>

<template>
  <article class="card card-pad metric">
    <span class="metric-icon">
      <IconByName :name="metric.icon" />
    </span>
    <div>
      <p class="metric-label">{{ metric.label }}</p>
      <p class="metric-value">{{ metric.value }}</p>
      <p class="metric-trend">{{ metric.trend }}</p>
    </div>
  </article>
</template>
