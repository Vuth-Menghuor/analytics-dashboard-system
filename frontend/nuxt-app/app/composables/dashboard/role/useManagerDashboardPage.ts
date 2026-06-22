import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import type { AnalyticsTable } from "~/types/analytics";
import {
  getPopularCourses,
  getStudentActivityTrend,
  getStudentGenderDistribution,
  getStudentsByInstitution,
  getStudentsByDepartment,
  getStudentsByCity,
} from "~/services/analytics.service";
import type {
  DashboardChartFilters,
  PopularCourseApi,
  StudentActivityTrendApi,
  StudentActivityTrendPeriod,
  StudentCityDistributionApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
} from "~/types/analytics-api";
import { studentInstituteAllOption } from "~/constants/studentAnalytics";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import {
  formatStudentGenderLabel,
  getStudentGenderChartColor,
} from "~/utils/studentGender";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

const getCourseDisplayName = (courseName: string): string => {
  const parts = courseName.trim().split(" ");

  if (parts.length <= 1) {
    return courseName;
  }

  return parts.slice(1).join(" ");
};

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
  "Course Completions",
  "Quiz Attempts",
] as const;

const activityPeriodOptions: Array<{
  label: string;
  value: StudentActivityTrendPeriod;
}> = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export const useManagerDashboardPage = () => {
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();

  const allInstitutionDistribution = ref<StudentInstitutionDistributionApi[]>([]);
  const institutionDistribution = ref<StudentInstitutionDistributionApi[]>([]);
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const departmentDistribution = ref<StudentDepartmentDistributionApi[]>([]);
  const cityDistribution = ref<StudentCityDistributionApi[]>([]);
  const popularCourses = ref<PopularCourseApi[]>([]);
  const studentActivityTrend = ref<StudentActivityTrendApi[]>([]);
  const selectedActivityPeriod = ref<StudentActivityTrendPeriod>("year");
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
      getStudentsByDepartment(chartFilters),
      getStudentsByCity(chartFilters),
      getPopularCourses(chartFilters),
      getStudentActivityTrend({
        ...chartFilters,
        period: selectedActivityPeriod.value,
      }),
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
        departmentDistribution.value = data;
      }),
      assignIfLoaded(results[3], (data) => {
        cityDistribution.value = data;
      }),
      assignIfLoaded(results[4], (data) => {
        popularCourses.value = data;
      }),
      assignIfLoaded(results[5], (data) => {
        studentActivityTrend.value = data;
      }),
    ].filter(Boolean).length;

    if (loadedCount === 0) {
      chartError.value = "Unable to load live dashboard charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadCharts);
  watch(selectedActivityPeriod, loadCharts);

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
  const departmentChartBadge = computed(() =>
    `${departmentPoints.value
      .reduce((total, point) => total + point.value, 0)
      .toLocaleString()} students`,
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

  const departmentChartData = computed(() =>
    departmentDistribution.value
      .map((point) => ({
        name: `${point.institution} / ${formatStudentDepartmentLabel(point.department)}`,
        institution: point.institution,
        department: formatStudentDepartmentLabel(point.department),
        value: point.totalStudents,
        percentage: point.percentage,
      }))
      .sort((current, next) => next.value - current.value),
  );

  const departmentPoints = computed(() => departmentChartData.value);
  const departmentDistributionHeight = computed(() => "360px");

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
    color: [appColors.blue],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
        const point = institutionPoints.value[index];

        if (!point) return "";

        return [
          `<strong>${formatStudentInstituteLabel(point.institution)}</strong>`,
          `Students: ${point.totalStudents.toLocaleString()}`,
        ].join("<br />");
      },
    },
    dataZoom: createDefaultColumnScroll(institutionPoints.value.length),
    grid: { top: 16, right: 18, bottom: 104, left: 42, containLabel: true },
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
        data: institutionPoints.value.map((point) => point.totalStudents),
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  }));

  const topDepartmentsOption = computed<EChartsOption>(() => ({
    color: [appColors.blue],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
        const point = departmentPoints.value[index];

        if (!point) return "";

        return [
          `<strong>${point.department}</strong>`,
          `Institute: ${point.institution}`,
          `Students: ${point.value.toLocaleString()}`,
          `Share: ${point.percentage}%`,
        ].join("<br />");
      },
    },
    dataZoom: createDefaultColumnScroll(departmentPoints.value.length),
    grid: { top: 16, right: 18, bottom: 104, left: 42, containLabel: true },
    xAxis: {
      type: "category",
      data: departmentPoints.value.map((point) => point.department),
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
        data: departmentPoints.value.map((point) => point.value),
        itemStyle: { borderRadius: [6, 6, 0, 0] },
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

  const popularCoursesOption = computed<EChartsOption>(() => ({
    color: [appColors.warning],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
        const course = popularCourses.value[index];

        if (!course) return "";

        return [
          `<strong>${getCourseDisplayName(course.courseName)}</strong>`,
          `Enrollments: ${course.totalEnrollments.toLocaleString()}`,
        ].join("<br />");
      },
    },
    grid: {
      top: 16,
      right: 18,
      bottom: 24,
      left: 12,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      axisLabel: { color: appColors.secondary },
      splitLine: {
        lineStyle: { color: appColors.grid, type: "dashed" },
      },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: popularCourses.value.map((course) =>
        getCourseDisplayName(course.courseName),
      ),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: appColors.secondary,
        width: 240,
        overflow: "break",
      },
    },
    series: [
      {
        name: "Enrollments",
        type: "bar",
        barMaxWidth: 24,
        data: popularCourses.value.map((course) => course.totalEnrollments),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  }));
  const popularCoursesHeight = computed(() =>
    `${Math.max(292, popularCourses.value.length * 36 + 64)}px`,
  );

  const studentActivityLabels = computed(() =>
    studentActivityTrend.value.map((point) => point.period),
  );

  const studentActivityCounts = computed(() =>
    studentActivityTrend.value.map((point) => point.totalStudents),
  );

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

  const studentActivityOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const value =
          typeof item.value === "number" ? item.value.toLocaleString() : item.value;

        return `${item.name}<br />Students: <strong>${value}</strong>`;
      },
    },
    grid: { top: 24, right: 20, bottom: 32, left: 12, containLabel: true },
    xAxis: {
      type: "category",
      data: studentActivityLabels.value,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: appColors.axis } },
      axisLabel: {
        color: appColors.secondary,
        width: 92,
        overflow: "truncate",
      },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: appColors.secondary },
      splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
    },
    series: [
      {
        name: "Students",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: studentActivityCounts.value,
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          opacity: 0.14,
        },
      },
    ],
  }));

  return {
    activityPeriodOptions,
    chartError,
    chartsLoading,
    applyInstituteFilter,
    clearInstituteFilter,
    departmentChartBadge,
    genderChartBadge,
    instituteChartBadge,
    instituteFilterDraft,
    instituteFilterOptions,
    hasInstituteFilter,
    institutionDistributionOption,
    institutionDistributionHeight,
    departmentDistributionHeight,
    topDepartmentsOption,
    cityDistributionTable,
    popularCoursesOption,
    popularCoursesHeight,
    genderDistributionOption,
    studentActivityOption,
    metrics,
    moodleDashboard,
    moodleDashboardError,
    moodleDashboardLoading,
    selectedActivityPeriod,
  };
};
