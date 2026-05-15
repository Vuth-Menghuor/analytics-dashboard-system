<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { appColors } from '~/constants/colors'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor'],
})

const filters = reactive({
  course: 'All courses',
  gradeItem: 'All items',
  risk: 'All risk levels',
  range: 'This semester',
})

const gradeStats = [
  {
    label: 'Avg. Grade',
    value: '78%',
    trend: '+3.1 points',
    icon: 'i-lucide-graduation-cap',
  },
  {
    label: 'Top Performers',
    value: '1,204',
    trend: '+96 students',
    icon: 'i-lucide-trophy',
  },
  {
    label: 'Low Performers',
    value: '842',
    trend: '-44 students',
    icon: 'i-lucide-circle-help',
  },
  {
    label: 'Grade Items',
    value: '4,820',
    trend: '+240 items',
    icon: 'i-lucide-file-bar-chart',
  },
]

const courseAverages = [
  { label: 'DataViz', average: 86, lowRisk: 8 },
  { label: 'DB-MDL', average: 82, lowRisk: 11 },
  { label: 'LDA', average: 78, lowRisk: 16 },
  { label: 'Math', average: 71, lowRisk: 24 },
  { label: 'Stats', average: 69, lowRisk: 28 },
]

const gradeBands = [
  { label: '90-100', value: 38, tone: 'high' },
  { label: '80-89', value: 72, tone: 'high' },
  { label: '65-79', value: 88, tone: 'medium' },
  { label: '50-64', value: 34, tone: 'medium' },
  { label: '0-49', value: 26, tone: 'low' },
]

const gradeWatch = [
  { label: 'Data Visualization Workshop', value: 86, tone: 'high', detail: 'Low risk, strong top band' },
  { label: 'Database Systems', value: 82, tone: 'high', detail: 'Stable average, healthy pass rate' },
  { label: 'Engineering Math', value: 71, tone: 'medium', detail: 'Low performers need follow-up' },
  { label: 'Business Statistics', value: 69, tone: 'medium', detail: 'Medium risk and weak lower band' },
]

const gradeTimeline = [
  {
    date: 'May 15',
    title: 'Final grade import completed',
    detail: '4,820 grade items refreshed from Moodle gradebook exports.',
  },
  {
    date: 'May 16',
    title: 'Business Statistics review',
    detail: '286 learners remain in the lower performance signal group.',
  },
  {
    date: 'May 18',
    title: 'Engineering Math intervention',
    detail: 'Tutors scheduled remediation for learners below the 65% band.',
  },
  {
    date: 'May 20',
    title: 'DataViz outcome report',
    detail: 'Workshop remains the strongest current grade outcome cohort.',
  },
]

const gradeRows = [
  {
    course: 'Data Visualization Workshop',
    institute: 'URDSE',
    average: '86%',
    topBand: '38%',
    lowBand: '8%',
    risk: 'Low',
    signal: 'Healthy',
  },
  {
    course: 'Database Systems',
    institute: 'ITC',
    average: '82%',
    topBand: '34%',
    lowBand: '11%',
    risk: 'Low',
    signal: 'Healthy',
  },
  {
    course: 'Engineering Mathematics',
    institute: 'NPIC',
    average: '71%',
    topBand: '18%',
    lowBand: '24%',
    risk: 'Medium',
    signal: 'Needs review',
  },
  {
    course: 'Business Statistics',
    institute: 'NUM',
    average: '69%',
    topBand: '16%',
    lowBand: '28%',
    risk: 'Medium',
    signal: 'Needs review',
  },
]

const gradeColumns = [
  { key: 'course', label: 'Course', width: '30%', rowHeader: true },
  { key: 'institute', label: 'Institute', width: '12%', tone: 'muted' },
  { key: 'average', label: 'Average', width: '12%', tone: 'strong' },
  { key: 'topBand', label: 'Top band', width: '12%' },
  { key: 'lowBand', label: 'Low band', width: '12%' },
  { key: 'risk', label: 'Risk', width: '12%' },
  {
    key: 'signal',
    label: 'Signal',
    width: '16%',
    type: 'status',
    warningValues: ['Needs review'],
  },
] as const

const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'

const courseAverageOption = computed<EChartsOption>(() => ({
  color: [appColors.primaryHover, appColors.warning],
  tooltip: {
    trigger: 'axis',
    backgroundColor: appColors.white,
    borderColor: appColors.axis,
    borderWidth: 1,
    borderRadius: 8,
    padding: [10, 12],
    textStyle: { color: appColors.ink, fontSize: 12 },
    extraCssText: `box-shadow: ${tooltipShadow};`,
  },
  legend: {
    top: 0,
    right: 0,
    textStyle: { color: appColors.secondary, fontSize: 12, fontWeight: 700 },
  },
  grid: { top: 42, right: 18, bottom: 18, left: 12, containLabel: true },
  xAxis: {
    type: 'category',
    data: courseAverages.map((point) => point.label),
    axisLine: { lineStyle: { color: appColors.axis } },
    axisTick: { show: false },
    axisLabel: { color: appColors.secondary, fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: appColors.secondary, fontSize: 12, formatter: '{value}%' },
    splitLine: { lineStyle: { color: appColors.grid, type: 'dashed' } },
  },
  series: [
    {
      name: 'Average',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
      data: courseAverages.map((point) => point.average),
    },
    {
      name: 'Low risk',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: {
        color: appColors.white,
        borderColor: appColors.warning,
        borderWidth: 2,
      },
      data: courseAverages.map((point) => point.lowRisk),
    },
  ],
}))
</script>

<template>
  <div class="page-stack grades-page">
    <PageHeader
      eyebrow="Grades and outcomes"
      title="Grade Analytics"
      copy="Analyze Moodle gradebook outcomes by average score, distribution bands, top performers, low-performance signals, and course risk."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/analytics/grades</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS', 'ENG-MATH', 'URDSE']" />
      </div>
      <div class="analytics-filter-field">
        <label>Grade item</label>
        <USelect v-model="filters.gradeItem" :items="['All items', 'Assignments', 'Quizzes', 'Final', 'Course total']" />
      </div>
      <div class="analytics-filter-field">
        <label>Risk</label>
        <USelect v-model="filters.risk" :items="['All risk levels', 'Low', 'Medium', 'High']" />
      </div>
      <div class="analytics-filter-field">
        <label>Period</label>
        <USelect v-model="filters.range" :items="['This month', 'This semester', 'Academic year']" />
      </div>
    </UCard>

    <section class="grid metrics">
      <MetricCard v-for="stat in gradeStats" :key="stat.label" :metric="stat" />
    </section>

    <section class="grid course-overview-layout">
      <UCard as="article" :ui="{ body: 'course-detail-panel grades-spotlight-panel' }">
        <div class="course-detail-copy">
          <p class="eyebrow">Outcome focus</p>
          <h2>Data Visualization Workshop</h2>
          <p>Highest current average grade among sampled courses, with a strong top-performance band and low intervention risk.</p>
          <div class="course-detail-badges">
            <UBadge color="primary" variant="soft">URDSE</UBadge>
            <UBadge color="success" variant="soft">86% average</UBadge>
            <UBadge color="neutral" variant="soft">Low risk</UBadge>
          </div>
        </div>
        <div class="profile-stat-grid">
          <div>
            <span>Average</span>
            <strong>86%</strong>
          </div>
          <div>
            <span>Top</span>
            <strong>38%</strong>
          </div>
          <div>
            <span>Low</span>
            <strong>8%</strong>
          </div>
          <div>
            <span>Items</span>
            <strong>42</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'course-health-panel' }">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-radar" />
            Grade Watch
          </h2>
          <p>Courses with lower grade outcomes or higher intervention signals</p>
        </div>
        <div class="course-health-list">
          <button v-for="item in gradeWatch" :key="item.label" type="button">
            <span>
              <strong>{{ item.label }}</strong>
              <em>{{ item.detail }}</em>
            </span>
            <i :class="item.tone">{{ item.value }}%</i>
          </button>
        </div>
      </UCard>
    </section>

    <section class="grid analytics-chart-grid">
      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-bar-chart-3" />
            Average by Course
          </h2>
          <p>Course grade averages compared with lower-band risk</p>
        </div>
        <AppEChart
          :option="courseAverageOption"
          height="320px"
          aria-label="Average grade by course"
        />
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-chart-no-axes-combined" />
            Grade Distribution
          </h2>
          <p>Students by grade band in the selected period</p>
        </div>
        <div class="completion-rate-list grades-band-list">
          <div v-for="item in gradeBands" :key="item.label">
            <span>{{ item.label }}</span>
            <div><i :class="item.tone" :style="{ width: `${item.value}%` }" /></div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </UCard>
    </section>

    <section class="grid analytics-chart-grid">
      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-calendar-clock" />
            Outcome Timeline
          </h2>
          <p>Gradebook refreshes and intervention milestones</p>
        </div>
        <div class="student-timeline grades-timeline">
          <div v-for="event in gradeTimeline" :key="event.date">
            <span>{{ event.date }}</span>
            <div>
              <strong>{{ event.title }}</strong>
              <p>{{ event.detail }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-target" />
            Outcome Targets
          </h2>
          <p>Progress against academic outcome thresholds</p>
        </div>
        <div class="profile-stat-grid grades-target-grid">
          <div>
            <span>Course average</span>
            <strong>78%</strong>
          </div>
          <div>
            <span>Pass threshold</span>
            <strong>84%</strong>
          </div>
          <div>
            <span>Top band growth</span>
            <strong>38%</strong>
          </div>
          <div>
            <span>Low band control</span>
            <strong>74%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <DashboardDataTable
      title="Grade Table"
      icon="i-lucide-table"
      description="Sample grade outcome metrics by course"
      :columns="gradeColumns"
      :rows="gradeRows"
      row-key="course"
      min-width="1040px"
    />
  </div>
</template>

<style scoped>
.grades-page :deep(.grades-spotlight-panel) {
  align-items: stretch;
}

.grades-band-list {
  min-height: 260px;
  align-content: center;
}

.grades-timeline {
  min-height: 260px;
  align-content: center;
}

.grades-target-grid {
  min-height: 260px;
  align-content: center;
}

@media (max-width: 760px) {
  .grades-page :deep(.grades-spotlight-panel) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
