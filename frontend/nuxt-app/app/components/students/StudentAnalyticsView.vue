<script setup lang="ts">
import AppSelect from "~/components/common/AppSelect.vue";
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppExportMenu from "~/components/common/AppExportMenu.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import StudentProfileDrawer from "~/components/students/StudentProfileDrawer.vue";
import { useStudentAnalyticsView } from "~/composables/students/useStudentAnalyticsView";

const {
  activeTab,
  activeFilterChips,
  activeFilterCount,
  applyStudentFilters,
  cityDistributionHeight,
  cityDistributionOption,
  cityFilterItems,
  changeInstitute,
  clearInstituteFilter,
  clearStudentListFilters,
  departments,
  departmentChartBadge,
  departmentFilterItems,
  dependentFiltersLoading,
  draftFilters,
  error,
  exportStudents,
  filters,
  genderFilterItems,
  genderDistributionOption,
  institutionDistributionHeight,
  institutionDistributionOption,
  instituteFilterItems,
  institutes,
  hasInstituteFilter,
  hasStudentListFilters,
  isPartnerScoped,
  isLoading,
  liveError,
  liveIsLoading,
  metrics,
  paginationLabel,
  partnerInstituteLabel,
  profileOpen,
  refresh,
  removeStudentFilter,
  searchQuery,
  departmentDistributionHeight,
  departmentDistributionOption,
  selectedStudent,
  selectedStudentIsLoading,
  studentMetricsLoaded,
  studentMetricsLoading,
  studentPage,
  studentPageOptions,
  studentPerPage,
  studentTotal,
  statusFilterItems,
  table,
  tabs,
  submitSearch,
  viewStudent,
} = useStudentAnalyticsView();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      title="Students"
      copy="Inspect Moodle student records, demographics, and profile details."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
      </div>
    </PageHeader>

    <template v-if="isLoading">
      <AppLoadingSkeleton variant="metrics" :count="4" />
      <AppLoadingSkeleton variant="filters" :count="7" />
      <AppLoadingSkeleton variant="tabs" :count="3" />
      <AppLoadingSkeleton
        variant="charts"
        container-class="grid analytics-chart-grid activity-tab-panel"
        :count="2"
      />
      <AppLoadingSkeleton variant="table" :rows="6" :columns="7" />
    </template>
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <UAlert
        v-if="!studentMetricsLoaded && !studentMetricsLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        :title="String(translateText('Loading student metric cards'))"
        :description="String(translateText('Student totals will appear as soon as the Moodle analytics counts respond.'))"
      />

      <AppLoadingSkeleton v-if="studentMetricsLoading" variant="metrics" :count="4" />

      <section v-else-if="studentMetricsLoaded" class="grid metrics" :aria-busy="studentMetricsLoading">
        <MetricCard
          v-for="metricItem in metrics"
          :key="metricItem.label"
          :metric="metricItem"
        />
      </section>

      <UCard
        as="section"
        class="student-advanced-filters"
        :ui="{ body: 'student-advanced-filters-body' }"
      >
        <div class="student-filter-heading">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-list-filter" />
              {{ translateText("Advanced Filters") }}
            </h2>
            <p class="chart-note">
              {{ translateText("Combine multiple criteria to update student records and analytics.") }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UBadge color="neutral" variant="soft">
              {{ t("text.activeFilters", { count: activeFilterCount }) }}
            </UBadge>
            <AppButton
              v-if="hasStudentListFilters"
              action="clear"
              @click="clearStudentListFilters"
            />
          </div>
        </div>

        <div class="student-filter-grid">
          <div class="student-filter-field student-filter-field--search">
            <label>{{ translateText("Student") }}</label>
            <AppSearchInput
              v-model="searchQuery"
              :placeholder="String(translateText('Name, username, or email'))"
              :aria-label="String(translateText('Search students by name, username, or email'))"
              clearable
              @submit="submitSearch"
              @clear="submitSearch"
            />
          </div>

          <div class="student-filter-field">
            <label>{{ translateText("Institute") }}</label>
            <AppSelect
              v-model="draftFilters.institute"
              :items="instituteFilterItems"
              value-key="value"
              :disabled="isPartnerScoped"
              searchable
              :aria-label="String(translateText('Filter students by institute'))"
              @update:model-value="changeInstitute"
            />
          </div>

          <div class="student-filter-field">
            <label>{{ translateText("Department") }}</label>
            <AppSelect
              v-model="draftFilters.department"
              :items="departmentFilterItems"
              value-key="value"
              searchable
              :disabled="dependentFiltersLoading"
              :aria-label="String(translateText('Filter students by department'))"
            />
          </div>

          <div class="student-filter-field">
            <label>{{ translateText("City") }}</label>
            <AppSelect
              v-model="draftFilters.city"
              :items="cityFilterItems"
              value-key="value"
              searchable
              :disabled="dependentFiltersLoading"
              :aria-label="String(translateText('Filter students by city'))"
            />
          </div>

          <div class="student-filter-field">
            <label>{{ translateText("Gender") }}</label>
            <AppSelect
              v-model="draftFilters.gender"
              :items="genderFilterItems"
              value-key="value"
              :aria-label="String(translateText('Filter students by gender'))"
            />
          </div>

          <div class="student-filter-field">
            <label>{{ translateText("Status") }}</label>
            <AppSelect
              v-model="draftFilters.status"
              :items="statusFilterItems"
              value-key="value"
              :aria-label="String(translateText('Filter students by status'))"
            />
          </div>

          <div class="student-filter-apply">
            <AppButton
              action="search"
              :label="String(translateText('Apply filters'))"
              @click="applyStudentFilters"
            />
          </div>
        </div>

        <div
          v-if="activeFilterChips.length"
          class="student-active-filters"
          :aria-label="String(translateText('Applied filters'))"
        >
          <span class="student-active-filters-label">{{ translateText("Applied:") }}</span>
          <button
            v-for="chip in activeFilterChips"
            :key="chip.key"
            type="button"
            class="student-filter-chip"
            :aria-label="`Remove ${chip.label}`"
            @click="removeStudentFilter(chip.key)"
          >
            <span>{{ chip.label }}</span>
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </UCard>

      <UAlert
        v-if="!liveIsLoading && liveError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="String(translateText('Student charts unavailable'))"
        :description="liveError"
      />

      <nav class="activity-tabs" :aria-label="String(translateText('Student analytics sections'))">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="activity-tab"
          :class="{ 'activity-tab--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ translateText(tab.label) }}
        </button>
      </nav>

      <AppLoadingSkeleton
        v-if="liveIsLoading"
        variant="charts"
        container-class="grid analytics-chart-grid activity-tab-panel"
        :count="2"
      />

      <template v-else-if="!liveError">
        <section v-if="activeTab === 'overview'" class="grid analytics-chart-grid activity-tab-panel">
          <AnalyticsChartCard
            title="Students by Institute"
            icon="i-lucide-building-2"
            description="Student totals across all Moodle institutes."
            :option="institutionDistributionOption"
            :height="institutionDistributionHeight"
            aria-label="Students by Institute"
          />
          <AnalyticsChartCard
            title="Students by Department"
            icon="i-lucide-list-ordered"
            description="Student totals across all Moodle departments."
            :badge="departmentChartBadge"
            :option="departmentDistributionOption"
            :height="departmentDistributionHeight"
            aria-label="Students by Department"
          >
            <template #actions>
              <div class="flex items-center gap-2">
                <UBadge color="primary" variant="soft">
                  {{ departmentChartBadge }}
                </UBadge>
              </div>
            </template>
          </AnalyticsChartCard>
        </section>

        <section v-else-if="activeTab === 'demographics'" class="grid analytics-chart-grid activity-tab-panel">
          <AnalyticsChartCard
            title="Gender Distribution"
            icon="i-lucide-pie-chart"
            description="Breakdown of students by gender."
            :option="genderDistributionOption"
            height="360px"
            aria-label="Gender Distribution"
          />
          <AnalyticsChartCard
            title="Students by City"
            icon="i-lucide-map-pin"
            description="Student totals across reported cities."
            :option="cityDistributionOption"
            :height="cityDistributionHeight"
            aria-label="Students by City"
          />
        </section>

      </template>

      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1628px"
      >
        <template #actions>
          <div class="dashboard-table-toolbar">
            <AppSearchInput
              v-model="searchQuery"
              class="dashboard-table-search"
              :placeholder="String(translateText('Search students'))"
              :aria-label="String(translateText('Search students by name, username, or email'))"
              clearable
              @submit="submitSearch"
              @clear="submitSearch"
            />
            <div class="dashboard-table-toolbar-actions">
              <UBadge v-if="activeFilterCount" color="primary" variant="soft">
                {{ activeFilterCount }} {{ translateText("filters") }}
              </UBadge>
              <AppExportMenu @select="exportStudents" />
            </div>
          </div>
        </template>
        <template #cell-action="{ value }">
          <AppButton
            action="view"
            :label="t('text.view')"
            @click="viewStudent(value)"
          />
        </template>
      </AppDataTable>

      <div class="student-pagination">
        <span>{{ paginationLabel }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>

            <USelect
              v-model="studentPerPage"
              :items="studentPageOptions"
              :aria-label="t('text.rowsPerPage')"
              class="max-w-[100px]"
            />
          </div>

          <UPagination
            v-model:page="studentPage"
            :total="studentTotal"
            :items-per-page="studentPerPage"
            :ui="{ first: 'hidden', last: 'hidden' }"
          />
        </div>
      </div>
    </template>

    <StudentProfileDrawer
      v-model="profileOpen"
      :student="selectedStudent"
      :loading="selectedStudentIsLoading"
    />
  </div>
</template>

<style scoped>
.student-advanced-filters :deep(.student-advanced-filters-body) {
  display: grid;
  gap: 16px;
}

.student-filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.student-filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(5, minmax(150px, 1fr)) auto;
  align-items: end;
  gap: 12px;
}

.student-filter-field {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.student-filter-field label,
.student-active-filters-label {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.student-filter-field :deep(.dashboard-select) {
  width: 100%;
  min-width: 0;
}

.student-filter-apply {
  display: flex;
  align-items: center;
}

.student-active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
}

.student-filter-chip {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  padding: 6px 8px;
  background: var(--app-primary-extra-soft);
  color: var(--app-text);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.student-filter-chip:hover {
  border-color: var(--app-primary);
}

.student-filter-chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-filter-chip svg {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
}

.activity-tabs {
  align-items: center;
  display: flex;
  gap: 28px;
  min-width: 0;
  overflow-x: auto;
  padding: 0 2px;
  scrollbar-width: none;
}

.activity-tabs::-webkit-scrollbar {
  display: none;
}

.activity-tab {
  align-items: center;
  color: var(--app-muted);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  padding: 4px 0 13px;
  position: relative;
  transition: color 0.18s ease;
}

.activity-tab::after {
  background: currentColor;
  bottom: 0;
  content: "";
  height: 2px;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
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

@media (max-width: 1279px) {
  .student-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .student-filter-field--search {
    grid-column: span 2;
  }
}

@media (max-width: 767px) {
  .student-filter-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .student-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .student-filter-field--search {
    grid-column: auto;
  }

  .student-filter-apply :deep(.app-button) {
    width: 100%;
  }
}
</style>
