import type { EChartsOption } from "echarts";
import { appColors } from "~/constants/colors";
import { useCsvExport } from "~/composables/common/useCsvExport";
import type { ExportFormat } from "~/utils/exportCsv";
import { getInstituteAnalytics } from "~/services/analytics.service";
import type { AnalyticsTable } from "~/types/analytics";
import type {
  InstituteAnalyticsResponse,
  InstituteAnalyticsRow,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";
import {
  createColoredBarData,
  formatChartValue,
  getChartPointColor,
} from "~/utils/chartDisplay";

const allInstitutesOption = "All institutes";
const allDepartmentsOption = "All departments";

const getStudentsFromDatasetValue = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const students = (value as { students?: unknown }).students;

  return typeof students === "number" ? students : undefined;
};

export const useInstitutesPage = () => {
  const { exportWithToast } = useCsvExport();
  const toast = useToast();
  const auth = useAuthStore();
  const data = ref<InstituteAnalyticsResponse | null>(null);
  const isLoading = ref(true);
  const isFiltering = ref(false);
  const detailLoading = ref(false);
  const error = ref("");
  const detailOpen = ref(false);
  const selectedInstitute = ref<InstituteAnalyticsRow | null>(null);
  const selectedDepartments = ref<InstituteAnalyticsResponse["departments"]>([]);
  const selectedCourses = ref<InstituteAnalyticsResponse["courses"]>([]);
  const filters = reactive({
    search: "",
    institution: allInstitutesOption,
    department: allDepartmentsOption,
    dateFrom: "",
    dateTo: "",
  });
  let latestRequestId = 0;
  const isPartnerScoped = computed(() => auth.user?.role === "partner");
  const partnerInstituteLabel = computed(() =>
    auth.user?.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "Institute scope not assigned",
  );
  const partnerInstitute = computed(
    () =>
      data.value?.filters.selectedInstitute ||
      auth.user?.institution_name ||
      allInstitutesOption,
  );

  if (isPartnerScoped.value) {
    filters.institution = auth.user?.institution_name || allInstitutesOption;
  }

  const queryParams = (institution = filters.institution) => ({
    search: filters.search.trim() || undefined,
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
  };

  const clearFilters = () => {
    filters.search = "";
    filters.institution = isPartnerScoped.value
      ? partnerInstitute.value
      : allInstitutesOption;
    filters.department = allDepartmentsOption;
    filters.dateFrom = "";
    filters.dateTo = "";
    void loadInstitutes();
  };

  const instituteOptions = computed(() =>
    isPartnerScoped.value
      ? [
          {
            label: formatStudentInstituteLabel(partnerInstitute.value),
            value: partnerInstitute.value,
          },
        ]
      : [
          { label: allInstitutesOption, value: allInstitutesOption },
          ...(data.value?.options.institutes ?? []).map((institution) => ({
            label: formatStudentInstituteLabel(institution),
            value: institution,
          })),
        ],
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
      (!isPartnerScoped.value && filters.institution !== allInstitutesOption) ||
      filters.department !== allDepartmentsOption ||
      Boolean(filters.search.trim()) ||
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
        label: "Enrollments",
        value: (summary?.enrollmentRecords ?? 0).toLocaleString(),
        trend: "Enrollment records in the current scope",
        icon: "FolderTree",
        color: appColors.amber,
      },
    ];
  });

  const comparisonOption = computed<EChartsOption>(() => {
    const institutes = data.value?.institutes ?? [];
    const chartDataset = institutes.map((row) => ({
      institution: row.institution,
      institute: formatStudentInstituteLabel(row.institution),
      students: row.students,
      courses: row.courses,
      enrollmentRecords: row.enrollmentRecords,
    }));
    const visibleItems = 12;
    const hasScroll = institutes.length > visibleItems;
    const scrollEnd = hasScroll
      ? Math.min(100, (visibleItems / institutes.length) * 100)
      : 100;

    return {
      dataset: {
        source: chartDataset,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const point =
            item && typeof item === "object" && "data" in item
              ? (item.data as (typeof chartDataset)[number] | undefined)
              : undefined;

          if (!point) return "";

          return [
            `<strong>${point.institute}</strong>`,
            `Students: ${point.students.toLocaleString()}`,
            `Courses: ${point.courses.toLocaleString()}`,
            `Enrollments: ${point.enrollmentRecords.toLocaleString()}`,
          ].join("<br />");
        },
      },
      grid: { top: 28, right: 18, bottom: 104, left: 42, containLabel: true },
      xAxis: {
        type: "category",
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
      series: [
        {
          name: "Students",
          type: "bar",
          barMaxWidth: 24,
          encode: {
            x: "institute",
            y: "students",
            tooltip: ["students", "courses", "enrollmentRecords"],
            itemName: "institute",
          },
          label: {
            show: true,
            position: "top",
            color: appColors.secondary,
            fontWeight: 700,
            formatter: ({ value }: { value?: unknown }) =>
              formatChartValue(getStudentsFromDatasetValue(value)),
          },
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: ({ dataIndex }: { dataIndex?: number }) =>
              getChartPointColor(Number(dataIndex ?? 0)),
          },
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
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { top: 20, right: 58, bottom: 24, left: 18, containLabel: true },
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
          data: createColoredBarData(
            departments.map((point) => point.students),
            [0, 6, 6, 0],
          ),
          label: {
            show: true,
            position: "right",
            color: appColors.secondary,
            fontWeight: 700,
            formatter: ({ value }: { value?: unknown }) =>
              formatChartValue(value),
          },
        },
      ],
    };
  });

  const table = computed<AnalyticsTable>(() => ({
    title: "Institute List",
    icon: "i-lucide-building-2",
    description:
      "All institutes in the current scope with aggregate students, courses, and enrollment records.",
    rowKey: "id",
    columns: [
      { key: "institution", label: "Institute", rowHeader: true, width: "180px" },
      { key: "students", label: "Students", align: "right", width: "110px" },
      { key: "courses", label: "Courses", align: "right", width: "100px" },
      { key: "enrollments", label: "Enrollments", align: "right", width: "120px" },
      { key: "action", label: "View", type: "action", align: "center", width: "90px" },
    ],
    rows: (data.value?.institutes ?? [])
      .map((row) => ({
        id: row.institution,
        institution: formatStudentInstituteLabel(row.institution),
        rawInstitution: row.institution,
        students: row.students.toLocaleString(),
        courses: row.courses.toLocaleString(),
        enrollments: row.enrollmentRecords.toLocaleString(),
        action: row.institution,
      })),
  }));

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
      selectedCourses.value = detail.courses;
      selectedInstitute.value =
        detail.institutes.find((row) => row.institution === institution) ??
        selectedInstitute.value;
    } finally {
      detailLoading.value = false;
    }
  };

  const exportInstitutes = async (format: ExportFormat = "csv") => {
    try {
      const exportData = await getInstituteAnalytics({});

      void exportWithToast({
        filename: `ccun-institute-analytics.${format === "excel" ? "xls" : "csv"}`,
        format,
        label: `All institute analytics ${format === "excel" ? "Excel" : "CSV"}`,
        columns: [
          { key: "institution", label: "Institute" },
          { key: "students", label: "Students" },
          { key: "courses", label: "Courses" },
          { key: "enrollmentRecords", label: "Enrollment Records" },
        ],
        rows: exportData.institutes.map((row) => ({
          institution: row.institution,
          students: row.students,
          courses: row.courses,
          enrollmentRecords: row.enrollmentRecords,
        })),
      });
    } catch {
      toast.add({
        title: "Export failed",
        description: "Unable to load all institute analytics for export.",
        icon: "i-lucide-circle-x",
        color: "error",
      });
    }
  };

  return {
    clearFilters,
    changeInstitute,
    comparisonOption,
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
    isPartnerScoped,
    isLoading,
    isFiltering,
    loadInstitutes,
    metrics,
    partnerInstituteLabel,
    selectedDepartments,
    selectedInstitute,
    selectedScopeLabel,
    selectedCourses,
    snapshotLabel,
    table,
    viewInstitute,
  };
};
