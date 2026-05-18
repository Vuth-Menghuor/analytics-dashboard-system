<script setup lang="ts">
import { useVisitorDashboardPage } from "~/composables/dashboard/role/useVisitorDashboardPage";

const {
  availableReports,
  metrics,
  moodleDashboardError,
  moodleDashboardLoading,
  publicMoodleDashboard,
  reportStatus,
  reportStatusOption,
  visitorTrafficOption,
} = useVisitorDashboardPage();
</script>

<template>
  <div class="page-stack">
    <section class="visitor-dashboard-intro">
      <h1>Cambodia Higher Education Statistics</h1>
      <p>
        Explore public statistics about higher education institutions, student
        enrollment, and academic achievements across Cambodia.
      </p>
    </section>

    <section class="grid metrics">
      <MetricCard
        v-for="metric in metrics.slice(1, 3)"
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
        <h2 class="section-title">Available Report Access</h2>
        <AppEChart
          :option="reportStatusOption"
          height="246px"
          aria-label="Available report access chart"
        />
        <p class="chart-note">Total reports: {{ reportStatus.total }}</p>
      </UCard>

      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <h2 class="section-title">Public Activity Snapshot</h2>
        <AppEChart
          :option="visitorTrafficOption"
          height="246px"
          aria-label="Visitor public activity snapshot"
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
            <UIcon name="i-lucide-file-text" />
            Available Reports
          </h2>
          <p>Read-only reports currently published for visitor access</p>
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
              <tr v-for="report in availableReports" :key="report.id">
                <td>{{ report.name }}</td>
                <td>{{ report.cadence }}</td>
                <td>
                  <span class="status">{{ report.status }}</span>
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
            <UIcon name="i-lucide-chart-pie" />
            Report Visibility
          </h2>
          <p>Published reports compared with internal drafts</p>
        </div>

        <AppEChart
          :option="reportStatusOption"
          height="292px"
          aria-label="Visitor report visibility mix"
        />
      </UCard>
    </section>

    <USeparator />

    <StatePanel v-if="moodleDashboardLoading" state="loading" />
    <StatePanel
      v-else-if="moodleDashboardError || !publicMoodleDashboard"
      state="error"
      :description="moodleDashboardError"
    />
    <DashboardOverview v-else :config="publicMoodleDashboard" />
  </div>
</template>
