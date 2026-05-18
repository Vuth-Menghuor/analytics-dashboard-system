<script setup lang="ts">
import { useManagerDashboardPage } from "~/composables/dashboard/role/useManagerDashboardPage";

const {
  departmentOption,
  enrollmentTrendOption,
  genderDistributionOption,
  genderRatioOption,
  metrics,
  moodleDashboard,
  moodleDashboardError,
  moodleDashboardLoading,
} = useManagerDashboardPage();
</script>

<template>
  <div class="page-stack">
    <section class="grid metrics">
      <MetricCard
        v-for="metric in metrics"
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
        <h2 class="section-title">Student Gender Distribution</h2>
        <AppEChart
          :option="genderDistributionOption"
          height="246px"
          aria-label="Student gender distribution chart"
        />
        <p class="chart-note">Total: 12,847</p>
      </UCard>

      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <h2 class="section-title">Gender Ratio by Year</h2>
        <AppEChart
          :option="genderRatioOption"
          height="246px"
          aria-label="Gender ratio by year"
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
            <UIcon name="i-lucide-trending-up" />
            Enrollment Trends
          </h2>
          <p>Monthly enrollment and graduation statistics</p>
        </div>

        <AppEChart
          :option="enrollmentTrendOption"
          height="292px"
          aria-label="Monthly enrollment and graduation trends"
        />
      </UCard>

      <UCard
        as="article"
        class="analytics-card"
        :ui="{ body: 'analytics-card-body' }"
      >
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-graduation-cap" />
            By Department
          </h2>
          <p>Student distribution across departments</p>
        </div>

        <AppEChart
          :option="departmentOption"
          height="292px"
          aria-label="Student distribution across departments"
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
