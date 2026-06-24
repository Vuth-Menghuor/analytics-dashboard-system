<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardOverview from "~/components/dashboard/DashboardOverview.vue";
import { useVisitorDashboardPage } from "~/composables/dashboard/role/useVisitorDashboardPage";

const {
  moodleDashboardError,
  moodleDashboardLoading,
  publicMoodleDashboard,
} = useVisitorDashboardPage();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <section class="visitor-dashboard-intro">
      <h1>{{ translateText("Cambodia Higher Education Statistics") }}</h1>
      <p>
        {{
          translateText(
            "Explore public statistics about higher education institutions, student enrollment, and academic achievements across Cambodia.",
          )
        }}
      </p>
    </section>

    <StatePanel v-if="moodleDashboardLoading" state="loading" />
    <StatePanel
      v-else-if="moodleDashboardError || !publicMoodleDashboard"
      state="error"
      :description="moodleDashboardError"
    />
    <DashboardOverview v-else :config="publicMoodleDashboard" />
  </div>
</template>
