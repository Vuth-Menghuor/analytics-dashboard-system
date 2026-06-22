<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSegmentedControl from "~/components/common/AppSegmentedControl.vue";
import { useManagerDashboardPage } from "~/composables/dashboard/role/useManagerDashboardPage";

const {
  activityPeriodOptions,
  applyInstituteFilter,
  chartError,
  chartsLoading,
  clearInstituteFilter,
  departmentChartBadge,
  genderChartBadge,
  hasInstituteFilter,
  instituteChartBadge,
  instituteFilterDraft,
  instituteFilterOptions,
  institutionDistributionOption,
  institutionDistributionHeight,
  departmentDistributionHeight,
  topDepartmentsOption,
  popularCoursesOption,
  popularCoursesHeight,
  genderDistributionOption,
  studentActivityOption,
  metrics,
  moodleDashboardError,
  moodleDashboardLoading,
  selectedActivityPeriod,
} = useManagerDashboardPage();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <StatePanel v-if="moodleDashboardLoading" state="loading" />

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
          {{ translateText("Apply an institute scope to dashboard charts and choose the activity period.") }}
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
          @update:model-value="applyInstituteFilter"
        />
        <AppSegmentedControl
          v-model="selectedActivityPeriod"
          :options="activityPeriodOptions"
          :aria-label="String(translateText('Student activity period'))"
        />
        <AppButton
          v-if="hasInstituteFilter"
          action="clear"
          @click="clearInstituteFilter"
        />
      </div>
    </UCard>

    <section class="grid dashboard-insights">
      <StatePanel v-if="chartsLoading" state="loading" />

      <StatePanel
        v-else-if="chartError"
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
          title="Students by Department"
          icon="i-lucide-list-ordered"
          description="Student totals across all Moodle departments."
          :badge="departmentChartBadge"
          :option="topDepartmentsOption"
          :height="departmentDistributionHeight"
          aria-label="Students by Department"
          class="analytics-chart-wide"
        >
          <template #actions>
            <div class="flex items-center gap-2">
              <UBadge color="primary" variant="soft">
                {{ departmentChartBadge }}
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
          title="Courses by Enrollment"
          icon="i-lucide-trending-up"
          description="Courses ranked by total Moodle enrollment records."
          :badge="t('text.topCourses')"
          badge-color="warning"
          :option="popularCoursesOption"
          :height="popularCoursesHeight"
          aria-label="Courses by Enrollment"
          class="analytics-chart-wide"
        >
          <template #actions>
            <AppButton
              action="details"
              to="/courses"
              :label="t('text.viewDetails')"
            />
          </template>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Student Login Activity"
          icon="i-lucide-activity"
          :option="studentActivityOption"
          height="360px"
          aria-label="Student Login Activity"
          class="analytics-chart-wide"
        >
          <template #actions>
            <AppButton
              action="details"
              to="/learning-activity"
              :label="t('text.viewDetails')"
            />
          </template>
        </AnalyticsChartCard>
      </template>
    </section>
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
