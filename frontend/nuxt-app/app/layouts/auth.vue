<script setup lang="ts">
import LanguageSwitcher from "~/components/common/LanguageSwitcher.vue";
import ThemeToggle from "~/components/common/ThemeToggle.vue";
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout-controls" aria-label="Authentication preferences">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  background: var(--app-bg);
}

.auth-layout-controls {
  position: fixed;
  top: 22px;
  left: 22px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-layout-controls :deep(.topbar-language-control),
.auth-layout-controls :deep(.topbar-icon-button) {
  height: 38px;
  border-color: var(--app-border);
  border-radius: 8px;
  background: var(--app-surface) !important;
  color: var(--app-text);
  box-shadow: none !important;
}

.auth-layout-controls :deep(.topbar-icon-button) {
  width: 38px;
  justify-content: center;
  border: 1px solid var(--app-border);
  padding: 0;
}

@media (max-width: 920px) {
  .auth-layout-controls {
    position: absolute;
    top: 18px;
    left: 18px;
  }
}

@media (max-width: 640px) {
  .auth-layout-controls {
    position: static;
    justify-content: flex-end;
    padding: 12px 14px 0;
    background: var(--app-bg);
  }
}
</style>
