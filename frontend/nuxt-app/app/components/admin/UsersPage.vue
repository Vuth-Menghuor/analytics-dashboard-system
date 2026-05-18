<script setup lang="ts">
import { adminUserTable } from "~/constants/admin";
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Administration"
      title="User Management"
      copy="Manage manager, partner, and visitor access with placeholders for profile view, role edits, and user disabling."
    >
      <UButton icon="i-lucide-plus" label="Invite user" />
    </PageHeader>

    <DashboardDataTable
      :title="adminUserTable.title"
      :icon="adminUserTable.icon"
      :description="adminUserTable.description"
      :columns="adminUserTable.columns"
      :rows="adminUserTable.rows"
      :row-key="adminUserTable.rowKey"
      min-width="1160px"
    >
      <template #cell-action>
        <div class="toolbar table-actions">
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="View" />
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-shield" label="Edit role" />
          <UButton size="sm" color="error" variant="soft" icon="i-lucide-ban" label="Disable" />
        </div>
      </template>
    </DashboardDataTable>
  </div>
</template>
