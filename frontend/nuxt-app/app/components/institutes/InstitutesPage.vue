<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppInput from "~/components/common/AppInput.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import InstituteDetailDrawer from "~/components/institutes/InstituteDetailDrawer.vue";
import { useInstitutesPage } from "~/composables/institutes/useInstitutesPage";

const {
  activeTab,
  clearFilters,
  changeInstitute,
  comparisonCards,
  comparisonInstituteA,
  comparisonInstituteB,
  comparisonInstituteOptions,
  comparisonOption,
  comparisonRows,
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
  isLoading,
  isFiltering,
  loadInstitutes,
  metrics,
  selectedDepartments,
  selectedInstitute,
  selectedScopeLabel,
  selectedTopCourses,
  snapshotLabel,
  table,
  tablePage,
  tablePageOptions,
  tablePaginationLabel,
  tablePerPage,
  tableTotal,
  tabs,
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
    />

    <UCard
      as="section"
      class="institute-filter-card"
      :ui="{ body: 'institute-filter-body' }"
    >
      <div class="institute-filter-grid">
        <div class="institute-filter-field">
          <label>{{ translateText("Institute") }}</label>
          <AppSelect
            v-model="filters.institution"
            :items="instituteOptions"
            value-key="value"
            searchable
            :disabled="isFiltering"
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
          <AppButton action="export" @click="exportInstitutes" />
        </div>
      </div>
      <p class="institute-filter-note">
        <template v-if="isFiltering">
          {{ translateText("Updating departments for the selected institute...") }}
        </template>
        <template v-else>
          {{ translateText("Department options follow the selected institute. Date filters apply to enrollment records, course counts, trends, and top courses.") }}
        </template>
      </p>
    </UCard>

    <nav class="activity-tabs" :aria-label="String(translateText('Institute analytics sections'))">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="activity-tab"
        :class="{ 'activity-tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span>{{ translateText(tab.label) }}</span>
      </button>
    </nav>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section v-if="activeTab === 'overview'" class="activity-tab-panel">
        <section class="grid metrics">
          <MetricCard
            v-for="metric in metrics"
            :key="metric.label"
            :metric="metric"
          />
        </section>

        <UAlert
          v-if="data?.institutes.some((row) => row.institution === 'Not filled')"
          color="warning"
          variant="soft"
          icon="i-lucide-database-zap"
          :title="String(translateText('Institute data quality notice'))"
          :description="String(translateText('Students without an institute remain visible as Not filled, but those records are not assigned a ranking number.'))"
        />

        <AnalyticsChartCard
          title="Students by Institute"
          icon="i-lucide-building-2"
          description="Compare total student records across institutes."
          :option="comparisonOption"
          height="520px"
          class="analytics-chart-wide"
          aria-label="Students by institute comparison"
        />
      </section>

      <section v-else-if="activeTab === 'comparison'" class="activity-tab-panel">
        <UCard
          as="section"
          class="institute-comparison-card"
          :ui="{ body: 'institute-comparison-body' }"
        >
          <div class="section-heading compact institute-comparison-heading">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-scale" />
                {{ translateText("Institute A vs Institute B") }}
              </h2>
              <p>{{ translateText("Compare two institutes using the current ranking dataset.") }}</p>
            </div>
            <div class="institute-comparison-selects">
              <AppSelect
                v-model="comparisonInstituteA"
                :items="comparisonInstituteOptions"
                value-key="value"
                searchable
                :aria-label="String(translateText('Select institute A'))"
              />
              <AppSelect
                v-model="comparisonInstituteB"
                :items="comparisonInstituteOptions"
                value-key="value"
                searchable
                :aria-label="String(translateText('Select institute B'))"
              />
            </div>
          </div>

          <div v-if="comparisonCards.length >= 2" class="institute-comparison-grid">
            <div
              v-for="item in comparisonCards"
              :key="item.label"
              class="institute-comparison-summary"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.row.institution }}</strong>
              <div>
                <p>
                  <b>{{ item.row.students.toLocaleString() }}</b>
                  {{ translateText("students") }}
                </p>
                <p>
                  <b>{{ item.row.activityRate.toFixed(1) }}%</b>
                  {{ translateText("activity rate") }}
                </p>
                <p>
                  <b>{{ item.row.courses.toLocaleString() }}</b>
                  {{ translateText("courses") }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="comparisonRows.length"
            class="dashboard-data-table-wrap institute-comparison-table-wrap"
          >
            <table class="dashboard-data-table institute-comparison-table">
              <thead>
                <tr>
                  <th scope="col">{{ translateText("Metric") }}</th>
                  <th scope="col">{{ comparisonCards[0]?.row.institution }}</th>
                  <th scope="col">{{ comparisonCards[1]?.row.institution }}</th>
                  <th scope="col">{{ translateText("Difference") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonRows" :key="row.metric">
                  <th scope="row">{{ row.metric }}</th>
                  <td>{{ row.a }}</td>
                  <td>{{ row.b }}</td>
                  <td>{{ row.difference }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <StatePanel
            v-else
            state="empty"
            :title="String(translateText('Select two institutes'))"
            :description="String(translateText('Choose Institute A and Institute B to compare their analytics.'))"
          />
        </UCard>
      </section>

      <section v-else class="grid analytics-chart-grid activity-tab-panel">
        <AnalyticsChartCard
          title="Enrollment Trend"
          icon="i-lucide-chart-no-axes-combined"
          description="Monthly enrollment records across the selected scope."
          :option="enrollmentTrendOption"
          height="380px"
          aria-label="Institute enrollment trend"
        />
        <AnalyticsChartCard
          title="Top Departments"
          icon="i-lucide-network"
          :description="`Largest departments inside ${selectedScopeLabel}.`"
          :option="departmentOption"
          height="380px"
          aria-label="Top institute departments"
        />
      </section>

      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1180px"
      >
        <template #actions>
          <UBadge color="neutral" variant="soft">
            {{ translateText("Ranked by student count") }}
          </UBadge>
        </template>
        <template #cell-action="{ value }">
          <AppButton
            action="view"
            :label="String(translateText('View details'))"
            @click="viewInstitute(value)"
          />
        </template>
      </AppDataTable>

      <div class="student-pagination">
        <span>{{ tablePaginationLabel }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
            <USelect
              v-model="tablePerPage"
              :items="tablePageOptions"
              :aria-label="t('text.rowsPerPage')"
              class="max-w-[100px]"
            />
          </div>

          <UPagination
            v-model:page="tablePage"
            :total="tableTotal"
            :items-per-page="tablePerPage"
            :ui="{ first: 'hidden', last: 'hidden' }"
          />
        </div>
      </div>
    </template>

    <InstituteDetailDrawer
      v-model="detailOpen"
      :loading="detailLoading"
      :institute="selectedInstitute"
      :departments="selectedDepartments"
      :top-courses="selectedTopCourses"
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
  grid-template-columns: repeat(5, minmax(150px, 1fr)) auto;
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
.institute-filter-field :deep(.app-input) {
  width: 100%;
  min-width: 0;
}

.institute-filter-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.institute-filter-note {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.75rem;
}

.activity-tabs {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 28px;
  overflow-x: auto;
  padding: 0 2px;
  scrollbar-width: none;
}

.activity-tabs::-webkit-scrollbar {
  display: none;
}

.activity-tab {
  display: inline-flex;
  position: relative;
  flex: 0 0 auto;
  align-items: center;
  color: var(--app-muted);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  padding: 4px 0 13px;
  transition: color 0.18s ease;
}

.activity-tab::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  content: "";
  opacity: 0;
  transform: scaleX(0.75);
  transform-origin: center;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.activity-tab:hover,
.activity-tab--active {
  color: var(--app-text);
}

.activity-tab--active::after {
  opacity: 1;
  transform: scaleX(1);
}

.activity-tab-panel {
  display: grid;
  gap: 20px;
}

.institute-comparison-card :deep(.institute-comparison-body) {
  display: grid;
  gap: 16px;
}

.institute-comparison-heading {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.85fr);
  align-items: end;
}

.institute-comparison-selects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.institute-comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.institute-comparison-summary {
  display: grid;
  gap: 10px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 14px;
  background: var(--app-surface-soft);
}

.institute-comparison-summary span {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.institute-comparison-summary strong {
  color: var(--app-heading);
  font-size: 1rem;
}

.institute-comparison-summary div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.institute-comparison-summary p {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.8rem;
}

.institute-comparison-summary b {
  color: var(--app-text);
}

.institute-comparison-table {
  min-width: 720px;
}

.institute-comparison-table th:not(:first-child),
.institute-comparison-table td {
  text-align: right;
}

@media (max-width: 1279px) {
  .institute-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .institute-comparison-heading {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .institute-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .institute-filter-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .institute-comparison-selects,
  .institute-comparison-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
