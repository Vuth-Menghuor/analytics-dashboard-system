<script setup lang="ts">
import type { AdminUser } from "~/types/admin";
import AppButton from "~/components/common/AppButton.vue";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  user: AdminUser | null;
}>();

const { t } = useI18n();
const { translateText } = useTranslateText();

const formatProfileDate = (value: string | null) => {
  if (!value) {
    return String(translateText("Not available"));
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const roleLabel = computed(() => {
  if (!props.user?.role) {
    return String(translateText("Not available"));
  }

  return props.user.role.charAt(0).toUpperCase() + props.user.role.slice(1);
});

const accessScope = computed(() => {
  if (!props.user) {
    return String(translateText("Not available"));
  }

  return props.user.role === "partner"
    ? props.user.institution_name || String(translateText("Not assigned"))
    : String(translateText("System-wide"));
});

const profileItems = computed(() => [
  {
    label: t("text.name"),
    value: props.user?.name || String(translateText("Not available")),
    icon: "i-lucide-user-round",
  },
  {
    label: t("text.email"),
    value: props.user?.email || String(translateText("Not available")),
    icon: "i-lucide-mail",
  },
  {
    label: t("text.role"),
    value: roleLabel.value,
    icon: "i-lucide-shield-check",
  },
  {
    label: String(translateText("Access Scope")),
    value: accessScope.value,
    icon: "i-lucide-building-2",
  },
  {
    label: String(translateText("Created")),
    value: formatProfileDate(props.user?.created_at ?? null),
    icon: "i-lucide-calendar-plus",
  },
  {
    label: String(translateText("Updated")),
    value: formatProfileDate(props.user?.updated_at ?? null),
    icon: "i-lucide-calendar-clock",
  },
]);
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('text.userProfile')"
    :description="String(translateText('Review account details and dashboard access.'))"
    :ui="{ content: 'max-w-2xl rounded-md admin-profile-modal' }"
  >
    <template #body>
      <div class="admin-profile">
        <section class="admin-profile-hero">
          <span class="admin-profile-avatar">
            <UIcon name="i-lucide-user-round" />
          </span>
          <div class="admin-profile-identity">
            <h3>{{ user?.name || translateText("Not available") }}</h3>
            <p>{{ user?.email || translateText("Not available") }}</p>
          </div>
          <div class="admin-profile-badges">
            <span class="admin-profile-badge">
              {{ translateText(roleLabel) }}
            </span>
            <span
              class="admin-profile-badge"
              :class="{ 'is-warning': user?.status === 'Inactive' }"
            >
              {{ translateText(user?.status || "Not available") }}
            </span>
          </div>
        </section>

        <section class="admin-profile-section">
          <div class="admin-profile-section-header">
            <span class="admin-profile-section-icon">
              <UIcon name="i-lucide-clipboard-list" />
            </span>
            <div>
              <h3>{{ translateText("Profile details") }}</h3>
              <p>{{ translateText("Read-only account information for this dashboard user.") }}</p>
            </div>
          </div>

          <dl class="admin-profile-grid">
            <div
              v-for="item in profileItems"
              :key="item.label"
              class="admin-profile-detail"
            >
              <dt>
                <UIcon :name="item.icon" />
                {{ item.label }}
              </dt>
              <dd>{{ translateText(item.value) }}</dd>
            </div>
          </dl>
        </section>

        <section class="admin-profile-section">
          <div class="admin-profile-section-header">
            <span class="admin-profile-section-icon">
              <UIcon name="i-lucide-badge-check" />
            </span>
            <div>
              <h3>{{ translateText("Verification") }}</h3>
              <p>{{ translateText("Email verification and account lifecycle timestamps.") }}</p>
            </div>
          </div>

          <dl class="admin-profile-grid">
            <div class="admin-profile-detail">
              <dt>
                <UIcon name="i-lucide-mail-check" />
                {{ translateText("Email verified") }}
              </dt>
              <dd>{{ formatProfileDate(user?.email_verified_at ?? null) }}</dd>
            </div>
            <div class="admin-profile-detail">
              <dt>
                <UIcon name="i-lucide-activity" />
                {{ t("text.status") }}
              </dt>
              <dd>{{ translateText(user?.status || "Not available") }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="admin-profile-modal-footer">
        <AppButton action="cancel" :label="String(translateText('Close'))" @click="close" />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.admin-profile {
  display: grid;
  gap: 16px;
}

.admin-profile-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--app-surface);
}

.admin-profile-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface-soft);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.admin-profile-identity {
  min-width: 0;
}

.admin-profile-identity h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.admin-profile-identity p {
  margin: 4px 0 0;
  color: var(--app-muted);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.admin-profile-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.admin-profile-badge {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: 999px;
  padding: 3px 10px;
  background: color-mix(in srgb, var(--app-success) 12%, transparent);
  color: var(--app-success);
  font-size: 0.76rem;
  font-weight: 800;
}

.admin-profile-badge.is-warning {
  background: color-mix(in srgb, var(--app-warning) 15%, transparent);
  color: var(--app-warning);
}

.admin-profile-section {
  display: grid;
  gap: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--app-surface-soft) 58%, transparent);
}

.admin-profile-section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.admin-profile-section-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.admin-profile-section-header h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.25;
}

.admin-profile-section-header p {
  margin: 3px 0 0;
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.admin-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.admin-profile-detail {
  min-width: 0;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-surface);
}

.admin-profile-detail dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-muted);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.3;
}

.admin-profile-detail dd {
  margin: 7px 0 0;
  color: var(--app-heading);
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.admin-profile-modal-footer {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

:global(.admin-profile-modal [data-slot="body"]) {
  background: var(--app-bg);
}

:global(.admin-profile-modal [data-slot="header"]),
:global(.admin-profile-modal [data-slot="footer"]) {
  background: var(--app-surface);
}

@media (max-width: 640px) {
  .admin-profile-hero {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .admin-profile-badges {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .admin-profile-grid {
    grid-template-columns: 1fr;
  }

  .admin-profile-modal-footer :deep(.app-button) {
    width: 100%;
  }
}
</style>
