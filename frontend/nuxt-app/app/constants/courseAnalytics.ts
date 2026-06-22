import type { AnalyticsTableColumn } from "~/types/analytics";

export const courseCategoryAllOption = "All categories";
export const courseInstituteAllOption = "All institutes";

export const courseEngagementOptions = [
  "All engagement",
  "No enrollments",
  "Has enrollments",
];

export const courseTableColumns: AnalyticsTableColumn[] = [
  { key: "id", label: "Course ID" },
  { key: "name", label: "Course name", rowHeader: true },
  { key: "category", label: "Category" },
  { key: "institute", label: "Institute" },
  { key: "courseCount", label: "Moodle course records" },
  { key: "enrolled", label: "Enrollment records" },
  { key: "action", label: "Action", type: "action" },
];
