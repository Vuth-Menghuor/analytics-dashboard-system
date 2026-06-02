import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import type { Metric } from "~/types/dashboard";

export type RiskLevel = "Low" | "Medium" | "High";

export type RiskStudent = {
  id: number;
  name: string;
  course: string;
  lastLogin: string;
  completions: number;
  quizAttempts: number;
  assignmentSubmissions: number;
  riskLevel: RiskLevel;
};

export type LearningPerformancePreview = {
  metrics: Metric[];
  charts: AnalyticsChart[];
  previewSummary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  riskRules: string[];
  riskStudents: RiskStudent[];
  riskTable: AnalyticsTable;
};
