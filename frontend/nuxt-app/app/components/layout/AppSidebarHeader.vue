<script setup lang="ts">
const props = defineProps<{
  collapsed: boolean;
  dashboardPath: string;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const { t } = useI18n();

const toggleIcon = computed(() =>
  props.open ? "i-lucide-panel-left-close" : "i-lucide-panel-left-open",
);

const toggleLabel = computed(() =>
  props.open ? t("text.collapseSidebar") : t("text.expandSidebar"),
);
</script>

<template>
  <div class="sidebar-header" :class="{ collapsed }">
    <NuxtLink v-if="!collapsed" class="sidebar-brand" :to="dashboardPath">
      <img class="sidebar-brand-image" src="/ccun-logo.png" alt="" />
      <span class="sidebar-brand-copy">
        <strong class="font-helvetica">CCUN Insights</strong>
      </span>
    </NuxtLink>

    <UButton
      color="neutral"
      :variant="open ? 'outline' : 'ghost'"
      size="sm"
      square
      class="sidebar-toggle"
      :class="{ active: !open }"
      :icon="toggleIcon"
      :aria-label="toggleLabel"
      @click="emit('update:open', !open)"
    />
  </div>
</template>

<style scoped>
.sidebar-header {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-header.collapsed {
  width: 64px;
  min-height: 40px;
  justify-content: center;
}

.sidebar-brand {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 8px;
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
  color: var(--app-heading);
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
  color: var(--app-text);
  box-shadow: none;
  --tw-ring-shadow: 0 0 #0000;
  --tw-ring-offset-shadow: 0 0 #0000;
}

.sidebar-toggle :deep([data-slot="leadingIcon"]) {
  margin: 0;
}

.sidebar-toggle:hover {
  background: var(--app-surface-soft);
}

.sidebar-toggle.active {
  background: var(--app-primary-soft);
  color: var(--app-primary);
}
</style>
