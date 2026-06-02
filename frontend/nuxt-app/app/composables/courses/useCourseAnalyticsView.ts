import {
  courseCategoryAllOption,
  courseStatusOptions,
  courseTableColumns,
} from "~/constants/courseAnalytics";
import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";
import { appColors } from "~/constants/colors";
import {
  getCourseCompletion,
  getCourseViews,
  getPopularCourses,
  type CourseCompletionApi,
  type CourseViewsApi,
  type PopularCourseApi,
} from "~/services/analytics.service";

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
    }),
  ]);

export const useCourseAnalyticsView = () => {
  const auth = useAuthStore();
  const {
    courses,
    error,
    filteredCourses,
    filters,
    isLoading,
    refresh,
  } = useCourses();
  const popularCourses = ref<PopularCourseApi[]>([]);
  const completionCourses = ref<CourseCompletionApi[]>([]);
  const viewedCourses = ref<CourseViewsApi[]>([]);
  const chartError = ref("");
  const chartsLoading = ref(true);
  const currentPage = ref(1);
  const perPage = ref(10);
  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );

  const loadLiveCourseCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";

    const [popular, completion, views] = await Promise.allSettled([
      getPopularCourses(),
      getCourseCompletion(),
      withTimeout(getCourseViews(), 8000),
    ]);

    if (popular.status === "fulfilled") {
      popularCourses.value = popular.value;
    }

    if (completion.status === "fulfilled") {
      completionCourses.value = completion.value;
    }

    if (views.status === "fulfilled") {
      viewedCourses.value = views.value;
    }

    if (
      popular.status === "rejected" &&
      completion.status === "rejected" &&
      views.status === "rejected"
    ) {
      chartError.value = "Unable to load live course charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadLiveCourseCharts);

  const categories = computed(() => [
    courseCategoryAllOption,
    ...new Set(courses.value.map((course) => course.category)),
  ]);

  const visibleCourses = computed(() =>
    courses.value.filter((course) => course.status === "Visible"),
  );
  const hiddenCourses = computed(() =>
    courses.value.filter((course) => course.status === "Hidden"),
  );
  const totalEnrollments = computed(() =>
    courses.value.reduce((sum, course) => sum + course.enrolled, 0),
  );
  const totalCompleted = computed(() =>
    courses.value.reduce((sum, course) => sum + course.completed, 0),
  );
  const completionGap = computed(() =>
    Math.max(totalEnrollments.value - totalCompleted.value, 0),
  );

  const courseSummaryItems = computed<Metric[]>(() => [
    {
      label: "Total Courses",
      value: courses.value.length.toLocaleString(),
      trend: "Imported Moodle courses",
      icon: "BookOpen",
      color: appColors.purple,
    },
    {
      label: "Visible Courses",
      value: visibleCourses.value.length.toLocaleString(),
      trend: "Available to learners",
      icon: "Eye",
      color: appColors.success,
    },
    {
      label: "Hidden Courses",
      value: hiddenCourses.value.length.toLocaleString(),
      trend: "Hidden Moodle course shells",
      icon: "EyeOff",
      color: appColors.warning,
    },
    {
      label: "Total Enrollments",
      value: totalEnrollments.value.toLocaleString(),
      trend: "Distinct enrolled learners",
      icon: "Users",
      color: appColors.primaryHover,
    },
    {
      label: "Total Completions",
      value: totalCompleted.value.toLocaleString(),
      trend: `${completionGap.value.toLocaleString()} learners in progress`,
      icon: "Check",
      color: appColors.success,
    },
  ]);

  const pagination = computed(() => {
    const total = filteredCourses.value.length;
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

    return filteredCourses.value.slice(start, start + pagination.value.perPage);
  });

  const paginationLabel = computed(() => {
    if (pagination.value.total === 0) {
      return "No courses found";
    }

    const start =
      (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
    const end = Math.min(
      pagination.value.currentPage * pagination.value.perPage,
      pagination.value.total,
    );

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${pagination.value.total.toLocaleString()}`;
  });

  const goToPage = (page: number) => {
    currentPage.value = Math.min(Math.max(page, 1), pagination.value.lastPage);
  };

  const setPerPage = (nextPerPage: number) => {
    perPage.value = nextPerPage;
    currentPage.value = 1;
  };

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

  const charts = computed<AnalyticsChart[]>(() => {
    const chartItems: AnalyticsChart[] = [
      {
        title: "Popular Courses",
        description: "Top courses by total enrollments",
        icon: "i-lucide-users",
        type: "horizontalBar",
        labels: popularCourses.value.map((course) => course.courseName),
        series: [
          {
            name: "Enrollments",
            data: popularCourses.value.map((course) => course.totalEnrollments),
          },
        ],
      },
      {
        title: "Course Completion Rate",
        description: "Top courses by course completion percentage",
        icon: "i-lucide-check-circle-2",
        type: "bar",
        labels: completionCourses.value.map((course) => course.courseName),
        series: [
          {
            name: "Completion",
            data: completionCourses.value.map(
              (course) => course.completionRatePercentage,
            ),
          },
        ],
      },
      {
        title: "Visible vs Hidden Courses",
        description: "Visible courses compared with hidden course shells",
        icon: "i-lucide-eye",
        type: "donut",
        labels: ["Visible", "Hidden"],
        series: [
          {
            name: "Courses",
            data: [visibleCourses.value.length, hiddenCourses.value.length],
          },
        ],
      },
    ];

    if (viewedCourses.value.length) {
      chartItems.splice(2, 0, {
        title: "Most Viewed Courses",
        description: "Top courses by Moodle log views",
        icon: "i-lucide-trending-up",
        type: "horizontalBar",
        labels: viewedCourses.value.map((course) => course.courseName),
        series: [
          {
            name: "Views",
            data: viewedCourses.value.map((course) => course.totalViews),
          },
        ],
      });
    }

    return chartItems;
  });

  const table = computed<AnalyticsTable>(() => ({
    title: "Course List",
    icon: "i-lucide-book-open",
    description:
      "Course records from mdl_course with enrollment, completion, visibility, and view activity.",
    rowKey: "id",
    columns: courseTableColumns,
    rows: paginatedCourses.value.map((course) => ({
      ...course,
      completionRate: `${course.completionRate}%`,
      views: course.views.toLocaleString(),
    })),
  }));

  return {
    categories,
    chartError,
    charts,
    chartsLoading,
    courseStatusOptions: [...courseStatusOptions],
    courseSummaryItems,
    error,
    filters,
    goToPage,
    isLoading,
    pagination,
    paginationLabel,
    partnerInstituteLabel,
    refresh,
    setPerPage,
    table,
  };
};
