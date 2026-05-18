import type { AnalyticsTableColumn } from "~/types/analytics";

export const reportFilterOptions = {
  ranges: ["Last 7 days", "Last 30 days", "This semester"],
  institutes: ["All institutes", "ITC", "RUPP", "NUM", "NPIC"],
  courses: ["All courses", "DB-MDL-401", "LDA-210", "BUS-STATS"],
  statuses: ["All students", "Active", "Suspended"],
} as const;

export const savedReports = [
  {
    id: 1,
    name: "Monthly Moodle Engagement",
    owner: "Manager",
    format: "PDF",
    status: "Ready",
    action: 1,
  },
  {
    id: 2,
    name: "Course Completion Audit",
    owner: "Partner",
    format: "Excel",
    status: "Draft",
    action: 2,
  },
  {
    id: 3,
    name: "Quiz and Grade Summary",
    owner: "Manager",
    format: "CSV",
    status: "Ready",
    action: 3,
  },
] as const;

export const savedReportColumns: AnalyticsTableColumn[] = [
  { key: "name", label: "Report", rowHeader: true },
  { key: "owner", label: "Owner", tone: "muted" },
  { key: "format", label: "Format" },
  { key: "status", label: "Status", type: "status", warningValues: ["Draft"] },
  { key: "action", label: "Export", type: "action" },
];
