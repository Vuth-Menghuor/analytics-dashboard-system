<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import MetricCard from "~/components/common/MetricCard.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useLearningPerformancePage } from "~/composables/learning/useLearningPerformancePage";

const {
  charts,
  metrics,
  partnerInstituteLabel,
  previewSummary,
  riskCounts,
  riskRules,
  riskTable,
} = useLearningPerformancePage();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Learning analytics"
      title="Learning Performance"
      copy="Preview grade, quiz, assignment, and student risk analytics before backend APIs are connected."
    >
      <div class="toolbar">
        <UBadge v-if="partnerInstituteLabel" color="success" variant="soft">
          {{ partnerInstituteLabel }}
        </UBadge>
        <UBadge color="warning" variant="soft">
          Static preview — API will be connected later
        </UBadge>
      </div>
    </PageHeader>

    <section class="grid report-export-summary">
      <UCard
        v-for="item in previewSummary"
        :key="item.label"
        as="article"
        :ui="{ body: 'report-summary-card' }"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.detail }}</p>
      </UCard>
    </section>

    <section class="grid metrics">
      <MetricCard
        v-for="metric in metrics"
        :key="metric.label"
        :metric="metric"
      />
    </section>

    <section class="grid analytics-chart-grid">
      <AnalyticsChartCard
        v-for="chart in charts"
        :key="chart.title"
        :chart="chart"
        badge="Static preview"
        badge-color="warning"
      />
    </section>

    <section class="grid dashboard-detail">
      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-shield-alert" />
              Student Risk Analytics
            </h2>
            <p class="chart-note">Rule preview only. Backend risk scoring will be connected later.</p>
          </div>
          <UBadge color="warning" variant="soft">API later</UBadge>
        </div>

        <div class="static-preview-stat-grid">
          <div>
            <span>Low Risk</span>
            <strong>{{ riskCounts.low }}</strong>
          </div>
          <div>
            <span>Medium Risk</span>
            <strong>{{ riskCounts.medium }}</strong>
          </div>
          <div>
            <span>High Risk</span>
            <strong>{{ riskCounts.high }}</strong>
          </div>
        </div>
      </UCard>

      <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-list-checks" />
              Risk Rule Preview
            </h2>
            <p class="chart-note">Rules that will guide the first risk endpoint.</p>
          </div>
          <UBadge color="neutral" variant="soft">Static preview</UBadge>
        </div>

        <ul class="static-preview-list">
          <li v-for="rule in riskRules" :key="rule">
            <UIcon name="i-lucide-check-circle-2" />
            <span>{{ rule }}</span>
          </li>
        </ul>
      </UCard>
    </section>

    <DashboardDataTable
      :title="riskTable.title"
      :icon="riskTable.icon"
      :description="riskTable.description"
      :columns="riskTable.columns"
      :rows="riskTable.rows"
      :row-key="riskTable.rowKey"
      min-width="980px"
    />
  </div>
</template>
