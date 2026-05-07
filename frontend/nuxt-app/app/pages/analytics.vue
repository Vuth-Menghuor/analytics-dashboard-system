<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner']
})

const { metrics, weeklyTraffic } = useDashboardData()
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Medium priority"
      title="Analytics"
      copy="Compare product, acquisition, and customer health signals across the current reporting window."
    >
      <select class="input" aria-label="Analytics period">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Quarter to date</option>
      </select>
    </PageHeader>

    <section class="grid metrics">
      <MetricCard v-for="metric in metrics" :key="metric.label" :metric="metric" />
    </section>

    <article class="card card-pad">
      <h2 class="section-title">Acquisition Trend</h2>
      <div class="chart-bars">
        <div v-for="point in weeklyTraffic" :key="point.label" class="bar">
          <div class="bar-fill" :style="{ height: `${point.value}%` }" />
          <span>{{ point.label }}</span>
        </div>
      </div>
    </article>
  </div>
</template>
