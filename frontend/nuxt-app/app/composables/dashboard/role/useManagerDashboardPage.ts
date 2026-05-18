import type { EChartsOption } from "echarts";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";
import { appColors, chartColors } from "~/constants/colors";
import {
  managerDepartments,
  managerEnrollmentTrends,
  managerGenderDistribution,
  managerGenderRatio,
} from "~/constants/roleDashboards";

export const useManagerDashboardPage = () => {
  const { metrics } = useDashboardData();
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const genderDistributionOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover, appColors.purple],
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        label: {
          formatter: "{b}\n{d}%",
          color: appColors.ink,
          fontWeight: 700,
        },
        data: managerGenderDistribution,
      },
    ],
  }));

  const genderRatioOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover, appColors.purple],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
    grid: { top: 18, right: 12, bottom: 48, left: 36, containLabel: true },
    xAxis: {
      type: "category",
      data: managerGenderRatio.map((point) => point.year),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      max: 80,
      axisLabel: { formatter: "{value}%" },
      splitLine: { lineStyle: { color: appColors.grid } },
    },
    series: [
      {
        name: "Male",
        type: "bar",
        data: managerGenderRatio.map((point) => point.male),
        barMaxWidth: 28,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
      },
      {
        name: "Female",
        type: "bar",
        data: managerGenderRatio.map((point) => point.female),
        barMaxWidth: 28,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
      },
    ],
  }));

  const enrollmentTrendOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover, appColors.success],
    tooltip: { trigger: "axis" },
    legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
    grid: { top: 16, right: 18, bottom: 48, left: 44, containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: managerEnrollmentTrends.map((point) => point.month),
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: appColors.grid } },
    },
    series: [
      {
        name: "Enrollments",
        type: "line",
        smooth: true,
        symbolSize: 7,
        areaStyle: { opacity: 0.16 },
        data: managerEnrollmentTrends.map((point) => point.enrollments),
      },
      {
        name: "Graduations",
        type: "line",
        smooth: true,
        symbolSize: 7,
        areaStyle: { opacity: 0.12 },
        data: managerEnrollmentTrends.map((point) => point.graduations),
      },
    ],
  }));

  const departmentOption = computed<EChartsOption>(() => ({
    color: [...chartColors],
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: { bottom: 0, itemWidth: 14, itemHeight: 10 },
    series: [
      {
        name: "Department",
        type: "pie",
        radius: ["44%", "70%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        label: { formatter: "{b}", color: appColors.ink },
        data: managerDepartments,
      },
    ],
  }));

  return {
    departmentOption,
    enrollmentTrendOption,
    genderDistributionOption,
    genderRatioOption,
    metrics,
    moodleDashboard,
    moodleDashboardError,
    moodleDashboardLoading,
  };
};
