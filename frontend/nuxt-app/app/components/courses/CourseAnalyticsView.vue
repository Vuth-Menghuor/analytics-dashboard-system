<script setup lang="ts">
import type { AnalyticsChart, AnalyticsTable, Course } from "~/types/analytics";

const { courses, error, filteredCourses, filters, isLoading, refresh, selectedCourse } = useCourses();

const categories = computed(() => ["All categories", ...new Set(courses.value.map((course) => course.category))]);
const institutes = computed(() => ["All institutes", ...new Set(courses.value.map((course) => course.institute))]);

const charts = computed<AnalyticsChart[]>(() => [
  { title: "Top Courses by Enrollment", icon: "i-lucide-users", type: "horizontalBar", labels: courses.value.map((course) => course.shortName), series: [{ name: "Enrollments", data: courses.value.map((course) => course.enrolled) }] },
  { title: "Course Completion Rate", icon: "i-lucide-check-circle-2", type: "bar", labels: courses.value.map((course) => course.shortName), series: [{ name: "Completion", data: courses.value.map((course) => course.completionRate) }] },
  { title: "Course Activity Trend", icon: "i-lucide-trending-up", type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May"], series: [{ name: "Views", data: [18200, 21400, 23800, 26900, courses.value.reduce((sum, course) => sum + course.views, 0)] }] },
]);

const metrics = computed(() => [
  { label: "Total Courses", value: courses.value.length.toLocaleString(), trend: "+41 visible courses", icon: "BookOpen", sparkline: [20, 24, 28, 30, 33, 36, 39, 42] },
  { label: "Enrolled Students", value: courses.value.reduce((sum, course) => sum + course.enrolled, 0).toLocaleString(), trend: "+2,140 records", icon: "Users", sparkline: [80, 96, 112, 124, 139, 148, 161, 174] },
  { label: "Completed Students", value: courses.value.reduce((sum, course) => sum + course.completed, 0).toLocaleString(), trend: "+9.8% completed", icon: "Check", sparkline: [44, 52, 63, 70, 82, 91, 98, 106] },
  { label: "Most Viewed", value: courses.value[0]?.views.toLocaleString() ?? "0", trend: courses.value[0]?.shortName ?? "No course", icon: "TrendingUp", sparkline: [120, 140, 170, 210, 260, 320, 380, 440] },
]);

const table = computed<AnalyticsTable>(() => ({
  title: "Course List",
  icon: "i-lucide-book-open",
  description: "Course records from mdl_course with enrollment, completion, visibility, and view activity.",
  rowKey: "id",
  columns: [
    { key: "name", label: "Course", rowHeader: true },
    { key: "shortName", label: "Short name", tone: "muted" },
    { key: "category", label: "Category" },
    { key: "institute", label: "Institute" },
    { key: "status", label: "Status", type: "status", warningValues: ["Hidden"] },
    { key: "enrolled", label: "Enrolled" },
    { key: "completionRate", label: "Completion" },
    { key: "action", label: "Detail", type: "action" },
  ],
  rows: filteredCourses.value.map((course) => ({
    ...course,
    completionRate: `${course.completionRate}%`,
    action: course.id,
  })),
}));

const selectCourse = (id: string | number | boolean | null) => {
  selectedCourse.value = courses.value.find((course) => course.id === Number(id)) ?? null;
};
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Course analytics"
      title="Course Analytics"
      copy="Analyze Moodle courses by category, institute, visibility, enrollment, completion percentage, and activity trend."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/courses</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Refresh" @click="refresh" />
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <UCard :ui="{ body: 'analytics-filter-bar' }">
        <div class="analytics-filter-field wide">
          <label>Search</label>
          <UInput v-model="filters.query" icon="i-lucide-search" placeholder="Course name or short name" />
        </div>
        <div class="analytics-filter-field">
          <label>Category</label>
          <USelect v-model="filters.category" :items="categories" />
        </div>
        <div class="analytics-filter-field">
          <label>Institute</label>
          <USelect v-model="filters.institute" :items="institutes" />
        </div>
        <div class="analytics-filter-field">
          <label>Status</label>
          <USelect v-model="filters.status" :items="['All statuses', 'Visible', 'Hidden']" />
        </div>
      </UCard>

      <section class="grid metrics">
        <MetricCard v-for="metricItem in metrics" :key="metricItem.label" :metric="metricItem" />
      </section>

      <UCard v-if="selectedCourse" as="article" :ui="{ body: 'course-detail-panel' }">
        <div>
          <p class="eyebrow">Course detail</p>
          <h2>{{ selectedCourse.name }}</h2>
          <p>{{ selectedCourse.shortName }} · {{ selectedCourse.category }} · {{ selectedCourse.institute }}</p>
        </div>
        <div class="profile-stat-grid">
          <div><span>Enrolled</span><strong>{{ selectedCourse.enrolled }}</strong></div>
          <div><span>Completed</span><strong>{{ selectedCourse.completed }}</strong></div>
          <div><span>Completion</span><strong>{{ selectedCourse.completionRate }}%</strong></div>
          <div><span>Views</span><strong>{{ selectedCourse.views.toLocaleString() }}</strong></div>
        </div>
      </UCard>

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard v-for="chart in charts" :key="chart.title" :chart="chart" />
      </section>

      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1100px"
      >
        <template #cell-action="{ value }">
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="View" @click="selectCourse(value)" />
        </template>
      </DashboardDataTable>
    </template>
  </div>
</template>
