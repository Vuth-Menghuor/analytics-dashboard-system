<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager']
})

const { users } = useDashboardData()
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="High priority"
      title="User Management"
      copy="Invite teammates, review roles, and monitor workspace access."
    >
      <button class="btn primary">
        <IconByName name="Plus" />
        Invite user
      </button>
    </PageHeader>

    <article class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td><span class="status" :class="{ warn: user.status === 'Pending' }">{{ user.status }}</span></td>
              <td>{{ user.lastSeen }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </div>
</template>
