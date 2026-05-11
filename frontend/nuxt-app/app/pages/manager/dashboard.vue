<script setup lang="ts">
import type { EChartsOption } from "echarts";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});

const { metrics } = useDashboardData();

const genderRatio = [
  { year: "2021", male: 56, female: 39 },
  { year: "2022", male: 60, female: 44 },
  { year: "2023", male: 63, female: 47 },
  { year: "2024", male: 68, female: 50 },
  { year: "2025", male: 72, female: 54 },
];

const enrollmentTrends = [
  { month: "Jan", enrollments: 58, graduations: 22 },
  { month: "Feb", enrollments: 66, graduations: 23 },
  { month: "Mar", enrollments: 64, graduations: 20 },
  { month: "Apr", enrollments: 88, graduations: 31 },
  { month: "May", enrollments: 92, graduations: 28 },
  { month: "Jun", enrollments: 96, graduations: 23 },
];

const departments = [
  { name: "Computer Science", value: 32 },
  { name: "Engineering", value: 26 },
  { name: "Business", value: 18 },
  { name: "Science", value: 14 },
  { name: "Arts", value: 10 },
];

const chartColors = ["#064b82", "#8847d8", "#0f8b57", "#d97706", "#475569"];

const genderRatioOption = computed<EChartsOption>(() => ({
  color: ["#064b82", "#8847d8"],
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
  grid: { top: 18, right: 12, bottom: 48, left: 36, containLabel: true },
  xAxis: {
    type: "category",
    data: genderRatio.map((point) => point.year),
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    max: 80,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: "#edf1f6" } },
  },
  series: [
    {
      name: "Male",
      type: "bar",
      data: genderRatio.map((point) => point.male),
      barMaxWidth: 28,
      itemStyle: { borderRadius: [5, 5, 0, 0] },
    },
    {
      name: "Female",
      type: "bar",
      data: genderRatio.map((point) => point.female),
      barMaxWidth: 28,
      itemStyle: { borderRadius: [5, 5, 0, 0] },
    },
  ],
}));

const enrollmentTrendOption = computed<EChartsOption>(() => ({
  color: ["#064b82", "#0f8b57"],
  tooltip: { trigger: "axis" },
  legend: { bottom: 0, itemWidth: 16, itemHeight: 10 },
  grid: { top: 16, right: 18, bottom: 48, left: 44, containLabel: true },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: enrollmentTrends.map((point) => point.month),
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    splitLine: { lineStyle: { color: "#edf1f6" } },
  },
  series: [
    {
      name: "Enrollments",
      type: "line",
      smooth: true,
      symbolSize: 7,
      areaStyle: { opacity: 0.16 },
      data: enrollmentTrends.map((point) => point.enrollments),
    },
    {
      name: "Graduations",
      type: "line",
      smooth: true,
      symbolSize: 7,
      areaStyle: { opacity: 0.12 },
      data: enrollmentTrends.map((point) => point.graduations),
    },
  ],
}));

const departmentOption = computed<EChartsOption>(() => ({
  color: chartColors,
  tooltip: { trigger: "item", formatter: "{b}: {d}%" },
  legend: { bottom: 0, itemWidth: 14, itemHeight: 10 },
  series: [
    {
      name: "Department",
      type: "pie",
      radius: ["44%", "70%"],
      center: ["50%", "42%"],
      avoidLabelOverlap: true,
      label: { formatter: "{b}", color: "#020617" },
      data: departments,
    },
  ],
}));
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
        <div class="gender-split">
          <div>
            <strong class="gender-value male">7,234</strong>
            <span>Male (56%)</span>
          </div>
          <div>
            <strong class="gender-value female">5,613</strong>
            <span>Female (44%)</span>
          </div>
        </div>
        <div class="gender-meter" aria-label="Male 56%, female 44%">
          <span class="gender-meter-male" />
          <span class="gender-meter-female" />
        </div>
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
  </div>
</template>
