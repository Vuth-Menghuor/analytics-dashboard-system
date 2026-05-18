<script setup lang="ts">
import { useProfilePage } from "~/composables/profile/useProfilePage";

const { avatarInitial, handleLogout, infoItems, profile, securityItems } =
  useProfilePage();
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
                  {{ profile.role ?? "User" }}
                </UBadge>
              </div>
              <p class="hero-email">{{ profile.email }}</p>
            </div>
          </div>

          <div class="hero-actions">
            <UButton
              icon="i-lucide-lock"
              color="neutral"
              variant="soft"
              size="sm"
              label="Security"
            />
            <UButton
              icon="i-lucide-log-out"
              color="error"
              variant="solid"
              size="sm"
              label="Log out"
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
              title="Account Information"
              description="Basic details linked to your account."
            />
          </template>

          <ul class="info-list" role="list">
            <li v-for="item in infoItems" :key="item.label" class="info-item">
              <div class="info-icon" aria-hidden="true">
                <UIcon :name="item.icon" />
              </div>
              <div class="info-text">
                <span class="info-label">{{ item.label }}</span>
                <strong class="info-value">{{ item.value }}</strong>
              </div>
            </li>
          </ul>
        </UCard>

        <!-- Security -->
        <UCard>
          <template #header>
            <CardHeader
              title="Security"
              description="Keep your account safe and protected."
            />
          </template>

          <ul class="security-list" role="list">
            <li
              v-for="item in securityItems"
              :key="item.title"
              class="security-item"
            >
              <div class="security-text">
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </div>
              <UButton
                :color="item.color"
                variant="soft"
                size="xs"
                :label="item.actionLabel"
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
  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #e0f2fe 100%);
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
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
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
  color: #0f172a;
  line-height: 1.3;
}

.hero-email {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
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
  border: 1px solid #edf2f7;
  border-radius: 0.875rem;
  background: #f8fafc;
}

.info-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: #eef2ff;
  color: #4f46e5;
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
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
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
  border: 1px solid #edf2f7;
  border-radius: 0.875rem;
  background: #f8fafc;
}

.security-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.security-text strong {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
}

.security-text span {
  font-size: 0.8125rem;
  color: #64748b;
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
