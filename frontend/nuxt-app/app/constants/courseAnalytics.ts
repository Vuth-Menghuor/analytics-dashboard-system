import type { AnalyticsTableColumn } from "~/types/analytics";

export const courseCategoryAllOption = "All categories";
export const courseInstituteAllOption = "All institutes";

export const courseStatusOptions = [
  "All statuses",
  "Visible",
  "Hidden",
];

export const courseActivityTrendLabels = ["Jan", "Feb", "Mar", "Apr", "May"];
export const courseActivityTrendSeed = [18200, 21400, 23800, 26900];

export const courseTableColumns: AnalyticsTableColumn[] = [
  { key: "name", label: "Course", rowHeader: true },
  { key: "shortName", label: "Short name", tone: "muted" },
  { key: "category", label: "Category" },
  { key: "institute", label: "Institute" },
  { key: "status", label: "Status", type: "status", warningValues: ["Hidden"] },
  { key: "enrolled", label: "Enrolled" },
  { key: "completionRate", label: "Completion" },
  { key: "action", label: "Detail", type: "action" },
];
