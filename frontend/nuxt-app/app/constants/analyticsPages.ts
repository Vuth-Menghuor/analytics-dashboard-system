import { appColors } from "~/constants/colors";
import type { AnalyticsPageConfig } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";
import type {
  DashboardMetricComparisonApi,
  DashboardSummaryApi,
  StudentGenderDistributionApi,
} from "~/types/analytics-api";
import { formatNumber } from "~/utils/formatNumber";

const metric = (
  label: string,
  value: string,
  trend: string,
  icon: string,
  color: string = appColors.primaryHover,
  options: Partial<Metric> = {},
): Metric => ({
  label,
  value,
  trend,
  icon,
  color,
  ...options,
});

const formatRate = (value: number) =>
  `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;

const formatComparisonChange = (
  comparison?: DashboardMetricComparisonApi,
) => {
  if (!comparison || comparison.percentageChange === null) {
    return undefined;
  }

  const change = comparison.percentageChange;
  const sign = change > 0 ? "+" : "";

  return `${sign}${change.toFixed(1)}%`;
};

const comparisonOptions = (
  comparison?: DashboardMetricComparisonApi,
  changePeriod = "compared to previous month",
): Partial<Metric> => {
  const change = formatComparisonChange(comparison);

  if (!change) {
    return {};
  }

  return {
    change,
    changeDirection: comparison?.direction ?? "neutral",
    changePeriod,
  };
};

const createGenderBreakdown = (
  genderDistribution: StudentGenderDistributionApi[],
) => {
  if (genderDistribution.length === 0) {
    return [];
  }

  const getGenderCount = (genderName: "Female" | "Male") =>
    genderDistribution.find((point) => point.gender === genderName)
      ?.totalStudents ?? 0;

  return [
    { label: "Female", value: formatNumber(getGenderCount("Female")) },
    { label: "Male", value: formatNumber(getGenderCount("Male")) },
  ];
};

export const analyticsPages: Record<string, AnalyticsPageConfig> = {
  dashboard: {
    eyebrow: "Moodle learning analytics",
    title: "Dashboard Overview",
    copy: "Decision-support summary for student activity, enrollment scale, course completion, and institutional contribution from Moodle analytics data.",
    endpoint: "GET /api/dashboard/summary",
    roles: ["manager", "partner", "visitor"],
    metrics: [],
    filters: [],
    charts: [],
  },
};

export const createLiveDashboardMetrics = (
  summary: DashboardSummaryApi,
  genderDistribution: StudentGenderDistributionApi[] = [],
  activeGenderDistribution: StudentGenderDistributionApi[] = [],
): Metric[] => {
  const completionRate =
    summary.totalEnrollments > 0
      ? (summary.totalCourseCompletions * 100) / summary.totalEnrollments
      : 0;
  const activeStudentRate =
    summary.totalStudents > 0
      ? (summary.totalActiveStudents * 100) / summary.totalStudents
      : 0;

  return [
    metric(
      "Total Students",
      formatNumber(summary.totalStudents),
      `${formatNumber(summary.totalInactiveStudents)} inactive students need follow-up`,
      "Users",
      appColors.slate,
      {
        ...comparisonOptions(
          summary.comparisons?.totalStudents,
          "student access compared to previous month",
        ),
        breakdown: createGenderBreakdown(genderDistribution),
      },
    ),
    metric(
      "Active Students",
      formatNumber(summary.totalActiveStudents),
      `${formatRate(activeStudentRate)} of students are active`,
      "UserRoundCheck",
      appColors.success,
      {
        ...comparisonOptions(summary.comparisons?.activeStudents),
        breakdown: createGenderBreakdown(activeGenderDistribution),
      },
    ),
    metric(
      "Course Completion Rate",
      formatRate(completionRate),
      `${formatNumber(summary.totalCourseCompletions)} completed course records`,
      "Check",
      appColors.amber,
      comparisonOptions(summary.comparisons?.courseCompletionRate),
    ),
    metric(
      "Total Enrollments",
      formatNumber(summary.totalEnrollments),
      "Learner-course participation records",
      "FolderTree",
      appColors.blue,
      comparisonOptions(summary.comparisons?.totalEnrollments),
    ),
    metric(
      "Total Courses",
      formatNumber(summary.totalCourses),
      "Excludes Moodle site course",
      "BookOpen",
      appColors.purple,
      comparisonOptions(
        summary.comparisons?.totalCourses,
        "courses starting this month vs previous month",
      ),
    ),
  ];
};
