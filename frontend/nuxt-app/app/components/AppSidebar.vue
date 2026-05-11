<script setup lang="ts">
import AppSidebarHeader from "~/components/sidebar/AppSidebarHeader.vue";
import AppSidebarNavigation from "~/components/sidebar/AppSidebarNavigation.vue";
import AppSidebarUserMenu from "~/components/sidebar/AppSidebarUserMenu.vue";

const auth = useAuthStore();
const { navigationGroups } = useSidebarNavigation();
const sidebarOpen = ref(true);
</script>

<template>
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
      footer: 'px-4 py-4 border-t border-slate-200',
    }"
  >
    <template #header="{ state }">
      <AppSidebarHeader
        v-model:open="sidebarOpen"
        :collapsed="state === 'collapsed'"
        :dashboard-path="auth.roleDashboardPath"
      />
    </template>

    <template #default="{ state }">
      <AppSidebarNavigation
        :collapsed="state === 'collapsed'"
        :groups="navigationGroups"
      />
    </template>

    <template #footer="{ state }">
      <AppSidebarUserMenu :collapsed="state === 'collapsed'" />
    </template>
  </USidebar>
</template>

<style scoped>
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
</style>
