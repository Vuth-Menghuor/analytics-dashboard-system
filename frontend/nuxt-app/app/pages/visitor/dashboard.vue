<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";

definePageMeta({
  middleware: ["role"],
  roles: ["visitor"],
});

const { metrics, reports, weeklyTraffic } = useDashboardData();

const availableReports = computed(() =>
  reports.filter((report) => report.status === "Ready"),
);

const reportStatus = computed(() => {
  const ready = availableReports.value.length;
  const draft = reports.filter((report) => report.status === "Draft").length;

  return { ready, draft, total: reports.length };
});

const visitorTrafficOption = computed<EChartsOption>(() => ({
  color: ["#064b82", "#0f8b57"],
  tooltip: { trigger: "axis" },
  legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
  grid: { top: 16, right: 18, bottom: 48, left: 44, containLabel: true },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: weeklyTraffic.map((point) => point.label),
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    max: 100,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: "#edf1f6" } },
  },
  series: [
    {
      name: "Activity",
      type: "line",
      smooth: true,
      symbolSize: 7,
      areaStyle: { opacity: 0.14 },
      data: weeklyTraffic.map((point) => point.value),
    },
    {
      name: "Baseline",
      type: "line",
      smooth: true,
      symbolSize: 7,
      areaStyle: { opacity: 0.08 },
      data: weeklyTraffic.map((point) => Math.max(point.value - 14, 8)),
    },
  ],
}));

const reportStatusOption = computed<EChartsOption>(() => ({
  color: ["#0f8b57", "#d97706"],
  tooltip: { trigger: "item", formatter: "{b}: {c}" },
  legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
  series: [
    {
      name: "Reports",
      type: "pie",
      radius: ["52%", "74%"],
      center: ["50%", "42%"],
      avoidLabelOverlap: true,
      label: {
        formatter: "{b}\n{d}%",
        color: "#020617",
        fontWeight: 700,
      },
      data: [
        { name: "Available", value: reportStatus.value.ready },
        { name: "Draft", value: reportStatus.value.draft },
      ],
    },
  ],
}));
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
  </div>
</template>
