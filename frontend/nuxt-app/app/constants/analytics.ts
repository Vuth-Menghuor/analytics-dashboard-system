export const analyticsOverviewPeriods = [
  "Last 7 days",
  "Last 30 days",
  "Quarter to date",
] as const;

export const recentCourseColumns = [
  { key: "fullname", label: "Course", width: "34%", rowHeader: true },
  { key: "shortname", label: "Short name", width: "32%", tone: "muted" },
  {
    key: "visible",
    label: "Status",
    width: "14%",
    type: "status",
    trueLabel: "Visible",
    falseLabel: "Hidden",
  },
  { key: "updated_at", label: "Updated", width: "20%" },
] as const;
