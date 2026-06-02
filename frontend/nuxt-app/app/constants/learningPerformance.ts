import { appColors } from "~/constants/colors";
import type {
  LearningPerformancePreview,
  RiskStudent,
} from "~/types/learningPerformance";

export const learningPerformanceMetrics = [
  {
    label: "Average Grade",
    value: "74%",
    trend: "Static preview",
    icon: "GraduationCap",
    color: appColors.success,
  },
  {
    label: "Quiz Success Rate",
    value: "68%",
    trend: "API later",
    icon: "CircleHelp",
    color: appColors.primaryHover,
  },
  {
    label: "Assignment Submission",
    value: "81%",
    trend: "Static preview",
    icon: "FileCheck2",
    color: appColors.purple,
  },
  {
    label: "High Risk Students",
    value: "24",
    trend: "Rule preview",
    icon: "TriangleAlert",
    color: appColors.warning,
  },
] satisfies LearningPerformancePreview["metrics"];

export const riskStudents: RiskStudent[] = [
  {
    id: 1,
    name: "Student A",
    course: "Database Systems",
    lastLogin: "Never logged in",
    completions: 0,
    quizAttempts: 0,
    assignmentSubmissions: 0,
    riskLevel: "High",
  },
  {
    id: 2,
    name: "Student B",
    course: "Web Development",
    lastLogin: "32 days ago",
    completions: 0,
    quizAttempts: 1,
    assignmentSubmissions: 0,
    riskLevel: "High",
  },
  {
    id: 3,
    name: "Student C",
    course: "Data Analytics",
    lastLogin: "12 days ago",
    completions: 1,
    quizAttempts: 2,
    assignmentSubmissions: 1,
    riskLevel: "Medium",
  },
  {
    id: 4,
    name: "Student D",
    course: "Learning Design",
    lastLogin: "Yesterday",
    completions: 3,
    quizAttempts: 4,
    assignmentSubmissions: 4,
    riskLevel: "Low",
  },
];

export const learningPerformancePreview: LearningPerformancePreview = {
  metrics: learningPerformanceMetrics,
  previewSummary: [
    {
      label: "Data status",
      value: "Static preview",
      detail: "No grade, quiz, assignment, or risk endpoint is connected yet.",
    },
    {
      label: "Future scope",
      value: "Role based",
      detail: "Partner users will receive only their approved institute data.",
    },
    {
      label: "Next API",
      value: "Learning performance",
      detail: "CSV/report exports can be added after live endpoints exist.",
    },
  ],
  charts: [
    {
      title: "Average Grade by Course",
      description: "Static preview of course grade averages",
      icon: "i-lucide-graduation-cap",
      type: "horizontalBar",
      labels: [
        "Database Systems",
        "Web Development",
        "Data Analytics",
        "Learning Design",
        "Network Fundamentals",
      ],
      series: [{ name: "Average grade", data: [79, 73, 82, 76, 69] }],
    },
    {
      title: "Quiz Success Rate",
      description: "Static preview of quiz pass/fail share",
      icon: "i-lucide-circle-help",
      type: "donut",
      labels: ["Passed", "Needs support"],
      series: [{ name: "Quiz success", data: [68, 32] }],
    },
    {
      title: "Assignment Submission Rate",
      description: "Static preview of submitted vs missing work",
      icon: "i-lucide-file-check-2",
      type: "donut",
      labels: ["Submitted", "Missing"],
      series: [{ name: "Assignments", data: [81, 19] }],
    },
    {
      title: "Student Risk Level",
      description: "Static preview based on engagement rules",
      icon: "i-lucide-triangle-alert",
      type: "donut",
      labels: ["Low", "Medium", "High"],
      series: [{ name: "Students", data: [184, 57, 24] }],
    },
  ],
  riskRules: [
    "Never logged in = higher risk",
    "No course completion = higher risk",
    "No quiz attempt = higher risk",
    "No assignment submission = higher risk",
  ],
  riskStudents,
  riskTable: {
    title: "Risk Student Table",
    icon: "i-lucide-triangle-alert",
    description: "Static preview of student risk indicators. API will be connected later.",
    rowKey: "id",
    columns: [
      { key: "name", label: "Student", rowHeader: true },
      { key: "course", label: "Course" },
      { key: "lastLogin", label: "Last login", tone: "muted" },
      { key: "completions", label: "Completions" },
      { key: "quizAttempts", label: "Quiz attempts" },
      { key: "assignmentSubmissions", label: "Submissions" },
      {
        key: "riskLevel",
        label: "Risk",
        type: "status",
        warningValues: ["High", "Medium"],
      },
    ],
    rows: riskStudents,
  },
};
