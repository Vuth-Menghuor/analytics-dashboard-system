<script setup lang="ts">
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardOverview from "~/components/dashboard/DashboardOverview.vue";
import DashboardStudentList from "~/components/dashboard/DashboardStudentList.vue";
import { usePartnerDashboardPage } from "~/composables/dashboard/role/usePartnerDashboardPage";

const {
  chartError,
  chartOptions,
  chartsLoading,
  partnerDashboard,
  partnerDashboardError,
  partnerDashboardLoading,
  partnerInstituteLabel,
} = usePartnerDashboardPage();
</script>

<template>
  <div class="page-stack">
    <template v-if="partnerDashboardLoading">
      <AppLoadingSkeleton variant="metrics" :count="5" />
      <AppLoadingSkeleton
        variant="charts"
        container-class="grid analytics-chart-grid"
        :count="2"
        :wide-indexes="[0]"
      />
    </template>
    <StatePanel
      v-else-if="partnerDashboardError || !partnerDashboard"
      state="error"
      :description="partnerDashboardError"
    />
    <template v-else>
      <DashboardOverview
        :config="partnerDashboard"
        :chart-options="chartOptions"
        :scope-label="partnerInstituteLabel"
      />

      <AppLoadingSkeleton
        v-if="chartsLoading"
        variant="charts"
        container-class="grid analytics-chart-grid"
        :count="2"
        :wide-indexes="[0]"
      />

      <UAlert
        v-else-if="chartError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="String(translateText('Charts unavailable'))"
        :description="chartError"
      />

      <DashboardStudentList />
    </template>
  </div>
</template>
