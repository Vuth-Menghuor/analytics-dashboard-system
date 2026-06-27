import type { AnalyticsTableColumn } from "~/types/analytics";

export const courseCategoryAllOption = "All categories";
export const courseInstituteAllOption = "All institutes";

export const courseTableColumns: AnalyticsTableColumn[] = [
  { key: "id", label: "Course ID", width: "96px" },
  { key: "name", label: "Course name", rowHeader: true, width: "440px" },
  { key: "category", label: "Category", width: "260px" },
  { key: "institute", label: "Institute", width: "220px" },
  { key: "courseCount", label: "Moodle course records", width: "190px" },
  { key: "enrolled", label: "Enrollment records", width: "180px" },
  { key: "action", label: "Action", type: "action", width: "110px" },
];
