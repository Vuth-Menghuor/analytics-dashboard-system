<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { getPublicPopularCourses } from "~/services/analytics.service";
import type { AnalyticsChart } from "~/types/analytics";

const chart = ref<AnalyticsChart | null>(null);
const isLoading = ref(true);
const error = ref("");

const loadCourses = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const courses = await getPublicPopularCourses();
    const visibleCourses = courses.slice(0, 8);

    chart.value = {
      title: "Popular Courses",
      description: "Public course popularity by enrollment records.",
      icon: "i-lucide-trending-up",
      type: "horizontalBar",
      height: "380px",
      labels: visibleCourses.map((course) => course.courseName),
      series: [
        {
          name: "Enrollments",
          data: visibleCourses.map((course) => course.totalEnrollments),
        },
      ],
    };
  } catch {
    error.value = "Unable to load public course summary.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadCourses);
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Public Moodle analytics"
      title="Courses"
      copy="A limited public view of course popularity. Detailed course records and learner activity require an approved account."
    />

    <AppLoadingSkeleton
      v-if="isLoading"
      variant="charts"
      container-class="grid analytics-chart-grid"
      :count="1"
      :wide-indexes="[0]"
    />
    <StatePanel v-else-if="error || !chart" state="error" :description="error" />

    <section v-else class="grid analytics-chart-grid">
      <AnalyticsChartCard :chart="chart" class="analytics-chart-wide" />
    </section>
  </div>
</template>
