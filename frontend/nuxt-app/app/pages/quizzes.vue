<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { appColors } from '~/constants/colors'

definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor'],
})

const filters = reactive({
  course: 'All courses',
  quizType: 'All quizzes',
  status: 'All statuses',
  range: 'This semester',
})

const quizStats = [
  {
    label: 'Quizzes',
    value: '214',
    trend: '+7 quizzes',
    icon: 'i-lucide-circle-help',
  },
  {
    label: 'Attempts',
    value: '28,491',
    trend: '+1,282 attempts',
    icon: 'i-lucide-trending-up',
  },
  {
    label: 'Avg. Score',
    value: '76%',
    trend: '+4.2 points',
    icon: 'i-lucide-circle-check-big',
  },
  {
    label: 'Pass Rate',
    value: '81%',
    trend: '+3.8 points',
    icon: 'i-lucide-user-round-check',
  },
]

const attemptTrend = [
  { label: 'Jan', attempts: 2440, passRate: 74 },
  { label: 'Feb', attempts: 2890, passRate: 77 },
  { label: 'Mar', attempts: 3240, passRate: 79 },
  { label: 'Apr', attempts: 3680, passRate: 82 },
  { label: 'May', attempts: 3920, passRate: 84 },
]

const scoreBands = [
  { label: '90-100', value: 52, tone: 'high' },
  { label: '80-89', value: 74, tone: 'high' },
  { label: '65-79', value: 88, tone: 'medium' },
  { label: '50-64', value: 42, tone: 'medium' },
  { label: '0-49', value: 31, tone: 'low' },
]

const quizWatch = [
  { label: 'Midterm Quiz', value: 84, tone: 'high', detail: '420 attempts, stable pass rate' },
  { label: 'Design Checkpoint', value: 82, tone: 'high', detail: '312 attempts, low retry volume' },
  { label: 'Statistics Quiz 2', value: 61, tone: 'medium', detail: '286 attempts, high retry count' },
  { label: 'Math Practice', value: 56, tone: 'low', detail: 'Follow-up on weak score band' },
]

const quizTimeline = [
  {
    time: '08:30',
    title: 'Midterm Quiz opened',
    detail: 'DB-MDL-401 generated 420 attempts with an 84% pass rate.',
  },
  {
    time: '10:15',
    title: 'Statistics Quiz 2 retry spike',
    detail: 'Retry volume reached 36%, suggesting question review is needed.',
  },
  {
    time: '13:20',
    title: 'Design Checkpoint completed',
    detail: 'LDA-210 cohorts finished with an 82% average score.',
  },
  {
    time: '15:45',
    title: 'Practice quiz score dip',
    detail: 'Math Practice moved below the healthy threshold in one cohort.',
  },
]

const quizRows = [
  {
    quiz: 'Midterm Quiz',
    course: 'DB-MDL-401',
    attempts: '420',
    average: '79%',
    passRate: '84%',
    signal: 'Healthy',
  },
  {
    quiz: 'Statistics Quiz 2',
    course: 'BUS-STATS',
    attempts: '286',
    average: '61%',
    passRate: '64%',
    signal: 'Needs review',
  },
  {
    quiz: 'Design Checkpoint',
    course: 'LDA-210',
    attempts: '312',
    average: '82%',
    passRate: '88%',
    signal: 'Healthy',
  },
  {
    quiz: 'Math Practice',
    course: 'ENG-MATH',
    attempts: '198',
    average: '56%',
    passRate: '58%',
    signal: 'Needs review',
  },
]

const quizColumns = [
  { key: 'quiz', label: 'Quiz', width: '28%', rowHeader: true },
  { key: 'course', label: 'Course', width: '16%', tone: 'muted' },
  { key: 'attempts', label: 'Attempts', width: '14%', tone: 'strong' },
  { key: 'average', label: 'Average', width: '14%' },
  { key: 'passRate', label: 'Pass rate', width: '14%' },
  {
    key: 'signal',
    label: 'Signal',
    width: '16%',
    type: 'status',
    warningValues: ['Needs review'],
  },
] as const

const tooltipShadow = '0 14px 34px rgba(15, 23, 42, 0.14)'

const attemptTrendOption = computed<EChartsOption>(() => ({
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
    data: attemptTrend.map((point) => point.label),
    axisLine: { lineStyle: { color: appColors.axis } },
    axisTick: { show: false },
    axisLabel: { color: appColors.secondary, fontSize: 12 },
  },
  yAxis: [
    {
      type: 'value',
      name: 'Attempts',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: appColors.secondary, fontSize: 12 },
      splitLine: { lineStyle: { color: appColors.grid, type: 'dashed' } },
    },
    {
      type: 'value',
      name: 'Pass rate',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: appColors.secondary, fontSize: 12, formatter: '{value}%' },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: 'Attempts',
      type: 'bar',
      barMaxWidth: 26,
      itemStyle: { borderRadius: [8, 8, 0, 0] },
      data: attemptTrend.map((point) => point.attempts),
    },
    {
      name: 'Pass rate',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: {
        color: appColors.white,
        borderColor: appColors.success,
        borderWidth: 2,
      },
      data: attemptTrend.map((point) => point.passRate),
    },
  ],
}))
</script>

<template>
  <div class="page-stack quizzes-page">
    <PageHeader
      eyebrow="Quiz performance"
      title="Quiz Analytics"
      copy="Review Moodle quiz attempts, pass rates, score bands, retries, and quizzes that need question or cohort follow-up."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">GET /api/analytics/quizzes</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS', 'ENG-MATH']" />
      </div>
      <div class="analytics-filter-field">
        <label>Quiz type</label>
        <USelect v-model="filters.quizType" :items="['All quizzes', 'Practice', 'Checkpoint', 'Midterm', 'Final']" />
      </div>
      <div class="analytics-filter-field">
        <label>Status</label>
        <USelect v-model="filters.status" :items="['All statuses', 'Healthy', 'Needs review', 'Low pass rate']" />
      </div>
      <div class="analytics-filter-field">
        <label>Period</label>
        <USelect v-model="filters.range" :items="['This week', 'This month', 'This semester']" />
      </div>
    </UCard>

    <section class="grid metrics">
      <MetricCard v-for="stat in quizStats" :key="stat.label" :metric="stat" />
    </section>

    <section class="grid course-overview-layout">
      <UCard as="article" :ui="{ body: 'course-detail-panel quizzes-spotlight-panel' }">
        <div class="course-detail-copy">
          <p class="eyebrow">Quiz focus</p>
          <h2>Midterm Quiz</h2>
          <p>Most active quiz with stable attempt volume, healthy pass rate, and a manageable retry pattern across the DB-MDL-401 cohort.</p>
          <div class="course-detail-badges">
            <UBadge color="primary" variant="soft">DB-MDL-401</UBadge>
            <UBadge color="neutral" variant="soft">420 attempts</UBadge>
            <UBadge color="success" variant="soft">79% average</UBadge>
          </div>
        </div>
        <div class="profile-stat-grid">
          <div>
            <span>Attempts</span>
            <strong>420</strong>
          </div>
          <div>
            <span>Average</span>
            <strong>79%</strong>
          </div>
          <div>
            <span>Pass</span>
            <strong>84%</strong>
          </div>
          <div>
            <span>Retakes</span>
            <strong>46</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'course-health-panel' }">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-radar" />
            Quiz Watch
          </h2>
          <p>Quizzes with low averages or high retry counts</p>
        </div>
        <div class="course-health-list">
          <button v-for="item in quizWatch" :key="item.label" type="button">
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
            Attempt Trend
          </h2>
          <p>Monthly quiz attempts compared with pass rate</p>
        </div>
        <AppEChart
          :option="attemptTrendOption"
          height="320px"
          aria-label="Quiz attempt trend and pass rate"
        />
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-chart-no-axes-combined" />
            Score Distribution
          </h2>
          <p>Quiz score bands for the selected period</p>
        </div>
        <div class="completion-rate-list quizzes-score-list">
          <div v-for="item in scoreBands" :key="item.label">
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
            <UIcon name="i-lucide-clock-3" />
            Quiz Activity Timeline
          </h2>
          <p>Recent quiz events and review signals</p>
        </div>
        <div class="student-timeline quizzes-timeline">
          <div v-for="event in quizTimeline" :key="event.time">
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
            Quiz Targets
          </h2>
          <p>Progress against assessment quality thresholds</p>
        </div>
        <div class="profile-stat-grid quizzes-target-grid">
          <div>
            <span>Pass threshold</span>
            <strong>81%</strong>
          </div>
          <div>
            <span>Retry control</span>
            <strong>73%</strong>
          </div>
          <div>
            <span>Question health</span>
            <strong>86%</strong>
          </div>
          <div>
            <span>Review complete</span>
            <strong>64%</strong>
          </div>
        </div>
      </UCard>
    </section>

    <DashboardDataTable
      title="Quiz Table"
      icon="i-lucide-table"
      description="Sample quiz performance metrics by course"
      :columns="quizColumns"
      :rows="quizRows"
      row-key="quiz"
      min-width="940px"
    />
  </div>
</template>

<style scoped>
.quizzes-page :deep(.quizzes-spotlight-panel) {
  align-items: stretch;
}

.quizzes-score-list {
  min-height: 260px;
  align-content: center;
}

.quizzes-timeline {
  min-height: 260px;
  align-content: center;
}

.quizzes-target-grid {
  min-height: 260px;
  align-content: center;
}

@media (max-width: 760px) {
  .quizzes-page :deep(.quizzes-spotlight-panel) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
