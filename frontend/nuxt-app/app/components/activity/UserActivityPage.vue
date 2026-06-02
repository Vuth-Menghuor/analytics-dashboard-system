<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { useUserActivityPage } from "~/composables/activity/useUserActivityPage";

const {
  activityError,
  activityLoading,
  charts,
  error,
  isLoading,
  metrics,
  partnerInstituteLabel,
  refresh,
  summaryError,
  summaryLoading,
  table,
} = useUserActivityPage();

const { t } = useI18n();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Moodle activity"
      title="User Activity"
      copy="Monitor Moodle login status, active users, inactive users, and never-logged-in accounts from the analytics database."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft">GET /api/dashboard/users/activity</UBadge>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :label="t('text.refresh')"
          @click="refresh"
        />
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <UAlert
        v-if="summaryError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Summary metrics unavailable"
        :description="summaryError"
      />

      <section class="grid metrics">
        <StatePanel v-if="summaryLoading" state="loading" />
        <MetricCard
          v-else
          v-for="metric in metrics"
          :key="metric.label"
          :metric="metric"
        />
      </section>

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard
          v-if="!activityLoading"
          v-for="chart in charts"
          :key="chart.title"
          :chart="chart"
        />
      </section>

      <UAlert
        v-if="activityLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        title="Loading login activity"
        description="Summary cards can load separately. Login status charts and table will update when Moodle activity responds."
      />

      <UAlert
        v-else-if="activityError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Login activity unavailable"
        :description="activityError"
      />

      <DashboardDataTable
        v-if="!activityLoading && !activityError"
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="760px"
      />
    </template>
  </div>
</template>
