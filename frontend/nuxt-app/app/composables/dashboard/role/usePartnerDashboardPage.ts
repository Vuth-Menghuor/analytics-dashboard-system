import type { EChartsOption } from "echarts";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";
import { appColors } from "~/constants/colors";

export const usePartnerDashboardPage = () => {
  const { metrics, reports, weeklyTraffic } = useDashboardData();
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const reportStatus = computed(() => {
    const ready = reports.filter((report) => report.status === "Ready").length;
    const draft = reports.filter((report) => report.status === "Draft").length;

    return { ready, draft, total: reports.length };
  });

  const trafficOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { top: 16, right: 12, bottom: 28, left: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: weeklyTraffic.map((point) => point.label),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%" },
      splitLine: { lineStyle: { color: appColors.grid } },
    },
    series: [
      {
        name: "Traffic",
        type: "bar",
        data: weeklyTraffic.map((point) => point.value),
        barMaxWidth: 34,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
      },
    ],
  }));

  const reportStatusOption = computed<EChartsOption>(() => ({
    color: [appColors.success, appColors.warning],
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
    series: [
      {
        name: "Reports",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}\n{d}%",
          color: appColors.ink,
          fontWeight: 700,
        },
        data: [
          { name: "Ready", value: reportStatus.value.ready },
          { name: "Draft", value: reportStatus.value.draft },
        ],
      },
    ],
  }));

  return {
    metrics,
    moodleDashboard,
    moodleDashboardError,
    moodleDashboardLoading,
    reports,
    reportStatus,
    reportStatusOption,
    trafficOption,
  };
};
