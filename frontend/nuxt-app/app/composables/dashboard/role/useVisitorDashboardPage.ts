import { visitorPublicDashboardCopy } from "~/constants/roleDashboards";
import {
  getPopularCourses,
  getStudentGenderDistribution,
  getStudentsByDepartment,
} from "~/services/analytics.service";
import type { AnalyticsChart } from "~/types/analytics";

export const useVisitorDashboardPage = () => {
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

    const [gender, departments, popularCourses] = await Promise.allSettled([
      getStudentGenderDistribution(),
      getStudentsByDepartment(),
      getPopularCourses(),
    ]);

    const loadedCharts: AnalyticsChart[] = [];

    if (departments.status === "fulfilled") {
      loadedCharts.push({
        title: "Top Departments",
        description: "Public summary of the largest Moodle departments.",
        icon: "i-lucide-list-ordered",
        type: "horizontalBar",
        labels: departments.value.slice(0, 8).map((point) => point.department),
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
        description: "Public student gender distribution summary.",
        icon: "i-lucide-pie-chart",
        type: "donut",
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
        description: "Public course popularity by enrollments.",
        icon: "i-lucide-trending-up",
        type: "horizontalBar",
        labels: popularCourses.value
          .slice(0, 8)
          .map((course) => course.courseName),
        series: [
          {
            name: "Enrollments",
            data: popularCourses.value
              .slice(0, 8)
              .map((course) => course.totalEnrollments),
          },
        ],
      });
    }

    charts.value = loadedCharts;

    if (loadedCharts.length === 0) {
      chartError.value = "Unable to load public dashboard charts.";
    }

    chartsLoading.value = false;
  };

  onMounted(loadCharts);

  const publicMoodleDashboard = computed(() =>
    moodleDashboard.value
      ? {
          ...moodleDashboard.value,
          title: "Public Moodle Analytics",
          copy: visitorPublicDashboardCopy,
          metrics: moodleDashboard.value.metrics.slice(0, 4),
          charts: charts.value,
        }
      : null,
  );

  const publicMoodleDashboardError = computed(
    () => moodleDashboardError.value || chartError.value,
  );

  const publicMoodleDashboardLoading = computed(
    () => moodleDashboardLoading.value || chartsLoading.value,
  );

  return {
    moodleDashboardError: publicMoodleDashboardError,
    moodleDashboardLoading: publicMoodleDashboardLoading,
    publicMoodleDashboard,
  };
};
