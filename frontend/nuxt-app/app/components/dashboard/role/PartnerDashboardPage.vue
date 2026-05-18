<script setup lang="ts">
import { usePartnerDashboardPage } from "~/composables/dashboard/role/usePartnerDashboardPage";

const {
  metrics,
  moodleDashboard,
  moodleDashboardError,
  moodleDashboardLoading,
  reports,
  reportStatus,
  reportStatusOption,
  trafficOption,
} = usePartnerDashboardPage();
</script>

<template>
  <div class="page-stack">
    <section class="grid metrics">
      <MetricCard
        v-for="metric in metrics.slice(0, 3)"
        :key="metric.label"
        :metric="metric"
      />
    </section>

    <section class="grid dashboard-insights">
      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <h2 class="section-title">Shared Report Status</h2>
        <AppEChart
          :option="reportStatusOption"
          height="246px"
          aria-label="Shared report status chart"
        />
        <p class="chart-note">Total shared reports: {{ reportStatus.total }}</p>
      </UCard>

      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <h2 class="section-title">Weekly Traffic</h2>
        <AppEChart
          :option="trafficOption"
          height="246px"
          aria-label="Partner weekly traffic"
        />
      </UCard>
    </section>

    <GenderByInstitutionTable />

    <section class="grid dashboard-detail">
      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-file-bar-chart" />
            Shared Reports
          </h2>
          <p>Report cadence and publishing status for partner review</p>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Cadence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td>{{ report.name }}</td>
                <td>{{ report.cadence }}</td>
                <td>
                  <span
                    class="status"
                    :class="{ warn: report.status === 'Draft' }"
                    >{{ report.status }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-circle-check" />
            Report Mix
          </h2>
          <p>Ready reports compared with drafts in progress</p>
        </div>

        <AppEChart
          :option="reportStatusOption"
          height="292px"
          aria-label="Partner report status mix"
        />
      </UCard>
    </section>

    <USeparator />

    <StatePanel v-if="moodleDashboardLoading" state="loading" />
    <StatePanel
      v-else-if="moodleDashboardError || !moodleDashboard"
      state="error"
      :description="moodleDashboardError"
    />
    <DashboardOverview v-else :config="moodleDashboard" />
  </div>
</template>
