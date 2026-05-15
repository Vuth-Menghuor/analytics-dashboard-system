<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { appColors } from '~/constants/colors'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor'],
})

const filters = reactive({
  course: 'All courses',
  status: 'All submissions',
  range: 'This semester',
  institute: 'All institutes',
})

const assignmentStats = [
  {
    label: 'Assignments',
    value: '842',
    trend: '+22 new items',
    icon: 'i-lucide-file-bar-chart',
  },
  {
    label: 'Submissions',
    value: '18,204',
    trend: '+844 submitted',
    icon: 'i-lucide-circle-check-big',
  },
  {
    label: 'Late Work',
    value: '1,284',
    trend: '-3.1% late rate',
    icon: 'i-lucide-clock-3',
  },
  {
    label: 'Ungraded',
    value: '2,146',
    trend: '+320 pending grades',
    icon: 'i-lucide-circle-help',
  },
]

const submissionTrend = [
  { label: 'Jan', submitted: 62, late: 18 },
  { label: 'Feb', submitted: 70, late: 16 },
  { label: 'Mar', submitted: 76, late: 14 },
  { label: 'Apr', submitted: 83, late: 12 },
  { label: 'May', submitted: 88, late: 10 },
]

const statusBreakdown = [
  { label: 'Submitted', value: 88, tone: 'high' },
  { label: 'Graded', value: 76, tone: 'high' },
  { label: 'Ungraded', value: 24, tone: 'medium' },
  { label: 'Late', value: 18, tone: 'medium' },
  { label: 'Missing', value: 12, tone: 'low' },
]

const reviewQueue = [
  { label: 'Database Project', value: 82, tone: 'high', detail: '74 ungraded submissions' },
  { label: 'Learning Reflection', value: 78, tone: 'high', detail: '18 late submissions' },
  { label: 'Statistics Lab 2', value: 61, tone: 'medium', detail: '44 missing submissions' },
  { label: 'Design Portfolio', value: 46, tone: 'low', detail: 'Coordinator review needed' },
]

const dueTimeline = [
  {
    date: 'May 16',
    title: 'Database Project closes',
    detail: '386 submissions received, with 74 still waiting for grades.',
  },
  {
    date: 'May 18',
    title: 'Learning Reflection feedback',
    detail: 'Partner tutors have completed 78% of rubric feedback.',
  },
  {
    date: 'May 21',
    title: 'Statistics Lab reminder',
    detail: '44 learners remain missing before the next progress report.',
  },
  {
    date: 'May 24',
    title: 'Design Portfolio checkpoint',
    detail: 'Low submission momentum in one cohort needs follow-up.',
  },
]

const assignmentRows = [
  {
    assignment: 'Database Project',
    course: 'DB-MDL-401',
    submissions: '386',
    average: '82%',
    late: '28',
    signal: 'Healthy',
  },
  {
    assignment: 'Learning Reflection',
    course: 'LDA-210',
    submissions: '280',
    average: '78%',
    late: '18',
    signal: 'Healthy',
  },
  {
    assignment: 'Statistics Lab 2',
    course: 'BUS-STATS',
    submissions: '186',
    average: '61%',
    late: '32',
    signal: 'Needs review',
  },
  {
    assignment: 'Design Portfolio',
    course: 'URDSE',
    submissions: '142',
    average: '68%',
    late: '26',
    signal: 'Needs review',
  },
]

const assignmentColumns = [
  { key: 'assignment', label: 'Assignment', width: '28%', rowHeader: true },
  { key: 'course', label: 'Course', width: '16%', tone: 'muted' },
  { key: 'submissions', label: 'Submissions', width: '14%', tone: 'strong' },
  { key: 'average', label: 'Average', width: '14%' },
  { key: 'late', label: 'Late', width: '10%' },
  {
    key: 'signal',
    label: 'Signal',
    width: '16%',
    type: 'status',
    warningValues: ['Needs review'],
  },
] as const

const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'

const submissionTrendOption = computed<EChartsOption>(() => ({
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
    data: submissionTrend.map((point) => point.label),
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
      name: 'Submitted',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
      data: submissionTrend.map((point) => point.submitted),
    },
    {
      name: 'Late',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
      data: submissionTrend.map((point) => point.late),
    },
  ],
}))
</script>

<template>
  <div class="page-stack assignments-page">
    <PageHeader
      eyebrow="Assessment analytics"
      title="Assignment Analytics"
      copy="Track Moodle assignments by submissions, grading progress, late work, missing responses, and course-level review signals."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/analytics/assignments</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS', 'URDSE']" />
      </div>
      <div class="analytics-filter-field">
        <label>Status</label>
        <USelect v-model="filters.status" :items="['All submissions', 'Submitted', 'Ungraded', 'Late', 'Missing']" />
      </div>
      <div class="analytics-filter-field">
        <label>Period</label>
        <USelect v-model="filters.range" :items="['This week', 'This month', 'This semester']" />
      </div>
      <div class="analytics-filter-field">
        <label>Institute</label>
        <USelect v-model="filters.institute" :items="['All institutes', 'ITC', 'RUPP', 'NUM', 'NPIC']" />
      </div>
    </UCard>

    <section class="grid metrics">
      <MetricCard v-for="stat in assignmentStats" :key="stat.label" :metric="stat" />
    </section>

    <section class="grid course-overview-layout">
      <UCard as="article" :ui="{ body: 'course-detail-panel assignments-spotlight-panel' }">
        <div class="course-detail-copy">
          <p class="eyebrow">Assignment focus</p>
          <h2>Database Project</h2>
          <p>High-volume project with a strong submission rate and a grading queue that still needs attention before reporting closes.</p>
          <div class="course-detail-badges">
            <UBadge color="primary" variant="soft">DB-MDL-401</UBadge>
            <UBadge color="neutral" variant="soft">386 submissions</UBadge>
            <UBadge color="success" variant="soft">82% average</UBadge>
          </div>
        </div>
        <div class="profile-stat-grid">
          <div>
            <span>Submitted</span>
            <strong>386</strong>
          </div>
          <div>
            <span>Late</span>
            <strong>28</strong>
          </div>
          <div>
            <span>Ungraded</span>
            <strong>74</strong>
          </div>
          <div>
            <span>Average</span>
            <strong>82%</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'course-health-panel' }">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-clipboard-check" />
            Submission Watch
          </h2>
          <p>Assignments that need grading or learner follow-up</p>
        </div>
        <div class="course-health-list">
          <button v-for="item in reviewQueue" :key="item.label" type="button">
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
            Submission Trend
          </h2>
          <p>Submitted and late work by month</p>
        </div>
        <AppEChart
          :option="submissionTrendOption"
          height="320px"
          aria-label="Assignment submission trend"
        />
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-chart-no-axes-combined" />
            Submission Status
          </h2>
          <p>Current assignment completion and grading state</p>
        </div>
        <div class="completion-rate-list assignments-status-list">
          <div v-for="item in statusBreakdown" :key="item.label">
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
            Due Date Timeline
          </h2>
          <p>Upcoming assignment checkpoints and grading milestones</p>
        </div>
        <div class="student-timeline assignments-timeline">
          <div v-for="event in dueTimeline" :key="event.date">
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
            Grading Targets
          </h2>
          <p>Progress against operational review targets</p>
        </div>
        <div class="profile-stat-grid assignments-target-grid">
          <div>
            <span>Rubric coverage</span>
            <strong>91%</strong>
          </div>
          <div>
            <span>Feedback complete</span>
            <strong>76%</strong>
          </div>
          <div>
            <span>Late work reviewed</span>
            <strong>68%</strong>
          </div>
          <div>
            <span>Missing contacted</span>
            <strong>54%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <DashboardDataTable
      title="Assignment Table"
      icon="i-lucide-table"
      description="Sample assignment submission metrics by course"
      :columns="assignmentColumns"
      :rows="assignmentRows"
      row-key="assignment"
      min-width="940px"
    />
  </div>
</template>

<style scoped>
.assignments-page :deep(.assignments-spotlight-panel) {
  align-items: stretch;
}

.assignments-status-list {
  min-height: 260px;
  align-content: center;
}

.assignments-timeline {
  min-height: 260px;
  align-content: center;
}

.assignments-target-grid {
  min-height: 260px;
  align-content: center;
}

@media (max-width: 760px) {
  .assignments-page :deep(.assignments-spotlight-panel) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
