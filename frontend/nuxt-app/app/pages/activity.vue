<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { appColors } from '~/constants/colors'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor'],
})

const filters = reactive({
  range: 'Last 7 days',
  institute: 'All institutes',
  activityType: 'All activity',
  course: 'All courses',
})

const activityStats = [
  {
    label: 'Daily Active Users',
    value: '3,204',
    trend: '+8.2% vs yesterday',
    icon: 'i-lucide-users-round',
  },
  {
    label: 'Learning Events',
    value: '84,120',
    trend: '+11.3% this week',
    icon: 'i-lucide-activity',
  },
  {
    label: 'Learning Hours',
    value: '18,640',
    trend: '+1,204 tracked hours',
    icon: 'i-lucide-clock-3',
  },
  {
    label: 'Resource Views',
    value: '62,950',
    trend: '+9.1% content views',
    icon: 'i-lucide-book-open',
  },
]

const activityTrend = [
  { day: 'Mon', events: 12500, users: 2840 },
  { day: 'Tue', events: 13920, users: 3010 },
  { day: 'Wed', events: 14880, users: 3180 },
  { day: 'Thu', events: 17140, users: 3370 },
  { day: 'Fri', events: 16220, users: 3290 },
  { day: 'Sat', events: 9890, users: 2120 },
  { day: 'Sun', events: 9570, users: 2030 },
]

const activityMix = [
  { label: 'Course views', value: 42, tone: 'high' },
  { label: 'Quiz attempts', value: 24, tone: 'medium' },
  { label: 'Assignment work', value: 18, tone: 'medium' },
  { label: 'Forum actions', value: 10, tone: 'low' },
  { label: 'Attendance marks', value: 6, tone: 'low' },
]

const focusItems = [
  { label: 'Database Systems / Quiz 3', value: 92, tone: 'high', detail: '420 active learners' },
  { label: 'Learning Design / Assignment 2', value: 76, tone: 'medium', detail: '286 active learners' },
  { label: 'Business Statistics / Week 4', value: 61, tone: 'medium', detail: '198 active learners' },
  { label: 'SCORM Orientation', value: 38, tone: 'low', detail: 'Follow-up suggested' },
]

const timeline = [
  {
    time: '09:14',
    title: 'Quiz 3 opened',
    detail: 'Database Systems generated 1,248 quiz events from ITC learners.',
  },
  {
    time: '10:40',
    title: 'Resource view spike',
    detail: 'Week 4 lecture notes crossed 8,900 views across partner cohorts.',
  },
  {
    time: '13:25',
    title: 'Assignment activity rose',
    detail: 'Learning Design submissions increased after reminder notifications.',
  },
  {
    time: '16:05',
    title: 'Forum participation dipped',
    detail: 'Two courses remain below the weekly discussion activity target.',
  },
]

const recentActivityRows = [
  {
    item: 'Database Systems / Quiz 3',
    learner: 'Sok Dara',
    type: 'Quiz',
    lastAccess: 'Today 09:14',
    events: '1,248',
    signal: 'Healthy',
  },
  {
    item: 'Learning Design / Assignment 2',
    learner: 'Chan Lina',
    type: 'Assignment',
    lastAccess: 'Today 08:52',
    events: '842',
    signal: 'Healthy',
  },
  {
    item: 'Business Statistics / Week 4',
    learner: 'NUM cohort',
    type: 'Resource',
    lastAccess: 'Yesterday 17:30',
    events: '620',
    signal: 'Needs review',
  },
  {
    item: 'SCORM Orientation',
    learner: 'NPIC cohort',
    type: 'SCORM',
    lastAccess: 'Yesterday 14:12',
    events: '286',
    signal: 'Needs review',
  },
]

const recentActivityColumns = [
  { key: 'item', label: 'Activity item', width: '32%', rowHeader: true },
  { key: 'learner', label: 'Learner / cohort', width: '20%', tone: 'muted' },
  { key: 'type', label: 'Type', width: '14%' },
  { key: 'lastAccess', label: 'Last access', width: '16%' },
  { key: 'events', label: 'Events', width: '10%', tone: 'strong' },
  {
    key: 'signal',
    label: 'Signal',
    width: '14%',
    type: 'status',
    warningValues: ['Needs review'],
  },
] as const

const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'

const activityTrendOption = computed<EChartsOption>(() => ({
  color: [appColors.primaryHover, appColors.success],
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
    data: activityTrend.map((point) => point.day),
    boundaryGap: false,
    axisLine: { lineStyle: { color: appColors.axis } },
    axisTick: { show: false },
    axisLabel: { color: appColors.secondary, fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: appColors.secondary, fontSize: 12 },
    splitLine: { lineStyle: { color: appColors.grid, type: 'dashed' } },
  },
  series: [
    {
      name: 'Events',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: {
        color: appColors.white,
        borderColor: appColors.primaryHover,
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
            { offset: 0, color: 'rgba(10, 56, 104, 0.2)' },
            { offset: 1, color: 'rgba(10, 56, 104, 0)' },
          ],
        },
      },
      data: activityTrend.map((point) => point.events),
    },
    {
      name: 'Active users',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: {
        color: appColors.white,
        borderColor: appColors.success,
        borderWidth: 2,
      },
      data: activityTrend.map((point) => point.users),
    },
  ],
}))
</script>

<template>
  <div class="page-stack activity-page">
    <PageHeader
      eyebrow="Learning behavior"
      title="Learning Activity"
      copy="Monitor Moodle activity logs, active users, learning time, content views, and engagement signals across institutes and courses."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/analytics/activity</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Date range</label>
        <USelect v-model="filters.range" :items="['Today', 'Last 7 days', 'Last 30 days', 'This semester']" />
      </div>
      <div class="analytics-filter-field">
        <label>Institute</label>
        <USelect v-model="filters.institute" :items="['All institutes', 'ITC', 'RUPP', 'NUM', 'NPIC']" />
      </div>
      <div class="analytics-filter-field">
        <label>Activity type</label>
        <USelect v-model="filters.activityType" :items="['All activity', 'Views', 'Quiz', 'Assignment', 'Forum', 'Attendance']" />
      </div>
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS', 'SCORM-101']" />
      </div>
    </UCard>

    <section class="grid metrics">
      <MetricCard v-for="stat in activityStats" :key="stat.label" :metric="stat" />
    </section>

    <section class="grid course-overview-layout">
      <UCard as="article" :ui="{ body: 'course-detail-panel activity-spotlight-panel' }">
        <div class="course-detail-copy">
          <p class="eyebrow">Peak activity</p>
          <h2>Database Systems / Quiz 3</h2>
          <p>Highest learning event volume during the selected window, with sustained quiz attempts and repeat visits from the ITC cohort.</p>
          <div class="course-detail-badges">
            <UBadge color="primary" variant="soft">Quiz activity</UBadge>
            <UBadge color="neutral" variant="soft">ITC</UBadge>
            <UBadge color="success" variant="soft">Today 09:14</UBadge>
          </div>
        </div>
        <div class="profile-stat-grid">
          <div>
            <span>Events</span>
            <strong>9,840</strong>
          </div>
          <div>
            <span>Users</span>
            <strong>420</strong>
          </div>
          <div>
            <span>Avg. time</span>
            <strong>34m</strong>
          </div>
          <div>
            <span>Trend</span>
            <strong>+12%</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'course-health-panel' }">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-radar" />
            Activity Watch
          </h2>
          <p>Learning areas that may need coordinator follow-up</p>
        </div>
        <div class="course-health-list">
          <button v-for="item in focusItems" :key="item.label" type="button">
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
            <UIcon name="i-lucide-activity" />
            Weekly Activity Trend
          </h2>
          <p>Learning events and active users by day</p>
        </div>
        <AppEChart
          :option="activityTrendOption"
          height="320px"
          aria-label="Weekly learning activity trend"
        />
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-chart-no-axes-combined" />
            Activity Mix
          </h2>
          <p>Share of tracked learning events in the selected period</p>
        </div>
        <div class="completion-rate-list activity-mix-list">
          <div v-for="item in activityMix" :key="item.label">
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
            <UIcon name="i-lucide-clock-3" />
            Live Activity Timeline
          </h2>
          <p>Recent high-signal activity from Moodle event logs</p>
        </div>
        <div class="student-timeline activity-timeline">
          <div v-for="event in timeline" :key="event.time">
            <span>{{ event.time }}</span>
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
            Engagement Targets
          </h2>
          <p>Current progress against activity review thresholds</p>
        </div>
        <div class="profile-stat-grid activity-target-grid">
          <div>
            <span>Active user target</span>
            <strong>89%</strong>
          </div>
          <div>
            <span>Content reach</span>
            <strong>84%</strong>
          </div>
          <div>
            <span>Assessment touch</span>
            <strong>73%</strong>
          </div>
          <div>
            <span>Discussion health</span>
            <strong>52%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <DashboardDataTable
      title="Recent Activity"
      icon="i-lucide-table"
      description="Sample recently accessed learning items from Moodle activity logs"
      :columns="recentActivityColumns"
      :rows="recentActivityRows"
      row-key="item"
      min-width="980px"
    />
  </div>
</template>

<style scoped>
.activity-page :deep(.activity-spotlight-panel) {
  align-items: stretch;
}

.activity-mix-list {
  min-height: 260px;
  align-content: center;
}

.activity-timeline {
  min-height: 260px;
  align-content: center;
}

.activity-target-grid {
  min-height: 260px;
  align-content: center;
}

@media (max-width: 760px) {
  .activity-page :deep(.activity-spotlight-panel) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
