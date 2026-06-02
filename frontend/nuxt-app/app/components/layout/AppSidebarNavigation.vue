<script setup lang="ts">
import type { SidebarNavigationGroup } from "~/composables/layout/useSidebarNavigation";
import { useSidebarNavigationState } from "~/composables/layout/useSidebarNavigationState";

const props = defineProps<{
  collapsed: boolean;
  groups: SidebarNavigationGroup[];
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const { t } = useI18n();

const navigationLabelKeys: Record<string, string> = {
  Admin: "navigation.admin",
  Administration: "navigation.administration",
  Analytics: "navigation.analytics",
  Courses: "navigation.courses",
  Dashboard: "navigation.dashboard",
  "Learning Analytics": "navigation.learningAnalytics",
  "Learning Performance": "navigation.learningPerformance",
  Main: "navigation.main",
  Permissions: "navigation.permissions",
  "Partner Requests": "navigation.partnerRequests",
  Profile: "navigation.profile",
  Reports: "navigation.reports",
  Roles: "navigation.roles",
  Settings: "navigation.settings",
  Students: "navigation.students",
  Users: "navigation.users",
  "User Activity": "navigation.userActivity",
};

const getNavigationLabel = (label: string) => {
  const key = navigationLabelKeys[label];

  return key ? t(key) : label;
};

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
        {{ getNavigationLabel(group.label) }}
      </p>
      <nav
        v-if="!collapsed"
        class="sidebar-nav"
        :aria-label="getNavigationLabel(group.label)"
      >
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
              <span class="sidebar-nav-label">
                {{ getNavigationLabel(item.label) }}
              </span>
              <UIcon
                name="i-lucide-chevron-up"
                class="sidebar-nav-chevron"
              />
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
              <span class="sidebar-nav-label">
                {{ getNavigationLabel(item.label) }}
              </span>
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
                  {{ getNavigationLabel(child.label) }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <nav
        v-else
        class="collapsed-nav"
        :aria-label="getNavigationLabel(group.label)"
      >
        <UTooltip
          v-for="item in group.items"
          :key="item.label"
          :text="getNavigationLabel(item.label)"
          :content="{ side: 'right' }"
        >
          <NuxtLink
            class="collapsed-nav-link"
            :class="{ active: item.active }"
            :to="item.to"
            :aria-label="getNavigationLabel(item.label)"
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
  border-top: 1px solid var(--app-border);
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
  background: var(--app-border);
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
  color: var(--app-text);
  font-size: 1rem;
}

.collapsed-nav-link.active {
  background: var(--app-primary-soft);
  color: var(--app-primary);
}

.collapsed-nav-link:hover {
  background: var(--app-surface-soft);
}

.sidebar-section-label {
  margin: 0;
  color: var(--app-muted);
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
  color: var(--app-text);
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
  background: var(--app-primary-soft);
  color: var(--app-primary);
}

.sidebar-nav-link.active,
.sidebar-nav-parent.open {
  background: var(--app-primary-soft);
  color: var(--app-primary);
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
  color: var(--app-text);
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
  background: var(--app-primary-soft);
  color: var(--app-primary);
}
</style>
