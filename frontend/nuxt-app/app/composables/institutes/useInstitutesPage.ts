import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import { useCsvExport } from "~/composables/common/useCsvExport";
import { getInstituteAnalytics } from "~/services/analytics.service";
import type { AnalyticsTable } from "~/types/analytics";
import type {
  InstituteAnalyticsResponse,
  InstituteAnalyticsRow,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

const allInstitutesOption = "All institutes";
const allDepartmentsOption = "All departments";
type InstituteTab = "overview" | "comparison" | "trends";

export const useInstitutesPage = () => {
  const { exportWithToast } = useCsvExport();
  const data = ref<InstituteAnalyticsResponse | null>(null);
  const isLoading = ref(true);
  const isFiltering = ref(false);
  const detailLoading = ref(false);
  const error = ref("");
  const detailOpen = ref(false);
  const activeTab = ref<InstituteTab>("overview");
  const selectedInstitute = ref<InstituteAnalyticsRow | null>(null);
  const selectedDepartments = ref<InstituteAnalyticsResponse["departments"]>([]);
  const selectedTopCourses = ref<InstituteAnalyticsResponse["topCourses"]>([]);
  const comparisonInstituteA = ref("");
  const comparisonInstituteB = ref("");
  const tablePage = ref(1);
  const tablePerPage = ref(10);
  const tablePageOptions = [10, 20, 30, 50, 100];
  const filters = reactive({
    institution: allInstitutesOption,
    department: allDepartmentsOption,
    dateFrom: "",
    dateTo: "",
  });
  let latestRequestId = 0;
  const tabs: Array<{
    label: string;
    value: InstituteTab;
  }> = [
    { label: "Overview", value: "overview" },
    { label: "Comparison", value: "comparison" },
    { label: "Trends", value: "trends" },
  ];

  const queryParams = (institution = filters.institution) => ({
    institution:
      institution === allInstitutesOption ? undefined : institution,
    department:
      filters.department === allDepartmentsOption
        ? undefined
        : filters.department,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const loadInstitutes = async (silent = false) => {
    const requestId = ++latestRequestId;

    if (silent) {
      isFiltering.value = true;
    } else {
      isLoading.value = true;
    }
    error.value = "";

    try {
      const response = await getInstituteAnalytics(queryParams());

      if (requestId === latestRequestId) {
        data.value = response;
      }
    } catch {
      if (requestId === latestRequestId) {
        error.value = "Unable to load institute analytics.";
      }
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
        isFiltering.value = false;
      }
    }
  };

  onMounted(loadInstitutes);

  const changeInstitute = async (institution: unknown) => {
    if (typeof institution === "string") {
      filters.institution = institution;
    }

    filters.department = allDepartmentsOption;
    await loadInstitutes(true);
  };

  const clearFilters = () => {
    filters.institution = allInstitutesOption;
    filters.department = allDepartmentsOption;
    filters.dateFrom = "";
    filters.dateTo = "";
    void loadInstitutes();
  };

  const instituteOptions = computed(() => [
    { label: allInstitutesOption, value: allInstitutesOption },
    ...(data.value?.options.institutes ?? []).map((institution) => ({
      label: formatStudentInstituteLabel(institution),
      value: institution,
    })),
  ]);
  const comparisonInstituteOptions = computed(() =>
    (data.value?.institutes ?? [])
      .filter((row) => row.institution !== "Not filled")
      .map((row) => ({
        label: formatStudentInstituteLabel(row.institution),
        value: row.institution,
      })),
  );
  const departmentOptions = computed(() => [
    { label: allDepartmentsOption, value: allDepartmentsOption },
    ...(data.value?.options.departments ?? []).map((department) => ({
      label: formatStudentDepartmentLabel(department),
      value: department,
    })),
  ]);
  const hasFilters = computed(
    () =>
      filters.institution !== allInstitutesOption ||
      filters.department !== allDepartmentsOption ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo),
  );
  const snapshotLabel = computed(() =>
    data.value?.snapshotDate
      ? `Data through ${new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(`${data.value.snapshotDate}T00:00:00`))}`
      : "Snapshot date unavailable",
  );
  const selectedScopeLabel = computed(() =>
    data.value?.filters.selectedInstitute
      ? formatStudentInstituteLabel(data.value.filters.selectedInstitute)
      : "selected institute",
  );

  const metrics = computed<Metric[]>(() => {
    const summary = data.value?.summary;

    return [
      {
        label: "Institutes",
        value: (summary?.institutes ?? 0).toLocaleString(),
        trend: "Named institutes in the current scope",
        icon: "Building2",
        color: appColors.blue,
      },
      {
        label: "Students",
        value: (summary?.students ?? 0).toLocaleString(),
        trend: "Student records matching the filters",
        icon: "Users",
        color: appColors.success,
      },
      {
        label: "Courses",
        value: (summary?.courses ?? 0).toLocaleString(),
        trend: "Courses represented by enrollment records",
        icon: "BookOpen",
        color: appColors.purple,
      },
      {
        label: "Snapshot Active Rate",
        value: `${(summary?.activityRate ?? 0).toFixed(1)}%`,
        trend: "Logged in within 90 days of the snapshot",
        icon: "Activity",
        color: appColors.amber,
      },
    ];
  });

  watch(
    () => data.value?.institutes,
    (institutes) => {
      const eligibleInstitutes =
        institutes?.filter((row) => row.institution !== "Not filled") ?? [];

      if (
        !comparisonInstituteA.value ||
        !eligibleInstitutes.some(
          (row) => row.institution === comparisonInstituteA.value,
        )
      ) {
        comparisonInstituteA.value = eligibleInstitutes[0]?.institution ?? "";
      }

      if (
        !comparisonInstituteB.value ||
        comparisonInstituteB.value === comparisonInstituteA.value ||
        !eligibleInstitutes.some(
          (row) => row.institution === comparisonInstituteB.value,
        )
      ) {
        comparisonInstituteB.value =
          eligibleInstitutes.find(
            (row) => row.institution !== comparisonInstituteA.value,
          )?.institution ?? "";
      }
    },
    { immediate: true },
  );

  const comparisonA = computed(
    () =>
      data.value?.institutes.find(
        (row) => row.institution === comparisonInstituteA.value,
      ) ?? null,
  );
  const comparisonB = computed(
    () =>
      data.value?.institutes.find(
        (row) => row.institution === comparisonInstituteB.value,
      ) ?? null,
  );
  const comparisonCards = computed(() =>
    [
      comparisonA.value
        ? {
            label: "Institute A",
            row: comparisonA.value,
          }
        : null,
      comparisonB.value
        ? {
            label: "Institute B",
            row: comparisonB.value,
          }
        : null,
    ].filter(
      (item): item is { label: string; row: InstituteAnalyticsRow } =>
        item !== null,
    ),
  );

  const formatDifference = (value: number, suffix = "") => {
    if (value === 0) return `0${suffix}`;

    return `${value > 0 ? "+" : ""}${value.toLocaleString()}${suffix}`;
  };
  const comparisonRows = computed(() => {
    const left = comparisonA.value;
    const right = comparisonB.value;

    if (!left || !right) {
      return [];
    }

    return [
      {
        metric: "Students",
        a: left.students.toLocaleString(),
        b: right.students.toLocaleString(),
        difference: formatDifference(left.students - right.students),
      },
      {
        metric: "Active students",
        a: left.activeStudents.toLocaleString(),
        b: right.activeStudents.toLocaleString(),
        difference: formatDifference(left.activeStudents - right.activeStudents),
      },
      {
        metric: "Activity rate",
        a: `${left.activityRate.toFixed(1)}%`,
        b: `${right.activityRate.toFixed(1)}%`,
        difference: formatDifference(
          Number((left.activityRate - right.activityRate).toFixed(1)),
          "%",
        ),
      },
      {
        metric: "Courses",
        a: left.courses.toLocaleString(),
        b: right.courses.toLocaleString(),
        difference: formatDifference(left.courses - right.courses),
      },
      {
        metric: "Enrollments",
        a: left.enrollmentRecords.toLocaleString(),
        b: right.enrollmentRecords.toLocaleString(),
        difference: formatDifference(
          left.enrollmentRecords - right.enrollmentRecords,
        ),
      },
      {
        metric: "Departments",
        a: left.departments.toLocaleString(),
        b: right.departments.toLocaleString(),
        difference: formatDifference(left.departments - right.departments),
      },
    ];
  });

  const comparisonOption = computed<EChartsOption>(() => {
    const institutes = data.value?.institutes ?? [];
    const visibleItems = 12;
    const hasScroll = institutes.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / institutes.length) * 100)
      : 100;

    return {
      color: [appColors.blue],
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 20, right: 42, bottom: 24, left: 18, containLabel: true },
      xAxis: {
        type: "value",
        axisTick: { show: false },
        axisLabel: { color: appColors.secondary },
        splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: institutes.map((row) =>
          formatStudentInstituteLabel(row.institution),
        ),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: appColors.secondary },
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
          barMaxWidth: 24,
          data: institutes.map((row) => row.students),
          itemStyle: { borderRadius: [0, 6, 6, 0] },
        },
      ],
    };
  });

  const enrollmentTrendOption = computed<EChartsOption>(() => ({
    color: [appColors.primaryHover],
    tooltip: { trigger: "axis" },
    grid: { top: 24, right: 20, bottom: 64, left: 20, containLabel: true },
    xAxis: {
      type: "category",
      data: (data.value?.enrollmentTrend ?? []).map((point) => point.period),
      axisTick: { show: false },
      axisLabel: { color: appColors.secondary, rotate: 45 },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: appColors.secondary },
      splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
    },
    dataZoom:
      (data.value?.enrollmentTrend.length ?? 0) > 18
        ? [{ type: "inside", start: 65, end: 100 }, { type: "slider", height: 16 }]
        : undefined,
    series: [
      {
        name: "Enrollment records",
        type: "line",
        smooth: true,
        symbolSize: 6,
        data: (data.value?.enrollmentTrend ?? []).map(
          (point) => point.enrollments,
        ),
        areaStyle: { opacity: 0.12 },
      },
    ],
  }));

  const departmentOption = computed<EChartsOption>(() => {
    const departments = data.value?.departments ?? [];
    const visibleItems = 8;
    const hasScroll = departments.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / departments.length) * 100)
      : 100;

    return {
      color: [appColors.success],
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 20, right: 42, bottom: 24, left: 18, containLabel: true },
      xAxis: {
        type: "value",
        axisTick: { show: false },
        axisLabel: { color: appColors.secondary },
        splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: departments.map((point) =>
          formatStudentDepartmentLabel(point.department),
        ),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: appColors.secondary },
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
          barMaxWidth: 22,
          data: departments.map((point) => point.students),
          itemStyle: { borderRadius: [0, 6, 6, 0] },
        },
      ],
    };
  });

  const table = computed<AnalyticsTable>(() => ({
    title: "Institute Performance Ranking",
    icon: "i-lucide-ranking",
    description:
      "Named institutes are ranked by student count. Records without an institute remain visible but are not ranked.",
    rowKey: "id",
    columns: [
      { key: "rank", label: "Rank", width: "70px", tone: "muted" },
      { key: "institution", label: "Institute", rowHeader: true, width: "180px" },
      { key: "students", label: "Students", align: "right", width: "110px" },
      { key: "courses", label: "Courses", align: "right", width: "100px" },
      { key: "enrollments", label: "Enrollments", align: "right", width: "120px" },
      { key: "activeStudents", label: "Active", align: "right", width: "100px" },
      { key: "activityRate", label: "Activity Rate", align: "right", width: "120px" },
      { key: "status", label: "Ranking", type: "status", width: "130px", warningValues: ["Unranked"] },
      { key: "action", label: "View", type: "action", align: "center", width: "90px" },
    ],
    rows: (data.value?.institutes ?? [])
      .slice(
        (tablePage.value - 1) * tablePerPage.value,
        tablePage.value * tablePerPage.value,
      )
      .map((row) => ({
        id: row.institution,
        rank: row.rankEligible ? row.rank : "-",
        institution: formatStudentInstituteLabel(row.institution),
        rawInstitution: row.institution,
        students: row.students.toLocaleString(),
        courses: row.courses.toLocaleString(),
        enrollments: row.enrollmentRecords.toLocaleString(),
        activeStudents: row.activeStudents.toLocaleString(),
        activityRate: `${row.activityRate.toFixed(1)}%`,
        status: row.rankEligible ? "Ranked" : "Unranked",
        action: row.institution,
      })),
  }));
  const tableTotal = computed(() => data.value?.institutes.length ?? 0);
  const tablePaginationLabel = computed(() => {
    if (tableTotal.value === 0) {
      return "No institutes found";
    }

    const start = (tablePage.value - 1) * tablePerPage.value + 1;
    const end = Math.min(tablePage.value * tablePerPage.value, tableTotal.value);

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${tableTotal.value.toLocaleString()}`;
  });

  const viewInstitute = async (
    value: string | number | boolean | null | undefined,
  ) => {
    if (value === null || value === undefined) return;

    const institution = String(value);
    selectedInstitute.value =
      data.value?.institutes.find((row) => row.institution === institution) ??
      null;
    detailOpen.value = true;
    detailLoading.value = true;

    try {
      const detail = await getInstituteAnalytics(queryParams(institution));
      selectedDepartments.value = detail.departments;
      selectedTopCourses.value = detail.topCourses;
      selectedInstitute.value =
        detail.institutes.find((row) => row.institution === institution) ??
        selectedInstitute.value;
    } finally {
      detailLoading.value = false;
    }
  };

  const exportInstitutes = () => {
    void exportWithToast({
      filename: "ccun-institute-analytics.csv",
      label: "Institute analytics CSV",
      columns: [
        { key: "rank", label: "Rank" },
        { key: "institution", label: "Institute" },
        { key: "students", label: "Students" },
        { key: "courses", label: "Courses" },
        { key: "enrollmentRecords", label: "Enrollment Records" },
        { key: "activeStudents", label: "Snapshot Active Students" },
        { key: "activityRate", label: "Snapshot Activity Rate" },
        { key: "lastActivity", label: "Last Activity" },
      ],
      rows: (data.value?.institutes ?? []).map((row) => ({
        rank: row.rank ?? "",
        institution: row.institution,
        students: row.students,
        courses: row.courses,
        enrollmentRecords: row.enrollmentRecords,
        activeStudents: row.activeStudents,
        activityRate: row.activityRate,
        lastActivity: row.lastActivity ?? "",
      })),
    });
  };

  watch(
    () => data.value?.institutes.length,
    () => {
      tablePage.value = 1;
    },
  );

  watch(tablePerPage, () => {
    tablePage.value = 1;
  });

  return {
    activeTab,
    clearFilters,
    changeInstitute,
    comparisonCards,
    comparisonInstituteA,
    comparisonInstituteB,
    comparisonInstituteOptions,
    comparisonOption,
    comparisonRows,
    data,
    departmentOption,
    departmentOptions,
    detailLoading,
    detailOpen,
    enrollmentTrendOption,
    error,
    exportInstitutes,
    filters,
    hasFilters,
    instituteOptions,
    isLoading,
    isFiltering,
    loadInstitutes,
    metrics,
    selectedDepartments,
    selectedInstitute,
    selectedScopeLabel,
    selectedTopCourses,
    snapshotLabel,
    table,
    tablePage,
    tablePageOptions,
    tablePaginationLabel,
    tablePerPage,
    tableTotal,
    tabs,
    viewInstitute,
  };
};
