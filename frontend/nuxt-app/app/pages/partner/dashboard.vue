<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useDashboardData } from "~/composables/dashboard/useDashboardData";
import { appColors } from "~/constants/colors";

definePageMeta({
  middleware: ["role"],
  roles: ["partner"],
});

const { metrics, reports, weeklyTraffic } = useDashboardData();

const reportStatus = computed(() => {
  const ready = reports.filter((report) => report.status === "Ready").length;
  const draft = reports.filter((report) => report.status === "Draft").length;

  return { ready, draft, total: reports.length };
});

const trafficOption = computed<EChartsOption>(() => ({
  color: [appColors.primaryHover],
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { top: 16, right: 12, bottom: 28, left: 36, containLabel: true },
  xAxis: {
    type: "category",
    data: weeklyTraffic.map((point) => point.label),
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    max: 100,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: appColors.grid } },
  },
  series: [
    {
      name: "Traffic",
      type: "bar",
      data: weeklyTraffic.map((point) => point.value),
      barMaxWidth: 34,
      itemStyle: { borderRadius: [5, 5, 0, 0] },
    },
  ],
}));

const reportStatusOption = computed<EChartsOption>(() => ({
  color: [appColors.success, appColors.warning],
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
        color: appColors.ink,
        fontWeight: 700,
      },
      data: [
        { name: "Ready", value: reportStatus.value.ready },
        { name: "Draft", value: reportStatus.value.draft },
      ],
    },
  ],
}));
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
  </div>
</template>
