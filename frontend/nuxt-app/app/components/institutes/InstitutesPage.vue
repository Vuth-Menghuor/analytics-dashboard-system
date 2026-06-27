<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppExportMenu from "~/components/common/AppExportMenu.vue";
import AppInput from "~/components/common/AppInput.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import InstituteDetailDrawer from "~/components/institutes/InstituteDetailDrawer.vue";
import { useInstitutesPage } from "~/composables/institutes/useInstitutesPage";

const {
  clearFilters,
  changeInstitute,
  comparisonOption,
  data,
  departmentOption,
  departmentOptions,
  detailLoading,
  detailOpen,
  enrollmentTrendOption,
  error,
  exportInstitutes,
  filters,
  hasFilters,
  instituteOptions,
  isPartnerScoped,
  isLoading,
  isFiltering,
  loadInstitutes,
  metrics,
  partnerInstituteLabel,
  selectedDepartments,
  selectedInstitute,
  selectedScopeLabel,
  selectedCourses,
  snapshotLabel,
  table,
  viewInstitute,
} = useInstitutesPage();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Institute analytics"
      title="Institutes Analytics"
      copy="Compare enrollment, snapshot engagement, and department coverage across institutes."
    >
      <div v-if="isPartnerScoped" class="toolbar">
        <UBadge color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
      </div>
    </PageHeader>

    <UCard
      as="section"
      class="institute-filter-card"
      :ui="{ body: 'institute-filter-body' }"
    >
      <div class="institute-filter-grid">
        <div class="institute-filter-field institute-filter-field--search">
          <label>{{ translateText("Search") }}</label>
          <AppSearchInput
            v-model="filters.search"
            :placeholder="String(translateText('Search institutes'))"
            :aria-label="String(translateText('Search institutes'))"
            clearable
            @submit="loadInstitutes"
            @clear="loadInstitutes"
          />
        </div>
        <div class="institute-filter-field">
          <label>{{ translateText("Institute") }}</label>
          <AppSelect
            v-model="filters.institution"
            :items="instituteOptions"
            value-key="value"
            searchable
            :disabled="isFiltering || isPartnerScoped"
            :aria-label="String(translateText('Filter institute analytics by institute'))"
            @update:model-value="changeInstitute"
          />
        </div>
        <div class="institute-filter-field">
          <label>{{ translateText("Department") }}</label>
          <AppSelect
            v-model="filters.department"
            :items="departmentOptions"
            value-key="value"
            searchable
            :disabled="isFiltering"
            :aria-label="String(translateText('Filter institute analytics by department'))"
          />
        </div>
        <div class="institute-filter-field">
          <label>{{ translateText("Date from") }}</label>
          <AppInput
            v-model="filters.dateFrom"
            type="date"
            :aria-label="String(translateText('Enrollment date from'))"
          />
        </div>
        <div class="institute-filter-field">
          <label>{{ translateText("Date to") }}</label>
          <AppInput
            v-model="filters.dateTo"
            type="date"
            :aria-label="String(translateText('Enrollment date to'))"
          />
        </div>
        <div class="institute-filter-actions">
          <AppButton action="search" :label="String(translateText('Apply filters'))" @click="loadInstitutes" />
          <AppButton v-if="hasFilters" action="clear" @click="clearFilters" />
        </div>
      </div>
      <p class="institute-filter-note">
        <template v-if="isFiltering">
          {{ translateText("Updating departments for the selected institute...") }}
        </template>
        <template v-else>
          {{ translateText("Department options follow the selected institute. Date filters apply to enrollment records, course counts, trends, and courses.") }}
        </template>
      </p>
    </UCard>

    <template v-if="isLoading">
      <AppLoadingSkeleton variant="metrics" :count="4" />
      <AppLoadingSkeleton
        variant="charts"
        container-class="grid analytics-chart-grid activity-tab-panel"
        :count="3"
        :wide-indexes="[0]"
      />
      <AppLoadingSkeleton variant="table" :rows="6" :columns="5" />
    </template>
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="activity-tab-panel">
        <section class="grid metrics">
          <MetricCard
            v-for="metric in metrics"
            :key="metric.label"
            :metric="metric"
          />
        </section>

        <AnalyticsChartCard
          title="Enrollment Trend"
          icon="i-lucide-chart-no-axes-combined"
          description="Monthly enrollment records across the selected scope."
          :option="enrollmentTrendOption"
          height="380px"
          class="analytics-chart-wide"
          aria-label="Institute enrollment trend"
        />

        <section class="grid analytics-chart-grid">
          <AnalyticsChartCard
            title="Students by Institute"
            icon="i-lucide-building-2"
            description="Compare total student records across institutes."
            :option="comparisonOption"
            height="380px"
            aria-label="Students by institute comparison"
          />
          <AnalyticsChartCard
            title="Departments"
            icon="i-lucide-network"
            :description="`All departments inside ${selectedScopeLabel}, ranked by student count.`"
            :option="departmentOption"
            height="380px"
            aria-label="Institute departments"
          />
        </section>
      </section>

      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="760px"
      >
        <template #actions>
          <div class="dashboard-table-toolbar">
            <AppSearchInput
              v-model="filters.search"
              class="dashboard-table-search"
              :placeholder="String(translateText('Search institutes'))"
              :aria-label="String(translateText('Search institutes'))"
              clearable
              @submit="loadInstitutes"
              @clear="loadInstitutes"
            />
            <div class="dashboard-table-toolbar-actions">
              <AppExportMenu @select="exportInstitutes" />
            </div>
          </div>
        </template>
        <template #cell-action="{ value }">
          <AppButton
            action="view"
            :label="String(translateText('View details'))"
            @click="viewInstitute(value)"
          />
        </template>
      </AppDataTable>
    </template>

    <InstituteDetailDrawer
      v-model="detailOpen"
      :loading="detailLoading"
      :institute="selectedInstitute"
      :departments="selectedDepartments"
      :courses="selectedCourses"
      :snapshot-label="snapshotLabel"
    />
  </div>
</template>

<style scoped>
.institute-filter-card :deep(.institute-filter-body) {
  display: grid;
  gap: 12px;
}

.institute-filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.1fr) minmax(200px, 1fr) minmax(200px, 1fr) minmax(150px, 0.75fr) minmax(150px, 0.75fr) max-content;
  align-items: end;
  gap: 12px;
}

.institute-filter-field {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.institute-filter-field label {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.institute-filter-field :deep(.dashboard-select),
.institute-filter-field :deep(.dashboard-search-input),
.institute-filter-field :deep(.app-input) {
  width: 100%;
  min-width: 0;
}

.institute-filter-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: max-content;
}

.institute-filter-note {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.75rem;
}

.activity-tab-panel {
  display: grid;
  gap: 20px;
}

@media (max-width: 1279px) {
  .institute-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .institute-filter-actions {
    justify-content: flex-start;
    min-width: 0;
  }
}

@media (max-width: 767px) {
  .institute-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .institute-filter-actions {
    align-items: stretch;
    flex-direction: column;
    justify-content: flex-start;
  }

}
</style>
