<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardOverview from "~/components/dashboard/DashboardOverview.vue";
import { usePartnerDashboardPage } from "~/composables/dashboard/role/usePartnerDashboardPage";

const {
  chartError,
  chartsLoading,
  partnerDashboard,
  partnerDashboardError,
  partnerDashboardLoading,
  partnerInstituteLabel,
} = usePartnerDashboardPage();
</script>

<template>
  <div class="page-stack">
    <StatePanel v-if="partnerDashboardLoading" state="loading" />
    <StatePanel
      v-else-if="partnerDashboardError || !partnerDashboard"
      state="error"
      :description="partnerDashboardError"
    />
    <template v-else>
      <DashboardOverview
        :config="partnerDashboard"
        :scope-label="partnerInstituteLabel"
      />

      <UAlert
        v-if="chartsLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        title="Loading scoped charts"
        description="Summary metrics are ready. Charts will appear when the analytics API responds."
      />

      <UAlert
        v-else-if="chartError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Charts unavailable"
        :description="chartError"
      />
    </template>
  </div>
</template>
