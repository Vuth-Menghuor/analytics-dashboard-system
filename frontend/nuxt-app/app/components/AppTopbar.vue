<script setup lang="ts">
import { useAccountDisplay } from "~/composables/account/useAccountDisplay";
import { useAccountMenu } from "~/composables/account/useAccountMenu";

const auth = useAuthStore();
const searchQuery = ref("");
const { avatarSrc, displayEmail, displayName, userInitial } =
  useAccountDisplay();
const { accountMenuUi, userMenuItems } = useAccountMenu();
const pageTitle = usePageTitle();
</script>

<template>
  <header class="topbar">
    <h1 class="topbar-title">{{ pageTitle }}</h1>

    <div class="topbar-actions">
      <UInput
        v-model="searchQuery"
        aria-label="Search dashboard"
        class="topbar-search"
        icon="i-lucide-search"
        placeholder="Search..."
        size="md"
        variant="outline"
      />

      <UButton
        icon="i-lucide-sun"
        color="neutral"
        variant="ghost"
        aria-label="Theme"
        class="topbar-icon-button"
      />

      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        aria-label="Notifications"
        class="topbar-icon-button"
      />

      <UDropdownMenu
        v-if="auth.user"
        :items="userMenuItems"
        :content="{ align: 'end', collisionPadding: 12, sideOffset: 10 }"
        :ui="accountMenuUi"
      >
        <template #content-top>
          <div class="topbar-account-menu-header">
            <span class="topbar-account-menu-avatar-wrap">
              <UAvatar
                :src="avatarSrc"
                :text="userInitial"
                :alt="displayName"
                class="topbar-account-menu-avatar"
              />
              <span class="topbar-account-menu-status" aria-hidden="true" />
            </span>

            <span class="topbar-account-menu-details">
              <span class="topbar-account-menu-name">{{ displayName }}</span>
              <span class="topbar-account-menu-email">{{ displayEmail }}</span>
            </span>
          </div>
        </template>

        <UButton
          color="neutral"
          variant="ghost"
          aria-label="Account menu"
          class="topbar-account-button"
        >
          <UAvatar
            :src="avatarSrc"
            :text="userInitial"
            :alt="displayName"
            class="topbar-account-avatar"
          />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  gap: 20px;
  padding: 0 16px;
  margin: -28px -28px 28px;
  background: #ffffff;
  border-bottom: 1px solid #dbe3ec;
}

.topbar-title {
  flex: 0 1 auto;
  min-width: 0;
  margin: 0;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-actions {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
}

.topbar-search {
  width: clamp(220px, 20vw, 256px);
}

.topbar-icon-button,
.topbar-account-button {
  flex: 0 0 auto;
}

.topbar-account-button {
  width: 36px;
  height: 36px;
  justify-content: center;
  border-radius: 999px;
  padding: 0;
}

.topbar-account-avatar {
  width: 30px;
  height: 30px;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

.topbar-account-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.topbar-account-menu-avatar-wrap {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.topbar-account-menu-avatar {
  width: 36px;
  height: 36px;
}

.topbar-account-menu-status {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #22c55e;
}

.topbar-account-menu-details {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.topbar-account-menu-name,
.topbar-account-menu-email {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-account-menu-name {
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 750;
  line-height: 1.25;
}

.topbar-account-menu-email {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.2;
}

@media (max-width: 680px) {
  .topbar {
    min-height: auto;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .topbar-actions {
    width: 100%;
  }

  .topbar-search {
    flex: 1;
    width: auto;
  }
}
</style>
