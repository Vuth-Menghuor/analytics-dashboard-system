<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useDashboardData } from '~/composables/dashboard/useDashboardData'
import { appColors } from '~/constants/colors'
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
const axisLabelColor = appColors.secondary
const axisLineColor = appColors.axis
const gridLineColor = appColors.grid
const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'
const categoryPeakCourses = computed(() =>
  Math.max(...topCategories.value.map((category) => category.coursecount), 0)
)
const categoryChartHeight = computed(() => `${topCategories.value.length * 40 + 42}px`)
const recentCourseColumns = [
  { key: 'fullname', label: 'Course', width: '34%', rowHeader: true },
  { key: 'shortname', label: 'Short name', width: '32%', tone: 'muted' },
  {
    key: 'visible',
    label: 'Status',
    width: '14%',
    type: 'status',
    trueLabel: 'Visible',
    falseLabel: 'Hidden',
  },
  { key: 'updated_at', label: 'Updated', width: '20%' },
] as const

const formatCourseDate = (value: string | null) => {
  if (!value) {
    return 'Unknown'
  }

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return value
  }

  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
const recentCourseRows = computed(() =>
  recentCourses.value.map((course) => ({
    fullname: course.fullname,
    shortname: course.shortname,
    visible: course.visible,
    updated_at: formatCourseDate(course.updated_at),
  }))
)

const categoryOption = computed<EChartsOption>(() => ({
  color: [appColors.primaryHover],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: { color: 'rgba(6, 75, 130, 0.08)' },
    },
    backgroundColor: appColors.white,
    borderColor: appColors.axis,
    borderWidth: 1,
    borderRadius: 8,
    padding: [10, 12],
    textStyle: { color: appColors.ink, fontSize: 12 },
    extraCssText: `box-shadow: ${tooltipShadow};`,
  },
  grid: { top: 8, right: 52, bottom: 10, left: 8, containLabel: true },
  xAxis: {
    type: 'value',
    max: Math.ceil(categoryPeakCourses.value * 1.15),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'category',
    data: topCategories.value.map((category) => category.name),
    inverse: true,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#334155',
      fontSize: 12,
      fontWeight: 700,
      width: 238,
      overflow: 'truncate',
    },
  },
  series: [
    {
      name: 'Courses',
      type: 'bar',
      data: topCategories.value.map((category) => category.coursecount),
      barMaxWidth: 16,
      barCategoryGap: '52%',
      showBackground: true,
      backgroundStyle: {
        color: '#f1f5f9',
        borderRadius: [0, 999, 999, 0],
      },
      itemStyle: {
        borderRadius: [0, 999, 999, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: appColors.primaryHover },
            { offset: 1, color: appColors.success },
          ],
        },
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: '#0f172a',
        fontSize: 12,
        fontWeight: 800,
      },
      emphasis: {
        focus: 'series',
      },
    },
  ],
}))

const weeklyActivityOption = computed<EChartsOption>(() => ({
  color: [appColors.success],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: { color: appColors.success, width: 1, type: 'dashed' },
    },
    backgroundColor: appColors.white,
    borderColor: appColors.axis,
    borderWidth: 1,
    borderRadius: 8,
    padding: [10, 12],
    textStyle: { color: appColors.ink, fontSize: 12 },
    extraCssText: `box-shadow: ${tooltipShadow};`,
  },
  grid: { top: 18, right: 18, bottom: 18, left: 12, containLabel: true },
  xAxis: {
    type: 'category',
    data: weeklyTraffic.map((point) => point.label),
    boundaryGap: false,
    axisLine: { lineStyle: { color: axisLineColor } },
    axisTick: { show: false },
    axisLabel: { color: axisLabelColor, fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: axisLabelColor, fontSize: 12, formatter: '{value}%' },
    splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' } },
  },
  series: [
    {
      name: 'Activity',
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: appColors.success },
      itemStyle: {
        color: appColors.white,
        borderColor: appColors.success,
        borderWidth: 2,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(15, 139, 87, 0.22)' },
            { offset: 1, color: 'rgba(15, 139, 87, 0)' },
          ],
        },
      },
      emphasis: {
        focus: 'series',
        itemStyle: { color: appColors.success },
      },
      data: weeklyTraffic.map((point) => point.value),
    },
  ],
}))

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
      eyebrow="Dashboard insights"
      title="Analytics"
      copy="Monitor imported course data, learning activity, and reporting trends for the selected period."
    >
      <USelect
        v-model="analyticsPeriod"
        :items="analyticsPeriods"
        aria-label="Analytics period"
        class="analytics-period-select"
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
      <h2 class="section-title with-icon">
        <UIcon name="i-lucide-folder-tree" />
        {{ isLoading ? 'Loading Imported Data' : 'Imported Course Categories' }}
      </h2>
      <AppEChart
        v-if="topCategories.length"
        :option="categoryOption"
        :height="categoryChartHeight"
        aria-label="Imported course categories by course count"
        class="chart-spacer"
      />
      <details v-if="topCategories.length" class="category-data-details">
        <summary>View table data</summary>
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
      </details>
    </UCard>

    <DashboardDataTable
      title="Recently Updated Courses"
      icon="i-lucide-clock-3"
      description="Latest course changes imported from the learning database"
      :columns="recentCourseColumns"
      :rows="recentCourseRows"
      row-key="shortname"
      min-width="820px"
    />

    <UCard as="article" :ui="{ body: 'p-5' }">
      <h2 class="section-title with-icon">
        <UIcon name="i-lucide-activity" />
        Weekly Activity Preview
      </h2>
      <AppEChart
        :option="weeklyActivityOption"
        height="280px"
        aria-label="Weekly activity preview"
      />
    </UCard>

    <USeparator />

    <AnalyticsWorkspacePage page-key="activity" />
  </div>
</template>
