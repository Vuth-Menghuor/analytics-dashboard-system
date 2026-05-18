import {
  courseActivityTrendLabels,
  courseActivityTrendSeed,
  courseCategoryAllOption,
  courseInstituteAllOption,
  courseStatusOptions,
  courseTableColumns,
} from "~/constants/courseAnalytics";
import type { AnalyticsChart, AnalyticsTable, Course } from "~/types/analytics";

export const useCourseAnalyticsView = () => {
  const {
    courses,
    error,
    filteredCourses,
    filters,
    isLoading,
    refresh,
    selectedCourse,
  } = useCourses();

  const categories = computed(() => [
    courseCategoryAllOption,
    ...new Set(courses.value.map((course) => course.category)),
  ]);
  const institutes = computed(() => [
    courseInstituteAllOption,
    ...new Set(courses.value.map((course) => course.institute)),
  ]);

  const visibleCourses = computed(() =>
    courses.value.filter((course) => course.status === "Visible"),
  );
  const hiddenCourses = computed(() =>
    courses.value.filter((course) => course.status === "Hidden"),
  );
  const topCourse = computed(
    () => [...courses.value].sort((a, b) => b.views - a.views)[0] ?? null,
  );
  const totalEnrollments = computed(() =>
    courses.value.reduce((sum, course) => sum + course.enrolled, 0),
  );
  const totalCompleted = computed(() =>
    courses.value.reduce((sum, course) => sum + course.completed, 0),
  );
  const totalViews = computed(() =>
    courses.value.reduce((sum, course) => sum + course.views, 0),
  );
  const averageCompletion = computed(() => {
    if (!courses.value.length) {
      return 0;
    }

    return Math.round(
      courses.value.reduce((sum, course) => sum + course.completionRate, 0) /
        courses.value.length,
    );
  });
  const completionGap = computed(() =>
    Math.max(totalEnrollments.value - totalCompleted.value, 0),
  );

  const courseSummaryItems = computed(() => [
    {
      label: "Visible Courses",
      value: visibleCourses.value.length.toLocaleString(),
      detail: `${hiddenCourses.value.length} hidden course shells`,
      icon: "i-lucide-book-open-check",
    },
    {
      label: "Enrollments",
      value: totalEnrollments.value.toLocaleString(),
      detail: `${totalCompleted.value.toLocaleString()} completed learners`,
      icon: "i-lucide-users",
    },
    {
      label: "Avg. Completion",
      value: `${averageCompletion.value}%`,
      detail: `${completionGap.value.toLocaleString()} learners in progress`,
      icon: "i-lucide-circle-check-big",
    },
    {
      label: "Course Views",
      value: totalViews.value.toLocaleString(),
      detail: topCourse.value?.shortName ?? "No active course",
      icon: "i-lucide-trending-up",
    },
  ]);

  const courseHealthItems = computed(() =>
    [...filteredCourses.value]
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 3),
  );

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Enrollment by Course",
      description: "Ranked courses based on current enrollment records",
      icon: "i-lucide-users",
      type: "horizontalBar",
      labels: filteredCourses.value.map((course) => course.shortName),
      series: [
        {
          name: "Enrollments",
          data: filteredCourses.value.map((course) => course.enrolled),
        },
      ],
    },
    {
      title: "Completion Rate",
      description: "Completion percentage for each filtered course",
      icon: "i-lucide-check-circle-2",
      type: "bar",
      labels: filteredCourses.value.map((course) => course.shortName),
      series: [
        {
          name: "Completion",
          data: filteredCourses.value.map((course) => course.completionRate),
        },
      ],
    },
    {
      title: "Activity Trend",
      description: "Monthly course view trend across the catalog",
      icon: "i-lucide-trending-up",
      type: "line",
      labels: courseActivityTrendLabels,
      series: [
        {
          name: "Views",
          data: [...courseActivityTrendSeed, totalViews.value],
        },
      ],
    },
    {
      title: "Visibility Mix",
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
  ]);

  const table = computed<AnalyticsTable>(() => ({
    title: "Course List",
    icon: "i-lucide-book-open",
    description:
      "Course records from mdl_course with enrollment, completion, visibility, and view activity.",
    rowKey: "id",
    columns: courseTableColumns,
    rows: filteredCourses.value.map((course) => ({
      ...course,
      completionRate: `${course.completionRate}%`,
      action: course.id,
    })),
  }));

  const selectCourse = (id: string | number | boolean | null) => {
    selectedCourse.value =
      courses.value.find((course) => course.id === Number(id)) ?? null;
  };

  const completionTone = (course: Course) => {
    if (course.completionRate >= 70) {
      return "high";
    }

    if (course.completionRate >= 55) {
      return "medium";
    }

    return "low";
  };

  return {
    categories,
    charts,
    completionTone,
    courseHealthItems,
    courseStatusOptions: [...courseStatusOptions],
    courseSummaryItems,
    error,
    filters,
    institutes,
    isLoading,
    refresh,
    selectCourse,
    selectedCourse,
    table,
  };
};
