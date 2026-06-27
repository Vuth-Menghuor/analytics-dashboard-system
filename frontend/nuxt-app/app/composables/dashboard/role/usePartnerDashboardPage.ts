import {
  getInstituteAnalytics,
  getStudentGenderDistribution,
  getStudentsByDepartment,
} from "~/services/analytics.service";
import type { AnalyticsChart, AnalyticsPageConfig } from "~/types/analytics";
import type {
  StudentGenderDistributionApi,
} from "~/types/analytics-api";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { createGenderDistributionOption } from "~/utils/genderDistributionChart";

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
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);

  const loadCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";

    const [gender, departments, institutes] =
      await Promise.allSettled([
        getStudentGenderDistribution(),
        getStudentsByDepartment(),
        getInstituteAnalytics(),
      ]);

    const loadedCharts: AnalyticsChart[] = [];

    if (institutes.status === "fulfilled") {
      loadedCharts.push({
        title: "Enrollment Trend",
        description: "Monthly enrollment records across the selected scope.",
        icon: "i-lucide-trending-up",
        type: "line",
        height: "340px",
        wide: true,
        labels: institutes.value.enrollmentTrend.map((point) => point.period),
        series: [
          {
            name: "Enrollment records",
            data: institutes.value.enrollmentTrend.map(
              (point) => point.enrollments,
            ),
          },
        ],
      });
    }

    if (gender.status === "fulfilled") {
      genderDistribution.value = gender.value;
      loadedCharts.push({
        title: "Gender Distribution",
        description: "Student gender breakdown from Moodle profiles.",
        icon: "i-lucide-pie-chart",
        type: "donut",
        height: "360px",
        labels: gender.value.map((point) => point.gender),
        series: [
          {
            name: "Students",
            data: gender.value.map((point) => point.totalStudents),
          },
        ],
      });
    }

    if (departments.status === "fulfilled") {
      loadedCharts.push({
        title: "Students by Department",
        description: "Student totals across all Moodle departments.",
        icon: "i-lucide-list-ordered",
        type: "horizontalBar",
        height: "360px",
        compact: true,
        badge: `${departments.value
          .reduce((total, point) => total + point.totalStudents, 0)
          .toLocaleString()} students`,
        visibleItems: 8,
        labels: departments.value.map((point) =>
          formatStudentDepartmentLabel(point.department),
        ),
        series: [
          {
            name: "Students",
            data: departments.value.map((point) => point.totalStudents),
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
          copy: "Institute-scoped Moodle analytics for student login status, courses, and enrollment context.",
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
  const chartOptions = computed(() => ({
    "Gender Distribution": createGenderDistributionOption(
      genderDistribution.value,
    ),
  }));

  return {
    chartError,
    chartOptions,
    chartsLoading,
    partnerDashboard,
    partnerDashboardError: moodleDashboardError,
    partnerDashboardLoading,
    partnerInstituteLabel,
  };
};
