<script setup lang="ts">
import { useDashboardData } from "~/composables/dashboard/useDashboardData";

definePageMeta({
  middleware: ["role"],
  roles: ["manager"],
});

const { users } = useDashboardData();

const partnerRequests = [
  {
    id: 1,
    user: "John Doe",
    email: "john.doe@example.com",
    institute: "Institute of Technology of Cambodia",
    department: "Computer Science",
    position: "Lecturer",
    assignRole: "Partner",
    status: "Pending",
  },
];
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="High priority"
      title="User Management"
      copy="Invite teammates, review roles, and monitor workspace access."
    >
      <UButton icon="i-lucide-plus" label="Invite user" />
    </PageHeader>

    <UCard as="article" class="approval-panel" :ui="{ body: 'p-5' }">
      <div>
        <p class="eyebrow">Pending approval</p>
        <h2 class="section-title">Partner Registration Request</h2>
      </div>

      <div
        v-for="request in partnerRequests"
        :key="request.id"
        class="approval-request"
      >
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
            <dd>
              <span class="status warn">{{ request.status }}</span>
            </dd>
          </div>
        </dl>

        <div class="approval-actions">
          <UButton
            color="error"
            variant="soft"
            type="button"
            icon="i-lucide-x"
            label="Reject"
          />
          <UButton type="button" icon="i-lucide-check" label="Approve" />
        </div>
      </div>
    </UCard>

    <UCard as="article" :ui="{ body: 'p-0' }">
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
              <td>
                <span
                  class="status"
                  :class="{ warn: user.status === 'Pending' }"
                  >{{ user.status }}</span
                >
              </td>
              <td>{{ user.lastSeen }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
