<script setup lang="ts">
import type { SidebarNavigationGroup } from "~/composables/sidebar/useSidebarNavigation";
import { useSidebarNavigationState } from "~/composables/sidebar/useSidebarNavigationState";

const props = defineProps<{
  collapsed: boolean;
  groups: SidebarNavigationGroup[];
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const { isItemOpen, onNavigationClick, toggleItem } =
  useSidebarNavigationState(toRef(props, "groups"), () => emit("navigate"));
</script>

<template>
  <div
    class="sidebar-sections scrollbar-hidden"
    :class="{ collapsed }"
    @click.capture="onNavigationClick"
  >
    <section v-for="group in groups" :key="group.label" class="sidebar-section">
      <p v-if="!collapsed" class="sidebar-section-label">
        {{ group.label }}
      </p>
      <nav v-if="!collapsed" class="sidebar-nav" :aria-label="group.label">
        <ul class="sidebar-nav-list">
          <li
            v-for="item in group.items"
            :key="item.label"
            class="sidebar-nav-item"
          >
            <button
              v-if="item.children?.length"
              type="button"
              class="sidebar-nav-link sidebar-nav-parent"
              :class="{
                active: item.active,
                open: isItemOpen(group.label, item),
              }"
              :aria-expanded="isItemOpen(group.label, item)"
              @click="toggleItem(group.label, item)"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="sidebar-nav-icon"
              />
              <span class="sidebar-nav-label">{{ item.label }}</span>
              <UIcon name="i-lucide-chevron-up" class="sidebar-nav-chevron" />
            </button>

            <NuxtLink
              v-else
              class="sidebar-nav-link"
              :class="{ active: item.active }"
              :to="item.to"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="sidebar-nav-icon"
              />
              <span class="sidebar-nav-label">{{ item.label }}</span>
            </NuxtLink>

            <ul
              v-if="item.children?.length && isItemOpen(group.label, item)"
              class="sidebar-subnav-list"
            >
              <li
                v-for="child in item.children"
                :key="child.label"
                class="sidebar-subnav-item"
              >
                <NuxtLink
                  class="sidebar-subnav-link"
                  :class="{ active: child.active }"
                  :to="child.to"
                >
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
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

.sidebar-nav-list,
.sidebar-subnav-list {
  display: grid;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar-nav-list {
  gap: 2px;
}

.sidebar-nav-item {
  min-width: 0;
}

.sidebar-nav-link {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  background: transparent;
  color: #0f172a;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.sidebar-nav-link:hover {
  background: #eef2ff;
  color: #4338ca;
}

.sidebar-nav-link.active,
.sidebar-nav-parent.open {
  background: #dedcff;
  color: #1f2937;
}

.sidebar-nav-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.sidebar-nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav-chevron {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  margin-left: auto;
  transition: transform 0.18s ease;
}

.sidebar-nav-parent:not(.open) .sidebar-nav-chevron {
  transform: rotate(180deg);
}

.sidebar-subnav-list {
  gap: 1px;
  padding: 6px 0 4px 32px;
}

.sidebar-subnav-link {
  display: flex;
  min-height: 34px;
  align-items: center;
  border-radius: 6px;
  padding: 7px 12px;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.sidebar-subnav-link:hover,
.sidebar-subnav-link.active {
  background: #f1f5f9;
  color: #4338ca;
}
</style>
