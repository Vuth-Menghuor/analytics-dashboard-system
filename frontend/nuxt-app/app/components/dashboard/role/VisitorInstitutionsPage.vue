<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import {
  getPublicStudentsByDepartment,
  getPublicStudentsByInstitution,
} from "~/services/analytics.service";
import type { AnalyticsChart } from "~/types/analytics";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";

const charts = ref<AnalyticsChart[]>([]);
const isLoading = ref(true);
const error = ref("");

const loadInstitutions = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const [institutions, departments] = await Promise.all([
      getPublicStudentsByInstitution(),
      getPublicStudentsByDepartment(),
    ]);

    charts.value = [
      {
        title: "Student Distribution by Institute",
        description: "Public aggregate student counts by institution.",
        icon: "i-lucide-building-2",
        type: "horizontalBar",
        height: "380px",
        wide: true,
        labels: institutions.slice(0, 8).map((point) => point.institution),
        series: [
          {
            name: "Students",
            data: institutions.slice(0, 8).map((point) => point.totalStudents),
          },
        ],
      },
      {
        title: "Top Departments",
        description: "Public aggregate student counts by department.",
        icon: "i-lucide-list-ordered",
        type: "bar",
        height: "340px",
        labels: departments
          .slice(0, 8)
          .map((point) => formatStudentDepartmentLabel(point.department)),
        series: [
          {
            name: "Students",
            data: departments.slice(0, 8).map((point) => point.totalStudents),
          },
        ],
      },
    ];
  } catch {
    error.value = "Unable to load public institute summary.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadInstitutions);
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Public Moodle analytics"
      title="Institutes"
      copy="A limited public view of institution and department distribution. Filters, details, and scoped institute analytics require login."
    />

    <AppLoadingSkeleton
      v-if="isLoading"
      variant="charts"
      container-class="grid analytics-chart-grid"
      :count="2"
      :wide-indexes="[0]"
    />
    <StatePanel
      v-else-if="error || !charts.length"
      state="error"
      :description="error"
    />

    <section v-else class="grid analytics-chart-grid">
      <AnalyticsChartCard
        v-for="chart in charts"
        :key="chart.title"
        :chart="chart"
        :class="{ 'analytics-chart-wide': chart.wide }"
      />
    </section>
  </div>
</template>
