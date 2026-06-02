<script setup lang="ts">
import type { EChartsOption } from "echarts";
import AppEChart from "~/components/common/AppEChart.vue";
import { appColors, chartColors } from "~/constants/colors";
import type { AnalyticsChart } from "~/types/analytics";

const props = withDefaults(
  defineProps<{
    chart?: AnalyticsChart;
    option?: EChartsOption;
    title?: string;
    icon?: string;
    description?: string;
    badge?: string;
    badgeColor?: "primary" | "success" | "warning" | "error" | "neutral";
    height?: string;
    ariaLabel?: string;
  }>(),
  {
    badgeColor: "primary",
    height: "300px",
  },
);

const { translateText } = useTranslateText();

const computedOption = computed<EChartsOption>(() => {
  if (props.option) return props.option;

  const chart = props.chart;
  if (!chart) return {};

  const colors = [...chartColors];

  const baseTooltip: EChartsOption["tooltip"] = {
    trigger: chart.type === "pie" || chart.type === "donut" ? "item" : "axis",
    backgroundColor: appColors.white,
    borderColor: appColors.axis,
    borderWidth: 1,
    borderRadius: 8,
    textStyle: { color: appColors.ink, fontSize: 12 },
  };

  if (chart.type === "pie" || chart.type === "donut") {
    return {
      color: colors,
      tooltip: baseTooltip,
      legend: { bottom: 0, itemWidth: 14, itemHeight: 10 },
      series: [
        {
          name: chart.series[0]?.name,
          type: "pie",
          radius: chart.type === "donut" ? ["48%", "72%"] : "70%",
          center: ["50%", "42%"],
          data: chart.labels.map((label, index) => ({
            name: label,
            value: chart.series[0]?.data[index] ?? 0,
          })),
          label: { color: appColors.ink, fontWeight: 700 },
        },
      ],
    };
  }

  const isHorizontal = chart.type === "horizontalBar";

  return {
    color: colors,
    tooltip: baseTooltip,
    legend:
      chart.series.length > 1
        ? { bottom: 0, itemWidth: 14, itemHeight: 10 }
        : undefined,
    grid: {
      top: 20,
      right: 18,
      bottom: chart.series.length > 1 ? 48 : 24,
      left: 28,
      containLabel: true,
    },
    xAxis: {
      type: isHorizontal ? "value" : "category",
      data: isHorizontal ? undefined : chart.labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: appColors.axis } },
      axisLabel: { color: appColors.secondary },
      splitLine: isHorizontal
        ? { lineStyle: { color: appColors.grid, type: "dashed" } }
        : undefined,
    },
    yAxis: {
      type: isHorizontal ? "category" : "value",
      data: isHorizontal ? chart.labels : undefined,
      inverse: isHorizontal,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: appColors.secondary },
      splitLine: isHorizontal
        ? undefined
        : { lineStyle: { color: appColors.grid, type: "dashed" } },
    },
    series: chart.series.map((series) => ({
      name: series.name,
      type: chart.type === "line" ? "line" : "bar",
      smooth: chart.type === "line",
      data: series.data,
      barMaxWidth: 28,
      areaStyle: chart.type === "line" ? { opacity: 0.14 } : undefined,
      itemStyle:
        chart.type === "bar" || chart.type === "horizontalBar"
          ? { borderRadius: isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0] }
          : undefined,
    })),
  };
});

const cardTitle = computed(() => props.title || props.chart?.title || "");
const cardIcon = computed(() => props.icon || props.chart?.icon);
const cardDescription = computed(
  () => props.description || props.chart?.description,
);
const chartHeight = computed(
  () => props.height || props.chart?.height || "300px",
);
const chartAriaLabel = computed(() => props.ariaLabel || cardTitle.value);
</script>

<template>
  <UCard
    as="article"
    class="analytics-card"
    :ui="{ body: 'analytics-card-body' }"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="section-title with-icon">
          <UIcon v-if="cardIcon" :name="cardIcon" />
          {{ translateText(cardTitle) }}
        </h2>

        <p v-if="cardDescription" class="chart-note">
          {{ translateText(cardDescription) }}
        </p>
      </div>

      <UBadge v-if="badge" :color="badgeColor" variant="soft">
        {{ translateText(badge) }}
      </UBadge>
    </div>

    <AppEChart
      :option="computedOption"
      :height="chartHeight"
      :aria-label="chartAriaLabel"
    />
  </UCard>
</template>
