import { appColors } from "~/constants/colors";
import type { AnalyticsPageConfig } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";
import type { DashboardSummaryApi } from "~/types/analytics-api";
import { formatNumber } from "~/utils/formatNumber";

const spark = (seed: number) =>
  Array.from(
    { length: 8 },
    (_, index) => seed + Math.round(Math.sin(index + seed) * 7) + index * 4,
  );

const metric = (
  label: string,
  value: string,
  trend: string,
  icon: string,
  color: string = appColors.primaryHover,
): Metric => ({
  label,
  value,
  trend,
  icon,
  color,
  sparkline: spark(Number(value.replace(/\D/g, "").slice(0, 2)) || 12),
});

export const analyticsPages: Record<string, AnalyticsPageConfig> = {
  dashboard: {
    eyebrow: "Moodle learning analytics",
    title: "Dashboard Overview",
    copy: "Global Moodle database indicators prepared from users, enrollments, completions, grades, quizzes, assignments, logs, and attendance records.",
    endpoint: "GET /api/dashboard/summary",
    roles: ["manager", "partner", "visitor"],
    metrics: [],
    filters: [],
    charts: [],
  },
};

export const createLiveDashboardMetrics = (
  summary: DashboardSummaryApi,
): Metric[] => [
  metric(
    "Total Students",
    formatNumber(summary.totalStudents),
    "Live from Moodle DB",
    "Users",
  ),
  metric(
    "Total Teachers",
    formatNumber(summary.totalTeachers),
    "Live Moodle teacher accounts",
    "UserRoundCog",
    appColors.purple,
  ),
  metric(
    "Total Courses",
    formatNumber(summary.totalCourses),
    "Excludes site course",
    "BookOpen",
    appColors.purple,
  ),
  metric(
    "Active Users",
    formatNumber(summary.totalActiveUsers),
    "Confirmed and not suspended",
    "UserRoundCheck",
    appColors.success,
  ),
  metric(
    "Inactive Users",
    formatNumber(summary.totalInactiveUsers),
    "Suspended, unconfirmed, or never logged in",
    "UserRoundX",
    appColors.warning,
  ),
  metric(
    "Total Enrollments",
    formatNumber(summary.totalEnrollments),
    "From Moodle enrollments",
    "FolderTree",
    appColors.primaryHover,
  ),
  metric(
    "Course Completions",
    formatNumber(summary.totalCourseCompletions),
    "Completed course records",
    "Check",
    appColors.success,
  ),
  metric(
    "Quiz Attempts",
    formatNumber(summary.totalQuizAttempts),
    "From Moodle quiz attempts",
    "CircleHelp",
    appColors.warning,
  ),
  metric(
    "Assignment Submissions",
    formatNumber(summary.totalAssignmentsSubmitted),
    "From Moodle assignment submissions",
    "FolderTree",
    appColors.primaryHover,
  ),
];
