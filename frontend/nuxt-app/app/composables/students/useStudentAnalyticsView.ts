import {
  studentActivityTimeline,
  studentCityAllOption,
  studentDepartmentAllOption,
  studentGenderOptions,
  studentInstituteAllOption,
  studentStatusOptions,
  studentTableColumns,
} from "~/constants/studentAnalytics";
import { appColors } from "~/constants/colors";
import type { AnalyticsChart, AnalyticsTable, Student } from "~/types/analytics";

const average = (values: number[]) =>
  Math.round(
    values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1),
  );

export const useStudentAnalyticsView = () => {
  const { error, filteredStudents, filters, isLoading, refresh, students } =
    useStudents();
  const selectedStudent = ref<Student | null>(null);
  const profileOpen = ref(false);

  const institutes = computed(() => [
    studentInstituteAllOption,
    ...new Set(students.value.map((student) => student.institute)),
  ]);
  const departments = computed(() => [
    studentDepartmentAllOption,
    ...new Set(students.value.map((student) => student.department)),
  ]);
  const cities = computed(() => [
    studentCityAllOption,
    ...new Set(students.value.map((student) => student.city)),
  ]);

  const activeStudents = computed(() =>
    students.value.filter((student) => student.status === "Active"),
  );
  const highRiskStudents = computed(() =>
    students.value.filter((student) => student.riskLevel === "High"),
  );
  const completionRate = computed(() => {
    const completions = students.value.reduce(
      (sum, student) => sum + student.completions,
      0,
    );
    const enrollments = students.value.reduce(
      (sum, student) => sum + student.enrollments,
      0,
    );

    return Math.round((completions / Math.max(enrollments, 1)) * 100);
  });

  const heroStats = computed(() => [
    {
      label: "Avg grade",
      value: `${average(students.value.map((student) => student.averageGrade))}%`,
    },
    {
      label: "Avg attendance",
      value: `${average(students.value.map((student) => student.attendanceRate ?? 0))}%`,
    },
    {
      label: "Learning hours",
      value: students.value
        .reduce((sum, student) => sum + student.learningHours, 0)
        .toLocaleString(),
    },
  ]);

  const metrics = computed(() => [
    {
      label: "Total Students",
      value: students.value.length.toLocaleString(),
      trend: "+12.5% from latest Moodle import",
      icon: "Users",
      color: appColors.primaryHover,
      sparkline: [22, 26, 31, 38, 42, 48, 52, 58],
    },
    {
      label: "Active Students",
      value: activeStudents.value.length.toLocaleString(),
      trend: `${Math.round((activeStudents.value.length / Math.max(students.value.length, 1)) * 100)}% currently active`,
      icon: "UserRoundCheck",
      color: appColors.success,
      sparkline: [18, 21, 29, 34, 39, 42, 47, 51],
    },
    {
      label: "Completion Rate",
      value: `${completionRate.value}%`,
      trend: "Course completions / enrollments",
      icon: "Check",
      color: appColors.purple,
      sparkline: [42, 46, 51, 53, 58, 61, 64, completionRate.value],
    },
    {
      label: "At-Risk Students",
      value: highRiskStudents.value.length.toLocaleString(),
      trend: "Needs follow-up based on grades and attendance",
      icon: "CircleHelp",
      color: appColors.warning,
      sparkline: [8, 7, 7, 6, 5, 5, 4, highRiskStudents.value.length],
    },
  ]);

  const countBy = (key: keyof Student) => {
    const totals = new Map<string, number>();
    students.value.forEach((student) => {
      const value = student[key];
      if (value === undefined || value === null) {
        return;
      }

      totals.set(String(value), (totals.get(String(value)) ?? 0) + 1);
    });

    return totals;
  };

  const byInstitute = computed(() => countBy("institute"));
  const byCity = computed(() => countBy("city"));
  const riskCounts = computed(() => countBy("riskLevel"));

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Students by Institute",
      description: "Distribution from Moodle user profile institution fields.",
      icon: "i-lucide-building-2",
      type: "bar",
      labels: [...byInstitute.value.keys()],
      series: [{ name: "Students", data: [...byInstitute.value.values()] }],
    },
    {
      title: "Students by City",
      description: "Useful for partner reporting and regional engagement.",
      icon: "i-lucide-map-pin",
      type: "bar",
      labels: [...byCity.value.keys()],
      series: [{ name: "Students", data: [...byCity.value.values()] }],
    },
    {
      title: "Gender Distribution",
      icon: "i-lucide-pie-chart",
      type: "donut",
      labels: ["Male", "Female"],
      series: [
        {
          name: "Students",
          data: [
            students.value.filter((student) => student.gender === "Male").length,
            students.value.filter((student) => student.gender === "Female").length,
          ],
        },
      ],
    },
    {
      title: "Active vs Suspended Users",
      icon: "i-lucide-user-round-check",
      type: "donut",
      labels: ["Active", "Suspended"],
      series: [
        {
          name: "Users",
          data: [
            students.value.filter((student) => student.status === "Active").length,
            students.value.filter((student) => student.status === "Suspended").length,
          ],
        },
      ],
    },
    {
      title: "Student Risk Levels",
      description:
        "Static sample signal using grade, attendance, and submission patterns.",
      icon: "i-lucide-triangle-alert",
      type: "donut",
      labels: ["Low", "Medium", "High"],
      series: [
        {
          name: "Students",
          data: [
            riskCounts.value.get("Low") ?? 0,
            riskCounts.value.get("Medium") ?? 0,
            riskCounts.value.get("High") ?? 0,
          ],
        },
      ],
    },
    {
      title: "Grade vs Attendance Snapshot",
      icon: "i-lucide-bar-chart-3",
      type: "bar",
      labels: ["Avg Grade", "Attendance", "Quiz Avg", "Submissions"],
      series: [
        {
          name: "Percent",
          data: [
            average(students.value.map((student) => student.averageGrade)),
            average(students.value.map((student) => student.attendanceRate ?? 0)),
            average(students.value.map((student) => student.quizAverage ?? 0)),
            average(
              students.value.map(
                (student) => student.assignmentSubmissionRate ?? 0,
              ),
            ),
          ],
        },
      ],
    },
  ]);

  const table = computed<AnalyticsTable>(() => ({
    title: "Student List",
    icon: "i-lucide-users",
    description:
      "Static sample table based on Moodle user, enrollment, completion, grade, last access, and activity fields.",
    rowKey: "id",
    columns: studentTableColumns,
    rows: filteredStudents.value.map((student) => ({
      ...student,
      averageGrade: `${student.averageGrade}%`,
      action: student.id,
    })),
  }));

  const topStudents = computed(() =>
    [...students.value]
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, 5),
  );

  const atRiskStudents = computed(() =>
    students.value
      .filter(
        (student) =>
          student.riskLevel === "High" || student.status === "Suspended",
      )
      .slice(0, 4),
  );

  const viewStudent = (id: number | string | boolean | null | undefined) => {
    if (id === undefined || id === null) {
      selectedStudent.value = null;
      profileOpen.value = false;
      return;
    }

    selectedStudent.value =
      students.value.find((student) => student.id === Number(id)) ?? null;
    profileOpen.value = Boolean(selectedStudent.value);
  };

  return {
    activityTimeline: studentActivityTimeline,
    atRiskStudents,
    charts,
    cities,
    departments,
    error,
    filters,
    genderOptions: [...studentGenderOptions],
    heroStats,
    institutes,
    isLoading,
    metrics,
    profileOpen,
    refresh,
    selectedStudent,
    statusOptions: [...studentStatusOptions],
    table,
    topStudents,
    viewStudent,
  };
};
