<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});

const users = [
  { id: 1, name: "Maya Chen", email: "maya@school.edu", role: "Manager", status: "Active", institute: "All institutes", department: "Executive", lastLogin: "Today, 08:10" },
  { id: 2, name: "Sophea Lim", email: "sophea@itc.edu", role: "Partner", status: "Active", institute: "ITC", department: "Computer Science", lastLogin: "Yesterday" },
  { id: 3, name: "Dara Kim", email: "dara@rupp.edu", role: "Partner", status: "Inactive", institute: "RUPP", department: "Education", lastLogin: "May 9, 2026" },
  { id: 4, name: "Visitor Demo", email: "visitor@example.com", role: "Visitor", status: "Active", institute: "Public", department: "Public", lastLogin: "May 14, 2026" },
];

const table = {
  title: "User Table",
  icon: "i-lucide-users",
  description: "Role, institute, department, status, and last login placeholders for future admin APIs.",
  rowKey: "id",
  columns: [
    { key: "name", label: "User", rowHeader: true },
    { key: "email", label: "Email", tone: "muted" },
    { key: "role", label: "Role", type: "status" },
    { key: "status", label: "Status", type: "status", warningValues: ["Inactive"] },
    { key: "institute", label: "Institute" },
    { key: "department", label: "Department" },
    { key: "lastLogin", label: "Last login" },
    { key: "action", label: "Actions", type: "action" },
  ],
  rows: users.map((user) => ({ ...user, action: user.id })),
} as const;
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
      :title="table.title"
      :icon="table.icon"
      :description="table.description"
      :columns="table.columns"
      :rows="table.rows"
      :row-key="table.rowKey"
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
