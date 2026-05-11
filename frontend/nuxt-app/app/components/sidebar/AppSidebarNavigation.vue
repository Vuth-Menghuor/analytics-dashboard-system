<script setup lang="ts">
import type { SidebarNavigationGroup } from "~/composables/useSidebarNavigation";

defineProps<{
  collapsed: boolean;
  groups: SidebarNavigationGroup[];
}>();
</script>

<template>
  <div
    class="sidebar-sections scrollbar-hidden"
    :class="{ collapsed }"
  >
    <section
      v-for="group in groups"
      :key="group.label"
      class="sidebar-section"
    >
      <p v-if="!collapsed" class="sidebar-section-label">
        {{ group.label }}
      </p>
      <UNavigationMenu
        v-if="!collapsed"
        :items="group.items"
        orientation="vertical"
        tooltip
        color="neutral"
        variant="pill"
        :ui="{
          list: 'gap-0.5',
          link: 'min-h-9 rounded-md px-3 py-2 text-sm font-medium text-slate-950 hover:bg-indigo-50 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700',
          linkLeadingIcon:
            'size-4 text-slate-950 data-[active=true]:text-indigo-700',
        }"
      />
      <nav v-else class="collapsed-nav" :aria-label="group.label">
        <UTooltip
          v-for="item in group.items"
          :key="item.label"
          :text="item.label"
          :content="{ side: 'right' }"
        >
          <NuxtLink
            class="collapsed-nav-link"
            :class="{ active: item.active }"
            :to="item.to"
            :aria-label="item.label"
          >
            <UIcon :name="item.icon" />
          </NuxtLink>
        </UTooltip>
      </nav>
    </section>
  </div>
</template>

<style scoped>
.sidebar-sections {
  display: grid;
  gap: 12px;
  padding: 0 10px;
}

.sidebar-sections.collapsed {
  width: 64px;
  max-height: 100%;
  min-height: 0;
  justify-items: stretch;
  gap: 18px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 2px 0 0;
}

.sidebar-section {
  display: grid;
  position: relative;
  width: 100%;
  gap: 4px;
}

.sidebar-section + .sidebar-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

.sidebar-sections.collapsed .sidebar-section {
  justify-items: center;
}

.sidebar-sections.collapsed .sidebar-section + .sidebar-section {
  width: 64px;
  border-top: 0;
  padding-top: 14px;
}

.sidebar-sections.collapsed .sidebar-section + .sidebar-section::before {
  position: absolute;
  top: 0;
  left: 50%;
  width: 42px;
  height: 1px;
  background: #e5e7eb;
  content: "";
  transform: translateX(-50%);
}

.collapsed-nav {
  display: grid;
  width: 64px;
  justify-items: center;
  gap: 14px;
}

.collapsed-nav-link {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #0f172a;
  font-size: 1rem;
}

.collapsed-nav-link.active {
  background: #e8e5ff;
  color: #3730a3;
}

.collapsed-nav-link:hover {
  background: #f1f5f9;
}

.sidebar-section-label {
  margin: 0;
  color: #6b7280;
  font-size: 0.78rem;
  line-height: 1.2;
}
</style>
