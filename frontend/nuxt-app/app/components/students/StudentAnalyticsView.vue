<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import StudentProfileDrawer from "~/components/students/StudentProfileDrawer.vue";
import type {
  AnalyticsChart,
  AnalyticsTable,
  Student,
} from "~/types/analytics";
import { appColors } from "~/constants/colors";

const { error, filteredStudents, filters, isLoading, refresh, students } =
  useStudents();
const selectedStudent = ref<Student | null>(null);
const profileOpen = ref(false);

const institutes = computed(() => [
  "All institutes",
  ...new Set(students.value.map((student) => student.institute)),
]);
const departments = computed(() => [
  "All departments",
  ...new Set(students.value.map((student) => student.department)),
]);
const cities = computed(() => [
  "All cities",
  ...new Set(students.value.map((student) => student.city)),
]);

const average = (values: number[]) =>
  Math.round(
    values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1),
  );
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
  students.value.forEach((student) =>
    totals.set(
      String(student[key]),
      (totals.get(String(student[key])) ?? 0) + 1,
    ),
  );
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
          students.value.filter((student) => student.gender === "Female")
            .length,
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
          students.value.filter((student) => student.status === "Active")
            .length,
          students.value.filter((student) => student.status === "Suspended")
            .length,
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
  columns: [
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
  ],
  rows: filteredStudents.value.map((student) => ({
    ...student,
    averageGrade: `${student.averageGrade}%`,
    action: student.id,
  })),
}));

const activityTimeline = computed(() => [
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
]);

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
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Static Moodle sample"
      title="Student Analytics"
      copy="Explore a sample Moodle student analytics screen with searchable user records, institute filters, engagement summaries, profile details, risk signals, grades, attendance, and activity snapshots."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">Static sample data</UBadge>
        <UBadge color="neutral" variant="soft">GET /api/students later</UBadge>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          label="Reload sample"
          @click="refresh"
        />
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="student-sample-hero">
        <div>
          <p class="eyebrow">Sample cohort overview</p>
          <h2>Moodle Learning Behavior Cohort</h2>
          <p>
            This static sample combines fields from mdl_user,
            mdl_user_enrolments, mdl_course_completions, mdl_grade_grades,
            mdl_logstore_standard_log, mdl_user_lastaccess, and attendance
            records.
          </p>
        </div>
        <div class="student-sample-hero-stats">
          <div>
            <span>Avg grade</span>
            <strong
              >{{
                average(students.map((student) => student.averageGrade))
              }}%</strong
            >
          </div>
          <div>
            <span>Avg attendance</span>
            <strong
              >{{
                average(students.map((student) => student.attendanceRate ?? 0))
              }}%</strong
            >
          </div>
          <div>
            <span>Learning hours</span>
            <strong>{{
              students.reduce((sum, student) => sum + student.learningHours, 0)
            }}</strong>
          </div>
        </div>
      </section>

      <UCard :ui="{ body: 'analytics-filter-bar' }">
        <div class="analytics-filter-field wide">
          <label>Search</label>
          <UInput
            v-model="filters.query"
            icon="i-lucide-search"
            placeholder="Search name, email, or username"
          />
        </div>
        <div class="analytics-filter-field">
          <label>Institute</label>
          <USelect v-model="filters.institute" :items="institutes" />
        </div>
        <div class="analytics-filter-field">
          <label>Department</label>
          <USelect v-model="filters.department" :items="departments" />
        </div>
        <div class="analytics-filter-field">
          <label>City</label>
          <USelect v-model="filters.city" :items="cities" />
        </div>
        <div class="analytics-filter-field">
          <label>Gender</label>
          <USelect
            v-model="filters.gender"
            :items="['All genders', 'Male', 'Female']"
          />
        </div>
        <div class="analytics-filter-field">
          <label>Status</label>
          <USelect
            v-model="filters.status"
            :items="['All statuses', 'Active', 'Suspended']"
          />
        </div>
      </UCard>

      <section class="grid metrics">
        <MetricCard
          v-for="metricItem in metrics"
          :key="metricItem.label"
          :metric="metricItem"
        />
      </section>

      <section class="grid student-insight-grid">
        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-trophy" />
              Top Performing Students
            </h2>
            <p>Ranked by current average grade.</p>
          </div>
          <div class="student-rank-list">
            <div v-for="(student, index) in topStudents" :key="student.id">
              <span>{{ index + 1 }}</span>
              <strong>{{ student.name }}</strong>
              <em>{{ student.averageGrade }}%</em>
            </div>
          </div>
        </UCard>

        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-triangle-alert" />
              Students Needing Follow-up
            </h2>
            <p>High risk or suspended accounts.</p>
          </div>
          <div class="student-risk-list">
            <div v-for="student in atRiskStudents" :key="student.id">
              <div>
                <strong>{{ student.name }}</strong>
                <span>{{ student.institute }} · {{ student.department }}</span>
              </div>
              <UBadge
                :color="student.riskLevel === 'High' ? 'warning' : 'neutral'"
                variant="soft"
              >
                {{ student.riskLevel }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-clock-3" />
              Daily Activity Timeline
            </h2>
            <p>Sample events from Moodle logs.</p>
          </div>
          <div class="student-timeline">
            <div v-for="event in activityTimeline" :key="event.time">
              <span>{{ event.time }}</span>
              <div>
                <strong>{{ event.title }}</strong>
                <p>{{ event.meta }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard
          v-for="chart in charts"
          :key="chart.title"
          :chart="chart"
        />
      </section>

      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1280px"
      >
        <template #cell-action="{ value }">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-eye"
            label="View"
            @click="viewStudent(value)"
          />
        </template>
      </DashboardDataTable>
    </template>

    <StudentProfileDrawer v-model="profileOpen" :student="selectedStudent" />
  </div>
</template>
