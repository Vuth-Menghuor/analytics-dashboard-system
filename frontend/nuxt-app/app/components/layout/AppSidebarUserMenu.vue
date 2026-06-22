<script setup lang="ts">
import { useAccountDisplay } from "~/composables/account/useAccountDisplay";
import { useAccountMenu } from "~/composables/account/useAccountMenu";

defineProps<{
  collapsed: boolean;
}>();

const { avatarSrc, displayEmail, displayName, userInitial } =
  useAccountDisplay();
const { accountMenuUi, userMenuItems } = useAccountMenu();
</script>

<template>
  <UDropdownMenu
    :items="userMenuItems"
    :modal="false"
    :content="{ align: 'start', collisionPadding: 12, sideOffset: 10 }"
    :ui="accountMenuUi"
  >
    <template #content-top>
      <div class="sidebar-user-menu-header">
        <span class="sidebar-user-menu-avatar-wrap">
          <UAvatar
            :src="avatarSrc"
            :text="userInitial"
            :alt="displayName"
            class="sidebar-user-menu-avatar"
          />
          <span class="sidebar-user-menu-status" aria-hidden="true" />
        </span>

        <span class="sidebar-user-menu-account">
          <span class="sidebar-user-menu-name">{{ displayName }}</span>
          <span class="sidebar-user-menu-email">{{ displayEmail }}</span>
        </span>
      </div>
    </template>

    <UButton
      color="neutral"
      variant="ghost"
      block
      class="sidebar-user-button"
      :class="{ collapsed }"
      :aria-label="collapsed ? displayName : undefined"
    >
      <UAvatar
        :src="avatarSrc"
        :text="userInitial"
        :alt="displayName"
        class="sidebar-user-avatar"
      />

      <span v-if="!collapsed" class="sidebar-user-details">
        <span class="sidebar-user-name-row">
          <span class="sidebar-user-name">{{ displayName }}</span>
        </span>
        <span class="sidebar-user-email">{{ displayEmail }}</span>
      </span>

      <UIcon
        v-if="!collapsed"
        class="sidebar-user-chevron"
        name="i-lucide-chevron-right"
      />
    </UButton>
  </UDropdownMenu>
</template>

<style scoped>
.sidebar-user-button {
  width: 100%;
  min-width: 0;
  min-height: 52px;
  justify-content: flex-start;
  gap: 10px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 10px 8px;
  background: var(--app-surface);
  color: var(--app-text);
}

.sidebar-user-button:hover,
.sidebar-user-button:focus-visible {
  border-color: var(--app-border);
  background: var(--app-surface-soft);
}

.sidebar-user-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--app-surface);
  border-radius: 999px;
  box-shadow: 0 8px 18px
    color-mix(in srgb, var(--app-text) 12%, transparent);
  color: var(--app-on-primary);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
}

.sidebar-user-details {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
  text-align: left;
}

.sidebar-user-name-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
}

.sidebar-user-name {
  min-width: 0;
  overflow: hidden;
  color: var(--app-heading);
  font-size: 0.9rem;
  font-weight: 750;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-email {
  min-width: 0;
  overflow: hidden;
  color: var(--app-muted);
  font-size: 0.74rem;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-chevron {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  color: var(--app-muted);
}

.sidebar-user-button.collapsed {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
}

.sidebar-user-button.collapsed .sidebar-user-avatar {
  width: 34px;
  height: 34px;
  flex-basis: 34px;
  font-size: 0.85rem;
}

.sidebar-user-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--app-border);
}

.sidebar-user-menu-avatar-wrap {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.sidebar-user-menu-avatar {
  width: 36px;
  height: 36px;
}

.sidebar-user-menu-status {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--app-surface);
  border-radius: 999px;
  background: var(--app-success);
}

.sidebar-user-menu-account {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.sidebar-user-menu-name,
.sidebar-user-menu-email {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-menu-name {
  color: var(--app-heading);
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.25;
}

.sidebar-user-menu-email {
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.2;
}
</style>
