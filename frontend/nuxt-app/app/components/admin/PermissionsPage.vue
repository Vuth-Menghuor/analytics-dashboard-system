<script setup lang="ts">
import {
  adminPermissionColumns,
  adminPermissionModules,
  adminPermissionRoleSummaries,
  adminPermissionRows,
  adminPermissionStats,
} from "~/constants/admin";
</script>

<template>
  <div class="page-stack permissions-page">
    <PageHeader
      eyebrow="Administration"
      title="Permissions"
      copy="Review which dashboard capabilities are available to managers, partners, and visitors."
    >
      <UButton icon="i-lucide-shield-plus" label="Add permission" />
    </PageHeader>

    <section class="permission-console">
      <UCard as="article" class="permission-model-card">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-lock-keyhole" />
            Permission Model
          </h2>
          <p>
            Access is composed from route metadata, sidebar visibility, and
            role-scoped account behavior.
          </p>
        </div>
        <div class="permission-stat-grid">
          <div
            v-for="permission in adminPermissionStats"
            :key="permission.label"
          >
            <UIcon :name="permission.icon" />
            <span>{{ permission.label }}</span>
            <strong>{{ permission.value }}</strong>
            <p>{{ permission.description }}</p>
          </div>
        </div>
      </UCard>

      <UCard as="article" class="permission-role-card">
        <div
          v-for="summary in adminPermissionRoleSummaries"
          :key="summary.role"
          class="permission-role"
        >
          <span>{{ summary.role }}</span>
          <strong>{{ summary.scope }}</strong>
        </div>
      </UCard>
    </section>

    <section class="permission-module-grid">
      <UCard
        v-for="module in adminPermissionModules"
        :key="module.label"
        as="article"
        class="permission-module-card"
      >
        <div>
          <span>{{ module.routes }}</span>
          <strong>{{ module.label }}</strong>
        </div>
        <dl>
          <div>
            <dt>Manager</dt>
            <dd>{{ module.manager }}</dd>
          </div>
          <div>
            <dt>Partner</dt>
            <dd>{{ module.partner }}</dd>
          </div>
          <div>
            <dt>Visitor</dt>
            <dd>{{ module.visitor }}</dd>
          </div>
        </dl>
      </UCard>
    </section>

    <UCard as="article" class="permission-route-banner">
      <span>
        <UIcon name="i-lucide-route" />
      </span>
      <div>
        <p class="eyebrow">Permission model</p>
        <h2>Route metadata controls access</h2>
        <p>
          Permissions shown here mirror the current role-protected routes and
          account settings behavior.
        </p>
      </div>
      <UBadge color="primary" variant="soft">definePageMeta roles</UBadge>
    </UCard>

    <DashboardDataTable
      title="Permission Matrix"
      icon="i-lucide-lock-keyhole"
      description="Allowed and blocked capabilities by dashboard role"
      :columns="adminPermissionColumns"
      :rows="adminPermissionRows"
      row-key="permission"
      min-width="980px"
    />
  </div>
</template>

<style scoped>
.permission-console,
.permission-module-grid {
  display: grid;
  gap: 1rem;
}

.permission-console {
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
}

.permission-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 1rem;
}

.permission-stat-grid div,
.permission-role,
.permission-module-card dl div {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 0.9rem;
}

.permission-stat-grid svg {
  color: var(--ui-color-primary-700);
  font-size: 1.2rem;
}

.permission-stat-grid span,
.permission-module-card span,
.permission-module-card dt,
.permission-role span {
  display: block;
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.permission-stat-grid strong,
.permission-module-card strong,
.permission-module-card dd,
.permission-role strong {
  display: block;
  margin-top: 0.4rem;
  color: var(--ui-text-highlighted);
  font-weight: 800;
}

.permission-stat-grid p {
  margin-top: 0.35rem;
  color: var(--ui-text-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

.permission-role-card {
  background: linear-gradient(
    145deg,
    rgba(10, 56, 104, 0.06),
    rgba(245, 158, 11, 0.08)
  );
}

.permission-role + .permission-role {
  margin-top: 0.75rem;
}

.permission-module-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.permission-module-card dl {
  display: grid;
  gap: 0.6rem;
  margin-top: 1rem;
}

.permission-module-card dd {
  margin: 0.25rem 0 0;
}

.permission-route-banner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
}

.permission-route-banner > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 8px;
  background: rgba(10, 56, 104, 0.08);
  color: var(--ui-color-primary-700);
}

.permission-route-banner h2 {
  margin-top: 0.2rem;
  color: var(--ui-text-highlighted);
  font-size: 1.2rem;
}

.permission-route-banner p:last-child {
  margin-top: 0.25rem;
  color: var(--ui-text-muted);
}

@media (max-width: 980px) {
  .permission-console,
  .permission-module-grid,
  .permission-stat-grid,
  .permission-route-banner {
    grid-template-columns: 1fr;
  }
}
</style>
