import type { EChartsOption } from "echarts";
import type { Metric } from "~/types/dashboard";
import type { Ref } from "vue";

const DEFAULT_SPARKLINE = [42, 46, 44, 49, 52, 50, 56, 60];
const DEFAULT_ACCENT_COLOR = "#075a9b";

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

export const useMetricCard = (metric: Ref<Metric>) => {
  const trendParts = computed(() => metric.value.trend.split(" "));
  const trendValue = computed(() => trendParts.value[0] ?? "");
  const trendDescription = computed(() => trendParts.value.slice(1).join(" "));
  const trendTone = computed(() =>
    metric.value.trend.trim().startsWith("-") ? "negative" : "positive",
  );
  const sparklineData = computed(() =>
    metric.value.sparkline?.length ? metric.value.sparkline : DEFAULT_SPARKLINE,
  );
  const accentColor = computed(() => metric.value.color ?? DEFAULT_ACCENT_COLOR);
  const accentRgb = computed(() => hexToRgb(accentColor.value));
  const accentSoftColor = computed(() => {
    const { r, g, b } = accentRgb.value;

    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  });
  const sparklineFill = computed(() => {
    const { r, g, b } = accentRgb.value;

    return `rgba(${r}, ${g}, ${b}, 0.14)`;
  });
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

  return {
    accentColor,
    accentSoftColor,
    sparklineOption,
    trendDescription,
    trendTone,
    trendValue,
  };
};
