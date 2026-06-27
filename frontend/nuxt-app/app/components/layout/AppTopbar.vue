<script setup lang="ts">
import LanguageSwitcher from "~/components/common/LanguageSwitcher.vue";
import ThemeToggle from "~/components/common/ThemeToggle.vue";
import { useAccountDisplay } from "~/composables/account/useAccountDisplay";
import { useAccountMenu } from "~/composables/account/useAccountMenu";

const auth = useAuthStore();
const { t } = useI18n();
const { avatarSrc, displayEmail, displayName, displayRole, userInitial } =
  useAccountDisplay();
const { accountMenuUi, userMenuItems } = useAccountMenu();
const pageTitle = usePageTitle();

const formattedRole = computed(() =>
  String(displayRole.value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()),
);

</script>

<template>
  <header class="topbar">
    <h1 class="topbar-title">{{ pageTitle }}</h1>

    <div class="topbar-actions">
      <LanguageSwitcher />

      <ThemeToggle />

      <UButton
        v-if="!auth.user"
        color="primary"
        variant="solid"
        size="sm"
        icon="i-lucide-log-in"
        class="topbar-login-button"
        :label="t('auth.login')"
        to="/login"
      />

      <UDropdownMenu
        v-if="auth.user"
        :items="userMenuItems"
        :modal="false"
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
          :aria-label="t('common.accountMenu')"
          class="topbar-account-button"
        >
          <UAvatar
            :src="avatarSrc"
            :text="userInitial"
            :alt="displayName"
            class="topbar-account-avatar"
          />
          <span class="topbar-account-copy">
            <strong>{{ displayName }}</strong>
            <small>{{ formattedRole }}</small>
          </span>
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  gap: 20px;
  padding: 0 16px;
  margin: -28px -28px 28px;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.topbar-title {
  flex: 0 1 auto;
  min-width: 0;
  margin: 0;
  color: var(--app-text);
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
  gap: 10px;
  min-width: 0;
}

.topbar-icon-button {
  flex: 0 0 auto;
}

.topbar-actions :deep(.topbar-icon-button) {
  width: 38px;
  height: 38px;
  justify-content: center;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 0;
  background: var(--app-surface);
}

.topbar-actions :deep(.topbar-language-control) {
  height: 38px;
  border-color: var(--app-border);
  border-radius: 8px;
}

.topbar-login-button {
  height: 38px;
  border: 1px solid var(--app-primary) !important;
  border-radius: 8px;
  background: var(--app-primary) !important;
  color: var(--app-on-primary) !important;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: none;
  --tw-ring-color: var(--app-primary);
}

.topbar-login-button:hover,
.topbar-login-button:active {
  border-color: var(--app-primary-hover) !important;
  background: var(--app-primary-hover) !important;
  color: var(--app-on-primary) !important;
}

.topbar-login-button:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
}

.topbar-login-button :deep([data-slot="leadingIcon"]),
.topbar-login-button :deep([data-slot="label"]) {
  color: currentColor !important;
}

.topbar-account-button {
  min-width: 0;
  min-height: 42px;
  justify-content: flex-start;
  gap: 8px;
  border: 0 !important;
  border-radius: 8px;
  padding: 3px 6px;
  background: transparent;
  box-shadow: none !important;
  --tw-ring-shadow: 0 0 transparent;
  --tw-ring-offset-shadow: 0 0 transparent;
}

.topbar-account-button:hover,
.topbar-account-button:active,
.topbar-account-button[data-state="open"] {
  background: transparent !important;
}

.topbar-account-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 1px solid var(--app-border);
  box-shadow: none;
}

.topbar-account-copy {
  display: grid;
  min-width: 0;
  gap: 1px;
  padding-right: 4px;
  text-align: left;
}

.topbar-account-copy strong,
.topbar-account-copy small {
  overflow: hidden;
  max-width: 130px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-account-copy strong {
  color: var(--app-heading);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.topbar-account-copy small {
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 400;
  line-height: 1.2;
}

.topbar-account-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--app-border);
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
  border: 2px solid var(--app-surface);
  border-radius: 999px;
  background: var(--app-success);
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
  color: var(--app-text);
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.25;
}

.topbar-account-menu-email {
  color: var(--app-muted);
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.2;
}

@media (max-width: 980px) {
  .topbar-account-copy {
    display: none;
  }
}

@media (max-width: 680px) {
  .topbar {
    min-height: auto;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    margin: -20px -20px 20px;
  }

  .topbar-actions {
    width: 100%;
  }

  .topbar-account-copy {
    display: none;
  }
}
</style>
