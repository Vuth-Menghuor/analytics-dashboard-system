<script setup lang="ts">
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardOverview from "~/components/dashboard/DashboardOverview.vue";
import { useVisitorDashboardPage } from "~/composables/dashboard/role/useVisitorDashboardPage";

const {
  applyOverviewFilters,
  chartOptions,
  clearOverviewFilters,
  hasOverviewFilters,
  instituteFilterDraft,
  instituteFilterOptions,
  instituteTable,
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

    <template v-if="moodleDashboardLoading">
      <AppLoadingSkeleton variant="metrics" :count="5" />
      <AppLoadingSkeleton
        variant="charts"
        container-class="grid analytics-chart-grid"
        :count="2"
        :wide-indexes="[0]"
      />
    </template>
    <StatePanel
      v-else-if="moodleDashboardError || !publicMoodleDashboard"
      state="error"
      :description="moodleDashboardError"
    />
    <template v-else>
      <DashboardOverview
        :config="publicMoodleDashboard"
        :chart-options="chartOptions"
      >
        <template #filters>
          <UCard
            as="section"
            class="role-overview-filters"
            :ui="{ body: 'role-overview-filters-body' }"
          >
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-sliders-horizontal" />
                {{ translateText("Overview Filters") }}
              </h2>
              <p class="chart-note">
                {{ translateText("Apply a public institute scope to dashboard charts.") }}
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
                @click="applyOverviewFilters"
              />
              <AppButton
                v-if="hasOverviewFilters"
                action="clear"
                @click="clearOverviewFilters"
              />
            </div>
          </UCard>
        </template>
      </DashboardOverview>

      <AppDataTable
        :title="instituteTable.title"
        :icon="instituteTable.icon"
        :description="instituteTable.description"
        :columns="instituteTable.columns"
        :rows="instituteTable.rows"
        :row-key="instituteTable.rowKey"
        min-width="760px"
      />
    </template>
  </div>
</template>

<style scoped>
.role-overview-filters :deep(.role-overview-filters-body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 767px) {
  .role-overview-filters :deep(.role-overview-filters-body) {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
