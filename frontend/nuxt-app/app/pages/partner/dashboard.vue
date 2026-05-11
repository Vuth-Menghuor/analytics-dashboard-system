<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['partner']
})

const { metrics, reports, weeklyTraffic } = useDashboardData()
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Partner access"
      title="Partner Dashboard"
      copy="Shared performance signals and report status for partner collaboration."
    >
      <div class="toolbar">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-file-bar-chart"
          label="Reports"
          to="/reports"
        />
      </div>
    </PageHeader>

    <section class="grid metrics">
      <MetricCard v-for="metric in metrics.slice(0, 3)" :key="metric.label" :metric="metric" />
    </section>

    <section class="grid two">
      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Weekly Traffic</h2>
        <div class="chart-bars">
          <div v-for="point in weeklyTraffic" :key="point.label" class="bar">
            <div class="bar-fill" :style="{ height: `${point.value}%` }" />
            <span>{{ point.label }}</span>
          </div>
        </div>
      </UCard>

      <UCard as="article" :ui="{ body: 'p-5' }">
        <h2 class="section-title">Shared Reports</h2>
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
                  <span class="status" :class="{ warn: report.status === 'Draft' }">{{ report.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </section>
  </div>
</template>
