<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { appColors } from '~/constants/colors'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor'],
})

const filters = reactive({
  course: 'All courses',
  session: 'All sessions',
  status: 'All statuses',
  range: 'This semester',
})

const attendanceStats = [
  {
    label: 'Sessions',
    value: '3,420',
    trend: '+180 sessions',
    icon: 'i-lucide-calendar-check',
  },
  {
    label: 'Present',
    value: '42,806',
    trend: '+2,120 present',
    icon: 'i-lucide-circle-check-big',
  },
  {
    label: 'Absent',
    value: '8,914',
    trend: '-3.4% absent',
    icon: 'i-lucide-x',
  },
  {
    label: 'Late',
    value: '3,090',
    trend: '+120 late',
    icon: 'i-lucide-clock-3',
  },
]

const attendanceByCourse = [
  { label: 'DataViz', present: 91, absence: 6 },
  { label: 'DB-MDL', present: 88, absence: 8 },
  { label: 'LDA', present: 84, absence: 10 },
  { label: 'Stats', present: 76, absence: 17 },
  { label: 'Math', present: 73, absence: 19 },
]

const attendanceStatus = [
  { label: 'Present', value: 92, tone: 'high' },
  { label: 'Excused', value: 21, tone: 'medium' },
  { label: 'Absent', value: 19, tone: 'low' },
  { label: 'Late', value: 12, tone: 'medium' },
]

const attendanceWatch = [
  { label: 'Data Visualization Workshop', value: 91, tone: 'high', detail: '28 sessions, low absence' },
  { label: 'Database Systems', value: 88, tone: 'high', detail: '42 sessions, stable presence' },
  { label: 'Business Statistics', value: 76, tone: 'medium', detail: 'Higher absence rate this month' },
  { label: 'Engineering Mathematics', value: 73, tone: 'medium', detail: 'Late arrivals need follow-up' },
]

const attendanceTimeline = [
  {
    date: 'May 15',
    title: 'Workshop attendance closed',
    detail: 'Data Visualization recorded 91% present across the latest session set.',
  },
  {
    date: 'May 16',
    title: 'Business Statistics absence alert',
    detail: 'Absence moved above the review threshold for the NUM cohort.',
  },
  {
    date: 'May 18',
    title: 'Engineering Math late trend',
    detail: 'Late arrivals increased across morning lab sessions.',
  },
  {
    date: 'May 20',
    title: 'Database Systems session review',
    detail: 'Attendance stayed healthy after reminder messages were sent.',
  },
]

const attendanceRows = [
  {
    course: 'Data Visualization Workshop',
    institute: 'URDSE',
    sessions: '28',
    present: '91%',
    absentLate: '9%',
    signal: 'Healthy',
  },
  {
    course: 'Database Systems',
    institute: 'ITC',
    sessions: '42',
    present: '88%',
    absentLate: '12%',
    signal: 'Healthy',
  },
  {
    course: 'Business Statistics',
    institute: 'NUM',
    sessions: '36',
    present: '76%',
    absentLate: '24%',
    signal: 'Needs review',
  },
  {
    course: 'Engineering Mathematics',
    institute: 'NPIC',
    sessions: '31',
    present: '73%',
    absentLate: '27%',
    signal: 'Needs review',
  },
]

const attendanceColumns = [
  { key: 'course', label: 'Course', width: '32%', rowHeader: true },
  { key: 'institute', label: 'Institute', width: '12%', tone: 'muted' },
  { key: 'sessions', label: 'Sessions', width: '12%', tone: 'strong' },
  { key: 'present', label: 'Present', width: '14%' },
  { key: 'absentLate', label: 'Absent / late', width: '14%' },
  {
    key: 'signal',
    label: 'Signal',
    width: '16%',
    type: 'status',
    warningValues: ['Needs review'],
  },
] as const

const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'

const attendanceByCourseOption = computed<EChartsOption>(() => ({
  color: [appColors.success, appColors.warning],
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
    data: attendanceByCourse.map((point) => point.label),
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
      name: 'Present',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
      data: attendanceByCourse.map((point) => point.present),
    },
    {
      name: 'Absent',
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
      data: attendanceByCourse.map((point) => point.absence),
    },
  ],
}))
</script>

<template>
  <div class="page-stack attendance-page">
    <PageHeader
      eyebrow="Presence tracking"
      title="Attendance Analytics"
      copy="Monitor Moodle attendance sessions, present rates, absence patterns, late arrivals, and course-level follow-up signals."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/analytics/attendance</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS', 'ENG-MATH', 'URDSE']" />
      </div>
      <div class="analytics-filter-field">
        <label>Session</label>
        <USelect v-model="filters.session" :items="['All sessions', 'Lecture', 'Lab', 'Workshop', 'Tutorial']" />
      </div>
      <div class="analytics-filter-field">
        <label>Status</label>
        <USelect v-model="filters.status" :items="['All statuses', 'Present', 'Absent', 'Late', 'Excused']" />
      </div>
      <div class="analytics-filter-field">
        <label>Period</label>
        <USelect v-model="filters.range" :items="['This week', 'This month', 'This semester']" />
      </div>
    </UCard>

    <section class="grid metrics">
      <MetricCard v-for="stat in attendanceStats" :key="stat.label" :metric="stat" />
    </section>

    <section class="grid course-overview-layout">
      <UCard as="article" :ui="{ body: 'course-detail-panel attendance-spotlight-panel' }">
        <div class="course-detail-copy">
          <p class="eyebrow">Attendance focus</p>
          <h2>Data Visualization Workshop</h2>
          <p>Strong attendance consistency across recent workshop sessions, with low absence and limited late arrivals.</p>
          <div class="course-detail-badges">
            <UBadge color="primary" variant="soft">URDSE</UBadge>
            <UBadge color="success" variant="soft">91% attendance</UBadge>
            <UBadge color="neutral" variant="soft">Low absence</UBadge>
          </div>
        </div>
        <div class="profile-stat-grid">
          <div>
            <span>Present</span>
            <strong>91%</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>6%</strong>
          </div>
          <div>
            <span>Late</span>
            <strong>3%</strong>
          </div>
          <div>
            <span>Sessions</span>
            <strong>28</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'course-health-panel' }">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-radar" />
            Attendance Watch
          </h2>
          <p>Courses with higher absence or late-arrival patterns</p>
        </div>
        <div class="course-health-list">
          <button v-for="item in attendanceWatch" :key="item.label" type="button">
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
            Attendance by Course
          </h2>
          <p>Present percentage compared with absence rate</p>
        </div>
        <AppEChart
          :option="attendanceByCourseOption"
          height="320px"
          aria-label="Attendance by course"
        />
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-chart-no-axes-combined" />
            Attendance Status
          </h2>
          <p>Present, absent, excused, and late distribution</p>
        </div>
        <div class="completion-rate-list attendance-status-list">
          <div v-for="item in attendanceStatus" :key="item.label">
            <span>{{ item.label }}</span>
            <div><i :class="item.tone" :style="{ width: `${item.value}%` }" /></div>
            <strong>{{ item.value }}%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <section class="grid analytics-chart-grid">
      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-calendar-clock" />
            Attendance Timeline
          </h2>
          <p>Recent session closures and attendance signals</p>
        </div>
        <div class="student-timeline attendance-timeline">
          <div v-for="event in attendanceTimeline" :key="event.date">
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
            Presence Targets
          </h2>
          <p>Progress against attendance review thresholds</p>
        </div>
        <div class="profile-stat-grid attendance-target-grid">
          <div>
            <span>Present target</span>
            <strong>86%</strong>
          </div>
          <div>
            <span>Absence control</span>
            <strong>74%</strong>
          </div>
          <div>
            <span>Late control</span>
            <strong>81%</strong>
          </div>
          <div>
            <span>Session coverage</span>
            <strong>93%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <DashboardDataTable
      title="Attendance Table"
      icon="i-lucide-table"
      description="Sample attendance metrics by course"
      :columns="attendanceColumns"
      :rows="attendanceRows"
      row-key="course"
      min-width="960px"
    />
  </div>
</template>

<style scoped>
.attendance-page :deep(.attendance-spotlight-panel) {
  align-items: stretch;
}

.attendance-status-list {
  min-height: 260px;
  align-content: center;
}

.attendance-timeline {
  min-height: 260px;
  align-content: center;
}

.attendance-target-grid {
  min-height: 260px;
  align-content: center;
}

@media (max-width: 760px) {
  .attendance-page :deep(.attendance-spotlight-panel) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
