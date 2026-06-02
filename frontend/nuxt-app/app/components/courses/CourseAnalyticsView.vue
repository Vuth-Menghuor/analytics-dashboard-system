<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useCourseAnalyticsView } from "~/composables/courses/useCourseAnalyticsView";

const {
  categories,
  chartError,
  charts,
  chartsLoading,
  courseStatusOptions,
  courseSummaryItems,
  error,
  filters,
  goToPage,
  isLoading,
  pagination,
  paginationLabel,
  partnerInstituteLabel,
  refresh,
  setPerPage,
  table,
} = useCourseAnalyticsView();

const { t } = useI18n();
const { translateText } = useTranslateText();

const translatedSelectItems = (items: string[]) =>
  items.map((item) => ({
    label: String(translateText(item)),
    value: item,
  }));

</script>

<template>
  <div class="page-stack course-analytics-view">
    <PageHeader
      eyebrow="Course analytics"
      title="Courses"
      copy="Analyze live Moodle courses by category, visibility, enrollment totals, completion percentage, and course view activity."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft">GET /api/dashboard/courses</UBadge>
        <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" :label="t('text.refresh')" @click="refresh" />
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

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard
          v-for="chart in charts"
          :key="chart.title"
          :chart="chart"
        />
      </section>

      <UAlert
        v-if="chartsLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        title="Loading course charts"
        description="Course records are ready. Popularity, completion, and view charts will update as Moodle analytics responds."
      />

      <UAlert
        v-else-if="chartError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Course charts unavailable"
        :description="chartError"
      />

      <section class="grid dashboard-detail">
        <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-heart-pulse" />
                Course Health Preview
              </h2>
              <p class="chart-note">Static UI for future engagement and health scoring.</p>
            </div>
            <UBadge color="warning" variant="soft">Static preview</UBadge>
          </div>
          <div class="static-preview-stat-grid">
            <div>
              <span>Healthy</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Needs review</span>
              <strong>6</strong>
            </div>
            <div>
              <span>Low engagement</span>
              <strong>3</strong>
            </div>
          </div>
        </UCard>

        <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-gauge" />
                Engagement Score Preview
              </h2>
              <p class="chart-note">Static criteria for the later course engagement endpoint.</p>
            </div>
            <UBadge color="warning" variant="soft">API later</UBadge>
          </div>
          <ul class="static-preview-list">
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>Higher course views increase engagement.</span>
            </li>
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>Higher completion rate improves health.</span>
            </li>
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>Hidden courses are separated from learning health.</span>
            </li>
          </ul>
        </UCard>
      </section>

      <UCard :ui="{ body: 'analytics-filter-bar' }">
        <div class="analytics-filter-field wide">
          <label>{{ t("common.search") }}</label>
          <UInput v-model="filters.query" icon="i-lucide-search" :placeholder="t('text.courseSearchPlaceholder')" />
        </div>
        <div class="analytics-filter-field">
          <label>{{ t("text.category") }}</label>
          <USelect v-model="filters.category" :items="translatedSelectItems(categories)" />
        </div>
        <div class="analytics-filter-field">
          <label>{{ t("text.status") }}</label>
          <USelect v-model="filters.status" :items="translatedSelectItems(courseStatusOptions)" />
        </div>
      </UCard>

      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1100px"
      />

      <div class="course-pagination">
        <span>{{ paginationLabel }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
            <USelect
              :model-value="pagination.perPage"
              :items="[10, 25, 50]"
              :aria-label="t('text.rowsPerPage')"
              class="max-w-[100px]"
              @update:model-value="setPerPage(Number($event))"
            />
          </div>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-left"
            :label="t('text.previous')"
            :disabled="pagination.currentPage <= 1 || isLoading"
            @click="goToPage(pagination.currentPage - 1)"
          />
          <span>
            Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
          </span>
          <UButton
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-right"
            :label="t('text.next')"
            :disabled="pagination.currentPage >= pagination.lastPage || isLoading"
            @click="goToPage(pagination.currentPage + 1)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
