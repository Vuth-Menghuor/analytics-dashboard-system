<script setup lang="ts">
import {
  adminRoleColumns,
  adminRolePolicies,
  adminRoleRows,
  adminRoleStats,
} from "~/constants/admin";
</script>

<template>
  <div class="page-stack roles-page">
    <PageHeader
      eyebrow="Administration"
      title="Roles"
      copy="Review the manager, partner, and visitor roles used by the dashboard access rules."
    >
      <UButton icon="i-lucide-plus" label="Create role" />
    </PageHeader>

    <section class="roles-overview-grid">
      <UCard
        v-for="role in adminRoleStats"
        :key="role.label"
        as="article"
        class="role-profile-card"
      >
        <span class="role-profile-icon">
          <UIcon :name="role.icon" />
        </span>
        <div>
          <span>{{ role.label }}</span>
          <strong>{{ role.value }}</strong>
          <p>{{ role.description }}</p>
        </div>
      </UCard>
    </section>

    <section class="roles-access-layout">
      <UCard as="article" class="role-scope-card">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-shield-check" />
            Access Scope
          </h2>
          <p>How each role expands across institutes, analytics, and administration.</p>
        </div>
        <div class="role-scope-stack">
          <div v-for="row in adminRoleRows" :key="row.role">
            <span>{{ row.role }}</span>
            <strong>{{ row.scope }}</strong>
            <p>{{ row.dashboard }} · {{ row.administration }}</p>
          </div>
        </div>
      </UCard>

      <div class="role-policy-stack">
        <UCard
          v-for="policy in adminRolePolicies"
          :key="policy.label"
          as="article"
          class="role-policy-card"
        >
          <span>{{ policy.label }}</span>
          <strong>{{ policy.value }}</strong>
          <p>{{ policy.detail }}</p>
        </UCard>
      </div>
    </section>

    <DashboardDataTable
      title="Role Matrix"
      icon="i-lucide-shield"
      description="Current role definitions and administration scope"
      :columns="adminRoleColumns"
      :rows="adminRoleRows"
      row-key="role"
      min-width="980px"
    />
  </div>
</template>

<style scoped>
.roles-overview-grid,
.roles-access-layout,
.role-policy-stack {
  display: grid;
  gap: 1rem;
}

.roles-overview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.role-profile-card {
  position: relative;
  overflow: hidden;
}

.role-profile-card::after {
  position: absolute;
  right: -2rem;
  bottom: -2rem;
  width: 7rem;
  height: 7rem;
  border-radius: 999px;
  background: rgba(10, 56, 104, 0.06);
  content: '';
}

.role-profile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 8px;
  background: rgba(10, 56, 104, 0.08);
  color: var(--ui-color-primary-700);
}

.role-profile-card span,
.role-scope-stack span,
.role-policy-card span {
  display: block;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.role-profile-card strong,
.role-scope-stack strong,
.role-policy-card strong {
  display: block;
  margin-top: 0.6rem;
  color: var(--ui-text-highlighted);
  font-size: 1.35rem;
}

.role-profile-card p,
.role-scope-stack p,
.role-policy-card p {
  margin-top: 0.45rem;
  color: var(--ui-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.roles-access-layout {
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
}

.role-scope-stack {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.role-scope-stack div {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 1rem;
}

.role-policy-card {
  background: linear-gradient(145deg, rgba(10, 56, 104, 0.06), rgba(34, 197, 94, 0.06));
}

@media (max-width: 980px) {
  .roles-overview-grid,
  .roles-access-layout {
    grid-template-columns: 1fr;
  }
}
</style>
