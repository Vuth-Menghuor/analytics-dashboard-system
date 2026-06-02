import type { ECharts, EChartsOption } from "echarts";
import type { Ref } from "vue";

export const useEChart = (option: Ref<EChartsOption>) => {
  const chartEl = ref<HTMLElement | null>(null);
  const themeStore = useThemeStore();
  let chart: ECharts | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const chartTheme = computed(() =>
    themeStore.isDark
      ? {
          surface: "#0f172a",
          border: "#24324a",
          text: "#e5e7eb",
          heading: "#f8fafc",
          muted: "#94a3b8",
          grid: "#24324a",
        }
      : {
          surface: "#ffffff",
          border: "#d9e1ec",
          text: "#0f172a",
          heading: "#020617",
          muted: "#64748b",
          grid: "#edf1f6",
        },
  );

  const asArray = <T>(value: T | T[] | undefined): T[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const themeAxis = (axis: unknown) => {
    if (!axis || typeof axis !== "object") return axis;

    const axisRecord = axis as Record<string, any>;

    return {
      ...axisRecord,
      axisLine: {
        ...axisRecord.axisLine,
        lineStyle: {
          ...axisRecord.axisLine?.lineStyle,
          color: chartTheme.value.border,
        },
      },
      axisLabel: {
        ...axisRecord.axisLabel,
        color: chartTheme.value.muted,
      },
      splitLine: axisRecord.splitLine
        ? {
            ...axisRecord.splitLine,
            lineStyle: {
              ...axisRecord.splitLine.lineStyle,
              color: chartTheme.value.grid,
            },
          }
        : axisRecord.splitLine,
    };
  };

  const themeSeries = (series: unknown) => {
    if (!series || typeof series !== "object") return series;

    const seriesRecord = series as Record<string, any>;

    return {
      ...seriesRecord,
      label: seriesRecord.label
        ? {
            ...seriesRecord.label,
            color: chartTheme.value.heading,
          }
        : seriesRecord.label,
      endLabel: seriesRecord.endLabel
        ? {
            ...seriesRecord.endLabel,
            color: chartTheme.value.heading,
          }
        : seriesRecord.endLabel,
      labelLine: seriesRecord.labelLine
        ? {
            ...seriesRecord.labelLine,
            lineStyle: {
              ...seriesRecord.labelLine.lineStyle,
              color: chartTheme.value.muted,
            },
          }
        : seriesRecord.labelLine,
    };
  };

  function themedOption(source: EChartsOption): EChartsOption {
    const optionRecord = source as Record<string, any>;
    const legend = optionRecord.legend;

    return {
      ...source,
      backgroundColor: "transparent",
      textStyle: {
        ...optionRecord.textStyle,
        color: chartTheme.value.text,
      },
      tooltip: optionRecord.tooltip
        ? {
            ...optionRecord.tooltip,
            backgroundColor: chartTheme.value.surface,
            borderColor: chartTheme.value.border,
            textStyle: {
              ...optionRecord.tooltip.textStyle,
              color: chartTheme.value.text,
            },
          }
        : optionRecord.tooltip,
      legend: Array.isArray(legend)
        ? legend.map((item) => ({
            ...item,
            textStyle: {
              ...item.textStyle,
              color: chartTheme.value.muted,
            },
          }))
        : legend
          ? {
              ...legend,
              textStyle: {
                ...legend.textStyle,
                color: chartTheme.value.muted,
              },
            }
          : legend,
      xAxis: Array.isArray(optionRecord.xAxis)
        ? optionRecord.xAxis.map(themeAxis)
        : themeAxis(optionRecord.xAxis),
      yAxis: Array.isArray(optionRecord.yAxis)
        ? optionRecord.yAxis.map(themeAxis)
        : themeAxis(optionRecord.yAxis),
      series: asArray(optionRecord.series).map(themeSeries),
    } as EChartsOption;
  }

  function renderChart() {
    chart?.setOption(themedOption(option.value), true);
  }

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

  watch(option, renderChart, { deep: true });
  watch(chartTheme, renderChart, { deep: true });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    chart?.dispose();
    chart = null;
  });

  return { chartEl };
};
