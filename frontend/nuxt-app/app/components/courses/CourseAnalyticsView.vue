<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppExportMenu from "~/components/common/AppExportMenu.vue";
import type { EChartsOption } from "echarts";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import AppEChart from "~/components/common/AppEChart.vue";
import { appColors } from "~/constants/colors";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
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
  applyFilters,
  categories,
  chartError,
  charts,
  chartsLoading,
  changeInstitute,
  clearFilters,
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

const instituteRankingOption = computed<EChartsOption>(() => {
  const rows = instituteDistribution.value;
  const visibleItems = 10;
  const hasScroll = rows.length > visibleItems;
  const scrollEnd = hasScroll
    ? Math.min(100, (visibleItems / rows.length) * 100)
    : 100;

  return {
    grid: { top: 16, right: 44, bottom: 28, left: 18, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: unknown) => {
        const item = Array.isArray(params) ? params[0] : params;
        const index =
          item && typeof item === "object" && "dataIndex" in item
            ? Number(item.dataIndex)
            : 0;
        const row = rows[index];

        if (!row) return "";

        return [
          `<strong>${row.label}</strong>`,
          `Course groups: ${row.count.toLocaleString()}`,
          `Share: ${row.percentage}%`,
        ].join("<br />");
      },
    },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: appColors.secondary },
      splitLine: { lineStyle: { color: appColors.grid, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((item) => item.label),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: appColors.secondary,
        width: 160,
        overflow: "truncate",
      },
    },
    dataZoom: hasScroll
      ? [
          {
            type: "inside",
            yAxisIndex: 0,
            start: 0,
            end: scrollEnd,
          },
          {
            type: "slider",
            yAxisIndex: 0,
            start: 0,
            end: scrollEnd,
            width: 16,
            right: 8,
          },
        ]
      : undefined,
    series: [
      {
        name: "Courses by Institute",
        type: "bar",
        barMaxWidth: 22,
        data: rows.map((item) => ({
          value: item.count,
          itemStyle: {
            color: item.color,
            borderRadius: [0, 6, 6, 0],
          },
        })),
        label: {
          show: true,
          position: "right",
          color: appColors.secondary,
          formatter: (params: { dataIndex?: number }) => {
            const row = rows[Number(params.dataIndex ?? 0)];

            return row ? `${row.percentage}%` : "";
          },
        },
      },
    ],
  };
});

const submitSearch = () => {
  filters.query = filters.query.trim();
  applyFilters();
};
</script>

<template>
  <div class="page-stack course-analytics-view">
    <PageHeader
      eyebrow="Course analytics"
      title="Courses"
      copy="Analyze cleaned course groups by course name, category, institute, and enrollment records."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
      </div>
    </PageHeader>

    <template v-if="isLoading">
      <AppLoadingSkeleton variant="metrics" :count="4" />
      <AppLoadingSkeleton variant="filters" :count="4" />
      <AppLoadingSkeleton variant="tabs" :count="3" />
      <AppLoadingSkeleton
        variant="charts"
        container-class="grid analytics-chart-grid activity-tab-panel"
        :count="1"
        :wide-indexes="[0]"
      />
      <AppLoadingSkeleton variant="table" :rows="6" :columns="7" />
    </template>
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="grid metrics">
        <MetricCard
          v-for="metric in courseSummaryItems"
          :key="metric.label"
          :metric="metric"
        />
      </section>

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
              {{ translateText("Combine course, category, institute, and enrollment criteria.") }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge color="neutral" variant="soft">
              {{ t("text.activeFilters", { count: activeFilterCount }) }}
            </UBadge>
            <AppButton
              action="search"
              :label="String(translateText('Apply filters'))"
              @click="applyFilters"
            />
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

      <AppLoadingSkeleton
        v-if="chartsLoading"
        variant="charts"
        container-class="grid analytics-chart-grid activity-tab-panel"
        :count="1"
        :wide-indexes="[0]"
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

          <div class="course-institute-ranking-chart">
            <AppEChart
              :option="instituteRankingOption"
              height="520px"
              :aria-label="String(translateText('Courses by institute ranking chart'))"
            />
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
        min-width="1500px"
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
              <AppExportMenu @select="exportCourses" />
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
