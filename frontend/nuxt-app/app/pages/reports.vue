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
      <button class="btn primary">
        <IconByName name="Plus" />
        New report
      </button>
    </PageHeader>

    <article class="card">
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
                <button class="btn">
                  <IconByName name="Download" />
                  Export
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </div>
</template>
