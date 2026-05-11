<script setup lang="ts">
defineProps<{
  collapsed: boolean;
}>();

const auth = useAuthStore();
const { userMenuItems } = useUserMenuItems();
</script>

<template>
  <UDropdownMenu
    :items="userMenuItems"
    :content="{ align: 'start', collisionPadding: 12 }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      class="sidebar-user-button justify-start overflow-hidden"
      :class="{ collapsed }"
      trailing-icon="i-lucide-chevrons-up-down"
      :avatar="{ text: auth.user?.name?.charAt(0) || 'A' }"
      :label="collapsed ? undefined : auth.user?.name"
      :ui="{ trailingIcon: 'ms-auto text-slate-400' }"
    />
  </UDropdownMenu>
</template>

<style scoped>
.sidebar-user-button.collapsed {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
}

.sidebar-user-button.collapsed :deep([data-slot="trailingIcon"]) {
  display: none;
}
</style>
