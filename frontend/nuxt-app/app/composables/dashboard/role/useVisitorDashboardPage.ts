import type { EChartsOption } from "echarts";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";
import { appColors } from "~/constants/colors";
import { visitorPublicDashboardCopy } from "~/constants/roleDashboards";

export const useVisitorDashboardPage = () => {
  const { metrics, reports, weeklyTraffic } = useDashboardData();
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const publicMoodleDashboard = computed(() =>
    moodleDashboard.value
      ? {
          ...moodleDashboard.value,
          title: "Public Moodle Analytics",
          copy: visitorPublicDashboardCopy,
          metrics: moodleDashboard.value.metrics.slice(0, 4),
          charts: moodleDashboard.value.charts.slice(0, 2),
        }
      : null,
  );

  const availableReports = computed(() =>
    reports.filter((report) => report.status === "Ready"),
  );

  const reportStatus = computed(() => {
    const ready = availableReports.value.length;
    const draft = reports.filter((report) => report.status === "Draft").length;

    return { ready, draft, total: reports.length };
  });

  const visitorTrafficOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover, appColors.success],
    tooltip: { trigger: "axis" },
    legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
    grid: { top: 16, right: 18, bottom: 48, left: 44, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
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
        name: "Activity",
        type: "line",
        smooth: true,
        symbolSize: 7,
        areaStyle: { opacity: 0.14 },
        data: weeklyTraffic.map((point) => point.value),
      },
      {
        name: "Baseline",
        type: "line",
        smooth: true,
        symbolSize: 7,
        areaStyle: { opacity: 0.08 },
        data: weeklyTraffic.map((point) => Math.max(point.value - 14, 8)),
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
          { name: "Available", value: reportStatus.value.ready },
          { name: "Draft", value: reportStatus.value.draft },
        ],
      },
    ],
  }));

  return {
    availableReports,
    metrics,
    moodleDashboardError,
    moodleDashboardLoading,
    publicMoodleDashboard,
    reportStatus,
    reportStatusOption,
    visitorTrafficOption,
  };
};
