<script setup lang="ts">
import AppSidebarHeader from "~/components/sidebar/AppSidebarHeader.vue";
import AppSidebarNavigation from "~/components/sidebar/AppSidebarNavigation.vue";
import AppSidebarUserMenu from "~/components/sidebar/AppSidebarUserMenu.vue";
import { useDashboardSidebar } from "~/composables/dashboard/useDashboardSidebar";

const {
  closeMobileSidebar,
  mobileSidebarIcon,
  mobileSidebarLabel,
  navigationGroups,
  roleDashboardPath,
  sidebarOpen,
  toggleSidebar,
} = useDashboardSidebar();
</script>

<template>
  <div class="app-sidebar-shell">
    <UButton
      color="neutral"
      variant="solid"
      size="sm"
      square
      class="mobile-sidebar-rail-toggle"
      :class="{ open: sidebarOpen }"
      :icon="mobileSidebarIcon"
      :aria-label="mobileSidebarLabel"
      @click="toggleSidebar"
    />

    <USidebar
      v-model:open="sidebarOpen"
      collapsible="icon"
      class="app-sidebar"
      :class="{ 'is-collapsed': !sidebarOpen }"
      :ui="{
        root: 'bg-white border-r border-slate-200 shadow-none',
        header: sidebarOpen
          ? 'px-4 py-4 border-b border-slate-200'
          : 'w-16 justify-center px-0 py-4 border-b border-slate-200',
        body: 'app-sidebar-body scrollbar-hidden px-0 py-3',
        footer: 'px-2 py-4',
      }"
    >
      <template #header="{ state }">
        <AppSidebarHeader
          v-model:open="sidebarOpen"
          :collapsed="state === 'collapsed'"
          :dashboard-path="roleDashboardPath"
        />
      </template>

      <template #default="{ state }">
        <AppSidebarNavigation
          :collapsed="state === 'collapsed'"
          :groups="navigationGroups"
          @navigate="closeMobileSidebar"
        />
      </template>

      <template #footer="{ state }">
        <AppSidebarUserMenu :collapsed="state === 'collapsed'" />
      </template>
    </USidebar>
  </div>
</template>

<style scoped>
.app-sidebar-shell {
  display: contents;
}

.app-sidebar {
  height: 100vh;
  min-height: 100vh;
}

.app-sidebar :deep([data-slot="inner"]) {
  background: #0288c6;
}

.app-sidebar.is-collapsed {
  width: 64px !important;
  min-width: 64px !important;
  max-width: 64px !important;
}

.app-sidebar.is-collapsed :deep([data-slot="header"]),
.app-sidebar.is-collapsed :deep([data-slot="body"]),
.app-sidebar.is-collapsed :deep([data-slot="footer"]) {
  width: 64px;
  padding-right: 0;
  padding-left: 0;
}

.app-sidebar.is-collapsed :deep([data-slot="header"]) {
  justify-content: center;
}

.app-sidebar :deep([data-slot="body"]) {
  min-height: 0;
}

.app-sidebar :deep([data-slot="footer"]) {
  flex-shrink: 0;
}

.app-sidebar.is-collapsed :deep([data-slot="body"]) {
  overflow: hidden !important;
}

.app-sidebar.is-collapsed :deep([data-slot="footer"]) {
  justify-content: center;
}

@media (max-width: 1080px) {
  .app-sidebar {
    min-height: auto;
  }
}

.mobile-sidebar-rail-toggle {
  position: fixed;
  top: 82px;
  left: 0;
  z-index: 70;
  display: none;
  width: 36px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 0 10px 10px 0;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

.mobile-sidebar-rail-toggle.open {
  left: min(calc(100vw - 40px), 256px);
  border-radius: 10px 0 0 10px;
}

@media (max-width: 1023px) {
  .mobile-sidebar-rail-toggle {
    display: inline-flex;
  }
}

@media (max-width: 420px) {
  .mobile-sidebar-rail-toggle.open {
    left: calc(100vw - 40px);
  }
}
</style>
