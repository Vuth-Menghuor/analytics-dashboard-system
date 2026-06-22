<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const options = computed(() =>
  locales.value.map((item) => ({
    label: item.name || item.code,
    value: item.code,
  })),
);

const selectedLabel = computed(
  () =>
    options.value.find((option) => option.value === locale.value)?.label ||
    locale.value,
);

const menuItems = computed(() =>
  options.value.map((option) => ({
    label: option.label,
    icon:
      option.value === locale.value ? "i-lucide-check" : "i-lucide-languages",
    onSelect: () => setLocale(option.value),
  })),
);
</script>

<template>
  <UDropdownMenu
    :items="menuItems"
    :modal="false"
    :content="{ align: 'end', collisionPadding: 12, sideOffset: 8 }"
    :ui="{
      content: 'min-w-28',
      item: 'text-xs',
      itemLabel: 'text-xs',
      itemLeadingIcon: 'size-3.5',
    }"
  >
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      trailing-icon="i-lucide-chevron-down"
      :aria-label="$t('common.language')"
      class="topbar-language-control w-28 justify-between"
    >
      <span class="truncate">{{ selectedLabel }}</span>
    </UButton>
  </UDropdownMenu>
</template>

<style scoped>
.topbar-language-control {
  border: 1px solid var(--app-border) !important;
  background: var(--app-surface) !important;
  font-size: 0.8rem !important;
  box-shadow: none !important;
  --tw-ring-shadow: 0 0 transparent;
  --tw-ring-offset-shadow: 0 0 transparent;
}

.topbar-language-control:active,
.topbar-language-control[data-state="open"] {
  border-color: var(--app-border) !important;
  background: var(--app-surface) !important;
}

.topbar-language-control:hover {
  border-color: var(--app-border) !important;
  background: var(--app-surface) !important;
}

.topbar-language-control:focus-visible {
  border-color: var(--app-border) !important;
  outline: none;
  box-shadow: none !important;
}

.topbar-language-control :deep([data-slot="trailingIcon"]) {
  width: 14px;
  height: 14px;
}
</style>
