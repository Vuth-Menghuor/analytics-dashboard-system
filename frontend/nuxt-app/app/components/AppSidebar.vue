<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const { navItems } = useDashboardData()

const visibleNavItems = computed(() =>
  navItems.filter((item) => auth.user && item.roles.includes(auth.user.role))
)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-mark">A</span>
      <div>
        <strong class="font-helvetica">Analytics</strong>
        <span>Dashboard System</span>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Main navigation">
      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
        :class="{ active: route.path === item.path }"
      >
        <IconByName :name="item.icon" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: grid;
  min-height: 100vh;
  align-content: start;
  gap: 28px;
  border-right: 1px solid #e1e7ef;
  background: #fff;
  padding: 24px 18px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 6px;
}

.sidebar-brand strong,
.sidebar-brand span {
  display: block;
}

.sidebar-brand span {
  color: #64748b;
  font-size: 0.84rem;
}

.sidebar-nav {
  display: grid;
  gap: 6px;
}

.sidebar-link {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 11px;
  border-radius: 8px;
  padding: 10px 12px;
  color: #526070;
  font-weight: 750;
}

.sidebar-link.active,
.sidebar-link:hover {
  background: #e8f1ff;
  color: #1d4ed8;
}

@media (max-width: 1080px) {
  .sidebar {
    position: static;
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid #e1e7ef;
  }

  .sidebar-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .sidebar-nav {
    grid-template-columns: 1fr;
  }
}
</style>
