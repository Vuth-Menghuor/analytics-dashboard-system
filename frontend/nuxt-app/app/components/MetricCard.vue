<script setup lang="ts">
import type { EChartsOption } from "echarts";
import type { Metric } from "~/types/dashboard";

const props = defineProps<{
  metric: Metric;
}>();

const trendTone = computed(() =>
  props.metric.trend.trim().startsWith("-") ? "negative" : "positive",
);

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value;
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const sparklineData = computed(() =>
  props.metric.sparkline?.length
    ? props.metric.sparkline
    : [42, 46, 44, 49, 52, 50, 56, 60],
);

const accentColor = computed(() => props.metric.color ?? "#075a9b");

const accentRgb = computed(() => hexToRgb(accentColor.value));

const accentSoftColor = computed(() => {
  const { r, g, b } = accentRgb.value;

  return `rgba(${r}, ${g}, ${b}, 0.12)`;
});

const sparklineFill = computed(() =>
  `rgba(${accentRgb.value.r}, ${accentRgb.value.g}, ${accentRgb.value.b}, 0.14)`,
);

const sparklineOption = computed<EChartsOption>(() => ({
  animation: false,
  grid: { top: 6, right: 0, bottom: 2, left: 0 },
  tooltip: { show: false },
  xAxis: {
    type: "category",
    show: false,
    boundaryGap: false,
    data: sparklineData.value.map((_, index) => index + 1),
  },
  yAxis: {
    type: "value",
    show: false,
    min: "dataMin",
    max: "dataMax",
  },
  series: [
    {
      type: "line",
      data: sparklineData.value,
      smooth: true,
      symbol: "none",
      lineStyle: {
        width: 2,
        color: accentColor.value,
      },
      areaStyle: {
        color: sparklineFill.value,
      },
    },
  ],
}));
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
        <span :class="trendTone">{{ metric.trend.split(" ")[0] }}</span>
        {{ metric.trend.split(" ").slice(1).join(" ") }}
      </p>
    </div>
  </UCard>
</template>
