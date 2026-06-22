import {
  studentCityAllOption,
  studentDepartmentAllOption,
  studentGenderOptions,
  studentInstituteAllOption,
  studentStatusOptions,
  studentTableColumns,
} from "~/constants/studentAnalytics";
import { appColors, withAlpha } from "~/constants/colors";
import type { EChartsOption } from "echarts";
import type {
  AnalyticsChart,
  AnalyticsTable,
  Student,
} from "~/types/analytics";
import {
  getStudent,
  getStudentActivity,
  getStudentActivityTrend,
  getStudentGenderDistribution,
  getStudents,
  getStudentsByCity,
  getStudentsByDepartment,
  getStudentsByInstitution,
} from "~/services/analytics.service";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import {
  formatStudentGenderLabel,
  getStudentGenderChartColor,
} from "~/utils/studentGender";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";
import { useCsvExport } from "~/composables/common/useCsvExport";
import type {
  StudentCityDistributionApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
  StudentActivityTrendApi,
  StudentActivityTrendPeriod,
  DashboardChartFilters,
  StudentsQuery,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";

const activityPeriodOptions: Array<{
  label: string;
  value: StudentActivityTrendPeriod;
}> = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

type StudentFilterKey =
  | "query"
  | "institute"
  | "department"
  | "city"
  | "gender"
  | "status";
type StudentAnalyticsTab = "overview" | "demographics" | "activity";

export const useStudentAnalyticsView = () => {
  const { exportWithToast } = useCsvExport();
  const auth = useAuthStore();
  const {
    applySearch,
    error,
    filters,
    isLoading,
    pagination,
    refresh: refreshStudents,
    setPage,
    setPerPage,
    students,
  } = useStudents();
  const selectedStudent = ref<Student | null>(null);
  const selectedStudentIsLoading = ref(false);
  const profileOpen = ref(false);
  const searchQuery = ref(filters.query);
  const liveError = ref("");
  const liveIsLoading = ref(true);
  const studentMetricsLoaded = ref(false);
  const studentMetricsLoading = ref(true);
  const totalStudentMetricTotal = ref(0);
  const activeStudentTotal = ref(0);
  const inactiveStudentTotal = ref(0);
  const neverLoggedInStudentTotal = ref(0);
  const totalStudentGenderDistribution = ref<StudentGenderDistributionApi[]>(
    [],
  );
  const activeStudentGenderDistribution = ref<StudentGenderDistributionApi[]>(
    [],
  );
  const studentsByInstitution = ref<StudentInstitutionDistributionApi[]>([]);
  const studentsByDepartment = ref<StudentDepartmentDistributionApi[]>([]);
  const studentsByCity = ref<StudentCityDistributionApi[]>([]);
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const studentActivityTrend = ref<StudentActivityTrendApi[]>([]);
  const selectedActivityPeriod = ref<StudentActivityTrendPeriod>("year");
  const activeTab = ref<StudentAnalyticsTab>("overview");
  const tabs: Array<{ label: string; value: StudentAnalyticsTab }> = [
    { label: "Overview", value: "overview" },
    { label: "Demographics", value: "demographics" },
    { label: "Activity", value: "activity" },
  ];
  const dependentFiltersLoading = ref(false);
  let latestChartRequestId = 0;
  let latestMetricRequestId = 0;
  const partnerInstitute = computed(() =>
    auth.user?.role === "partner" ? auth.user.institution_name || "" : "",
  );
  const isPartnerScoped = computed(() => Boolean(partnerInstitute.value));
  const partnerInstituteLabel = computed(() =>
    isPartnerScoped.value ? `Institute: ${partnerInstitute.value}` : "",
  );

  if (isPartnerScoped.value) {
    filters.institute = partnerInstitute.value;
  }

  const getCurrentFilters = (): DashboardChartFilters => ({
    search: filters.query.trim() || undefined,
    institution:
      filters.institute === studentInstituteAllOption
        ? undefined
        : filters.institute,
    department:
      filters.department === studentDepartmentAllOption
        ? undefined
        : filters.department,
    city: filters.city === studentCityAllOption ? undefined : filters.city,
    gender: filters.gender === "All genders" ? undefined : filters.gender,
    status: filters.status === "All statuses" ? undefined : filters.status,
  });

  const getStudentsQuery = (
    overrides: Partial<StudentsQuery> = {},
  ): StudentsQuery => ({
    ...getCurrentFilters(),
    ...overrides,
  });

  const getStudentMetricFilters = (
    overrides: Partial<DashboardChartFilters> = {},
  ): DashboardChartFilters => {
    const { status: _status, ...filtersWithoutStatus } = getCurrentFilters();

    return {
      ...filtersWithoutStatus,
      ...overrides,
    };
  };

  const getStudentMetricQuery = (
    overrides: Partial<StudentsQuery> = {},
  ): StudentsQuery => {
    return {
      ...getStudentMetricFilters(overrides),
      page: 1,
      perPage: 1,
    };
  };

  const loadStudentMetricCounts = async () => {
    const requestId = ++latestMetricRequestId;
    studentMetricsLoading.value = true;
    const [
      totalResult,
      activeResult,
      inactiveResult,
      totalGenderResult,
      activeGenderResult,
      activityResult,
    ] = await Promise.allSettled([
      getStudents(getStudentMetricQuery()),
      getStudents(getStudentMetricQuery({ status: "Active" })),
      getStudents(getStudentMetricQuery({ status: "Inactive" })),
      getStudentGenderDistribution(getStudentMetricFilters()),
      getStudentGenderDistribution(
        getStudentMetricFilters({ status: "Active" }),
      ),
      getStudentActivity(getStudentMetricFilters()),
    ]);

    if (requestId !== latestMetricRequestId) {
      return;
    }

    if (totalResult.status === "fulfilled") {
      totalStudentMetricTotal.value = totalResult.value.meta.total;
    }

    if (activeResult.status === "fulfilled") {
      activeStudentTotal.value = activeResult.value.meta.total;
    }

    if (inactiveResult.status === "fulfilled") {
      inactiveStudentTotal.value = inactiveResult.value.meta.total;
    }

    if (totalGenderResult.status === "fulfilled") {
      totalStudentGenderDistribution.value = totalGenderResult.value;
    }

    if (activeGenderResult.status === "fulfilled") {
      activeStudentGenderDistribution.value = activeGenderResult.value;
    }

    if (activityResult.status === "fulfilled") {
      neverLoggedInStudentTotal.value =
        activityResult.value.find(
          (point) => point.loginStatus === "Never logged in",
        )?.totalStudents ?? 0;
    }

    studentMetricsLoaded.value = [
      totalResult,
      activeResult,
      inactiveResult,
    ].some((result) => result.status === "fulfilled");
    studentMetricsLoading.value = false;
  };

  const loadLiveStudentCharts = async () => {
    const requestId = ++latestChartRequestId;

    liveIsLoading.value = true;
    liveError.value = "";
    const chartFilters = getCurrentFilters();

    const [
      institutions,
      departmentsData,
      citiesData,
      genderData,
      activityData,
      metricCounts,
    ] = await Promise.allSettled([
      getStudentsByInstitution(chartFilters),
      getStudentsByDepartment(chartFilters),
      getStudentsByCity(chartFilters),
      getStudentGenderDistribution(chartFilters),
      getStudentActivityTrend({
        ...chartFilters,
        period: selectedActivityPeriod.value,
      }),
      loadStudentMetricCounts(),
    ]);

    if (requestId !== latestChartRequestId) {
      return;
    }

    if (institutions.status === "fulfilled") {
      studentsByInstitution.value = institutions.value;
    }

    if (departmentsData.status === "fulfilled") {
      studentsByDepartment.value = departmentsData.value;
    }

    if (citiesData.status === "fulfilled") {
      studentsByCity.value = citiesData.value;
    }

    if (genderData.status === "fulfilled") {
      genderDistribution.value = genderData.value;
    }

    if (activityData.status === "fulfilled") {
      studentActivityTrend.value = activityData.value;
    }

    const loadedCount = [
      institutions,
      departmentsData,
      citiesData,
      genderData,
      activityData,
      metricCounts,
    ].filter((result) => result.status === "fulfilled").length;

    if (loadedCount === 0) {
      liveError.value = "Unable to load live student analytics.";
    }

    liveIsLoading.value = false;
    dependentFiltersLoading.value = false;
  };

  onMounted(loadLiveStudentCharts);

  const refresh = async () => {
    await Promise.allSettled([refreshStudents(), loadLiveStudentCharts()]);
  };

  const changeInstitute = (institute: unknown) => {
    if (typeof institute === "string") {
      filters.institute = institute;
    }

    filters.department = studentDepartmentAllOption;
    filters.city = studentCityAllOption;
    dependentFiltersLoading.value = true;
  };

  const institutes = computed(() =>
    isPartnerScoped.value
      ? [partnerInstitute.value]
      : [
          studentInstituteAllOption,
          ...studentsByInstitution.value.map((point) => point.institution),
        ],
  );
  const departments = computed(() => [
    studentDepartmentAllOption,
    ...new Set(
      studentsByDepartment.value.length > 0
        ? studentsByDepartment.value.map((point) => point.department)
        : students.value.map((student) => student.department),
    ),
  ]);
  const instituteFilterItems = computed(() =>
    institutes.value.map((institute) => ({
      label:
        institute === studentInstituteAllOption
          ? institute
          : formatStudentInstituteLabel(institute),
      value: institute,
    })),
  );
  const departmentFilterItems = computed(() =>
    departments.value.map((department) => ({
      label:
        department === studentDepartmentAllOption
          ? department
          : formatStudentDepartmentLabel(department),
      value: department,
    })),
  );
  const cities = computed(() => [
    studentCityAllOption,
    "Not filled",
    ...new Set(studentsByCity.value.map((point) => point.city)),
  ]);
  const cityFilterItems = computed(() =>
    cities.value.map((city) => ({
      label: city,
      value: city,
    })),
  );
  const genderFilterItems = studentGenderOptions.map((gender) => ({
    label: gender,
    value: gender,
  }));
  const statusFilterItems = studentStatusOptions.map((status) => ({
    label: status,
    value: status,
  }));
  const totalStudentCount = computed(() => totalStudentMetricTotal.value);
  const activeStudentCount = computed(() => activeStudentTotal.value);
  const inactiveStudentCount = computed(() => inactiveStudentTotal.value);
  const activeStudentRate = computed(() =>
    totalStudentCount.value > 0
      ? (activeStudentCount.value * 100) / totalStudentCount.value
      : 0,
  );
  const inactiveStudentRate = computed(() =>
    totalStudentCount.value > 0
      ? (inactiveStudentCount.value * 100) / totalStudentCount.value
      : 0,
  );
  const neverLoggedInTotal = computed(() => neverLoggedInStudentTotal.value);
  const createGenderBreakdown = (
    distribution: StudentGenderDistributionApi[],
  ) => {
    if (distribution.length === 0) {
      return [];
    }

    const getGenderCount = (genderName: "Female" | "Male") =>
      distribution.find((point) => point.gender === genderName)
        ?.totalStudents ?? 0;

    return [
      { label: "Female", value: getGenderCount("Female").toLocaleString() },
      { label: "Male", value: getGenderCount("Male").toLocaleString() },
    ];
  };
  const metrics = computed<Metric[]>(() => [
    {
      label: "Active Students",
      value: activeStudentCount.value.toLocaleString(),
      trend: `${activeStudentRate.value.toFixed(1)}% of students are active`,
      icon: "UserRoundCheck",
      color: appColors.success,
      change: `${activeStudentRate.value.toFixed(1)}%`,
      changeDirection: "neutral",
      changePeriod: "active student share",
      breakdown: createGenderBreakdown(activeStudentGenderDistribution.value),
    },
    {
      label: "Total Students",
      value: totalStudentCount.value.toLocaleString(),
      trend: "Matching current filters",
      icon: "Users",
      color: appColors.blue,
      breakdown: createGenderBreakdown(totalStudentGenderDistribution.value),
    },
    {
      label: "Inactive Students",
      value: inactiveStudentCount.value.toLocaleString(),
      trend: `${inactiveStudentRate.value.toFixed(1)}% may need follow-up`,
      icon: "UserCircle",
      color: appColors.warning,
    },
    {
      label: "Never Logged In",
      value: neverLoggedInTotal.value.toLocaleString(),
      trend: "No login activity recorded",
      icon: "UserRoundX",
      color: appColors.slate,
    },
  ]);

  const countBy = (key: keyof Student) => {
    const totals = new Map<string, number>();
    students.value.forEach((student) => {
      const value = student[key];
      if (value === undefined || value === null) {
        return;
      }

      totals.set(String(value), (totals.get(String(value)) ?? 0) + 1);
    });

    return totals;
  };

  const byInstitute = computed(() => countBy("institute"));
  const byDepartment = computed(() => countBy("department"));
  const byGender = computed(() => countBy("gender"));

  const genderChartData = computed(() =>
    genderDistribution.value.length > 0
      ? genderDistribution.value.map((point) => ({
          name: formatStudentGenderLabel(point.gender),
          value: point.totalStudents,
          itemStyle: { color: getStudentGenderChartColor(point.gender) },
        }))
      : [...byGender.value.entries()].map(([gender, totalStudents]) => ({
          name: formatStudentGenderLabel(gender),
          value: totalStudents,
          itemStyle: { color: getStudentGenderChartColor(gender) },
        })),
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

  const instituteChartPoints = computed(() =>
    studentsByInstitution.value.length > 0
      ? studentsByInstitution.value.map((point) => ({
          label: formatStudentInstituteLabel(point.institution),
          value: point.totalStudents,
        }))
      : [...byInstitute.value.entries()].map(([label, value]) => ({
          label,
          value,
        })),
  );
  const departmentChartPoints = computed(() =>
    studentsByDepartment.value.length > 0
      ? studentsByDepartment.value
          .map((point) => ({
            label: formatStudentDepartmentLabel(point.department),
            institution: point.institution,
            value: point.totalStudents,
            percentage: point.percentage,
          }))
          .sort((current, next) => next.value - current.value)
      : [...byDepartment.value.entries()].map(([label, value]) => ({
          label: formatStudentDepartmentLabel(label),
          institution: "",
          value,
          percentage: 0,
        })),
  );
  const cityChartPoints = computed(() =>
    studentsByCity.value.map((point) => ({
      label: point.city,
      value: point.totalStudents,
    })),
  );
  const departmentChartBadge = computed(
    () =>
      `${departmentChartPoints.value
        .reduce((total, point) => total + point.value, 0)
        .toLocaleString()} students`,
  );
  const createColumnChartOption = (
    points: Array<{ label: string; value: number }>,
    color: string,
  ): EChartsOption => {
    const visibleItems = 12;
    const hasScroll = points.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / points.length) * 100)
      : 100;

    return {
      color: [color],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
          const point = points[index];

          if (!point) return "";

          return [
            `<strong>${point.label}</strong>`,
            `Students: ${point.value.toLocaleString()}`,
          ].join("<br />");
        },
      },
      dataZoom: hasScroll
        ? [
            {
              type: "inside",
              xAxisIndex: 0,
              start: 0,
              end: scrollEnd,
            },
            {
              type: "slider",
              xAxisIndex: 0,
              start: 0,
              end: scrollEnd,
              height: 16,
            },
          ]
        : undefined,
      grid: { top: 16, right: 18, bottom: 104, left: 42, containLabel: true },
      xAxis: {
        type: "category",
        data: points.map((point) => point.label),
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
          data: points.map((point) => point.value),
          itemStyle: { borderRadius: [6, 6, 0, 0] },
        },
      ],
    };
  };
  const createDepartmentRankingOption = (
    points: typeof departmentChartPoints.value,
  ): EChartsOption => {
    const visibleItems = 8;
    const hasScroll = points.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / points.length) * 100)
      : 100;

    return {
      color: [appColors.cyan],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
          const point = points[index];

          if (!point) return "";

          return [
            `<strong>${point.label}</strong>`,
            point.institution ? `Institute: ${point.institution}` : "",
            `Students: ${point.value.toLocaleString()}`,
            point.percentage ? `Share: ${point.percentage}%` : "",
          ]
            .filter(Boolean)
            .join("<br />");
        },
      },
      grid: { top: 16, right: 54, bottom: 24, left: 24, containLabel: true },
      xAxis: {
        type: "value",
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
        axisLabel: { color: appColors.secondary },
      },
      yAxis: {
        type: "category",
        data: points.map((point) => point.label),
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: appColors.secondary,
          width: 116,
          overflow: "truncate",
        },
      },
      dataZoom: hasScroll
        ? [
            {
              type: "inside",
              yAxisIndex: 0,
              start: 0,
              end: scrollEnd,
            },
            {
              type: "slider",
              yAxisIndex: 0,
              start: 0,
              end: scrollEnd,
              width: 16,
              right: 10,
            },
          ]
        : undefined,
      series: [
        {
          name: "Students",
          type: "bar",
          barWidth: 14,
          showBackground: true,
          backgroundStyle: {
            color: withAlpha(appColors.cyan, 0.08),
            borderRadius: [0, 8, 8, 0],
          },
          label: {
            show: true,
            position: "right",
            color: appColors.secondary,
            fontWeight: 700,
            formatter: ({ value }) => Number(value ?? 0).toLocaleString(),
          },
          data: points.map((point) => point.value),
          itemStyle: { borderRadius: [0, 8, 8, 0] },
        },
      ],
    };
  };
  const createCityDotChartOption = (
    points: typeof cityChartPoints.value,
  ): EChartsOption => {
    const rankedPoints = [...points].sort(
      (current, next) => next.value - current.value,
    );
    const visibleItems = 8;
    const hasScroll = rankedPoints.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / rankedPoints.length) * 100)
      : 100;

    return {
      color: [appColors.success],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const index = typeof item.dataIndex === "number" ? item.dataIndex : 0;
          const point = rankedPoints[index];

          if (!point) return "";

          return [
            `<strong>${point.label}</strong>`,
            `Students: ${point.value.toLocaleString()}`,
          ].join("<br />");
        },
      },
      grid: { top: 18, right: 56, bottom: 24, left: 24, containLabel: true },
      xAxis: {
        type: "value",
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
        axisLabel: { color: appColors.secondary },
      },
      yAxis: {
        type: "category",
        data: rankedPoints.map((point) => point.label),
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: appColors.secondary,
          width: 124,
          overflow: "truncate",
        },
      },
      dataZoom: hasScroll
        ? [
            {
              type: "inside",
              yAxisIndex: 0,
              start: 0,
              end: scrollEnd,
            },
            {
              type: "slider",
              yAxisIndex: 0,
              start: 0,
              end: scrollEnd,
              width: 16,
              right: 10,
            },
          ]
        : undefined,
      series: [
        {
          name: "Students",
          type: "bar",
          barWidth: 14,
          showBackground: true,
          backgroundStyle: {
            color: withAlpha(appColors.success, 0.08),
            borderRadius: [0, 8, 8, 0],
          },
          label: {
            show: true,
            position: "right",
            color: appColors.secondary,
            fontWeight: 700,
            formatter: ({ value }) => Number(value ?? 0).toLocaleString(),
          },
          data: rankedPoints.map((point) => point.value),
          itemStyle: { borderRadius: [0, 8, 8, 0] },
        },
      ],
    };
  };
  const institutionDistributionOption = computed(() =>
    createColumnChartOption(instituteChartPoints.value, appColors.blue),
  );
  const departmentDistributionOption = computed(
    () => createDepartmentRankingOption(departmentChartPoints.value),
  );
  const cityDistributionOption = computed(() =>
    createCityDotChartOption(cityChartPoints.value),
  );
  const institutionDistributionHeight = computed(() => "360px");
  const departmentDistributionHeight = computed(() => "360px");
  const cityDistributionHeight = computed(() => "360px");

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Student Login Activity",
      description: "Latest student login trend by selected period.",
      icon: "i-lucide-activity",
      type: "line",
      height: "360px",
      wide: true,
      labels: studentActivityTrend.value.map((point) => point.period),
      series: [
        {
          name: "Students",
          data: studentActivityTrend.value.map((point) => point.totalStudents),
        },
      ],
    },
  ]);

  const studentTableRows = computed(() =>
    students.value.map((student) => ({
      ...student,
      institute: formatStudentInstituteLabel(student.institute),
      department: formatStudentDepartmentLabel(student.department),
      gender: formatStudentGenderLabel(student.gender),
      action: student.id,
    })),
  );

  const studentPageOptions = [10, 20, 30, 50, 100];
  const studentPage = computed({
    get: () => pagination.value.currentPage,
    set: (page: number) => setPage(page),
  });
  const studentPerPage = computed({
    get: () => pagination.value.perPage,
    set: (perPage: number) => setPerPage(perPage),
  });
  const studentTotal = computed(() => pagination.value.total);

  const hasInstituteFilter = computed(
    () =>
      !isPartnerScoped.value && filters.institute !== studentInstituteAllOption,
  );
  const clearInstituteFilter = () => {
    if (!isPartnerScoped.value) {
      filters.institute = studentInstituteAllOption;
    }
  };
  const hasStudentListFilters = computed(
    () =>
      Boolean(filters.query.trim()) ||
      hasInstituteFilter.value ||
      filters.department !== studentDepartmentAllOption ||
      filters.city !== studentCityAllOption ||
      filters.gender !== studentGenderOptions[0] ||
      filters.status !== studentStatusOptions[0],
  );
  const activeFilterChips = computed<
    Array<{ key: StudentFilterKey; label: string }>
  >(() =>
    [
      filters.query.trim()
        ? { key: "query" as const, label: `Search: ${filters.query.trim()}` }
        : null,
      hasInstituteFilter.value
        ? {
            key: "institute" as const,
            label: `Institute: ${formatStudentInstituteLabel(filters.institute)}`,
          }
        : null,
      filters.department !== studentDepartmentAllOption
        ? {
            key: "department" as const,
            label: `Department: ${formatStudentDepartmentLabel(filters.department)}`,
          }
        : null,
      filters.city !== studentCityAllOption
        ? { key: "city" as const, label: `City: ${filters.city}` }
        : null,
      filters.gender !== studentGenderOptions[0]
        ? { key: "gender" as const, label: `Gender: ${filters.gender}` }
        : null,
      filters.status !== studentStatusOptions[0]
        ? { key: "status" as const, label: `Status: ${filters.status}` }
        : null,
    ].filter(
      (chip): chip is { key: StudentFilterKey; label: string } =>
        chip !== null,
    ),
  );
  const activeFilterCount = computed(() => activeFilterChips.value.length);
  const removeStudentFilter = (key: StudentFilterKey) => {
    if (key === "query") {
      searchQuery.value = "";
      applySearch("");
      return;
    }

    if (key === "institute") {
      clearInstituteFilter();
      return;
    }

    const defaultValues = {
      department: studentDepartmentAllOption,
      city: studentCityAllOption,
      gender: studentGenderOptions[0],
      status: studentStatusOptions[0],
    } as const;

    filters[key] = defaultValues[key];
  };
  const clearStudentListFilters = () => {
    clearInstituteFilter();
    filters.department = studentDepartmentAllOption;
    filters.city = studentCityAllOption;
    filters.gender = studentGenderOptions[0];
    filters.status = studentStatusOptions[0];
    searchQuery.value = "";
    applySearch("");
  };
  const submitSearch = () => applySearch(searchQuery.value);
  const exportStudents = () => {
    void exportWithToast({
      filename: "ccun-students.csv",
      label: "Student CSV file",
      columns: studentTableColumns
        .filter((column) => column.type !== "action")
        .map((column) => ({
          key: column.key,
          label: column.label,
        })),
      rows: studentTableRows.value,
    });
  };

  watch(partnerInstitute, (institute) => {
    if (institute) {
      filters.institute = institute;
    }
  });

  watch(
    () => filters.institute,
    (institute, previousInstitute) => {
      if (partnerInstitute.value && institute !== partnerInstitute.value) {
        filters.institute = partnerInstitute.value;
        return;
      }

      if (institute !== previousInstitute) {
        filters.department = studentDepartmentAllOption;
        filters.city = studentCityAllOption;
      }
    },
  );

  watch(
    () => [
      filters.query,
      filters.institute,
      filters.department,
      filters.city,
      filters.gender,
      filters.status,
      selectedActivityPeriod.value,
    ],
    loadLiveStudentCharts,
  );

  const table = computed<AnalyticsTable>(() => ({
    title: "Student List",
    icon: "i-lucide-users",
    description:
      "Search and combine institute, department, city, gender, and status criteria.",
    rowKey: "id",
    columns: studentTableColumns,
    rows: studentTableRows.value,
  }));

  const paginationLabel = computed(() => {
    if (studentTotal.value === 0) {
      return "No students found";
    }

    const start = (studentPage.value - 1) * studentPerPage.value + 1;
    const end = Math.min(
      studentPage.value * studentPerPage.value,
      studentTotal.value,
    );

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${studentTotal.value.toLocaleString()}`;
  });

  const viewStudent = async (
    id: number | string | boolean | null | undefined,
  ) => {
    if (id === undefined || id === null) {
      selectedStudent.value = null;
      profileOpen.value = false;
      return;
    }

    const studentId = Number(id);

    selectedStudent.value =
      students.value.find((student) => student.id === studentId) ?? null;
    profileOpen.value = Boolean(selectedStudent.value);
    selectedStudentIsLoading.value = true;

    try {
      selectedStudent.value = await getStudent(studentId);
      profileOpen.value = true;
    } catch {
      selectedStudent.value = null;
      profileOpen.value = false;
    } finally {
      selectedStudentIsLoading.value = false;
    }
  };

  return {
    activeTab,
    activityPeriodOptions,
    charts,
    changeInstitute,
    activeFilterChips,
    activeFilterCount,
    cities,
    cityDistributionHeight,
    cityDistributionOption,
    cityFilterItems,
    clearInstituteFilter,
    clearStudentListFilters,
    departments,
    departmentChartBadge,
    departmentFilterItems,
    dependentFiltersLoading,
    error,
    exportStudents,
    filters,
    genderFilterItems,
    genderDistributionOption,
    institutionDistributionHeight,
    institutionDistributionOption,
    instituteFilterItems,
    institutes,
    hasInstituteFilter,
    hasStudentListFilters,
    isLoading,
    isPartnerScoped,
    liveError,
    liveIsLoading,
    metrics,
    paginationLabel,
    partnerInstituteLabel,
    profileOpen,
    refresh,
    removeStudentFilter,
    searchQuery,
    departmentDistributionHeight,
    departmentDistributionOption,
    selectedActivityPeriod,
    selectedStudent,
    selectedStudentIsLoading,
    studentMetricsLoaded,
    studentMetricsLoading,
    studentPage,
    studentPageOptions,
    studentPerPage,
    studentTotal,
    statusFilterItems,
    table,
    tabs,
    submitSearch,
    viewStudent,
  };
};
