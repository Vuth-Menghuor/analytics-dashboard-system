<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  roles: ['manager']
})

const { users } = useDashboardData()

const partnerRequests = [
  {
    id: 1,
    user: 'John Doe',
    email: 'john.doe@example.com',
    institute: 'Institute of Technology of Cambodia',
    department: 'Computer Science',
    position: 'Lecturer',
    assignRole: 'Partner',
    status: 'Pending'
  }
]
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

    <article class="card card-pad approval-panel">
      <div>
        <p class="eyebrow">Pending approval</p>
        <h2 class="section-title">Partner Registration Request</h2>
      </div>

      <div v-for="request in partnerRequests" :key="request.id" class="approval-request">
        <dl class="approval-details">
          <div>
            <dt>User</dt>
            <dd>{{ request.user }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ request.email }}</dd>
          </div>
          <div>
            <dt>Requested Institute</dt>
            <dd>{{ request.institute }}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{{ request.department }}</dd>
          </div>
          <div>
            <dt>Position</dt>
            <dd>{{ request.position }}</dd>
          </div>
          <div>
            <dt>Assign Role</dt>
            <dd>{{ request.assignRole }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><span class="status warn">{{ request.status }}</span></dd>
          </div>
        </dl>

        <div class="approval-actions">
          <button class="btn danger" type="button">
            <IconByName name="X" />
            Reject
          </button>
          <button class="btn primary" type="button">
            <IconByName name="Check" />
            Approve
          </button>
        </div>
      </div>
    </article>

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
