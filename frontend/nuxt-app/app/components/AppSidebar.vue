<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const auth = useAuthStore();
const { navItems } = useDashboardData();
const sidebarOpen = ref(true);

const iconMap: Record<string, string> = {
  ChartNoAxesCombined: "i-lucide-chart-no-axes-combined",
  FileBarChart: "i-lucide-file-bar-chart",
  LayoutDashboard: "i-lucide-layout-dashboard",
  Settings: "i-lucide-settings",
  UserCircle: "i-lucide-circle-user-round",
  Users: "i-lucide-users",
};

const navigationItems = computed<NavigationMenuItem[]>(() =>
  navItems
    .filter((item) => auth.user && item.roles.includes(auth.user.role))
    .map((item) => {
      const path = item.path === "/" ? auth.roleDashboardPath : item.path;

      return {
        label: item.label,
        icon: iconMap[item.icon] ?? "i-lucide-circle",
        to: path,
        active: route.path === path,
        tooltip: { text: item.label },
      };
    }),
);

const navigationGroups = computed(() =>
  [
    {
      label: "Manage",
      items: navigationItems.value.filter((item) =>
        ["Dashboard", "Analytics", "Reports"].includes(item.label || ""),
      ),
    },
    {
      label: "Manage Accounts",
      items: navigationItems.value.filter((item) =>
        ["User Profile", "User Management"].includes(item.label || ""),
      ),
    },
    {
      label: "System",
      items: navigationItems.value.filter((item) =>
        ["Settings"].includes(item.label || ""),
      ),
    },
    {
      label: "Tools",
      items: [
        {
          label: "Data Display",
          icon: "i-lucide-list-tree",
          to: "/reports",
          active: route.path === "/reports",
          tooltip: { text: "Data Display" },
        },
        {
          label: "Feedback",
          icon: "i-lucide-message-circle",
          to: "/reports",
          active: false,
          tooltip: { text: "Feedback" },
        },
        {
          label: "Inputs",
          icon: "i-lucide-panels-left-bottom",
          to: "/settings",
          active: false,
          tooltip: { text: "Inputs" },
        },
        {
          label: "Navigation",
          icon: "i-lucide-link",
          to: "/settings",
          active: false,
          tooltip: { text: "Navigation" },
        },
        {
          label: "Surface",
          icon: "i-lucide-rectangle-horizontal",
          to: "/settings",
          active: false,
          tooltip: { text: "Surface" },
        },
        {
          label: "Utils",
          icon: "i-lucide-pencil-ruler",
          to: "/settings",
          active: false,
          tooltip: { text: "Utils" },
        },
      ],
    },
    {
      label: "Plugins",
      items: [
        {
          label: "Color Picker",
          icon: "i-lucide-paint-bucket",
          to: "/settings",
          active: false,
          tooltip: { text: "Color Picker" },
        },
        {
          label: "Calendar",
          icon: "i-lucide-calendar-days",
          to: "/settings",
          active: false,
          tooltip: { text: "Calendar" },
        },
        {
          label: "Dropzone",
          icon: "i-lucide-upload",
          to: "/reports",
          active: false,
          tooltip: { text: "Dropzone" },
        },
      ],
    },
  ].filter((group) => group.items.length),
);

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      to: "/profile",
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  ],
]);

async function handleLogout() {
  await auth.logout();
  await navigateTo("/login");
}
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
      body: 'app-sidebar-body px-0 py-3',
      footer: 'px-4 py-4 border-t border-slate-200',
    }"
  >
    <template #header="{ state }">
      <div class="sidebar-header" :class="{ collapsed: state === 'collapsed' }">
        <NuxtLink
          v-if="state === 'expanded'"
          class="sidebar-brand"
          :to="auth.roleDashboardPath"
        >
          <img
            class="sidebar-brand-image"
            src="/ccun-logo.png"
            alt=""
          >
          <span class="sidebar-brand-copy">
            <strong class="font-helvetica">CCUN Insights</strong>
          </span>
        </NuxtLink>

        <UButton
          color="neutral"
          :variant="sidebarOpen ? 'outline' : 'ghost'"
          size="sm"
          square
          class="sidebar-toggle"
          :class="{ active: !sidebarOpen }"
          :icon="
            sidebarOpen
              ? 'i-lucide-panel-left-close'
              : 'i-lucide-panel-left-open'
          "
          :aria-label="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>
    </template>

    <template #default="{ state }">
      <div
        class="sidebar-sections"
        :class="{ collapsed: state === 'collapsed' }"
      >
        <section
          v-for="group in navigationGroups"
          :key="group.label"
          class="sidebar-section"
        >
          <p v-if="state === 'expanded'" class="sidebar-section-label">
            {{ group.label }}
          </p>
          <UNavigationMenu
            v-if="state === 'expanded'"
            :items="group.items"
            orientation="vertical"
            tooltip
            color="neutral"
            variant="pill"
            :ui="{
              list: 'gap-1',
              link: 'min-h-10 rounded-md px-2.5 py-2 text-sm font-medium text-slate-950 hover:bg-indigo-50 data-[active=true]:bg-indigo-100 data-[active=true]:text-indigo-700',
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

    <template #footer="{ state }">
      <UDropdownMenu
        v-if="state === 'expanded'"
        :items="userMenuItems"
        :content="{ align: 'start', collisionPadding: 12 }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          block
          class="justify-start overflow-hidden"
          trailing-icon="i-lucide-chevrons-up-down"
          :avatar="{ text: auth.user?.name?.charAt(0) || 'A' }"
          :label="state === 'expanded' ? auth.user?.name : undefined"
          :ui="{ trailingIcon: 'ms-auto text-slate-400' }"
        />
      </UDropdownMenu>
    </template>
  </USidebar>
</template>

<style scoped>
.app-sidebar {
  min-height: 100vh;
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

.sidebar-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.sidebar-header.collapsed {
  display: flex;
  width: 64px;
  justify-content: center;
  min-height: 40px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.sidebar-brand-image {
  display: block;
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.sidebar-brand-copy {
  min-width: 0;
}

.sidebar-brand-copy strong {
  display: block;
  color: #111827;
  font-size: 1.15rem;
  font-weight: 900;
  line-height: 1;
}

.sidebar-toggle {
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #0f172a;
  box-shadow: none;
  --tw-ring-shadow: 0 0 #0000;
  --tw-ring-offset-shadow: 0 0 #0000;
}

.sidebar-toggle :deep([data-slot="leadingIcon"]) {
  margin: 0;
}

.sidebar-toggle:hover {
  background: #f1f5f9;
}

.sidebar-toggle.active {
  background: #e8e5ff;
  color: #3730a3;
}

.sidebar-sections {
  display: grid;
  gap: 16px;
  padding: 0 16px;
}

.sidebar-sections.collapsed {
  justify-items: stretch;
  gap: 18px;
  width: 64px;
  padding: 0;
}

.sidebar-section {
  display: grid;
  position: relative;
  gap: 6px;
  width: 100%;
}

.sidebar-section + .sidebar-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
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
  justify-items: center;
  gap: 14px;
  width: 64px;
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

@media (max-width: 1080px) {
  .app-sidebar {
    min-height: auto;
  }
}
</style>
