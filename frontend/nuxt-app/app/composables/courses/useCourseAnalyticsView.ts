import {
  courseCategoryAllOption,
  courseInstituteAllOption,
  courseTableColumns,
} from "~/constants/courseAnalytics";
import type { AnalyticsChart, AnalyticsTable, Course } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";
import {
  appColors,
  chartColors,
} from "~/constants/colors";
import { useCsvExport } from "~/composables/common/useCsvExport";
import type { ExportFormat } from "~/utils/exportCsv";

type CourseAnalyticsTab = "overview" | "institutes" | "enrollment";
type CourseTableRow = Record<string, string | number | boolean | null | undefined>;
type CourseExportRow = {
  id: number;
  name: string;
  category: string;
  institute: string;
  courseCount: number;
  enrolled: number;
};

const courseExportColumns = [
  { key: "id", label: "Course ID" },
  { key: "name", label: "Course name" },
  { key: "category", label: "Category" },
  { key: "institute", label: "Institute" },
  { key: "courseCount", label: "Moodle course records" },
  { key: "enrolled", label: "Enrollment records" },
] satisfies Array<{ key: keyof CourseExportRow; label: string }>;

export const useCourseAnalyticsView = () => {
  const { exportWithToast } = useCsvExport();
  const auth = useAuthStore();
  const {
    appliedFilters,
    applyFilters: applyCourseFilters,
    courses,
    error,
    filteredCourses,
    filters,
    isLoading,
    refresh: refreshCourses,
  } = useCourses();
  const currentPage = ref(1);
  const perPage = ref(10);
  const activeTab = ref<CourseAnalyticsTab>("overview");
  const tabs: Array<{ label: string; value: CourseAnalyticsTab }> = [
    { label: "Overview", value: "overview" },
    { label: "Institutes", value: "institutes" },
    { label: "Enrollment", value: "enrollment" },
  ];
  const selectedCourse = ref<Course | null>(null);
  const courseDetailOpen = ref(false);
  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

  const refresh = async () => {
    await refreshCourses();
  };

  const clearFilters = () => {
    filters.query = "";
    filters.category = courseCategoryAllOption;
    filters.institute = courseInstituteAllOption;
    applyCourseFilters();
    currentPage.value = 1;
  };

  const categories = computed(() => [
    courseCategoryAllOption,
    ...new Set(
      courses.value.flatMap(
        (course) => course.categories ?? [course.category],
      ),
    ),
  ]);
  const institutes = computed(() => [
    courseInstituteAllOption,
    ...new Set(
      courses.value.flatMap((course) => course.institutes ?? [course.institute]),
    ),
  ]);
  const changeInstitute = (institute: unknown) => {
    if (typeof institute === "string") {
      filters.institute = institute;
    }
  };

  const analysisCourses = computed(() => filteredCourses.value);
  const activeFilterChips = computed(() =>
    [
      appliedFilters.query.trim()
        ? { key: "query", label: `Search: ${appliedFilters.query.trim()}` }
        : null,
      appliedFilters.category !== courseCategoryAllOption
        ? { key: "category", label: `Category: ${appliedFilters.category}` }
        : null,
      appliedFilters.institute !== courseInstituteAllOption
        ? { key: "institute", label: `Institute: ${appliedFilters.institute}` }
        : null,
    ].filter(
      (item): item is { key: keyof typeof filters; label: string } =>
        item !== null,
    ),
  );
  const activeFilterCount = computed(() => activeFilterChips.value.length);
  const hasFilters = computed(() => activeFilterCount.value > 0);
  const removeFilter = (key: keyof typeof filters) => {
    const defaults = {
      query: "",
      category: courseCategoryAllOption,
      institute: courseInstituteAllOption,
    };

    filters[key] = defaults[key] as never;
    applyCourseFilters();
    currentPage.value = 1;
  };

  const applyFilters = () => {
    filters.query = filters.query.trim();
    applyCourseFilters();
    currentPage.value = 1;
  };

  const sortedCourses = computed(() =>
    [...analysisCourses.value].sort((a, b) => b.enrolled - a.enrolled),
  );

  const totalEnrollments = computed(() =>
    analysisCourses.value.reduce((sum, course) => sum + course.enrolled, 0),
  );
  const groupedCourses = computed(() => analysisCourses.value.length);
  const representedInstitutes = computed(
    () =>
      new Set(
        analysisCourses.value.flatMap(
          (course) => course.institutes ?? [course.institute],
        ),
      ).size,
  );

  const courseSummaryItems = computed<Metric[]>(() => [
    {
      label: "Course Groups",
      value: groupedCourses.value.toLocaleString(),
      trend: "Cleaned course groups in this view",
      icon: "BookOpen",
      color: appColors.purple,
    },
    {
      label: "Institutes",
      value: representedInstitutes.value.toLocaleString(),
      trend: "Institutes represented by course groups",
      icon: "Building2",
      color: appColors.blue,
    },
    {
      label: "Total Enrollments",
      value: totalEnrollments.value.toLocaleString(),
      trend: "Learner-course enrollment records",
      icon: "Users",
      color: appColors.success,
    },
  ]);

  const pagination = computed(() => {
    const total = analysisCourses.value.length;
    const lastPage = Math.max(Math.ceil(total / perPage.value), 1);

    return {
      currentPage: Math.min(currentPage.value, lastPage),
      perPage: perPage.value,
      total,
      lastPage,
    };
  });

  const paginatedCourses = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.perPage;

    return sortedCourses.value.slice(start, start + pagination.value.perPage);
  });

  const paginationLabel = computed(() => {
    if (pagination.value.total === 0) {
      return "No course groups found";
    }

    const start =
      (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
    const end = Math.min(
      pagination.value.currentPage * pagination.value.perPage,
      pagination.value.total,
    );

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${pagination.value.total.toLocaleString()} course groups`;
  });

  const goToPage = (page: number) => {
    currentPage.value = Math.min(Math.max(page, 1), pagination.value.lastPage);
  };

  const setPerPage = (nextPerPage: number) => {
    perPage.value = nextPerPage;
    currentPage.value = 1;
  };

  const coursePageOptions = [10, 25, 50, 100];
  const coursePage = computed({
    get: () => pagination.value.currentPage,
    set: (page: number) => goToPage(page),
  });
  const coursePerPage = computed({
    get: () => pagination.value.perPage,
    set: (nextPerPage: number) => setPerPage(nextPerPage),
  });
  const courseTotal = computed(() => pagination.value.total);

  watch(
    () => ({ ...filters }),
    () => {
      currentPage.value = 1;
    },
  );

  watch(
    () => pagination.value.lastPage,
    (lastPage) => {
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage;
      }
    },
  );

  const countCourseValues = (
    getValues: (course: Course) => string[] | undefined,
    fallbackValue: (course: Course) => string,
    emptyLabel: string,
  ) => {
    const counts = new Map<string, number>();

    analysisCourses.value.forEach((course) => {
      const values = getValues(course)?.filter(Boolean);
      const labels = values?.length ? values : [fallbackValue(course)];

      labels.forEach((label) => {
        const cleanLabel = label?.trim() || emptyLabel;

        counts.set(cleanLabel, (counts.get(cleanLabel) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

  const categoryCounts = computed(() =>
    countCourseValues(
      (course) => course.categories,
      (course) => course.category,
      "No category",
    ),
  );

  const instituteDistribution = computed(() => {
    const items = countCourseValues(
      (course) => course.institutes,
      (course) => course.institute,
      "No institute",
    );
    const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
    let offset = 0;

    return items.map((item, index) => {
      const arcPercentage = (item.count * 100) / total;
      const distributionItem = {
        ...item,
        arcOffset: offset,
        arcPercentage,
        color: chartColors[index % chartColors.length],
        percentage: Math.round((item.count * 1000) / total) / 10,
      };

      offset += arcPercentage;

      return distributionItem;
    });
  });

  const instituteDistributionTotal = computed(() =>
    instituteDistribution.value.reduce((sum, item) => sum + item.count, 0),
  );

  const charts = computed<AnalyticsChart[]>(() => {
    return [
      {
        title: "Courses by Category",
        description: "Where are the clean course groups concentrated?",
        icon: "i-lucide-folders",
        type: "horizontalBar",
        height: "360px",
        labels: categoryCounts.value.map((item) => item.label),
        series: [
          {
            name: "Course groups",
            data: categoryCounts.value.map((item) => item.count),
          },
        ],
      },
      {
        title: "Courses by Enrollment",
        description: "Which clean courses have the most enrollments?",
        icon: "i-lucide-users",
        type: "horizontalBar",
        height: "360px",
        wide: true,
        labels: sortedCourses.value.map((course) => course.name),
        series: [
          {
            name: "Enrollment records",
            data: sortedCourses.value.map((course) => course.enrolled),
          },
        ],
      },
    ];
  });

  const openCourseDetail = (row: CourseTableRow) => {
    const courseId = Number(row.id);
    selectedCourse.value =
      courses.value.find((course) => course.id === courseId) ?? null;
    courseDetailOpen.value = Boolean(selectedCourse.value);
  };

  const formatCourseListValue = (
    values: string[] | undefined,
    fallback: string,
  ) => (values?.length ? values.join(", ") : fallback);

  const table = computed<AnalyticsTable>(() => ({
    title: "Course Groups",
    icon: "i-lucide-layers-3",
    description:
      "Cleaned course-group analytics. Each row can represent one or more original Moodle course records.",
    rowKey: "id",
    columns: courseTableColumns,
    rows: paginatedCourses.value.map((course) => ({
      id: course.id,
      name: course.name,
      category: formatCourseListValue(course.categories, course.category),
      institute: formatCourseListValue(course.institutes, course.institute),
      courseCount: course.courseCount ?? 1,
      enrolled: course.enrolled,
      action: "View detail",
    })),
  }));

  const exportCourses = (format: ExportFormat = "csv") => {
    const rows = [...courses.value]
      .sort((a, b) => b.enrolled - a.enrolled)
      .map<CourseExportRow>((course) => ({
        id: course.id,
        name: course.name,
        category: formatCourseListValue(course.categories, course.category),
        institute: formatCourseListValue(course.institutes, course.institute),
        courseCount: course.courseCount ?? 1,
        enrolled: course.enrolled,
      }));

    void exportWithToast({
      filename: `ccun-course-groups.${format === "excel" ? "xls" : "csv"}`,
      format,
      label: `All courses ${format === "excel" ? "Excel" : "CSV"} file`,
      columns: courseExportColumns,
      rows,
    });
  };

  return {
    activeTab,
    activeFilterChips,
    activeFilterCount,
    categories,
    chartError: ref(""),
    charts,
    chartsLoading: ref(false),
    changeInstitute,
    courseDetailOpen,
    instituteDistribution,
    instituteDistributionTotal,
    coursePage,
    coursePageOptions,
    coursePerPage,
    courseSummaryItems,
    courseTotal,
    clearFilters,
    error,
    exportCourses,
    filters,
    hasFilters,
    institutes,
    isLoading,
    openCourseDetail,
    pagination,
    paginationLabel,
    partnerInstituteLabel,
    refresh,
    removeFilter,
    selectedCourse,
    table,
    tabs,
    applyFilters,
  };
};
