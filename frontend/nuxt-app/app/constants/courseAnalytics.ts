import type { AnalyticsTableColumn } from "~/types/analytics";

export const courseCategoryAllOption = "All categories";

export const courseStatusOptions = [
  "All statuses",
  "Visible",
  "Hidden",
];

export const courseTableColumns: AnalyticsTableColumn[] = [
  { key: "name", label: "Course", rowHeader: true },
  { key: "shortName", label: "Short name", tone: "muted" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status", type: "status", warningValues: ["Hidden"] },
  { key: "enrolled", label: "Enrolled" },
  { key: "completed", label: "Completed" },
  { key: "completionRate", label: "Completion" },
  { key: "views", label: "Views" },
];
