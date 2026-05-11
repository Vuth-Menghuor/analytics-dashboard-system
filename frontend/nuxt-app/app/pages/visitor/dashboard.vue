<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['visitor']
})

const { metrics, reports } = useDashboardData()
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Visitor access"
      title="Visitor Dashboard"
      copy="Read-only snapshot of public workspace performance and available reports."
    />

    <section class="grid metrics">
      <MetricCard v-for="metric in metrics.slice(1, 3)" :key="metric.label" :metric="metric" />
    </section>

    <UCard as="article" :ui="{ body: 'p-5' }">
      <h2 class="section-title">Available Reports</h2>
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
            <tr v-for="report in reports.filter((item) => item.status === 'Ready')" :key="report.id">
              <td>{{ report.name }}</td>
              <td>{{ report.cadence }}</td>
              <td><span class="status">{{ report.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
