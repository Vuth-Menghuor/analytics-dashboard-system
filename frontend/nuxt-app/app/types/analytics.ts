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

export type ChartType =
  | "line"
  | "bar"
  | "horizontalBar"
  | "pie"
  | "donut"
  | "halfDonut";

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
  wide?: boolean;
  visibleItems?: number;
  showAllCategories?: boolean;
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

export type AnalyticsTableRow = Record<
  string,
  string | number | boolean | null
>;

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
  avatarUrl?: string | null;
  avatarAlt?: string | null;
  institute: string;
  department: string;
  city: string;
  gender: "Male" | "Female" | "Not filled";
  status: "Active" | "Inactive";
  confirmed: boolean;
  lastLogin: string;
  lastCourse?: string;
  enrollments: number;
  learningHours: number;
  attendanceRate?: number;
  riskLevel?: "Low" | "Medium" | "High";
};

export type Course = {
  id: number;
  name: string;
  rawName?: string;
  nameAdjusted?: boolean;
  qualityStatus?: string;
  shortName: string;
  category: string;
  categories?: string[];
  categoryCount?: number;
  courseCount?: number;
  institute: string;
  institutes?: string[];
  instituteCount?: number;
  status: "Active" | "No enrollments";
  enrolled: number;
  views: number;
  moodleCourses?: Array<{
    id: number;
    originalName: string;
    cleanName: string;
    shortName: string;
    category: string;
    enrollments: number;
  }>;
};
