import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import {
  getInstituteAnalytics,
  getStudentGenderDistribution,
  getStudentsByInstitution,
  getStudentsByCity,
} from "~/services/analytics.service";
import type {
  DashboardChartFilters,
  InstituteAnalyticsResponse,
  StudentCityDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
} from "~/types/analytics-api";
import { studentInstituteAllOption } from "~/constants/studentAnalytics";
import {
  formatStudentGenderLabel,
  getStudentGenderChartColor,
} from "~/utils/studentGender";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";
import { createColoredBarData, formatChartValue } from "~/utils/chartDisplay";

const assignIfLoaded = <T>(
  result: PromiseSettledResult<T>,
  assign: (data: T) => void,
) => {
  if (result.status !== "fulfilled") {
    return false;
  }

  assign(result.value);
  return true;
};

const createDefaultColumnScroll = (
  totalItems: number,
  visibleItems = 12,
): EChartsOption["dataZoom"] => {
  if (totalItems <= visibleItems) return undefined;

  const end = Math.min(100, (visibleItems / totalItems) * 100);

  return [
    {
      type: "inside",
      xAxisIndex: 0,
      start: 0,
      end,
    },
    {
      type: "slider",
      xAxisIndex: 0,
      start: 0,
      end,
      height: 16,
    },
  ];
};

const dashboardMetricLabels = [
  "Total Students",
  "Total Courses",
  "Total Enrollments",
  "Active Students",
  "Inactive Students",
] as const;

export const useManagerDashboardPage = () => {
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const allInstitutionDistribution = ref<StudentInstitutionDistributionApi[]>([]);
  const institutionDistribution = ref<StudentInstitutionDistributionApi[]>([]);
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const cityDistribution = ref<StudentCityDistributionApi[]>([]);
  const instituteAnalytics = ref<InstituteAnalyticsResponse | null>(null);
  const instituteFilterDraft = ref(studentInstituteAllOption);
  const selectedInstituteFilter = ref(studentInstituteAllOption);
  const chartError = ref("");
  const chartsLoading = ref(true);

  const getChartFilters = (): DashboardChartFilters =>
    selectedInstituteFilter.value === studentInstituteAllOption
      ? {}
      : { institution: selectedInstituteFilter.value };

  const loadCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";
    const chartFilters = getChartFilters();

    const results = await Promise.allSettled([
      getStudentsByInstitution(),
      getStudentGenderDistribution(chartFilters),
      getStudentsByCity(chartFilters),
      getInstituteAnalytics(chartFilters),
    ]);

    const loadedCount = [
      assignIfLoaded(results[0], (data) => {
        allInstitutionDistribution.value = data;
        institutionDistribution.value =
          selectedInstituteFilter.value === studentInstituteAllOption
            ? data
            : data.filter(
                (point) => point.institution === selectedInstituteFilter.value,
              );
      }),
      assignIfLoaded(results[1], (data) => {
        genderDistribution.value = data;
      }),
      assignIfLoaded(results[2], (data) => {
        cityDistribution.value = data;
      }),
      assignIfLoaded(results[3], (data) => {
        instituteAnalytics.value = data;
      }),
    ].filter(Boolean).length;

    if (loadedCount === 0) {
      chartError.value = "Unable to load live dashboard charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadCharts);

  const instituteFilterOptions = computed(() =>
    [
      studentInstituteAllOption,
      ...allInstitutionDistribution.value.map((point) => point.institution),
    ].map((institute) => ({
      label:
        institute === studentInstituteAllOption
          ? institute
          : formatStudentInstituteLabel(institute),
      value: institute,
    })),
  );
  const hasInstituteFilter = computed(
    () => selectedInstituteFilter.value !== studentInstituteAllOption,
  );
  const instituteStudentTotal = computed(() =>
    institutionDistribution.value.reduce(
      (total, point) => total + point.totalStudents,
      0,
    ),
  );
  const instituteChartBadge = computed(
    () => `${instituteStudentTotal.value.toLocaleString()} students`,
  );
  const applyInstituteFilter = async () => {
    selectedInstituteFilter.value = instituteFilterDraft.value;
    await loadCharts();
  };
  const clearInstituteFilter = async () => {
    instituteFilterDraft.value = studentInstituteAllOption;
    selectedInstituteFilter.value = studentInstituteAllOption;
    await loadCharts();
  };

  const metrics = computed(() =>
    (moodleDashboard.value?.metrics ?? [])
      .filter((metric) =>
        dashboardMetricLabels.includes(
          metric.label as (typeof dashboardMetricLabels)[number],
        ),
      )
      .map(({ sparkline, ...metric }) => metric),
  );

  const genderChartData = computed(() =>
    genderDistribution.value.map((point) => ({
      name: formatStudentGenderLabel(point.gender),
      value: point.totalStudents,
      itemStyle: { color: getStudentGenderChartColor(point.gender) },
    })),
  );
  const genderChartBadge = computed(
    () =>
      `${genderChartData.value
        .reduce((total, point) => total + point.value, 0)
        .toLocaleString()} students`,
  );

  const institutionPoints = computed(() => institutionDistribution.value);
  const institutionDistributionHeight = computed(() => "360px");
  const topCityPoints = computed(() => cityDistribution.value.slice(0, 12));
  const displayedCityTotal = computed(() =>
    topCityPoints.value.reduce(
      (total, point) => total + point.totalStudents,
      0,
    ),
  );
  const cityTotal = computed(
    () =>
      cityDistribution.value[0]?.overallTotalStudents ??
      cityDistribution.value.reduce(
        (total, point) => total + point.totalStudents,
        0,
      ),
  );

  const institutionDistributionOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const index =
          item && typeof item.dataIndex === "number" ? item.dataIndex : 0;
        const point = institutionPoints.value[index];

        if (!point) return "";

        return [
          `<strong>${formatStudentInstituteLabel(point.institution)}</strong>`,
          `Students: ${point.totalStudents.toLocaleString()}`,
        ].join("<br />");
      },
    },
    dataZoom: createDefaultColumnScroll(institutionPoints.value.length),
    grid: { top: 28, right: 18, bottom: 104, left: 42, containLabel: true },
    xAxis: {
      type: "category",
      data: institutionPoints.value.map((point) =>
        formatStudentInstituteLabel(point.institution),
      ),
      axisTick: { show: false },
      axisLabel: {
        color: appColors.secondary,
        interval: 0,
        width: 104,
        overflow: "break",
        rotate: 0,
      },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
      axisLabel: { color: appColors.secondary },
    },
    series: [
      {
        name: "Students",
        type: "bar",
        barMaxWidth: 24,
        data: createColoredBarData(
          institutionPoints.value.map((point) => point.totalStudents),
          [6, 6, 0, 0],
        ),
        label: {
          show: true,
          position: "top",
          color: appColors.secondary,
          fontWeight: 700,
          formatter: ({ value }: { value?: unknown }) =>
            formatChartValue(value),
        },
      },
    ],
  }));

  const cityDistributionTable = computed<AnalyticsTable>(() => ({
    title: "Students by City",
    icon: "i-lucide-map-pin",
    description: "Top student locations by Moodle profile city.",
    rowKey: "city",
    columns: [
      { key: "rank", label: "#", width: "52px", tone: "muted" },
      { key: "city", label: "City", rowHeader: true },
      { key: "students", label: "Students", width: "130px", tone: "strong" },
      { key: "share", label: "Share", width: "100px", tone: "muted" },
    ],
    rows: [
      ...topCityPoints.value.map((point, index) => ({
        rank: index + 1,
        city: point.city,
        students: point.totalStudents.toLocaleString(),
        share:
          cityTotal.value > 0
            ? `${((point.totalStudents * 100) / cityTotal.value).toFixed(1)}%`
            : "0.0%",
      })),
      ...(cityTotal.value > displayedCityTotal.value
        ? [
            {
              rank: "",
              city: "Other / no city",
              students: (
                cityTotal.value - displayedCityTotal.value
              ).toLocaleString(),
              share:
                cityTotal.value > 0
                  ? `${(((cityTotal.value - displayedCityTotal.value) * 100) / cityTotal.value).toFixed(1)}%`
                  : "0.0%",
            },
          ]
        : []),
      {
        rank: "",
        city: "Total",
        students: cityTotal.value.toLocaleString(),
        share: cityTotal.value > 0 ? "100.0%" : "0.0%",
      },
    ],
  }));

  const enrollmentTrendChart = computed<AnalyticsChart>(() => ({
    title: "Enrollment Trend",
    description: "Monthly enrollment records across the selected scope.",
    icon: "i-lucide-trending-up",
    type: "line",
    wide: true,
    height: "380px",
    labels: (instituteAnalytics.value?.enrollmentTrend ?? []).map(
      (point) => point.period,
    ),
    series: [
      {
        name: "Enrollment records",
        data: (instituteAnalytics.value?.enrollmentTrend ?? []).map(
          (point) => point.enrollments,
        ),
      },
    ],
  }));

  const genderDistributionOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      top: 0,
      left: "center",
      data: genderChartData.value.map((point) => point.name),
    },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "55%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          color: appColors.ink,
          formatter: "{b}: {c} ({d}%)",
        },
        emphasis: {
          scale: false,
          label: { show: true },
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8,
        },
        data: genderChartData.value,
      },
    ],
  }));

  return {
    chartError,
    chartsLoading,
    applyInstituteFilter,
    clearInstituteFilter,
    genderChartBadge,
    instituteChartBadge,
    instituteFilterDraft,
    instituteFilterOptions,
    hasInstituteFilter,
    institutionDistributionOption,
    institutionDistributionHeight,
    enrollmentTrendChart,
    cityDistributionTable,
    genderDistributionOption,
    metrics,
    moodleDashboard,
    moodleDashboardError,
    moodleDashboardLoading,
  };
};
