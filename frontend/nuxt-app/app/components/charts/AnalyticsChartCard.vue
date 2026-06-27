<script setup lang="ts">
import type { EChartsOption } from "echarts";
import AppEChart from "~/components/common/AppEChart.vue";
import {
  appColors,
  chartColors,
  chartOtherColor,
  withAlpha,
} from "~/constants/colors";
import type { AnalyticsChart } from "~/types/analytics";
import { createColoredBarData, formatChartValue } from "~/utils/chartDisplay";

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

const toChartNumber = (value: number | string | null | undefined) => {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value ?? "").replace(/,/g, ""));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatAxisTooltip = (params: unknown) => {
  const items = Array.isArray(params) ? params : [params];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return "";

      const point = item as {
        marker?: string;
        seriesName?: string;
        name?: string;
        value?: string | number;
      };

      return `${point.marker ?? ""} ${point.seriesName ?? ""}: <strong>${point.value ?? 0}</strong>`;
    })
    .filter(Boolean)
    .join("<br />");
};

const getPieData = (chart: AnalyticsChart) => {
  const data = chart.labels.map((label, index) => ({
    name: label,
    value: toChartNumber(chart.series[0]?.data[index]),
  }));

  if (data.length <= chartColors.length) return data;

  return [
    ...data.slice(0, chartColors.length - 1),
    {
      name: "Other",
      value: data
        .slice(chartColors.length - 1)
        .reduce((total, item) => total + item.value, 0),
    },
  ];
};

const computedOption = computed<EChartsOption>(() => {
  if (props.option) return props.option;

  const chart = props.chart;
  if (!chart) return {};

  const colors = [...chartColors];
  const isPieLike = ["pie", "donut", "halfDonut"].includes(chart.type);
  const isHalfDonut = chart.type === "halfDonut";

  const baseTooltip: EChartsOption["tooltip"] = {
    trigger: isPieLike ? "item" : "axis",
    backgroundColor: appColors.white,
    borderColor: appColors.axis,
    borderWidth: 1,
    borderRadius: 8,
    textStyle: { color: appColors.ink, fontSize: 12 },
    formatter: isPieLike
      ? "{b}: <strong>{c}</strong> ({d}%)"
      : formatAxisTooltip,
  };

  if (isPieLike) {
    return {
      color:
        chart.labels.length > chartColors.length
          ? [...chartColors.slice(0, -1), chartOtherColor]
          : colors,
      tooltip: baseTooltip,
      legend: isHalfDonut
        ? { top: "5%", left: "center", itemWidth: 14, itemHeight: 10 }
        : {
            type: "scroll",
            orient: "horizontal",
            left: "center",
            bottom: 0,
            icon: "roundRect",
            itemWidth: 16,
            itemHeight: 10,
            itemGap: 12,
          },
      series: [
        {
          name: chart.series[0]?.name,
          type: "pie",
          left: 0,
          right: 0,
          top: 28,
          bottom: 58,
          radius:
            chart.type === "pie"
              ? "62%"
              : isHalfDonut
                ? ["40%", "70%"]
                : ["30%", "58%"],
          center: isHalfDonut ? ["50%", "70%"] : ["50%", "46%"],
          startAngle: isHalfDonut ? 180 : undefined,
          endAngle: isHalfDonut ? 360 : undefined,
          avoidLabelOverlap: true,
          stillShowZeroSum: true,
          minAngle: 4,
          data: getPieData(chart),
          label: {
            show: chart.type !== "donut",
            color: appColors.ink,
            fontWeight: 700,
            formatter: "{b}: {c}",
            position: "outside",
          },
          labelLine:
            chart.type === "pie" || isHalfDonut
              ? { show: true, length: 18, length2: 24 }
              : undefined,
        },
      ],
    };
  }

  const isHorizontal = chart.type === "horizontalBar";
  const isVerticalBar = chart.type === "bar";
  const isLine = chart.type === "line";
  const horizontalLabelWidth = chart.wide ? 220 : 156;
  const visibleHorizontalItems =
    chart.visibleItems ?? (chart.wide ? 10 : 8);
  const hasHorizontalScroll =
    isHorizontal && chart.labels.length > visibleHorizontalItems;
  const visibleCategoryItems = chart.wide ? 12 : 8;
  const hasCategoryScroll =
    (isLine || (isVerticalBar && !chart.showAllCategories)) &&
    chart.labels.length > visibleCategoryItems;
  const horizontalScrollEnd = hasHorizontalScroll
    ? Math.min(100, (visibleHorizontalItems / chart.labels.length) * 100)
    : 100;
  const categoryScrollEnd = hasCategoryScroll
    ? Math.min(100, (visibleCategoryItems / chart.labels.length) * 100)
    : 100;

  return {
    color: colors,
    tooltip: baseTooltip,
    legend:
      chart.series.length > 1
        ? { bottom: 0, itemWidth: 14, itemHeight: 10 }
        : undefined,
    grid: {
      top: 20,
      right: isHorizontal ? (hasHorizontalScroll ? 58 : 38) : 18,
      bottom: hasCategoryScroll
        ? chart.series.length > 1
          ? 96
          : 78
        : chart.series.length > 1
          ? 48
          : 24,
      left: 28,
      containLabel: true,
    },
    xAxis: {
      type: isHorizontal ? "value" : "category",
      data: isHorizontal ? undefined : chart.labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: appColors.axis } },
      axisLabel: {
        color: appColors.secondary,
        width: isHorizontal ? undefined : 92,
        overflow: isHorizontal ? undefined : "truncate",
      },
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
      axisLabel: {
        color: appColors.secondary,
        width: isHorizontal ? horizontalLabelWidth : undefined,
        overflow: isHorizontal ? "truncate" : undefined,
      },
      splitLine: isHorizontal
        ? undefined
        : { lineStyle: { color: appColors.grid, type: "dashed" } },
    },
    dataZoom: hasHorizontalScroll
      ? [
          {
            type: "inside",
            yAxisIndex: 0,
            start: 0,
            end: horizontalScrollEnd,
          },
          {
            type: "slider",
            yAxisIndex: 0,
            start: 0,
            end: horizontalScrollEnd,
            width: 16,
            right: 8,
          },
        ]
      : hasCategoryScroll
        ? [
            {
              type: "inside",
              xAxisIndex: 0,
              start: 0,
              end: categoryScrollEnd,
            },
            {
              type: "slider",
              xAxisIndex: 0,
              start: 0,
              end: categoryScrollEnd,
              height: 16,
              bottom: chart.series.length > 1 ? 28 : 18,
            },
          ]
      : undefined,
    series: chart.series.map((series) => ({
      name: series.name,
      type: chart.type === "line" ? "line" : "bar",
      smooth: chart.type === "line",
      data:
        chart.type === "bar" || chart.type === "horizontalBar"
          ? createColoredBarData(
              series.data.map(toChartNumber),
              isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0],
            )
          : series.data.map(toChartNumber),
      barMaxWidth: 28,
      showBackground: isHorizontal,
      backgroundStyle: isHorizontal
        ? {
            color: withAlpha(appColors.primary, 0.08),
            borderRadius: [0, 8, 8, 0],
          }
        : undefined,
      label:
        chart.type === "bar" || chart.type === "horizontalBar"
          ? {
              show: true,
              position: isHorizontal ? "right" : "top",
              color: appColors.secondary,
              fontWeight: 700,
              formatter: ({ value }: { value?: unknown }) =>
                formatChartValue(value),
            }
          : undefined,
      areaStyle: chart.type === "line" ? { opacity: 0.14 } : undefined,
    })),
  };
});

const cardTitle = computed(() => props.title || props.chart?.title || "");
const cardIcon = computed(() => props.icon || props.chart?.icon);
const cardDescription = computed(
  () => props.description || props.chart?.description,
);
const cardBadge = computed(() => props.badge || props.chart?.badge);
const chartHeight = computed(
  () => props.height || props.chart?.height || "300px",
);
const chartAriaLabel = computed(() => props.ariaLabel || cardTitle.value);
const chartMinWidth = computed(() => {
  const chart = props.chart;

  if (!chart?.showAllCategories || chart.type !== "bar") {
    return undefined;
  }

  return `${Math.max(chart.labels.length * 72, 960)}px`;
});
const chartValueTotal = computed(() => {
  const chart = props.chart;

  if (!chart) return 1;

  return chart.series.reduce(
    (total, series) =>
      total +
      series.data.reduce(
        (seriesTotal, value) => seriesTotal + toChartNumber(value),
        0,
      ),
    0,
  );
});
const hasChartData = computed(() => !props.chart || chartValueTotal.value > 0);
</script>

<template>
  <UCard
    as="article"
    class="analytics-card"
    :ui="{ body: 'analytics-card-body' }"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="section-title with-icon">
          <UIcon v-if="cardIcon" :name="cardIcon" />
          {{ translateText(cardTitle) }}
        </h2>

        <p v-if="cardDescription" class="chart-note">
          {{ translateText(cardDescription) }}
        </p>
      </div>

      <slot name="actions">
        <UBadge v-if="cardBadge" :color="badgeColor" variant="soft">
          {{ translateText(cardBadge) }}
        </UBadge>
      </slot>
    </div>

    <AppEChart
      v-if="hasChartData"
      :option="computedOption"
      :height="chartHeight"
      :min-width="chartMinWidth"
      :aria-label="chartAriaLabel"
    />

    <div v-else class="chart-empty-state" :style="{ minHeight: chartHeight }">
      <UIcon name="i-lucide-chart-no-axes-column" />
      <strong>{{ translateText("No chart data") }}</strong>
      <span>{{ translateText("There are no non-zero values for this chart yet.") }}</span>
    </div>
  </UCard>
</template>
