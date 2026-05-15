<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});

const filters = reactive({
  range: "Last 30 days",
  institute: "All institutes",
  course: "All courses",
  status: "All students",
});

const savedReports = [
  { id: 1, name: "Monthly Moodle Engagement", owner: "Manager", format: "PDF", status: "Ready" },
  { id: 2, name: "Course Completion Audit", owner: "Partner", format: "Excel", status: "Draft" },
  { id: 3, name: "Quiz and Grade Summary", owner: "Manager", format: "CSV", status: "Ready" },
];

const table = {
  title: "Saved Reports",
  icon: "i-lucide-file-bar-chart",
  description: "Prepared report packages for repeated Moodle database exports.",
  rowKey: "id",
  columns: [
    { key: "name", label: "Report", rowHeader: true },
    { key: "owner", label: "Owner", tone: "muted" },
    { key: "format", label: "Format" },
    { key: "status", label: "Status", type: "status", warningValues: ["Draft"] },
    { key: "action", label: "Export", type: "action" },
  ],
  rows: savedReports.map((report) => ({ ...report, action: report.id })),
} as const;
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
        <USelect v-model="filters.range" :items="['Last 7 days', 'Last 30 days', 'This semester']" />
      </div>
      <div class="analytics-filter-field">
        <label>Institute</label>
        <USelect v-model="filters.institute" :items="['All institutes', 'ITC', 'RUPP', 'NUM', 'NPIC']" />
      </div>
      <div class="analytics-filter-field">
        <label>Course</label>
        <USelect v-model="filters.course" :items="['All courses', 'DB-MDL-401', 'LDA-210', 'BUS-STATS']" />
      </div>
      <div class="analytics-filter-field">
        <label>Student status</label>
        <USelect v-model="filters.status" :items="['All students', 'Active', 'Suspended']" />
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
