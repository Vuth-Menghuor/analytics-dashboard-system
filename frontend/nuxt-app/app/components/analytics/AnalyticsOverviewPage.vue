<script setup lang="ts">
import AppEChart from "~/components/common/AppEChart.vue";
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useAnalyticsOverview } from "~/composables/analytics/useAnalyticsOverview";

const {
  categoryChartHeight,
  categoryOption,
  importedMetrics,
  isLoading,
  loadError,
  recentCourseColumns,
  recentCourseRows,
  topCategories,
} = useAnalyticsOverview();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Dashboard insights"
      title="Analytics"
      copy="Monitor imported course data, learning activity, and reporting trends from the Moodle database."
    />

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

  </div>
</template>
