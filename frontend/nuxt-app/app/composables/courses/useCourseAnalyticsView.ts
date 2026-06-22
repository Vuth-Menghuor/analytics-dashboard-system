import {
  courseCategoryAllOption,
  courseEngagementOptions,
  courseInstituteAllOption,
  courseTableColumns,
} from "~/constants/courseAnalytics";
import type { AnalyticsChart, AnalyticsTable, Course } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";
import {
  appColors,
  chartColors,
  chartOtherColor,
} from "~/constants/colors";
import { useCsvExport } from "~/composables/common/useCsvExport";

type CourseAnalyticsTab = "overview" | "institutes" | "enrollment";

export const useCourseAnalyticsView = () => {
  const { exportWithToast } = useCsvExport();
  const auth = useAuthStore();
  const {
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
    filters.engagement = "All engagement";
    currentPage.value = 1;
  };

  const coursesInSelectedInstitute = computed(() =>
    filters.institute === courseInstituteAllOption
      ? courses.value
      : courses.value.filter(
          (course) =>
            course.institute === filters.institute ||
            course.institutes?.includes(filters.institute),
        ),
  );
  const categories = computed(() => [
    courseCategoryAllOption,
    ...new Set(
      coursesInSelectedInstitute.value.flatMap(
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

    filters.category = courseCategoryAllOption;
    currentPage.value = 1;
  };

  const analysisCourses = computed(() =>
    filteredCourses.value.filter((course) => {
      if (filters.engagement === "No enrollments") return course.enrolled === 0;
      if (filters.engagement === "Has enrollments") return course.enrolled > 0;

      return true;
    }),
  );
  const activeFilterChips = computed(() =>
    [
      filters.query.trim()
        ? { key: "query", label: `Search: ${filters.query.trim()}` }
        : null,
      filters.category !== courseCategoryAllOption
        ? { key: "category", label: `Category: ${filters.category}` }
        : null,
      filters.institute !== courseInstituteAllOption
        ? { key: "institute", label: `Institute: ${filters.institute}` }
        : null,
      filters.engagement !== "All engagement"
        ? { key: "engagement", label: `Enrollment: ${filters.engagement}` }
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
      engagement: "All engagement",
    };

    filters[key] = defaults[key] as never;
  };

  const sortedCourses = computed(() =>
    [...analysisCourses.value].sort((a, b) => b.enrolled - a.enrolled),
  );

  const totalCourseRecords = computed(() =>
    analysisCourses.value.reduce(
      (sum, course) => sum + (course.courseCount ?? 1),
      0,
    ),
  );
  const totalEnrollments = computed(() =>
    analysisCourses.value.reduce((sum, course) => sum + course.enrolled, 0),
  );
  const groupedFamilies = computed(() => analysisCourses.value.length);

  const courseSummaryItems = computed<Metric[]>(() => [
    {
      label: "Clean Course Families",
      value: groupedFamilies.value.toLocaleString(),
      trend: "Grouped analytics course names",
      icon: "BookOpen",
      color: appColors.purple,
    },
    {
      label: "Original Moodle Course Records",
      value: totalCourseRecords.value.toLocaleString(),
      trend: "Raw course rows represented in clean groups",
      icon: "Layers",
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
      return "No course families found";
    }

    const start =
      (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
    const end = Math.min(
      pagination.value.currentPage * pagination.value.perPage,
      pagination.value.total,
    );

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${pagination.value.total.toLocaleString()} course families`;
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
    const rawItems = countCourseValues(
      (course) => course.institutes,
      (course) => course.institute,
      "No institute",
    );
    const items =
      rawItems.length > chartColors.length
        ? [
            ...rawItems.slice(0, chartColors.length - 1),
            {
              label: "Other",
              count: rawItems
                .slice(chartColors.length - 1)
                .reduce((sum, item) => sum + item.count, 0),
            },
          ]
        : rawItems;
    const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
    let offset = 0;

    return items.map((item, index) => {
      const arcPercentage = (item.count * 100) / total;
      const distributionItem = {
        ...item,
        arcOffset: offset,
        arcPercentage,
        color:
          item.label === "Other"
            ? chartOtherColor
            : chartColors[index],
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
            name: "Course families",
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

  const openCourseDetail = (
    row: Record<string, string | number | boolean | null>,
  ) => {
    const courseId = Number(row.id);
    selectedCourse.value =
      courses.value.find((course) => course.id === courseId) ?? null;
    courseDetailOpen.value = Boolean(selectedCourse.value);
  };

  const table = computed<AnalyticsTable>(() => ({
    title: "Course Families",
    icon: "i-lucide-layers-3",
    description:
      "Cleaned course-family analytics. Each row can represent one or more original Moodle course records.",
    rowKey: "id",
    columns: courseTableColumns,
    rows: paginatedCourses.value.map((course) => ({
      id: course.id,
      name: course.name,
      category: course.category,
      institute: course.institute,
      courseCount: course.courseCount ?? 1,
      enrolled: course.enrolled,
      action: "View detail",
    })),
  }));

  const exportCourses = () => {
    const rows = sortedCourses.value.map((course) => ({
      name: course.name,
      category: course.category,
      institute: course.institute,
      courseCount: course.courseCount ?? 1,
      enrolled: course.enrolled,
    }));

    void exportWithToast({
      filename: "ccun-course-families.csv",
      label: "Course CSV file",
      columns: courseTableColumns.map((column) => ({
        key: column.key,
        label: column.label,
      })),
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
    courseEngagementOptions: [...courseEngagementOptions],
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
  };
};
