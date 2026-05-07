<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager']
})

const { metrics, reports, users, weeklyTraffic } = useDashboardData()
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Manager access"
      title="Manager Dashboard"
      copy="A focused overview of revenue, audience, support workload, and report readiness."
    >
      <div class="toolbar">
        <NuxtLink class="btn" to="/reports">
          <IconByName name="FileBarChart" />
          Reports
        </NuxtLink>
        <button class="btn primary">
          <IconByName name="Download" />
          Export
        </button>
      </div>
    </PageHeader>

    <section class="grid metrics">
      <MetricCard v-for="metric in metrics" :key="metric.label" :metric="metric" />
    </section>

    <section class="grid two">
      <article class="card card-pad">
        <h2 class="section-title">Weekly Traffic</h2>
        <div class="chart-bars">
          <div v-for="point in weeklyTraffic" :key="point.label" class="bar">
            <div class="bar-fill" :style="{ height: `${point.value}%` }" />
            <span>{{ point.label }}</span>
          </div>
        </div>
      </article>

      <article class="card card-pad">
        <h2 class="section-title">Recent Users</h2>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dashboardUser in users.slice(0, 3)" :key="dashboardUser.id">
                <td>{{ dashboardUser.name }}</td>
                <td>{{ dashboardUser.role }}</td>
                <td><span class="status">{{ dashboardUser.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <article class="card card-pad">
      <h2 class="section-title">Report Queue</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Owner</th>
              <th>Cadence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>{{ report.name }}</td>
              <td>{{ report.owner }}</td>
              <td>{{ report.cadence }}</td>
              <td>
                <span class="status" :class="{ warn: report.status === 'Draft' }">{{ report.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </div>
</template>
