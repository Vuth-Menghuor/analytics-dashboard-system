<script setup lang="ts">
import { useMetricCard } from "~/composables/dashboard/useMetricCard";
import type { Metric } from "~/types/dashboard";

const props = defineProps<{
  metric: Metric;
}>();
const { accentColor, accentSoftColor, backgroundColor, foregroundColor } = useMetricCard(
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
      '--metric-foreground': foregroundColor,
    }"
  >
    <div class="metric-layout">
      <div class="metric-head">
        <p class="metric-label">{{ translateText(metric.label) }}</p>
        <span class="metric-icon">
          <IconByName :name="metric.icon" size="22" />
        </span>
      </div>

      <div class="metric-main">
        <div class="metric-content">
          <p class="metric-value">{{ metric.value }}</p>
          <dl v-if="metric.breakdown?.length" class="metric-breakdown">
            <div v-for="item in metric.breakdown" :key="item.label">
              <dt>{{ translateText(item.label) }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
          <p v-else-if="metric.trend" class="metric-subtitle">
            {{ translateText(metric.trend) }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
