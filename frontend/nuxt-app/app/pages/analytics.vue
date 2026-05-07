<script setup lang="ts">
import { api } from '~/services/api'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner']
})

const { metrics, weeklyTraffic } = useDashboardData()

type ImportedMetric = {
  label: string
  value: string
  trend: string
  icon: string
}

type TopCategory = {
  name: string
  coursecount: number
}

type RecentCourse = {
  fullname: string
  shortname: string
  visible: boolean
  updated_at: string | null
}

type ImportedOverview = {
  metrics: ImportedMetric[]
  top_categories: TopCategory[]
  recent_courses: RecentCourse[]
}

const importedMetrics = ref<ImportedMetric[]>(metrics)
const topCategories = ref<TopCategory[]>([])
const recentCourses = ref<RecentCourse[]>([])
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get<ImportedOverview>('/analytics/imported/overview')

    importedMetrics.value = data.metrics
    topCategories.value = data.top_categories
    recentCourses.value = data.recent_courses
  } catch {
    loadError.value = 'Unable to load imported database analytics.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Medium priority"
      title="Analytics"
      copy="Compare product, acquisition, and customer health signals across the current reporting window."
    >
      <select class="input" aria-label="Analytics period">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Quarter to date</option>
      </select>
    </PageHeader>

    <p v-if="loadError" class="form-error">{{ loadError }}</p>

    <section class="grid metrics">
      <MetricCard v-for="metric in importedMetrics" :key="metric.label" :metric="metric" />
    </section>

    <article class="card card-pad">
      <h2 class="section-title">{{ isLoading ? 'Loading Imported Data' : 'Imported Course Categories' }}</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Courses</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in topCategories" :key="category.name">
              <td>{{ category.name }}</td>
              <td>{{ category.coursecount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="card card-pad">
      <h2 class="section-title">Recently Updated Courses</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Short name</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in recentCourses" :key="course.shortname">
              <td>{{ course.fullname }}</td>
              <td>{{ course.shortname }}</td>
              <td>
                <span class="status" :class="{ warn: !course.visible }">
                  {{ course.visible ? 'Visible' : 'Hidden' }}
                </span>
              </td>
              <td>{{ course.updated_at ?? 'Unknown' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="card card-pad">
      <h2 class="section-title">Weekly Activity Preview</h2>
      <div class="chart-bars">
        <div v-for="point in weeklyTraffic" :key="point.label" class="bar">
          <div class="bar-fill" :style="{ height: `${point.value}%` }" />
          <span>{{ point.label }}</span>
        </div>
      </div>
    </article>
  </div>
</template>
