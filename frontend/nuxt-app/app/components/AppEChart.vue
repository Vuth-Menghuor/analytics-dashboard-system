<script setup lang="ts">
import type { EChartsOption, ECharts } from "echarts";

const props = withDefaults(
  defineProps<{
    option: EChartsOption;
    height?: string;
    ariaLabel?: string;
  }>(),
  {
    height: "280px",
    ariaLabel: "Data visualization",
  },
);

const chartEl = ref<HTMLElement | null>(null);
let chart: ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const renderChart = () => {
  if (!chart) {
    return;
  }

  chart.setOption(props.option, true);
};

onMounted(async () => {
  if (!chartEl.value) {
    return;
  }

  const echarts = await import("echarts");
  chart = echarts.init(chartEl.value, null, { renderer: "canvas" });
  renderChart();

  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartEl.value);
});

watch(
  () => props.option,
  () => renderChart(),
  { deep: true },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <div
    ref="chartEl"
    class="echart"
    role="img"
    :aria-label="ariaLabel"
    :style="{ height }"
  />
</template>
