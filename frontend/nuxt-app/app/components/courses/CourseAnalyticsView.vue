<script setup lang="ts">
import { useCourseAnalyticsView } from "~/composables/courses/useCourseAnalyticsView";

defineProps<{
  compactHeader?: boolean;
}>();

const {
  categories,
  charts,
  completionTone,
  courseHealthItems,
  courseStatusOptions,
  courseSummaryItems,
  error,
  filters,
  institutes,
  isLoading,
  refresh,
  selectCourse,
  selectedCourse,
  table,
} = useCourseAnalyticsView();
</script>

<template>
  <div class="page-stack course-analytics-view">
    <PageHeader
      v-if="!compactHeader"
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
      <section class="course-analytics-panel">
        <div class="course-summary-grid">
          <div
            v-for="item in courseSummaryItems"
            :key="item.label"
            class="course-summary-card"
          >
            <span class="course-summary-icon">
              <UIcon :name="item.icon" />
            </span>
            <div>
              <p>{{ item.label }}</p>
              <strong>{{ item.value }}</strong>
              <span>{{ item.detail }}</span>
            </div>
          </div>
        </div>
      </section>

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
          <USelect v-model="filters.status" :items="courseStatusOptions" />
        </div>
      </UCard>

      <section class="grid course-overview-layout">
        <UCard v-if="selectedCourse" as="article" :ui="{ body: 'course-detail-panel course-detail-panel-rich' }">
          <div class="course-detail-copy">
            <p class="eyebrow">Selected course</p>
            <h2>{{ selectedCourse.name }}</h2>
            <p>{{ selectedCourse.shortName }} · {{ selectedCourse.category }} · {{ selectedCourse.institute }}</p>
            <div class="course-detail-badges">
              <UBadge :color="selectedCourse.status === 'Visible' ? 'success' : 'warning'" variant="soft">
                {{ selectedCourse.status }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ selectedCourse.views.toLocaleString() }} views
              </UBadge>
            </div>
          </div>
          <div class="profile-stat-grid">
            <div><span>Enrolled</span><strong>{{ selectedCourse.enrolled }}</strong></div>
            <div><span>Completed</span><strong>{{ selectedCourse.completed }}</strong></div>
            <div><span>Completion</span><strong>{{ selectedCourse.completionRate }}%</strong></div>
            <div><span>Views</span><strong>{{ selectedCourse.views.toLocaleString() }}</strong></div>
          </div>
        </UCard>

        <UCard as="article" :ui="{ body: 'course-health-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-activity" />
              Completion Watch
            </h2>
            <p>Courses with the lowest completion rates in the current view</p>
          </div>
          <div class="course-health-list">
            <button
              v-for="course in courseHealthItems"
              :key="course.id"
              type="button"
              @click="selectCourse(course.id)"
            >
              <span>
                <strong>{{ course.shortName }}</strong>
                <em>{{ course.name }}</em>
              </span>
              <i :class="completionTone(course)">{{ course.completionRate }}%</i>
            </button>
          </div>
        </UCard>
      </section>

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
