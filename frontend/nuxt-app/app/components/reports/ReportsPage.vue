<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useReportsPage } from "~/composables/reports/useReportsPage";

const {
  partnerInstituteLabel,
  reportCards,
  reportSummaryItems,
} = useReportsPage();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      :eyebrow="String(translateText('Reporting'))"
      :title="String(translateText('Reports'))"
      :copy="String(translateText('Open each analytics page and export the visible dashboard data as CSV.'))"
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="success" variant="soft">
          {{ translateText("CSV export available on feature pages") }}
        </UBadge>
      </div>
    </PageHeader>

    <section class="grid report-export-summary">
      <UCard
        v-for="item in reportSummaryItems"
        :key="item.label"
        as="article"
        class="report-summary-shell"
        :ui="{ body: 'report-summary-card' }"
      >
        <span>{{ translateText(item.label) }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ translateText(item.detail) }}</p>
      </UCard>
    </section>

    <section class="report-export-grid">
      <UCard
        v-for="report in reportCards"
        :key="report.key"
        as="article"
        class="analytics-card report-export-shell"
        :ui="{ body: 'report-export-card' }"
      >
        <div class="report-export-icon">
          <UIcon :name="report.icon" />
        </div>
        <div>
          <h2>{{ translateText(report.title) }}</h2>
          <p>{{ translateText(report.description) }}</p>
        </div>
        <div class="report-export-meta">
          <UBadge color="neutral" variant="soft">{{ report.format }}</UBadge>
          <UBadge color="success" variant="soft">{{ translateText("Ready") }}</UBadge>
        </div>
        <div class="toolbar">
          <AppButton
            action="details"
            :to="report.route"
            :label="String(translateText('Open page'))"
            variant="outline"
          />
        </div>
      </UCard>
    </section>

    <UCard as="article" class="report-preview-shell" :ui="{ body: 'report-preview-card' }">
      <div>
        <p class="eyebrow">{{ translateText("Preview") }}</p>
        <h2>{{ translateText("Moodle Learning Activity Report") }}</h2>
        <p>
          {{ translateText("CSV export buttons are now placed inside the analytics feature pages next to the data they export.") }}
        </p>
      </div>
      <UBadge color="success" variant="soft">{{ translateText("Ready") }}</UBadge>
    </UCard>
  </div>
</template>
