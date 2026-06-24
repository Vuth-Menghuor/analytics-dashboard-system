<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import AppInput from "~/components/common/AppInput.vue";
import AppSegmentedControl from "~/components/common/AppSegmentedControl.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { useUserActivityPage } from "~/composables/activity/useUserActivityPage";

const {
  activeTab,
  activityError,
  activityLoading,
  activityTypeOptions,
  applyFilters,
  changeDepartment,
  changeInstitute,
  cityFilterOptions,
  clearFilters,
  courseFilterOptions,
  coursePage,
  coursePaginationLabel,
  coursePerPage,
  courseTable,
  courseTotal,
  departmentFilterOptions,
  error,
  filterOptionsLoading,
  filters,
  hasFilters,
  instituteFilterOptions,
  isLoading,
  isPartnerScoped,
  metrics,
  organizationDimension,
  organizationDimensionOptions,
  organizationPage,
  organizationPaginationLabel,
  organizationPerPage,
  organizationTable,
  organizationTotal,
  overviewCharts,
  partnerInstituteLabel,
  refresh,
  studentPage,
  studentPaginationLabel,
  studentPerPage,
  studentTable,
  studentTotal,
  tabs,
  userStatusOptions,
  pageSizeOptions,
} = useUserActivityPage();

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="String(translateText('Moodle learning engagement'))"
      :title="String(translateText('Learning Activity'))"
      :copy="String(translateText('Analyze logins, course views, forum usage, and student active/inactive engagement from Moodle activity logs.'))"
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <UCard
        as="section"
        class="activity-filters"
        :ui="{ body: 'activity-filters-body' }"
      >
        <div class="activity-filter-heading">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-list-filter" />
              {{ translateText("Main Filters") }}
            </h2>
            <p class="chart-note">
              {{ translateText("Combine date, institute, department, course, activity type, and user status.") }}
            </p>
          </div>
          <div class="activity-filter-actions">
            <AppButton action="search" :label="String(translateText('Apply'))" @click="applyFilters" />
            <AppButton v-if="hasFilters" action="clear" @click="clearFilters" />
          </div>
        </div>

        <div class="activity-filter-grid">
          <div class="activity-filter-field">
            <label>{{ translateText("Date from") }}</label>
            <AppInput
              v-model="filters.dateFrom"
              type="date"
              :aria-label="String(translateText('Filter activity from date'))"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("Date to") }}</label>
            <AppInput
              v-model="filters.dateTo"
              type="date"
              :aria-label="String(translateText('Filter activity to date'))"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("Institute") }}</label>
            <AppSelect
              v-model="filters.institution"
              :items="instituteFilterOptions"
              value-key="value"
              searchable
              :disabled="isPartnerScoped"
              :aria-label="String(translateText('Filter activity by institute'))"
              @update:model-value="changeInstitute"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("Department") }}</label>
            <AppSelect
              v-model="filters.department"
              :items="departmentFilterOptions"
              value-key="value"
              searchable
              :disabled="filterOptionsLoading"
              :aria-label="String(translateText('Filter activity by department'))"
              @update:model-value="changeDepartment"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("City") }}</label>
            <AppSelect
              v-model="filters.city"
              :items="cityFilterOptions"
              value-key="value"
              searchable
              :disabled="filterOptionsLoading"
              :aria-label="String(translateText('Filter activity by city'))"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("Course") }}</label>
            <AppSelect
              v-model="filters.courseId"
              :items="courseFilterOptions"
              value-key="value"
              searchable
              :aria-label="String(translateText('Filter activity by course'))"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("Activity type") }}</label>
            <AppSelect
              v-model="filters.activityType"
              :items="activityTypeOptions"
              value-key="value"
              searchable
              :aria-label="String(translateText('Filter by activity type'))"
            />
          </div>
          <div class="activity-filter-field">
            <label>{{ translateText("User status") }}</label>
            <AppSelect
              v-model="filters.userStatus"
              :items="userStatusOptions"
              value-key="value"
              :aria-label="String(translateText('Filter by user status'))"
            />
          </div>
          <div class="activity-filter-field activity-filter-field--search">
            <label>{{ translateText("Student search") }}</label>
            <AppInput
              v-model="filters.search"
              icon="i-lucide-search"
              :placeholder="String(translateText('Name, email, or username'))"
              :aria-label="String(translateText('Search student activity'))"
              @keydown.enter="applyFilters"
            />
          </div>
        </div>
      </UCard>

      <nav class="activity-tabs" :aria-label="String(translateText('Learning activity sections'))">
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

      <UAlert
        v-if="activityLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        :title="String(translateText('Loading learning activity'))"
        :description="String(translateText('The page is aggregating Moodle log records for the selected filters.'))"
      />

      <UAlert
        v-else-if="activityError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="String(translateText('Learning activity unavailable'))"
        :description="activityError"
      />

      <template v-else>
        <section v-if="activeTab === 'overview'" class="activity-tab-panel">
          <section class="grid metrics learning-activity-metrics">
            <MetricCard
              v-for="metric in metrics"
              :key="metric.label"
              :metric="metric"
            />
          </section>

          <section class="grid analytics-chart-grid">
            <AnalyticsChartCard
              v-for="chart in overviewCharts"
              :key="chart.title"
              :chart="chart"
              :class="{ 'analytics-chart-wide': chart.wide }"
            />
          </section>

        </section>

        <section v-else-if="activeTab === 'organizations'" class="activity-tab-panel">
          <AppDataTable
            :title="organizationTable.title"
            :icon="organizationTable.icon"
            :description="organizationTable.description"
            :columns="organizationTable.columns"
            :rows="organizationTable.rows"
            :row-key="organizationTable.rowKey"
            min-width="820px"
          >
            <template #actions>
              <AppSegmentedControl
                v-model="organizationDimension"
                :options="organizationDimensionOptions"
                :aria-label="String(translateText('Organization activity grouping'))"
              />
            </template>
          </AppDataTable>

          <div class="organization-pagination">
            <span>{{ organizationPaginationLabel }}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
                <USelect
                  v-model="organizationPerPage"
                  :items="pageSizeOptions"
                  :aria-label="t('text.rowsPerPage')"
                  class="max-w-[100px]"
                />
              </div>

              <UPagination
                v-model:page="organizationPage"
                :total="organizationTotal"
                :items-per-page="organizationPerPage"
                :ui="{ first: 'hidden', last: 'hidden' }"
              />
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'courses'" class="activity-tab-panel">
          <AppDataTable
            :title="courseTable.title"
            :icon="courseTable.icon"
            :description="courseTable.description"
            :columns="courseTable.columns"
            :rows="courseTable.rows"
            :row-key="courseTable.rowKey"
            min-width="760px"
          />

          <div class="course-pagination">
            <span>{{ coursePaginationLabel }}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
                <USelect
                  v-model="coursePerPage"
                  :items="pageSizeOptions"
                  :aria-label="t('text.rowsPerPage')"
                  class="max-w-[100px]"
                />
              </div>

              <UPagination
                v-model:page="coursePage"
                :total="courseTotal"
                :items-per-page="coursePerPage"
                :ui="{ first: 'hidden', last: 'hidden' }"
              />
            </div>
          </div>
        </section>

        <AppDataTable
          :title="studentTable.title"
          :icon="studentTable.icon"
          :description="studentTable.description"
          :columns="studentTable.columns"
          :rows="studentTable.rows"
          :row-key="studentTable.rowKey"
          min-width="980px"
        />

        <div class="student-pagination">
          <span>{{ studentPaginationLabel }}</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
              <USelect
                v-model="studentPerPage"
                :items="pageSizeOptions"
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
    </template>
  </div>
</template>

<style scoped>
.activity-filters :deep(.activity-filters-body) {
  display: grid;
  gap: 18px;
}

.activity-filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.activity-filter-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.activity-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 12px;
}

.activity-filter-field {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.activity-filter-field--search {
  grid-column: span 2;
}

.activity-filter-field label {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 700;
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
  transition:
    color 0.18s ease;
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

.learning-activity-metrics {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

@media (max-width: 1180px) {
  .activity-filter-grid,
  .learning-activity-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .activity-filter-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .activity-filter-actions {
    justify-content: flex-start;
  }

  .activity-filter-grid,
  .learning-activity-metrics {
    grid-template-columns: 1fr;
  }

  .activity-filter-field--search {
    grid-column: auto;
  }
}
</style>
