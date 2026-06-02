<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import { useManagerDashboardPage } from "~/composables/dashboard/role/useManagerDashboardPage";

const {
  chartError,
  chartsLoading,
  topDepartmentsOption,
  popularCoursesOption,
  courseCompletionOption,
  genderDistributionOption,
  totalGenderStudents,
  learningPerformanceSummary,
  metrics,
  moodleDashboardError,
  moodleDashboardLoading,
} = useManagerDashboardPage();

const { t } = useI18n();
</script>

<template>
  <div class="page-stack">
    <StatePanel v-if="moodleDashboardLoading" state="loading" />

    <StatePanel
      v-else-if="moodleDashboardError"
      state="error"
      :description="moodleDashboardError"
    />

    <section v-else class="grid metrics">
      <MetricCard
        v-for="metric in metrics"
        :key="metric.label"
        :metric="metric"
      />
    </section>

    <section class="grid dashboard-insights">
      <StatePanel v-if="chartsLoading" state="loading" />

      <StatePanel
        v-else-if="chartError"
        state="error"
        :description="chartError"
      />

      <template v-else>
        <AnalyticsChartCard
          title="Top 10 Departments by Students"
          icon="i-lucide-list-ordered"
          description="Largest Moodle departments by enrolled students."
          badge="Top departments"
          :option="topDepartmentsOption"
          height="292px"
          aria-label="Top 10 Departments by Students"
        />

        <AnalyticsChartCard
          :title="t('text.studentGenderDistribution')"
          icon="i-lucide-users"
          :description="t('text.genderBreakdown')"
          :badge="`Total: ${totalGenderStudents.toLocaleString()}`"
          :option="genderDistributionOption"
          height="246px"
          :aria-label="t('text.studentGenderDistribution')"
        />

        <AnalyticsChartCard
        :title="t('text.popularCourses')"
        icon="i-lucide-trending-up"
        :description="t('text.coursesRanked')"
        :badge="t('text.topCourses')"
        badge-color="warning"
        :option="popularCoursesOption"
        height="292px"
        :aria-label="t('text.popularCourses')"
      />

      <AnalyticsChartCard
        title="Course Completion Rate"
        icon="i-lucide-check-circle-2"
        description="Top courses by completion percentage."
        badge="Completion"
        badge-color="success"
        :option="courseCompletionOption"
        height="292px"
        aria-label="Course Completion Rate"
      />
      </template>
    </section>

    <section
      v-if="!chartsLoading && !chartError"
      class="grid dashboard-detail"
    >
      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-graduation-cap" />
              Learning Performance Summary
            </h2>
            <p class="chart-note">Static preview of grade, quiz, and assignment indicators.</p>
          </div>
          <UBadge color="warning" variant="soft">Static preview</UBadge>
        </div>

        <div class="static-preview-stat-grid">
          <div
            v-for="metric in learningPerformanceSummary"
            :key="metric.label"
          >
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-route" />
              Drill Down
            </h2>
            <p class="chart-note">Dashboard stays summary-only. Open detail pages for full analysis.</p>
          </div>
        </div>
        <div class="dashboard-drilldown-actions">
          <UButton to="/students" color="neutral" variant="outline" icon="i-lucide-users" label="View students" />
          <UButton to="/courses" color="neutral" variant="outline" icon="i-lucide-book-open" label="View courses" />
          <UButton to="/activity" color="neutral" variant="outline" icon="i-lucide-activity" label="View activity" />
          <UButton to="/learning-performance" color="neutral" variant="outline" icon="i-lucide-graduation-cap" label="View learning performance" />
        </div>
      </UCard>
    </section>
  </div>
</template>
