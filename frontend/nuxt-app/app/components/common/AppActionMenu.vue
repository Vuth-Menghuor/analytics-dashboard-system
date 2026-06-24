<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import AppButton from "~/components/common/AppButton.vue";

type DropdownMenuItems = DropdownMenuItem[] | DropdownMenuItem[][];

const props = defineProps<{
  items: DropdownMenuItems;
  ariaLabel: string;
  title?: string;
}>();
const { translateText } = useTranslateText();

const translateItem = (item: DropdownMenuItem): DropdownMenuItem => ({
  ...item,
  label:
    typeof item.label === "string"
      ? String(translateText(item.label))
      : item.label,
});

const isGroupedMenu = (
  items: DropdownMenuItems,
): items is DropdownMenuItem[][] => items.length > 0 && Array.isArray(items[0]);

const translatedItems = computed<DropdownMenuItems>(() => {
  if (isGroupedMenu(props.items)) {
    return props.items.map((group) => group.map(translateItem));
  }

  return props.items.map(translateItem);
});

const actionMenuUi = {
  content:
    "w-36 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-1 shadow-xl ring-1 ring-black/5",
  viewport: "space-y-1 divide-y-0 py-0",
  group: "space-y-1 p-0",
  item: "h-8 rounded px-2 text-xs gap-2 text-[var(--app-text)] data-highlighted:before:bg-[var(--app-surface-soft)]",
  itemLeadingIcon: "size-3.5 text-[var(--app-muted)]",
  itemLabel: "text-xs font-normal leading-4",
};
</script>

<template>
  <UDropdownMenu
    :items="translatedItems"
    :content="{ align: 'end', collisionPadding: 12, sideOffset: 6 }"
    :ui="actionMenuUi"
  >
    <AppButton
      action="more"
      :aria-label="String(translateText(ariaLabel))"
      :title="title ? String(translateText(title)) : undefined"
    />
  </UDropdownMenu>
</template>
