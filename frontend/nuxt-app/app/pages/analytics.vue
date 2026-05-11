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
const analyticsPeriod = ref('Last 7 days')
const analyticsPeriods = ['Last 7 days', 'Last 30 days', 'Quarter to date']

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
      <USelect
        v-model="analyticsPeriod"
        :items="analyticsPeriods"
        aria-label="Analytics period"
        class="w-44"
      />
    </PageHeader>

    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :description="loadError"
    />

    <section class="grid metrics">
      <MetricCard v-for="metric in importedMetrics" :key="metric.label" :metric="metric" />
    </section>

    <UCard as="article" :ui="{ body: 'p-5' }">
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
    </UCard>

    <UCard as="article" :ui="{ body: 'p-5' }">
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
    </UCard>

    <UCard as="article" :ui="{ body: 'p-5' }">
      <h2 class="section-title">Weekly Activity Preview</h2>
      <div class="chart-bars">
        <div v-for="point in weeklyTraffic" :key="point.label" class="bar">
          <div class="bar-fill" :style="{ height: `${point.value}%` }" />
          <span>{{ point.label }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
