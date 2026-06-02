<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useEChart } from "~/composables/charts/useEChart";

const props = withDefaults(
  defineProps<{
    option: EChartsOption;
    height?: string;
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
  <div
    ref="chartEl"
    class="echart"
    role="img"
    :aria-label="ariaLabel || t('text.dataVisualization')"
    :style="{ height }"
  />
</template>
