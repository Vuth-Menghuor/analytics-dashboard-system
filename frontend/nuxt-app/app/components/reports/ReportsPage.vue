<script setup lang="ts">
import { useReportsPage } from "~/composables/reports/useReportsPage";

const { filters, filterOptions, table } = useReportsPage();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Reporting"
      title="Reports"
      copy="Generate filtered reports by date range, institute, course, and student status with export-ready placeholders."
    >
      <UButton icon="i-lucide-file-plus-2" label="Generate report" />
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field">
        <label>Date range</label>
        <USelect v-model="filters.range" :items="filterOptions.ranges" />
      </div>
      <div class="analytics-filter-field">
        <label>Institute</label>
        <USelect v-model="filters.institute" :items="filterOptions.institutes" />
      </div>
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="filterOptions.courses" />
      </div>
      <div class="analytics-filter-field">
        <label>Student status</label>
        <USelect v-model="filters.status" :items="filterOptions.statuses" />
      </div>
      <div class="toolbar report-export-actions">
        <UButton color="neutral" variant="outline" icon="i-lucide-file-text" label="PDF" />
        <UButton color="neutral" variant="outline" icon="i-lucide-table-2" label="Excel" />
        <UButton color="neutral" variant="outline" icon="i-lucide-download" label="CSV" />
      </div>
    </UCard>

    <UCard as="article" :ui="{ body: 'report-preview-card' }">
      <div>
        <p class="eyebrow">Preview</p>
        <h2>Moodle Learning Analytics Report</h2>
        <p>Includes dashboard summary, activity trend, grade distribution, attendance status, and selected filters.</p>
      </div>
      <UBadge color="primary" variant="soft">POST /api/reports/export</UBadge>
    </UCard>

    <DashboardDataTable
      :title="table.title"
      :icon="table.icon"
      :description="table.description"
      :columns="table.columns"
      :rows="table.rows"
      :row-key="table.rowKey"
      min-width="900px"
    >
      <template #cell-action>
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Export" />
      </template>
    </DashboardDataTable>
  </div>
</template>
