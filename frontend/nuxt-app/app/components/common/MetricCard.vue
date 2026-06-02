<script setup lang="ts">
import { useMetricCard } from "~/composables/dashboard/useMetricCard";
import type { Metric } from "~/types/dashboard";

const props = defineProps<{
  metric: Metric;
}>();
const { accentColor, accentSoftColor, backgroundColor } = useMetricCard(
  toRef(props, "metric"),
);
const { translateText } = useTranslateText();
</script>

<template>
  <UCard
    as="article"
    class="metric"
    :ui="{ body: 'metric-body' }"
    :style="{
      '--metric-accent': accentColor,
      '--metric-accent-soft': accentSoftColor,
      '--metric-background': backgroundColor,
    }"
  >
    <div class="metric-layout">
      <div class="metric-head">
        <p class="metric-label">{{ translateText(metric.label) }}</p>
      </div>
      <div class="metric-main">
        <div class="metric-content">
          <div class="metric-value-row">
            <div class="metric-value-copy">
              <p class="metric-value">{{ metric.value }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="metric-foot">
        <p v-if="metric.trend" class="metric-subtitle">
          {{ translateText(metric.trend) }}
        </p>
        <span class="metric-icon">
          <IconByName :name="metric.icon" size="22" />
        </span>
      </div>
    </div>
  </UCard>
</template>
