<script setup lang="ts">
import PageHeader from "~/components/common/PageHeader.vue";
import { useReportsPage } from "~/composables/reports/useReportsPage";

const {
  partnerInstituteLabel,
  previewExport,
  reportCards,
  reportSummaryItems,
} = useReportsPage();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Reporting"
      title="Reports"
      copy="Review the export layout before backend export APIs are connected."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="warning" variant="soft">
          Export UI only — backend export API later
        </UBadge>
      </div>
    </PageHeader>

    <section class="grid report-export-summary">
      <UCard
        v-for="item in reportSummaryItems"
        :key="item.label"
        as="article"
        :ui="{ body: 'report-summary-card' }"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.detail }}</p>
      </UCard>
    </section>

    <section class="report-export-grid">
      <UCard
        v-for="report in reportCards"
        :key="report.key"
        as="article"
        class="analytics-card"
        :ui="{ body: 'report-export-card' }"
      >
        <div class="report-export-icon">
          <UIcon :name="report.icon" />
        </div>
        <div>
          <h2>{{ report.title }}</h2>
          <p>{{ report.description }}</p>
        </div>
        <div class="report-export-meta">
          <UBadge color="neutral" variant="soft">{{ report.format }}</UBadge>
          <UBadge color="warning" variant="soft">API later</UBadge>
        </div>
        <div class="toolbar">
          <UButton
            :to="report.route"
            color="neutral"
            variant="ghost"
            icon="i-lucide-eye"
            label="View data"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-download"
            label="Export CSV"
            @click="previewExport(report.key)"
          />
        </div>
      </UCard>
    </section>

    <UCard as="article" :ui="{ body: 'report-preview-card' }">
      <div>
        <p class="eyebrow">{{ translateText("Preview") }}</p>
        <h2>{{ translateText("Moodle Learning Analytics Report") }}</h2>
        <p>
          Export buttons are static UI controls for review. CSV generation will
          be connected first; PDF can be added later if needed.
        </p>
      </div>
      <UBadge color="warning" variant="soft">Static preview</UBadge>
    </UCard>
  </div>
</template>
