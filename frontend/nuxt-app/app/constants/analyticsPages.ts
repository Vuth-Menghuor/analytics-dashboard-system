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

export const analyticsPages = {
  dashboard: {
    eyebrow: "Moodle learning analytics",
    title: "Dashboard Overview",
    copy: "Decision-support summary for student activity, active/inactive status, enrollment scale, and institutional contribution from Moodle analytics data.",
    endpoint: "GET /api/dashboard/summary",
    roles: ["manager", "partner", "visitor"],
    metrics: [],
    filters: [],
    charts: [],
  },
} satisfies Record<"dashboard", AnalyticsPageConfig>;

export const createLiveDashboardMetrics = (
  summary: DashboardSummaryApi,
  genderDistribution: StudentGenderDistributionApi[] = [],
  activeGenderDistribution: StudentGenderDistributionApi[] = [],
): Metric[] => {
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
      "Inactive Students",
      formatNumber(summary.totalInactiveStudents),
      `${formatRate(100 - activeStudentRate)} may need follow-up`,
      "UserRoundX",
      appColors.amber,
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
