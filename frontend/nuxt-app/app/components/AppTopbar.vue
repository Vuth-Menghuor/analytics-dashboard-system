<script setup lang="ts">
const auth = useAuthStore();
const searchQuery = ref("");
const { userMenuItems } = useUserMenuItems();
</script>

<template>
  <header class="topbar">
    <UInput
      v-model="searchQuery"
      aria-label="Search dashboard"
      class="topbar-search"
      icon="i-lucide-search"
      placeholder="Search analytics, users, reports"
      size="lg"
      variant="outline"
    />

    <div class="toolbar">
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="outline"
        aria-label="Notifications"
      />

      <UDropdownMenu
        v-if="auth.user"
        :items="userMenuItems"
        :content="{ align: 'end', collisionPadding: 12 }"
      >
        <UButton
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevrons-up-down"
          :avatar="{ text: auth.user.name.charAt(0) }"
          :label="auth.user.name"
          :ui="{ trailingIcon: 'text-slate-400' }"
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
  gap: 16px;
  margin-bottom: 28px;
}

.topbar-search {
  width: min(520px, 100%);
}

@media (max-width: 680px) {
  .topbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
