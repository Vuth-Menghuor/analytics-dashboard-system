import { appColors } from "~/constants/colors";
import type {
  AnalyticsPageConfig,
  Course,
  Student,
} from "~/types/analytics";
import type { Metric } from "~/types/dashboard";

const spark = (seed: number) =>
  Array.from({ length: 8 }, (_, index) => seed + Math.round(Math.sin(index + seed) * 7) + index * 4);

const metric = (label: string, value: string, trend: string, icon: string, color = appColors.primaryHover): Metric => ({
  label,
  value,
  trend,
  icon,
  color,
  sparkline: spark(Number(value.replace(/\D/g, "").slice(0, 2)) || 12),
});

export const dashboardSummaryMetrics: Metric[] = [
  metric("Total Students", "12,847", "+12.5% from last import", "Users"),
  metric("Total Teachers", "642", "+18 new accounts", "GraduationCap", appColors.success),
  metric("Total Courses", "1,284", "+41 visible courses", "BookOpen", appColors.purple),
  metric("Total Active Users", "9,820", "+7.4% active", "UserRoundCheck", appColors.success),
  metric("Total Inactive Users", "3,027", "-2.1% inactive", "UserCircle", appColors.warning),
  metric("Total Enrollments", "38,420", "+2,140 records", "FolderTree", appColors.primaryHover),
  metric("Course Completions", "7,956", "+9.8% completed", "Check", appColors.success),
  metric("Quiz Attempts", "28,491", "+1,282 attempts", "CircleHelp", appColors.purple),
  metric("Assignment Submissions", "18,204", "+844 submitted", "FileBarChart", appColors.primaryHover),
  metric("Attendance Records", "54,810", "+3,901 logs", "CalendarCheck", appColors.warning),
];

export const students: Student[] = [
  { id: 1, studentCode: "ITC-2026-001", name: "Sok Dara", username: "sok.dara", email: "dara@student.edu", institute: "ITC", department: "Computer Science", city: "Phnom Penh", gender: "Male", status: "Active", confirmed: true, lastLogin: "Today, 09:14", lastCourse: "Database Systems for Moodle Analytics", enrollments: 7, completions: 4, averageGrade: 86, learningHours: 42, attendanceRate: 92, quizAverage: 84, assignmentSubmissionRate: 96, riskLevel: "Low" },
  { id: 2, studentCode: "RUPP-2026-014", name: "Chan Lina", username: "chan.lina", email: "lina@student.edu", institute: "RUPP", department: "Business", city: "Siem Reap", gender: "Female", status: "Active", confirmed: true, lastLogin: "Yesterday, 18:22", lastCourse: "Learning Design and Assessment", enrollments: 5, completions: 3, averageGrade: 78, learningHours: 31, attendanceRate: 84, quizAverage: 76, assignmentSubmissionRate: 88, riskLevel: "Low" },
  { id: 3, studentCode: "NUM-2026-022", name: "Vannak Rith", username: "vannak.rith", email: "rith@student.edu", institute: "NUM", department: "Finance", city: "Battambang", gender: "Male", status: "Suspended", confirmed: false, lastLogin: "Apr 30, 2026", lastCourse: "Business Statistics", enrollments: 3, completions: 1, averageGrade: 58, learningHours: 12, attendanceRate: 61, quizAverage: 55, assignmentSubmissionRate: 52, riskLevel: "High" },
  { id: 4, studentCode: "NPIC-2026-033", name: "Nita Phal", username: "nita.phal", email: "nita@student.edu", institute: "NPIC", department: "Engineering", city: "Kampot", gender: "Female", status: "Active", confirmed: true, lastLogin: "May 14, 2026", lastCourse: "Engineering Mathematics", enrollments: 6, completions: 5, averageGrade: 91, learningHours: 49, attendanceRate: 96, quizAverage: 89, assignmentSubmissionRate: 100, riskLevel: "Low" },
  { id: 5, studentCode: "URDSE-2026-007", name: "Heng Bora", username: "heng.bora", email: "bora@student.edu", institute: "URDSE", department: "Data Science", city: "Phnom Penh", gender: "Male", status: "Active", confirmed: true, lastLogin: "May 13, 2026", lastCourse: "Data Visualization Workshop", enrollments: 4, completions: 2, averageGrade: 73, learningHours: 26, attendanceRate: 79, quizAverage: 70, assignmentSubmissionRate: 81, riskLevel: "Medium" },
  { id: 6, studentCode: "ITC-2026-041", name: "Monyneath Keo", username: "monyneath.keo", email: "monyneath@student.edu", institute: "ITC", department: "Information Systems", city: "Phnom Penh", gender: "Female", status: "Active", confirmed: true, lastLogin: "Today, 11:42", lastCourse: "Web Application Security", enrollments: 6, completions: 3, averageGrade: 82, learningHours: 38, attendanceRate: 88, quizAverage: 81, assignmentSubmissionRate: 93, riskLevel: "Low" },
  { id: 7, studentCode: "RUPP-2026-052", name: "Piseth Long", username: "piseth.long", email: "piseth@student.edu", institute: "RUPP", department: "Education", city: "Kandal", gender: "Male", status: "Active", confirmed: true, lastLogin: "May 12, 2026", lastCourse: "Learning Design and Assessment", enrollments: 4, completions: 2, averageGrade: 66, learningHours: 18, attendanceRate: 72, quizAverage: 64, assignmentSubmissionRate: 68, riskLevel: "Medium" },
  { id: 8, studentCode: "NUM-2026-061", name: "Sreypov Meas", username: "sreypov.meas", email: "sreypov@student.edu", institute: "NUM", department: "Accounting", city: "Takeo", gender: "Female", status: "Active", confirmed: true, lastLogin: "May 11, 2026", lastCourse: "Business Statistics", enrollments: 5, completions: 4, averageGrade: 88, learningHours: 44, attendanceRate: 94, quizAverage: 87, assignmentSubmissionRate: 98, riskLevel: "Low" },
  { id: 9, studentCode: "NPIC-2026-070", name: "Rotha Chhim", username: "rotha.chhim", email: "rotha@student.edu", institute: "NPIC", department: "Civil Engineering", city: "Kampong Cham", gender: "Male", status: "Active", confirmed: false, lastLogin: "May 8, 2026", lastCourse: "Engineering Mathematics", enrollments: 3, completions: 1, averageGrade: 62, learningHours: 15, attendanceRate: 69, quizAverage: 59, assignmentSubmissionRate: 64, riskLevel: "High" },
  { id: 10, studentCode: "URDSE-2026-082", name: "Kimleang Touch", username: "kimleang.touch", email: "kimleang@student.edu", institute: "URDSE", department: "Data Science", city: "Phnom Penh", gender: "Female", status: "Active", confirmed: true, lastLogin: "Today, 08:06", lastCourse: "Data Visualization Workshop", enrollments: 5, completions: 4, averageGrade: 90, learningHours: 51, attendanceRate: 95, quizAverage: 92, assignmentSubmissionRate: 99, riskLevel: "Low" },
  { id: 11, studentCode: "ITC-2026-093", name: "Sovannara Yin", username: "sovannara.yin", email: "sovannara@student.edu", institute: "ITC", department: "Computer Science", city: "Prey Veng", gender: "Male", status: "Active", confirmed: true, lastLogin: "May 10, 2026", lastCourse: "Database Systems for Moodle Analytics", enrollments: 4, completions: 2, averageGrade: 71, learningHours: 24, attendanceRate: 77, quizAverage: 69, assignmentSubmissionRate: 74, riskLevel: "Medium" },
  { id: 12, studentCode: "RUPP-2026-104", name: "Theary Noun", username: "theary.noun", email: "theary@student.edu", institute: "RUPP", department: "Education", city: "Siem Reap", gender: "Female", status: "Suspended", confirmed: false, lastLogin: "Apr 27, 2026", lastCourse: "Learning Design and Assessment", enrollments: 2, completions: 0, averageGrade: 49, learningHours: 8, attendanceRate: 48, quizAverage: 46, assignmentSubmissionRate: 40, riskLevel: "High" },
];

export const courses: Course[] = [
  { id: 1, name: "Database Systems for Moodle Analytics", shortName: "DB-MDL-401", category: "Computer Science", institute: "ITC", status: "Visible", enrolled: 420, completed: 286, completionRate: 68, views: 12840 },
  { id: 2, name: "Learning Design and Assessment", shortName: "LDA-210", category: "Education", institute: "RUPP", status: "Visible", enrolled: 312, completed: 221, completionRate: 71, views: 9340 },
  { id: 3, name: "Business Statistics", shortName: "BUS-STATS", category: "Business", institute: "NUM", status: "Visible", enrolled: 284, completed: 166, completionRate: 58, views: 7620 },
  { id: 4, name: "Engineering Mathematics", shortName: "ENG-MATH", category: "Engineering", institute: "NPIC", status: "Hidden", enrolled: 198, completed: 82, completionRate: 41, views: 4380 },
  { id: 5, name: "Data Visualization Workshop", shortName: "DATAVIZ", category: "Data Science", institute: "URDSE", status: "Visible", enrolled: 164, completed: 119, completionRate: 73, views: 5910 },
];

export const dashboardCharts = [
  { title: "Active vs Inactive Users", icon: "i-lucide-user-round-check", type: "donut", labels: ["Active", "Inactive"], series: [{ name: "Users", data: [9820, 3027] }] },
  { title: "Students by Institute", icon: "i-lucide-building-2", type: "bar", labels: ["ITC", "RUPP", "NUM", "NPIC", "URDSE"], series: [{ name: "Students", data: [4200, 3800, 2900, 747, 1200] }] },
  { title: "Course Completion Rate", icon: "i-lucide-check-circle-2", type: "bar", labels: ["ITC", "RUPP", "NUM", "NPIC", "URDSE"], series: [{ name: "Completion", data: [72, 68, 61, 54, 74] }] },
  { title: "Monthly User Activity", icon: "i-lucide-activity", type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], series: [{ name: "Activity", data: [6200, 7100, 7600, 8200, 9100, 9820] }] },
  { title: "Top 10 Active Courses", icon: "i-lucide-bar-chart-3", type: "horizontalBar", labels: ["DB-MDL", "LDA", "Stats", "DataViz", "Math", "English", "Java", "SCORM", "Quiz Lab", "Research"], series: [{ name: "Activity", data: [98, 94, 87, 82, 80, 76, 72, 70, 68, 64] }] },
] as AnalyticsPageConfig["charts"];

export const analyticsPages: Record<string, AnalyticsPageConfig> = {
  dashboard: {
    eyebrow: "Moodle learning analytics",
    title: "Dashboard Overview",
    copy: "Global Moodle database indicators prepared from users, enrollments, completions, grades, quizzes, assignments, logs, and attendance records.",
    endpoint: "GET /api/dashboard/summary",
    roles: ["manager", "partner", "visitor"],
    metrics: dashboardSummaryMetrics,
    filters: [{ key: "period", label: "Period", type: "select", options: ["Last 7 days", "Last 30 days", "This semester"] }],
    charts: dashboardCharts,
  },
  activity: {
    eyebrow: "Learning behavior",
    title: "Learning Activity",
    copy: "Monitor Moodle logs, views, attendance, assignment, quiz, SCORM, and resource access patterns.",
    endpoint: "GET /api/analytics/activity",
    roles: ["manager", "partner"],
    metrics: [metric("Daily Active Users", "3,204", "+8.2% today", "Activity"), metric("Weekly Events", "84,120", "+11.3% logs", "TrendingUp", appColors.success), metric("Learning Hours", "18,640", "+1,204 hours", "Clock", appColors.purple), metric("Resource Views", "62,950", "+9.1% views", "BookOpen")],
    filters: [{ key: "date", label: "Date range", type: "select", options: ["Today", "Last 7 days", "Last 30 days"] }, { key: "institute", label: "Institute", type: "select", options: ["All institutes", "ITC", "RUPP", "NUM", "NPIC"] }],
    charts: [
      { title: "Daily Active Users", icon: "i-lucide-activity", type: "line", labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], series: [{ name: "Users", data: [2100, 2420, 2880, 3204, 3040, 1810, 1560] }] },
      { title: "Weekly Activity Trend", icon: "i-lucide-trending-up", type: "bar", labels: ["W1", "W2", "W3", "W4"], series: [{ name: "Events", data: [64000, 70120, 78400, 84120] }] },
      { title: "Monthly Activity Trend", icon: "i-lucide-calendar-days", type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May"], series: [{ name: "Events", data: [180000, 210000, 238000, 252000, 274000] }] },
      { title: "Activity Type Distribution", icon: "i-lucide-pie-chart", type: "donut", labels: ["Views", "Quiz", "Assignment", "Attendance", "SCORM"], series: [{ name: "Events", data: [48, 18, 16, 12, 6] }] },
      { title: "Learning Time / Dedication", icon: "i-lucide-clock-3", type: "bar", labels: ["ITC", "RUPP", "NUM", "NPIC", "URDSE"], series: [{ name: "Hours", data: [5200, 4600, 3400, 2140, 3300] }] },
    ],
    table: {
      title: "Recently Accessed Courses",
      icon: "i-lucide-clock-3",
      columns: [{ key: "item", label: "Course or item", rowHeader: true }, { key: "student", label: "Student", tone: "muted" }, { key: "type", label: "Type" }, { key: "lastAccess", label: "Last access" }],
      rows: [{ item: "Database Systems / Quiz 3", student: "Sok Dara", type: "Quiz", lastAccess: "Today, 09:14" }, { item: "Learning Design / Assignment 2", student: "Chan Lina", type: "Assignment", lastAccess: "Yesterday" }],
      rowKey: "item",
    },
  },
  assignments: {
    eyebrow: "Assessment analytics",
    title: "Assignment Analytics",
    copy: "Track submission status, grading progress, late submissions, and assignment grade patterns.",
    endpoint: "GET /api/analytics/assignments",
    roles: ["manager", "partner"],
    metrics: [metric("Total Assignments", "842", "+22 new", "FileBarChart"), metric("Total Submissions", "18,204", "+844 submitted", "Check", appColors.success), metric("Late Submissions", "1,284", "-3.1% late", "Clock", appColors.warning), metric("Ungraded", "2,146", "+320 pending", "CircleHelp", appColors.purple)],
    filters: [{ key: "course", label: "Course", type: "select", options: ["All courses", "DB-MDL-401", "LDA-210", "BUS-STATS"] }, { key: "status", label: "Status", type: "select", options: ["All", "Submitted", "Not submitted", "Late"] }],
    charts: [
      { title: "Assignment Submission Status", icon: "i-lucide-check-circle-2", type: "donut", labels: ["Submitted", "Not submitted", "Late"], series: [{ name: "Submissions", data: [18204, 3920, 1284] }] },
      { title: "Assignment Grade Distribution", icon: "i-lucide-bar-chart-3", type: "bar", labels: ["0-49", "50-64", "65-79", "80-89", "90-100"], series: [{ name: "Students", data: [640, 2180, 5200, 7040, 3144] }] },
      { title: "Top Assignments by Submission", icon: "i-lucide-trending-up", type: "horizontalBar", labels: ["A1", "A2", "Lab 1", "Project", "Reflection"], series: [{ name: "Submissions", data: [840, 790, 720, 680, 640] }] },
    ],
    table: { title: "Assignment Table", icon: "i-lucide-table", columns: [{ key: "assignment", label: "Assignment", rowHeader: true }, { key: "course", label: "Course", tone: "muted" }, { key: "submissions", label: "Submissions" }, { key: "averageGrade", label: "Average grade" }], rows: [{ assignment: "Database Project", course: "DB-MDL-401", submissions: 386, averageGrade: "82%" }, { assignment: "Learning Reflection", course: "LDA-210", submissions: 280, averageGrade: "78%" }], rowKey: "assignment" },
  },
  quizzes: {
    eyebrow: "Quiz performance",
    title: "Quiz Analytics",
    copy: "Review quiz attempts, scoring spread, highest and lowest performance, and pass/fail trends.",
    endpoint: "GET /api/analytics/quizzes",
    roles: ["manager", "partner"],
    metrics: [metric("Total Quizzes", "214", "+7 quizzes", "CircleHelp"), metric("Quiz Attempts", "28,491", "+1,282 attempts", "TrendingUp"), metric("Average Score", "76%", "+4.2 points", "Check", appColors.success), metric("Pass Rate", "81%", "+3.8 points", "UserRoundCheck", appColors.success)],
    filters: [{ key: "course", label: "Course", type: "select", options: ["All courses", "DB-MDL-401", "LDA-210"] }],
    charts: [
      { title: "Quiz Attempt Trend", icon: "i-lucide-trending-up", type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May"], series: [{ name: "Attempts", data: [4200, 5100, 5600, 6200, 7391] }] },
      { title: "Quiz Score Distribution", icon: "i-lucide-bar-chart-3", type: "bar", labels: ["0-49", "50-64", "65-79", "80-89", "90-100"], series: [{ name: "Attempts", data: [920, 3100, 7200, 9800, 7471] }] },
      { title: "Pass vs Fail Rate", icon: "i-lucide-pie-chart", type: "donut", labels: ["Pass", "Fail"], series: [{ name: "Rate", data: [81, 19] }] },
    ],
    table: { title: "Quiz Table", icon: "i-lucide-table", columns: [{ key: "quiz", label: "Quiz", rowHeader: true }, { key: "course", label: "Course", tone: "muted" }, { key: "attempts", label: "Attempts" }, { key: "average", label: "Average score" }, { key: "status", label: "Status", type: "status", warningValues: ["Needs review"] }], rows: [{ quiz: "Midterm Quiz", course: "DB-MDL-401", attempts: 420, average: "79%", status: "Healthy" }, { quiz: "Statistics Quiz 2", course: "BUS-STATS", attempts: 286, average: "61%", status: "Needs review" }], rowKey: "quiz" },
  },
  grades: {
    eyebrow: "Grades and outcomes",
    title: "Grade Analytics",
    copy: "Compare grade distributions, average grade by course, student rankings, and low-performance signals.",
    endpoint: "GET /api/analytics/grades",
    roles: ["manager", "partner"],
    metrics: [metric("Average Student Grade", "78%", "+3.1 points", "GraduationCap"), metric("Top Performers", "1,204", "+96 students", "TrendingUp", appColors.success), metric("Low Performers", "842", "-44 students", "CircleHelp", appColors.warning), metric("Grade Items", "4,820", "+240 items", "FileBarChart")],
    filters: [{ key: "course", label: "Course", type: "select", options: ["All courses", "DB-MDL-401", "LDA-210"] }],
    charts: [
      { title: "Grade Distribution", icon: "i-lucide-bar-chart-3", type: "bar", labels: ["0-49", "50-64", "65-79", "80-89", "90-100"], series: [{ name: "Students", data: [842, 2100, 4380, 3620, 1905] }] },
      { title: "Average Grade by Course", icon: "i-lucide-book-open", type: "bar", labels: ["DB-MDL", "LDA", "Stats", "DataViz", "Math"], series: [{ name: "Average", data: [82, 78, 69, 86, 71] }] },
      { title: "Student Performance Ranking", icon: "i-lucide-trophy", type: "horizontalBar", labels: ["Nita", "Dara", "Lina", "Bora", "Rith"], series: [{ name: "Grade", data: [91, 86, 78, 73, 58] }] },
    ],
  },
  attendance: {
    eyebrow: "Presence tracking",
    title: "Attendance Analytics",
    copy: "Track Moodle attendance sessions, present, absent, late, and course-level attendance behavior.",
    endpoint: "GET /api/analytics/attendance",
    roles: ["manager", "partner"],
    metrics: [metric("Attendance Sessions", "3,420", "+180 sessions", "CalendarCheck"), metric("Present Count", "42,806", "+2,120 present", "Check", appColors.success), metric("Absent Count", "8,914", "-3.4% absent", "X", appColors.warning), metric("Late Count", "3,090", "+120 late", "Clock", appColors.purple)],
    filters: [{ key: "course", label: "Course", type: "select", options: ["All courses", "DB-MDL-401", "LDA-210"] }],
    charts: [
      { title: "Attendance Status Chart", icon: "i-lucide-pie-chart", type: "donut", labels: ["Present", "Absent", "Late"], series: [{ name: "Attendance", data: [42806, 8914, 3090] }] },
      { title: "Attendance Trend", icon: "i-lucide-trending-up", type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May"], series: [{ name: "Present", data: [7800, 8120, 8400, 8970, 9516] }] },
      { title: "Attendance by Course", icon: "i-lucide-book-open", type: "bar", labels: ["DB-MDL", "LDA", "Stats", "DataViz", "Math"], series: [{ name: "Attendance %", data: [88, 84, 76, 91, 73] }] },
    ],
  },
};

export const getDashboardSummary = async () => analyticsPages.dashboard;
export const getAnalyticsPage = async (key: string) => analyticsPages[key];
export const getStudents = async () => students;
export const getStudent = async (id: number) => students.find((student) => student.id === id) ?? null;
export const getCourses = async () => courses;
export const getCourse = async (id: number) => courses.find((course) => course.id === id) ?? null;
