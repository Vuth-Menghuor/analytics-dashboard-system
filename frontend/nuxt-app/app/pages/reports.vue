<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager', 'partner', 'visitor']
})

const { reports } = useDashboardData()
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

    <UCard as="article" :ui="{ body: 'p-0' }">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Owner</th>
              <th>Cadence</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>{{ report.name }}</td>
              <td>{{ report.owner }}</td>
              <td>{{ report.cadence }}</td>
              <td><span class="status" :class="{ warn: report.status === 'Draft' }">{{ report.status }}</span></td>
              <td>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-download"
                  label="Export"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
