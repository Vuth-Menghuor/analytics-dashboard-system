<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useEChart } from "~/composables/charts/useEChart";

const props = withDefaults(
  defineProps<{
    option: EChartsOption;
    height?: string;
    minWidth?: string;
    ariaLabel?: string;
  }>(),
  {
    height: "280px",
    ariaLabel: "",
  },
);

const { chartEl } = useEChart(toRef(props, "option"));
const { t } = useI18n();
</script>

<template>
  <div class="echart-scroll">
    <div
      ref="chartEl"
      class="echart"
      role="img"
      :aria-label="ariaLabel || t('text.dataVisualization')"
      :style="{ height, minWidth }"
    />
  </div>
</template>

<style scoped>
.echart-scroll {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.echart {
  width: 100%;
}
</style>
