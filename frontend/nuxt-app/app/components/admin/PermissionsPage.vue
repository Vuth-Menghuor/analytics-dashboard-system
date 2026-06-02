<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import {
  adminPermissionColumns,
  adminPermissionModules,
  adminPermissionRoleSummaries,
  adminPermissionRows,
  adminPermissionStats,
} from "~/constants/admin";

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack permissions-page">
    <PageHeader
      eyebrow="Administration"
      title="Permissions"
      copy="Review which dashboard capabilities are available to managers, partners, and visitors."
    >
      <UBadge color="neutral" variant="soft">Read-only configuration</UBadge>
    </PageHeader>

    <section class="permission-console">
      <UCard as="article" class="admin-panel-card">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-lock-keyhole" />
            {{ t("text.permissionModel") }}
          </h2>
          <p>
            Access is composed from route metadata, sidebar visibility, and
            role-scoped account behavior.
          </p>
        </div>
        <div class="admin-summary-grid permission-stat-grid">
          <div
            v-for="permission in adminPermissionStats"
            :key="permission.label"
            class="admin-summary-card permission-stat-card"
          >
            <div class="admin-card-heading">
              <span class="admin-card-icon">
                <UIcon :name="permission.icon" />
              </span>
              <UBadge color="neutral" variant="soft">Current</UBadge>
            </div>
            <span>{{ translateText(permission.label) }}</span>
            <strong>{{ translateText(permission.value) }}</strong>
            <p>{{ translateText(permission.description) }}</p>
          </div>
        </div>
      </UCard>

      <UCard as="article" class="admin-panel-card permission-role-card">
        <div class="section-heading compact">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-users-round" />
            Role Scope
          </h2>
          <p>Current access level by system role.</p>
        </div>
        <div
          v-for="summary in adminPermissionRoleSummaries"
          :key="summary.role"
          class="permission-role"
        >
          <span>{{ translateText(summary.role) }}</span>
          <strong>{{ translateText(summary.scope) }}</strong>
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
        <div class="permission-module-header">
          <span>{{ module.routes }}</span>
          <strong>{{ translateText(module.label) }}</strong>
        </div>
        <dl>
          <div>
            <dt>{{ t("text.manager") }}</dt>
            <dd>{{ module.manager }}</dd>
          </div>
          <div>
            <dt>{{ t("text.partner") }}</dt>
            <dd>{{ module.partner }}</dd>
          </div>
          <div>
            <dt>{{ t("text.visitor") }}</dt>
            <dd>{{ module.visitor }}</dd>
          </div>
        </dl>
      </UCard>
    </section>

    <UCard as="article" class="permission-route-banner admin-panel-card">
      <span class="admin-card-icon">
        <UIcon name="i-lucide-route" />
      </span>
      <div>
        <p class="eyebrow">{{ t("text.permissionModel") }}</p>
        <h2>{{ translateText("Route metadata controls access") }}</h2>
        <p>
          Permissions shown here mirror the current role-protected routes and
          account settings behavior.
        </p>
      </div>
      <UBadge color="primary" variant="soft">definePageMeta roles</UBadge>
    </UCard>

    <DashboardDataTable
      :title="t('text.permissionMatrix')"
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

.admin-panel-card,
.admin-summary-card,
.permission-module-card {
  border: 1px solid var(--ui-border);
  box-shadow: none;
}

.admin-summary-grid {
  display: grid;
  gap: 0.85rem;
}

.permission-stat-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.admin-card-heading,
.permission-module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 8px;
  background: var(--ui-bg-elevated);
  color: var(--ui-color-primary-700);
}

.permission-stat-card,
.permission-role,
.permission-module-card dl div {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 0.9rem;
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

.permission-role {
  display: grid;
  gap: 0.2rem;
}

.permission-role:first-of-type {
  margin-top: 1rem;
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
