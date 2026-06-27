import { visitorPublicDashboardCopy } from "~/constants/roleDashboards";
import {
  getPublicDashboardSummary,
  getPublicInstituteAnalytics,
  getPublicStudentGenderDistribution,
  getPublicStudentsByDepartment,
  getPublicStudentsByInstitution,
} from "~/services/analytics.service";
import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import type {
  DashboardChartFilters,
  InstituteAnalyticsResponse,
  StudentGenderDistributionApi,
} from "~/types/analytics-api";
import { studentInstituteAllOption } from "~/constants/studentAnalytics";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";
import { createGenderDistributionOption } from "~/utils/genderDistributionChart";

const dashboardMetricLabels = [
  "Total Students",
  "Total Courses",
  "Total Enrollments",
  "Active Students",
] as const;

export const useVisitorDashboardPage = () => {
  const moodleDashboard = ref<Awaited<
    ReturnType<typeof getPublicDashboardSummary>
  > | null>(null);
  const moodleDashboardError = ref("");
  const moodleDashboardLoading = ref(true);
  const charts = ref<AnalyticsChart[]>([]);
  const chartError = ref("");
  const chartsLoading = ref(true);
  const allInstitutions = ref<string[]>([]);
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const instituteAnalytics = ref<InstituteAnalyticsResponse | null>(null);
  const instituteFilterDraft = ref(studentInstituteAllOption);
  const selectedInstituteFilter = ref(studentInstituteAllOption);

  const getChartFilters = (): DashboardChartFilters =>
    selectedInstituteFilter.value === studentInstituteAllOption
      ? {}
      : { institution: selectedInstituteFilter.value };

  const loadCharts = async () => {
    chartsLoading.value = true;
    chartError.value = "";
    const chartFilters = getChartFilters();

    const [institutions, gender, departments, institutes] =
      await Promise.allSettled([
        getPublicStudentsByInstitution(),
        getPublicStudentGenderDistribution(chartFilters),
        getPublicStudentsByDepartment(chartFilters),
        getPublicInstituteAnalytics(chartFilters),
      ]);

    const loadedCharts: AnalyticsChart[] = [];

    if (institutions.status === "fulfilled") {
      allInstitutions.value = institutions.value.map(
        (point) => point.institution,
      );
    }

    if (institutes.status === "fulfilled") {
      instituteAnalytics.value = institutes.value;
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
        description: "Public student gender distribution summary.",
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
      chartError.value = "Unable to load public dashboard charts.";
    }

    chartsLoading.value = false;
  };

  const loadDashboard = async () => {
    moodleDashboardLoading.value = true;
    moodleDashboardError.value = "";

    try {
      moodleDashboard.value = await getPublicDashboardSummary();
    } catch {
      moodleDashboardError.value = "Unable to load public dashboard summary.";
    } finally {
      moodleDashboardLoading.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([loadDashboard(), loadCharts()]);
  });

  const instituteFilterOptions = computed(() =>
    [
      studentInstituteAllOption,
      ...allInstitutions.value,
    ].map((institute) => ({
      label:
        institute === studentInstituteAllOption
          ? institute
          : formatStudentInstituteLabel(institute),
      value: institute,
    })),
  );
  const hasInstituteFilter = computed(
    () => selectedInstituteFilter.value !== studentInstituteAllOption,
  );
  const hasOverviewFilters = computed(() => hasInstituteFilter.value);
  const applyOverviewFilters = async () => {
    selectedInstituteFilter.value = instituteFilterDraft.value;
    await loadCharts();
  };
  const clearOverviewFilters = async () => {
    instituteFilterDraft.value = studentInstituteAllOption;
    selectedInstituteFilter.value = studentInstituteAllOption;
    await loadCharts();
  };

  const publicMoodleDashboard = computed(() =>
    moodleDashboard.value
      ? {
          ...moodleDashboard.value,
          title: "Public Moodle Analytics",
          copy: visitorPublicDashboardCopy,
          metrics: moodleDashboard.value.metrics.filter((metric) =>
            dashboardMetricLabels.includes(
              metric.label as (typeof dashboardMetricLabels)[number],
            ),
          ),
          charts: charts.value,
        }
      : null,
  );

  const publicMoodleDashboardError = computed(
    () => moodleDashboardError.value || chartError.value,
  );

  const publicMoodleDashboardLoading = computed(() => moodleDashboardLoading.value);
  const instituteTable = computed<AnalyticsTable>(() => ({
    title: "Institute List",
    icon: "i-lucide-building-2",
    description:
      "All institutes in the current scope with student, course, and enrollment totals.",
    rowKey: "institute",
    columns: [
      { key: "institute", label: "Institute", rowHeader: true, width: "220px" },
      { key: "students", label: "Students", align: "right", width: "130px" },
      { key: "courses", label: "Courses", align: "right", width: "130px" },
      {
        key: "enrollmentRecords",
        label: "Enrollment Records",
        align: "right",
        width: "170px",
      },
    ],
    rows: (instituteAnalytics.value?.institutes ?? []).map((row) => ({
      institute: formatStudentInstituteLabel(row.institution),
      students: row.students.toLocaleString(),
      courses: row.courses.toLocaleString(),
      enrollmentRecords: row.enrollmentRecords.toLocaleString(),
    })),
  }));
  const chartOptions = computed(() => ({
    "Gender Distribution": createGenderDistributionOption(
      genderDistribution.value,
    ),
  }));

  return {
    applyOverviewFilters,
    chartOptions,
    clearOverviewFilters,
    hasOverviewFilters,
    instituteFilterDraft,
    instituteFilterOptions,
    instituteTable,
    moodleDashboardError: publicMoodleDashboardError,
    moodleDashboardLoading: publicMoodleDashboardLoading,
    publicMoodleDashboard,
  };
};
