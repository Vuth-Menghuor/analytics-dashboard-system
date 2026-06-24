import {
  getPopularCourses,
  getStudentActivityTrend,
  getStudentGenderDistribution,
  getStudentsByDepartment,
} from "~/services/analytics.service";
import type { AnalyticsChart, AnalyticsPageConfig } from "~/types/analytics";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";

const dashboardMetricLabels = [
  "Total Students",
  "Total Courses",
  "Total Enrollments",
  "Active Students",
] as const;

export const usePartnerDashboardPage = () => {
  const auth = useAuthStore();
  const {
    data: moodleDashboard,
    error: moodleDashboardError,
    isLoading: moodleDashboardLoading,
  } = useDashboard();
  const charts = ref<AnalyticsChart[]>([]);
  const chartError = ref("");
  const chartsLoading = ref(true);

  const loadCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";

    const [gender, departments, popularCourses, activityTrend] =
      await Promise.allSettled([
        getStudentGenderDistribution(),
        getStudentsByDepartment(),
        getPopularCourses(),
        getStudentActivityTrend({ period: "year" }),
      ]);

    const loadedCharts: AnalyticsChart[] = [];

    if (activityTrend.status === "fulfilled") {
      loadedCharts.push({
        title: "Student Login Activity",
        description: "Latest student login trend by year.",
        icon: "i-lucide-activity",
        type: "line",
        height: "340px",
        wide: true,
        labels: activityTrend.value.map((point) => point.period),
        series: [
          {
            name: "Students",
            data: activityTrend.value.map((point) => point.totalStudents),
          },
        ],
      });
    }

    if (departments.status === "fulfilled") {
      loadedCharts.push({
        title: "Top Departments",
        description: "Largest departments by Moodle student count.",
        icon: "i-lucide-list-ordered",
        type: "bar",
        height: "320px",
        labels: departments.value
          .slice(0, 8)
          .map((point) => formatStudentDepartmentLabel(point.department)),
        series: [
          {
            name: "Students",
            data: departments.value
              .slice(0, 8)
              .map((point) => point.totalStudents),
          },
        ],
      });
    }

    if (gender.status === "fulfilled") {
      loadedCharts.push({
        title: "Gender Distribution",
        description: "Student gender breakdown from Moodle profiles.",
        icon: "i-lucide-chart-column",
        type: "bar",
        height: "320px",
        labels: gender.value.map((point) => point.gender),
        series: [
          {
            name: "Students",
            data: gender.value.map((point) => point.totalStudents),
          },
        ],
      });
    }

    if (popularCourses.status === "fulfilled") {
      loadedCharts.push({
        title: "Popular Courses",
        description: "Courses ranked by total enrollments.",
        icon: "i-lucide-trending-up",
        type: "horizontalBar",
        height: "340px",
        labels: popularCourses.value
          .slice(0, 10)
          .map((course) => course.courseName),
        series: [
          {
            name: "Enrollments",
            data: popularCourses.value
              .slice(0, 10)
              .map((course) => course.totalEnrollments),
          },
        ],
      });
    }

    charts.value = loadedCharts;

    if (loadedCharts.length === 0) {
      chartError.value = "Unable to load partner dashboard charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadCharts);

  const partnerDashboard = computed<AnalyticsPageConfig | null>(() =>
    moodleDashboard.value
      ? {
          ...moodleDashboard.value,
          title: "Partner Dashboard",
          copy: "Institute-scoped Moodle analytics for student activity, active/inactive status, courses, and enrollment engagement.",
          metrics: moodleDashboard.value.metrics.filter((metric) =>
            dashboardMetricLabels.includes(
              metric.label as (typeof dashboardMetricLabels)[number],
            ),
          ),
          charts: charts.value,
        }
      : null,
  );

  const partnerInstituteLabel = computed(() =>
    auth.user?.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "Institute scope not assigned",
  );

  const partnerDashboardLoading = computed(() => moodleDashboardLoading.value);

  return {
    chartError,
    chartsLoading,
    partnerDashboard,
    partnerDashboardError: moodleDashboardError,
    partnerDashboardLoading,
    partnerInstituteLabel,
  };
};
