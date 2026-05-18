import type { AnalyticsTableColumn, Student } from "~/types/analytics";

export const studentInstituteAllOption = "All institutes";
export const studentDepartmentAllOption = "All departments";
export const studentCityAllOption = "All cities";

export const studentGenderOptions = ["All genders", "Male", "Female"];
export const studentStatusOptions = ["All statuses", "Active", "Suspended"];

export const studentTableColumns: AnalyticsTableColumn[] = [
  { key: "name", label: "Student", rowHeader: true, width: "18%" },
  { key: "studentCode", label: "ID", tone: "muted", width: "12%" },
  { key: "email", label: "Email", tone: "muted", width: "18%" },
  { key: "institute", label: "Institute", width: "8%" },
  { key: "department", label: "Department", width: "14%" },
  {
    key: "status",
    label: "Status",
    type: "status",
    warningValues: ["Suspended"],
    width: "9%",
  },
  {
    key: "riskLevel",
    label: "Risk",
    type: "status",
    warningValues: ["Medium", "High"],
    width: "8%",
  },
  { key: "averageGrade", label: "Grade", width: "7%" },
  { key: "action", label: "Profile", type: "action", width: "8%" },
];

export const studentActivityTimeline = [
  {
    time: "09:14",
    title: "Quiz attempt completed",
    meta: "Sok Dara submitted Database Quiz 3 with 84%.",
  },
  {
    time: "10:30",
    title: "Assignment uploaded",
    meta: "Monyneath Keo submitted Web Security Lab 2.",
  },
  {
    time: "11:42",
    title: "Course resource viewed",
    meta: "Kimleang Touch opened Data Visualization module resources.",
  },
  {
    time: "14:05",
    title: "Attendance warning",
    meta: "Rotha Chhim dropped below 70% attendance.",
  },
] as const;

export const studentProfileStats: Array<{
  label: string;
  key: keyof Student;
  suffix?: string;
}> = [
  { label: "Last login", key: "lastLogin" },
  { label: "Enrollments", key: "enrollments" },
  { label: "Completions", key: "completions" },
  { label: "Average grade", key: "averageGrade", suffix: "%" },
  { label: "Attendance", key: "attendanceRate", suffix: "%" },
  { label: "Quiz average", key: "quizAverage", suffix: "%" },
  { label: "Assignments", key: "assignmentSubmissionRate", suffix: "%" },
  { label: "Learning hours", key: "learningHours" },
];

export const studentProfileDetails: Array<{
  label: string;
  key: keyof Student;
  type?: "boolean";
}> = [
  { label: "Institute", key: "institute" },
  { label: "Department", key: "department" },
  { label: "City", key: "city" },
  { label: "Confirmed", key: "confirmed", type: "boolean" },
];
