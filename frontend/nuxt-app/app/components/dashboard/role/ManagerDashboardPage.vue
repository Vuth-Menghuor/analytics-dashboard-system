<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import DashboardStudentList from "~/components/dashboard/DashboardStudentList.vue";
import { useManagerDashboardPage } from "~/composables/dashboard/role/useManagerDashboardPage";

const {
  applyInstituteFilter,
  chartError,
  chartsLoading,
  clearInstituteFilter,
  genderChartBadge,
  hasInstituteFilter,
  instituteChartBadge,
  instituteFilterDraft,
  instituteFilterOptions,
  institutionDistributionOption,
  institutionDistributionHeight,
  enrollmentTrendChart,
  genderDistributionOption,
  metrics,
  moodleDashboardError,
  moodleDashboardLoading,
} = useManagerDashboardPage();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <AppLoadingSkeleton v-if="moodleDashboardLoading" variant="metrics" :count="5" />

    <StatePanel
      v-else-if="moodleDashboardError"
      state="error"
      :description="moodleDashboardError"
    />

    <section v-else class="grid metrics">
      <MetricCard
        v-for="metric in metrics"
        :key="metric.label"
        :metric="metric"
      />
    </section>

    <UCard
      as="section"
      class="manager-overview-filters"
      :ui="{ body: 'manager-overview-filters-body' }"
    >
      <div>
        <h2 class="section-title with-icon">
          <UIcon name="i-lucide-sliders-horizontal" />
          {{ translateText("Overview Filters") }}
        </h2>
        <p class="chart-note">
          {{ translateText("Apply an institute scope to dashboard charts.") }}
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <AppSelect
          v-model="instituteFilterDraft"
          :items="instituteFilterOptions"
          value-key="value"
          searchable
          class="min-w-52"
          :aria-label="String(translateText('Filter overview by institute'))"
        />
        <AppButton
          action="search"
          :label="String(translateText('Apply filters'))"
          @click="applyInstituteFilter"
        />
        <AppButton
          v-if="hasInstituteFilter"
          action="clear"
          @click="clearInstituteFilter"
        />
      </div>
    </UCard>

    <AppLoadingSkeleton
      v-if="chartsLoading"
      variant="charts"
      container-class="grid dashboard-insights"
      :count="3"
      :bar-count="8"
      :wide-indexes="[2]"
    />

    <section v-else class="grid dashboard-insights">
      <StatePanel
        v-if="chartError"
        state="error"
        :description="chartError"
      />

      <template v-else>
        <AnalyticsChartCard
          title="Students by Institute"
          icon="i-lucide-building-2"
          description="Student totals across all Moodle institutes."
          :badge="instituteChartBadge"
          :option="institutionDistributionOption"
          :height="institutionDistributionHeight"
          aria-label="Students by Institute"
        >
          <template #actions>
            <AppButton
              action="details"
              to="/institutes"
              :label="t('text.viewDetails')"
            />
          </template>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Gender Distribution"
          icon="i-lucide-pie-chart"
          description="Breakdown of students by gender."
          :option="genderDistributionOption"
          height="360px"
          aria-label="Gender Distribution"
        >
          <template #actions>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <UBadge color="primary" variant="soft">
                {{ genderChartBadge }}
              </UBadge>
              <AppButton
                action="details"
                to="/students"
                :label="t('text.viewDetails')"
              />
            </div>
          </template>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          :chart="enrollmentTrendChart"
          class="analytics-chart-wide"
        />
      </template>
    </section>

    <DashboardStudentList />
  </div>
</template>

<style scoped>
.manager-overview-filters :deep(.manager-overview-filters-body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 767px) {
  .manager-overview-filters :deep(.manager-overview-filters-body) {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
