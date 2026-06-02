<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import StudentProfileDrawer from "~/components/students/StudentProfileDrawer.vue";
import { useStudentAnalyticsView } from "~/composables/students/useStudentAnalyticsView";

const {
  charts,
  cities,
  departments,
  error,
  filters,
  genderOptions,
  institutes,
  isPartnerScoped,
  isLoading,
  liveError,
  liveIsLoading,
  metrics,
  paginationLabel,
  partnerInstituteLabel,
  profileOpen,
  searchQuery,
  selectedStudent,
  selectedStudentIsLoading,
  statusOptions,
  studentPage,
  studentPageOptions,
  studentPerPage,
  studentTotal,
  submitSearch,
  table,
  viewStudent,
} = useStudentAnalyticsView();

const { t } = useI18n();
const { translateText } = useTranslateText();

const translatedSelectItems = (items: string[]) =>
  items.map((item) => ({
    label: String(translateText(item)),
    value: item,
  }));

</script>

<template>
  <div class="page-stack">
    <PageHeader
      title="Students"
      copy="Inspect Moodle student records, demographics, login activity, and profile details."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft">GET /api/dashboard/students</UBadge>
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="grid metrics">
        <MetricCard
          v-for="metricItem in metrics"
          :key="metricItem.label"
          :metric="metricItem"
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
        v-if="liveIsLoading"
        color="neutral"
        variant="soft"
        icon="i-lucide-loader"
        title="Loading student analytics charts"
        description="The student table is ready. Chart sections will update as Moodle analytics responds."
      />

      <UAlert
        v-else-if="liveError"
        color="warning"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Student charts unavailable"
        :description="liveError"
      />

      <UCard :ui="{ body: 'analytics-filter-bar' }">
        <div class="analytics-filter-field wide">
          <label>{{ t("common.search") }}</label>
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            :placeholder="String(translateText('Search name, email, or username'))"
            @keydown.enter="submitSearch"
          />
        </div>
        <div class="analytics-filter-field">
          <label>{{ t("text.institution") }}</label>
          <USelect
            v-model="filters.institute"
            :items="translatedSelectItems(institutes)"
            :disabled="isPartnerScoped"
          />
          <span v-if="isPartnerScoped" class="text-xs text-muted">
            Locked to your approved institute.
          </span>
        </div>
        <div class="analytics-filter-field">
          <label>{{ t("text.department") }}</label>
          <USelect v-model="filters.department" :items="translatedSelectItems(departments)" />
        </div>
        <div class="analytics-filter-field">
          <label>{{ translateText("City") }}</label>
          <USelect v-model="filters.city" :items="translatedSelectItems(cities)" />
        </div>
        <div class="analytics-filter-field">
          <label>{{ translateText("Gender") }}</label>
          <USelect
            v-model="filters.gender"
            :items="translatedSelectItems(genderOptions)"
          />
        </div>
        <div class="analytics-filter-field">
          <label>{{ t("text.status") }}</label>
          <USelect
            v-model="filters.status"
            :items="translatedSelectItems(statusOptions)"
          />
        </div>
      </UCard>

      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1280px"
      >
        <template #cell-action="{ value }">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-eye"
            :label="t('text.view')"
            @click="viewStudent(value)"
          />
        </template>
      </DashboardDataTable>

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

      <section class="grid dashboard-detail">
        <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-triangle-alert" />
                Risk Level Explanation
              </h2>
              <p class="chart-note">Static preview for the future student risk model.</p>
            </div>
            <UBadge color="warning" variant="soft">Static preview</UBadge>
          </div>
          <ul class="static-preview-list">
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>Never logged in increases risk.</span>
            </li>
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>No course completion increases risk.</span>
            </li>
            <li>
              <UIcon name="i-lucide-check-circle-2" />
              <span>No quiz or assignment activity increases risk.</span>
            </li>
          </ul>
        </UCard>

        <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title with-icon">
                <UIcon name="i-lucide-gauge" />
                Performance Preview Fields
              </h2>
              <p class="chart-note">These fields are UI placeholders until learning-performance APIs are ready.</p>
            </div>
            <UBadge color="warning" variant="soft">API later</UBadge>
          </div>
          <div class="static-preview-stat-grid">
            <div>
              <span>Performance score</span>
              <strong>76%</strong>
            </div>
            <div>
              <span>Learning hours</span>
              <strong>42h</strong>
            </div>
            <div>
              <span>Attendance rate</span>
              <strong>88%</strong>
            </div>
          </div>
        </UCard>
      </section>
    </template>

    <StudentProfileDrawer
      v-model="profileOpen"
      :student="selectedStudent"
      :loading="selectedStudentIsLoading"
    />
  </div>
</template>
