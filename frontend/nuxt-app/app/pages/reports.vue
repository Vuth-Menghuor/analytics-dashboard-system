<script setup lang="ts">
import { useDashboardData } from "~/composables/dashboard/useDashboardData";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});

const { reports } = useDashboardData();

const reportColumns = [
  { key: "name", label: "Report", width: "34%", rowHeader: true },
  { key: "owner", label: "Owner", width: "20%", tone: "muted" },
  { key: "cadence", label: "Cadence", width: "16%" },
  {
    key: "status",
    label: "Status",
    width: "14%",
    type: "status",
    warningValues: ["Draft"],
  },
  {
    key: "action",
    label: "Action",
    width: "16%",
    align: "center",
    type: "action",
  },
] as const;

const reportRows = computed(() =>
  reports.map((report) => ({
    id: report.id,
    name: report.name,
    owner: report.owner,
    cadence: report.cadence,
    status: report.status,
    action: report.id,
  })),
);
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Medium priority"
      title="Reports"
      copy="Create, review, and distribute recurring reporting packages."
    >
      <UButton icon="i-lucide-plus" label="New report" />
    </PageHeader>

    <DashboardDataTable
      title="Reporting Packages"
      icon="i-lucide-file-bar-chart"
      description="Recurring reports by owner, cadence, and publishing status"
      :columns="reportColumns"
      :rows="reportRows"
      row-key="id"
      min-width="780px"
    >
      <template #cell-action>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-download"
          label="Export"
        />
      </template>
    </DashboardDataTable>
  </div>
</template>
