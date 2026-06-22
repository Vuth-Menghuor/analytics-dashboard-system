<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import type { EChartsOption } from "echarts";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppEChart from "~/components/common/AppEChart.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import CourseDetailDrawer from "~/components/courses/CourseDetailDrawer.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useCourseAnalyticsView } from "~/composables/courses/useCourseAnalyticsView";

const {
  activeTab,
  activeFilterChips,
  activeFilterCount,
  categories,
  chartError,
  charts,
  chartsLoading,
  changeInstitute,
  clearFilters,
  courseEngagementOptions,
  courseDetailOpen,
  coursePage,
  coursePageOptions,
  coursePerPage,
  courseSummaryItems,
  courseTotal,
  error,
  exportCourses,
  filters,
  hasFilters,
  instituteDistribution,
  instituteDistributionTotal,
  institutes,
  isLoading,
  openCourseDetail,
  paginationLabel,
  partnerInstituteLabel,
  refresh,
  removeFilter,
  selectedCourse,
  table,
  tabs,
} = useCourseAnalyticsView();

const { t } = useI18n();
const { translateText } = useTranslateText();

const translatedSelectItems = (items: string[]) =>
  items.map((item) => ({
    label: String(translateText(item)),
    value: item,
  }));

const instituteHalfDoughnutOption = computed<EChartsOption>(() => {
  const total = instituteDistributionTotal.value || 1;
  const chartData = instituteDistribution.value.map((item) => ({
    name: item.label,
    value: item.count,
    itemStyle: { color: item.color },
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const item = params as {
          name?: string;
          value?: number;
          percent?: number;
        };

        if (item.name === "__empty__") {
          return "";
        }

        return `${item.name}: <strong>${Number(item.value ?? 0).toLocaleString()}</strong> (${Number(item.percent ?? 0).toFixed(1)}%)`;
      },
    },
    series: [
      {
        name: "Courses by Institute",
        type: "pie",
        radius: ["74%", "106%"],
        center: ["50%", "90%"],
        startAngle: 180,
        label: { show: false },
        labelLine: { show: false },
        avoidLabelOverlap: false,
        data: [
          ...chartData,
          {
            name: "__empty__",
            value: total,
            tooltip: { show: false },
            itemStyle: {
              color: "transparent",
              decal: { symbol: "none" },
            },
          },
        ],
      },
    ],
  };
});

const submitSearch = () => {
  filters.query = filters.query.trim();
};
</script>

<template>
  <div class="page-stack course-analytics-view">
    <PageHeader
      eyebrow="Course analytics"
      title="Courses"
      copy="Analyze cleaned Moodle courses by course name, category, institute, course-record count, and enrollment records."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <AppButton action="refresh" :label="t('text.refresh')" @click="refresh" />
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="grid metrics">
        <MetricCard
          v-for="metric in courseSummaryItems"
          :key="metric.label"
          :metric="metric"
        />
      </section>

      <UAlert
        color="primary"
        variant="soft"
        icon="i-lucide-database-zap"
        :title="String(translateText('Course-family analytics active'))"
        :description="String(translateText('Courses are grouped by cleaned family name. Demo or test records are excluded from analytics without changing the original Moodle database.'))"
      />

      <UCard
        as="section"
        class="course-advanced-filters"
        :ui="{ body: 'course-advanced-filters-body' }"
      >
        <div class="course-filter-heading">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-list-filter" />
              {{ translateText("Advanced Filters") }}
            </h2>
            <p class="chart-note">
              {{ translateText("Combine course, category, institute, engagement, and enrollment criteria.") }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge color="neutral" variant="soft">
              {{ t("text.activeFilters", { count: activeFilterCount }) }}
            </UBadge>
            <AppButton v-if="hasFilters" action="clear" @click="clearFilters" />
          </div>
        </div>

        <div class="course-filter-grid">
          <div class="course-filter-field course-filter-field--search">
            <label>{{ translateText("Course") }}</label>
            <AppSearchInput
              v-model="filters.query"
              :placeholder="t('text.courseSearchPlaceholder')"
              :aria-label="String(translateText('Search courses'))"
              clearable
              @submit="submitSearch"
              @clear="submitSearch"
            />
          </div>
          <div class="course-filter-field">
            <label>{{ t("text.category") }}</label>
            <AppSelect
              v-model="filters.category"
              :items="translatedSelectItems(categories)"
              value-key="value"
              searchable
              :aria-label="t('text.category')"
            />
          </div>
          <div class="course-filter-field">
            <label>{{ translateText("Institute") }}</label>
            <AppSelect
              v-model="filters.institute"
              :items="translatedSelectItems(institutes)"
              value-key="value"
              searchable
              :disabled="Boolean(partnerInstituteLabel)"
              :aria-label="String(translateText('Institute'))"
              @update:model-value="changeInstitute"
            />
          </div>
          <div class="course-filter-field">
            <label>{{ translateText("Engagement") }}</label>
            <AppSelect
              v-model="filters.engagement"
              :items="translatedSelectItems(courseEngagementOptions)"
              value-key="value"
              :aria-label="String(translateText('Enrollment engagement'))"
            />
          </div>
        </div>

        <div
          v-if="activeFilterChips.length"
          class="course-active-filters"
          :aria-label="String(translateText('Applied course filters'))"
        >
          <span>{{ translateText("Applied:") }}</span>
          <button
            v-for="chip in activeFilterChips"
            :key="chip.key"
            type="button"
            class="course-filter-chip"
            @click="removeFilter(chip.key)"
          >
            {{ chip.label }}
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </UCard>

      <UAlert
        v-if="chartsLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        :title="String(translateText('Loading course charts'))"
        :description="String(translateText('Course records are ready. Popularity, completion, and view charts will update as Moodle analytics responds.'))"
      />

      <UAlert
        v-else-if="chartError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="String(translateText('Course charts unavailable'))"
        :description="chartError"
      />

      <nav class="activity-tabs" :aria-label="String(translateText('Course analytics sections'))">
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

      <section
        v-if="!chartsLoading && !chartError && activeTab === 'overview'"
        class="grid analytics-chart-grid activity-tab-panel"
      >
        <AnalyticsChartCard
          v-if="charts[0]"
          :chart="charts[0]"
        />
      </section>

      <section
        v-if="!chartsLoading && !chartError && activeTab === 'institutes'"
        class="grid analytics-chart-grid activity-tab-panel"
      >
        <UCard
          as="article"
          class="analytics-card course-institute-distribution-card analytics-chart-wide"
          :ui="{ body: 'analytics-card-body' }"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-building-2" />
                {{ translateText("Courses by Institute") }}
              </h2>
              <p class="chart-note">
                {{ translateText("Which institutes appear most often in clean course groups?") }}
              </p>
            </div>
          </div>

          <div class="course-institute-half-doughnut">
            <AppEChart
              :option="instituteHalfDoughnutOption"
              height="420px"
              :aria-label="String(translateText('Courses by institute half doughnut chart'))"
            />
            <div class="course-institute-chart-center">
              <span>{{ translateText("Total") }}</span>
              <strong>{{ instituteDistributionTotal.toLocaleString() }}</strong>
              <small>{{ translateText("course families") }}</small>
            </div>
          </div>

          <div class="course-institute-summary">
            <div
              v-for="item in instituteDistribution"
              :key="item.label"
              class="course-institute-summary-item"
            >
              <span>
                <i :style="{ backgroundColor: item.color }" />
                {{ item.label }}
              </span>
              <strong>
                {{ item.count.toLocaleString() }}
                <small>{{ item.percentage }}%</small>
              </strong>
            </div>
          </div>
        </UCard>
      </section>

      <section
        v-if="!chartsLoading && !chartError && activeTab === 'enrollment'"
        class="grid analytics-chart-grid activity-tab-panel"
      >
        <AnalyticsChartCard
          v-if="charts[1]"
          :chart="charts[1]"
          class="analytics-chart-wide"
        />
      </section>

      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1100px"
      >
        <template #actions>
          <div class="dashboard-table-toolbar">
            <AppSearchInput
              v-model="filters.query"
              class="dashboard-table-search"
              :placeholder="t('text.courseSearchPlaceholder')"
              :aria-label="String(translateText('Search courses'))"
              clearable
              @submit="submitSearch"
              @clear="submitSearch"
            />
            <div class="dashboard-table-toolbar-actions">
              <UBadge v-if="activeFilterCount" color="primary" variant="soft">
                {{ activeFilterCount }} {{ translateText("filters") }}
              </UBadge>
              <AppButton action="export" @click="exportCourses" />
            </div>
          </div>
        </template>
        <template #cell-action="{ row }">
          <AppButton
            action="view"
            :label="String(translateText('View'))"
            @click="openCourseDetail(row)"
          />
        </template>
      </AppDataTable>

      <div class="student-pagination">
        <span>{{ paginationLabel }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
            <USelect
              v-model="coursePerPage"
              :items="coursePageOptions"
              :aria-label="t('text.rowsPerPage')"
              class="max-w-[100px]"
            />
          </div>

          <UPagination
            v-model:page="coursePage"
            :total="courseTotal"
            :items-per-page="coursePerPage"
            :disabled="isLoading"
            :ui="{ first: 'hidden', last: 'hidden' }"
          />
        </div>
      </div>

      <CourseDetailDrawer
        v-model="courseDetailOpen"
        :course="selectedCourse"
      />
    </template>
  </div>
</template>

<style scoped>
.course-advanced-filters :deep(.course-advanced-filters-body) {
  display: grid;
  gap: 16px;
}

.course-filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.course-filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(5, minmax(150px, 1fr));
  gap: 12px;
}

.course-filter-field {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.course-filter-field label,
.course-active-filters > span {
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.course-filter-field :deep(.dashboard-select),
.course-filter-field :deep(input) {
  width: 100%;
  min-width: 0;
}

.course-active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
}

.course-filter-chip {
  display: inline-flex;
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

.course-filter-chip svg {
  width: 13px;
  height: 13px;
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
  .course-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .course-filter-field--search {
    grid-column: span 2;
  }
}

@media (max-width: 767px) {
  .course-filter-heading {
    flex-direction: column;
  }

  .course-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .course-filter-field--search {
    grid-column: auto;
  }
}
</style>
