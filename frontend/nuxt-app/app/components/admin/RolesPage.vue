<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import {
  adminRoleColumns,
  adminRolePolicies,
  adminRoleRows,
  adminRoleStats,
} from "~/constants/admin";

const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <div class="page-stack roles-page">
    <PageHeader
      eyebrow="Administration"
      title="Roles"
      copy="Review the manager, partner, and visitor roles used by the dashboard access rules."
    >
      <UBadge color="neutral" variant="soft">Read-only configuration</UBadge>
    </PageHeader>

    <section class="admin-summary-grid" aria-label="Role summary">
      <UCard
        v-for="role in adminRoleStats"
        :key="role.label"
        as="article"
        class="admin-summary-card"
      >
        <div class="admin-card-heading">
          <span class="admin-card-icon">
            <UIcon :name="role.icon" />
          </span>
          <UBadge color="neutral" variant="soft">Active</UBadge>
        </div>
        <div class="admin-card-copy">
          <span>{{ translateText(role.value) }}</span>
          <strong>{{ translateText(role.label) }}</strong>
          <p>{{ translateText(role.description) }}</p>
        </div>
      </UCard>
    </section>

    <section class="admin-detail-layout">
      <UCard as="article" class="admin-panel-card">
        <div class="section-heading">
          <h2 class="section-title with-icon">
            <UIcon name="i-lucide-shield-check" />
            {{ t("text.accessScope") }}
          </h2>
          <p>How each role expands across institutes, analytics, and administration.</p>
        </div>

        <div class="admin-list">
          <div v-for="row in adminRoleRows" :key="row.role" class="admin-list-row">
            <span class="admin-list-icon">
              <UIcon name="i-lucide-user-check" />
            </span>
            <div>
              <strong>{{ translateText(row.role) }}</strong>
              <p>{{ translateText(row.scope) }}</p>
            </div>
            <span>{{ translateText(row.dashboard) }}</span>
          </div>
        </div>
      </UCard>

      <div class="admin-policy-stack">
        <UCard
          v-for="policy in adminRolePolicies"
          :key="policy.label"
          as="article"
          class="admin-policy-card"
        >
          <div class="admin-policy-header">
            <span>{{ translateText(policy.label) }}</span>
            <UIcon name="i-lucide-arrow-up-right" />
          </div>
          <strong>{{ translateText(policy.value) }}</strong>
          <p>{{ translateText(policy.detail) }}</p>
        </UCard>
      </div>
    </section>

    <DashboardDataTable
      :title="t('text.roleMatrix')"
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
.admin-summary-grid,
.admin-detail-layout,
.admin-policy-stack {
  display: grid;
  gap: 1rem;
}

.admin-summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.admin-summary-card,
.admin-panel-card,
.admin-policy-card {
  border: 1px solid var(--ui-border);
  box-shadow: none;
}

.admin-card-heading,
.admin-policy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-card-icon,
.admin-list-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 8px;
  background: var(--ui-bg-elevated);
  color: var(--ui-color-primary-700);
}

.admin-card-copy {
  margin-top: 1rem;
}

.admin-card-copy span,
.admin-list-row > span:last-child,
.admin-policy-header span {
  display: block;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.admin-card-copy strong,
.admin-list-row strong,
.admin-policy-card strong {
  display: block;
  margin-top: 0.35rem;
  color: var(--ui-text-highlighted);
  font-size: 1.15rem;
}

.admin-card-copy p,
.admin-list-row p,
.admin-policy-card p {
  margin-top: 0.45rem;
  color: var(--ui-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.admin-detail-layout {
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
}

.admin-list {
  display: grid;
  gap: 0.6rem;
  margin-top: 1rem;
}

.admin-list-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 0.85rem;
}

.admin-policy-header svg {
  color: var(--ui-text-muted);
}

@media (max-width: 980px) {
  .admin-summary-grid,
  .admin-detail-layout,
  .admin-list-row {
    grid-template-columns: 1fr;
  }
}
</style>
