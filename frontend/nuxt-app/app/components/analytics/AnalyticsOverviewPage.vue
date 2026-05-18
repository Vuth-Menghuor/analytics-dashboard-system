<script setup lang="ts">
import { useAnalyticsOverview } from "~/composables/analytics/useAnalyticsOverview";

const {
  analyticsPeriod,
  analyticsPeriods,
  categoryChartHeight,
  categoryOption,
  importedMetrics,
  isLoading,
  loadError,
  recentCourseColumns,
  recentCourseRows,
  topCategories,
  weeklyActivityOption,
} = useAnalyticsOverview();
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
