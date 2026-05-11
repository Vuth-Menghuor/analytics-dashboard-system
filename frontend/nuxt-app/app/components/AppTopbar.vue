<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
const searchQuery = ref("");
const { userMenuItems } = useUserMenuItems();

const pageTitles: Record<string, string> = {
  "/analytics": "Analytics",
  "/manager/dashboard": "Manager Dashboard",
  "/partner/dashboard": "Partner Dashboard",
  "/profile": "Profile",
  "/reports": "Reports",
  "/settings": "Settings",
  "/users": "User Management",
  "/visitor/dashboard": "Visitor Dashboard",
};

const pageTitle = computed(() => pageTitles[route.path] ?? "Dashboard");
</script>

<template>
  <header class="topbar">
    <h1 class="topbar-title">{{ pageTitle }}</h1>

    <div class="topbar-actions">
      <UInput
        v-model="searchQuery"
        aria-label="Search dashboard"
        class="topbar-search"
        icon="i-lucide-search"
        placeholder="Search..."
        size="md"
        variant="outline"
      />

      <UButton
        icon="i-lucide-sun"
        color="neutral"
        variant="ghost"
        aria-label="Theme"
        class="topbar-icon-button"
      />

      <UDropdownMenu
        v-if="auth.user"
        :items="userMenuItems"
        :content="{ align: 'end', collisionPadding: 12 }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          :avatar="{ text: auth.user.name.charAt(0) }"
          :ui="{ leadingAvatar: 'size-7 text-xs' }"
          aria-label="Account menu"
          class="topbar-account-button"
        />
      </UDropdownMenu>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  gap: 20px;
  padding: 0 16px;
  margin: -28px -28px 28px;
  background: #ffffff;
  border-bottom: 1px solid #dbe3ec;
}

.topbar-title {
  min-width: 0;
  margin: 0;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
}

.topbar-search {
  width: clamp(220px, 20vw, 256px);
}

.topbar-icon-button,
.topbar-account-button {
  flex: 0 0 auto;
}

@media (max-width: 680px) {
  .topbar {
    min-height: auto;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .topbar-actions {
    width: 100%;
  }

  .topbar-search {
    flex: 1;
    width: auto;
  }
}
</style>
