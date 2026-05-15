import type { Metric } from "~/types/dashboard";

export type AnalyticsRole = "manager" | "partner" | "visitor";

export type FilterType = "search" | "select" | "date";

export type AnalyticsFilter = {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: string[];
};

export type ChartType = "line" | "bar" | "horizontalBar" | "pie" | "donut";

export type ChartSeries = {
  name: string;
  data: number[];
};

export type AnalyticsChart = {
  title: string;
  description?: string;
  icon: string;
  type: ChartType;
  labels: string[];
  series: ChartSeries[];
  height?: string;
};

export type AnalyticsTableColumn = {
  key: string;
  label: string;
  width?: string;
  tone?: "default" | "muted" | "strong";
  rowHeader?: boolean;
  type?: "text" | "status" | "action";
  warningValues?: Array<string | number | boolean>;
};

export type AnalyticsTableRow = Record<string, string | number | boolean | null>;

export type AnalyticsTable = {
  title: string;
  icon: string;
  description?: string;
  columns: AnalyticsTableColumn[];
  rows: AnalyticsTableRow[];
  rowKey: string;
};

export type AnalyticsPageConfig = {
  eyebrow: string;
  title: string;
  copy: string;
  endpoint: string;
  roles: AnalyticsRole[];
  metrics: Metric[];
  filters: AnalyticsFilter[];
  charts: AnalyticsChart[];
  table?: AnalyticsTable;
  emptyTitle?: string;
  emptyDescription?: string;
};

export type Student = {
  id: number;
  studentCode?: string;
  name: string;
  username: string;
  email: string;
  institute: string;
  department: string;
  city: string;
  gender: "Male" | "Female";
  status: "Active" | "Suspended";
  confirmed: boolean;
  lastLogin: string;
  lastCourse?: string;
  enrollments: number;
  completions: number;
  averageGrade: number;
  learningHours: number;
  attendanceRate?: number;
  quizAverage?: number;
  assignmentSubmissionRate?: number;
  riskLevel?: "Low" | "Medium" | "High";
};

export type Course = {
  id: number;
  name: string;
  shortName: string;
  category: string;
  institute: string;
  status: "Visible" | "Hidden";
  enrolled: number;
  completed: number;
  completionRate: number;
  views: number;
};
