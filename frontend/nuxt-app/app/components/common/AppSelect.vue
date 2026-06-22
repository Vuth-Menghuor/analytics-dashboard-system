<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    items: SelectMenuItem[] | SelectMenuItem[][];
    valueKey?: string;
    labelKey?: string;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    searchable?: boolean;
  }>(),
  {
    valueKey: "value",
    labelKey: "label",
    placeholder: "",
    disabled: false,
    clearable: false,
    searchable: false,
  },
);

const model = defineModel<any>();
const { translateText } = useTranslateText();

const translatedItems = computed(() => {
  const translateItem = (item: SelectMenuItem): SelectMenuItem => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return item;
    }

    return {
      ...item,
      label:
        typeof item.label === "string"
          ? String(translateText(item.label))
          : item.label,
    };
  };

  return props.items.map((item) =>
    Array.isArray(item) ? item.map(translateItem) : translateItem(item),
  );
});
</script>

<template>
  <USelectMenu
    v-bind="$attrs"
    v-model="model"
    :items="translatedItems"
    :value-key="valueKey"
    :label-key="labelKey"
    :placeholder="placeholder"
    :disabled="disabled"
    :clear="clearable"
    :search-input="
      searchable
        ? {
            size: 'xs',
            ui: {
              base: '!px-3 !py-2 !text-sm !leading-5',
            },
          }
        : false
    "
    size="sm"
    class="dashboard-select"
    :content="{ align: 'start', collisionPadding: 12, sideOffset: 6 }"
    :ui="{
      base: 'h-9 min-w-44 border border-[var(--app-border)] bg-[var(--app-surface)] !text-[0.75rem] text-[var(--app-text)] shadow-none ring-0 focus-visible:ring-0',
      content:
        'min-w-[var(--reka-combobox-trigger-width)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg ring-0',
      viewport: 'p-1',
      item: 'min-h-8 rounded-md px-2.5 text-xs',
      itemLabel: 'text-xs leading-4',
      itemLeadingIcon: 'size-3.5',
      itemTrailingIcon: 'size-3.5',
      trailingIcon: 'size-3.5',
    }"
  />
</template>

<style scoped>
.dashboard-select:hover,
.dashboard-select:focus-visible,
.dashboard-select[data-state="open"] {
  border-color: var(--app-border) !important;
  background: var(--app-surface) !important;
  box-shadow: none !important;
}
</style>
