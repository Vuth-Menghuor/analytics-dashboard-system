<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import { useProfilePage } from "~/composables/profile/useProfilePage";

const { avatarInitial, handleLogout, infoItems, profile, securityItems } =
  useProfilePage();
const { translateText } = useTranslateText();
const { t } = useI18n();
</script>

<template>
  <div v-if="profile" class="profile-page">
    <PageHeader
      eyebrow="Account"
      title="User Profile"
      copy="Manage your account information and security settings."
    />

    <div class="profile-stack">
      <!-- Hero Card -->
      <UCard class="hero-card" :ui="{ body: 'p-0' }">
        <div class="hero-cover" aria-hidden="true" />

        <div class="hero-body">
          <div class="hero-identity">
            <UAvatar
              :text="avatarInitial"
              size="3xl"
              class="hero-avatar"
              aria-hidden="true"
            />
            <div class="hero-meta">
              <div class="hero-name-row">
                <h2 class="hero-name">{{ profile.name }}</h2>
                <UBadge color="primary" variant="soft" size="sm">
                  {{ translateText(profile.role ?? "User") }}
                </UBadge>
              </div>
              <p class="hero-email">{{ profile.email }}</p>
            </div>
          </div>

          <div class="hero-actions">
            <AppButton
              action="logout"
              :label="t('common.logout')"
              @click="handleLogout"
            />
          </div>
        </div>
      </UCard>

      <!-- Detail Grid -->
      <div class="detail-grid">
        <!-- Account Info -->
        <UCard>
          <template #header>
            <CardHeader
              :title="t('text.accountInformation')"
              :description="t('text.basicAccountDetails')"
            />
          </template>

          <ul class="info-list" role="list">
            <li v-for="item in infoItems" :key="item.label" class="info-item">
              <div class="info-icon" aria-hidden="true">
                <UIcon :name="item.icon" />
              </div>
              <div class="info-text">
                <span class="info-label">{{ translateText(item.label) }}</span>
                <strong class="info-value">{{ translateText(item.value) }}</strong>
              </div>
            </li>
          </ul>
        </UCard>

        <!-- Security -->
        <UCard>
          <template #header>
            <CardHeader
              :title="t('text.security')"
              :description="translateText('Keep your account safe and protected.')"
            />
          </template>

          <ul class="security-list" role="list">
            <li
              v-for="item in securityItems"
              :key="item.title"
              class="security-item"
            >
              <div class="security-text">
                <strong>{{ translateText(item.title) }}</strong>
                <span>{{ translateText(item.description) }}</span>
              </div>
              <AppButton
                action="logout"
                :color="item.color"
                :label="String(translateText(item.actionLabel))"
                @click="item.action === 'logout' ? handleLogout() : undefined"
              />
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page Layout ── */
.profile-page {
  container-type: inline-size;
}

.profile-stack {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

/* ── Hero Card ── */
.hero-card {
  overflow: hidden;
  border-radius: 1.25rem;
}

.hero-cover {
  height: 100px;
  background: linear-gradient(
    135deg,
    var(--app-primary-extra-soft) 0%,
    var(--app-surface-soft) 50%,
    color-mix(in srgb, var(--app-info) 12%, var(--app-surface)) 100%
  );
}

.hero-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
  margin-top: -2rem;
}

.hero-identity {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  min-width: 0;
}

.hero-avatar {
  flex-shrink: 0;
  border: 4px solid var(--app-surface);
  box-shadow: 0 4px 16px
    color-mix(in srgb, var(--app-text) 12%, transparent);
}

.hero-meta {
  min-width: 0;
  padding-bottom: 0.25rem;
}

.hero-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--app-text);
  line-height: 1.3;
}

.hero-email {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--app-muted);
  overflow-wrap: anywhere;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

/* ── Detail Grid ── */
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1.25rem;
}

/* ── Info List ── */
.info-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  border: 1px solid var(--app-border);
  border-radius: 0.875rem;
  background: var(--app-surface-soft);
}

.info-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--app-primary-extra-soft);
  color: var(--app-primary);
  font-size: 1.1rem;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--app-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--app-text);
  overflow-wrap: anywhere;
}

/* ── Security List ── */
.security-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem;
  border: 1px solid var(--app-border);
  border-radius: 0.875rem;
  background: var(--app-surface-soft);
}

.security-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.security-text strong {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--app-text);
}

.security-text span {
  font-size: 0.8125rem;
  color: var(--app-muted);
  line-height: 1.4;
}

/* ── Responsive ── */
@container (max-width: 700px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@container (max-width: 500px) {
  .hero-body {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-identity {
    align-items: center;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions :deep(button) {
    flex: 1;
    justify-content: center;
  }

  .security-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
