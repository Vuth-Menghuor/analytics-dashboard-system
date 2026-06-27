<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ExportFormat } from "~/utils/exportCsv";

const emit = defineEmits<{
  select: [format: ExportFormat];
}>();

const { translateText } = useTranslateText();

const exportItems = computed<DropdownMenuItem[]>(() => [
  {
    label: String(translateText("Excel file")),
    icon: "i-lucide-file-spreadsheet",
    onSelect: () => emit("select", "excel"),
  },
  {
    label: String(translateText("CSV file")),
    icon: "i-lucide-file-text",
    onSelect: () => emit("select", "csv"),
  },
]);

const menuUi = {
  content:
    "w-40 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-1 shadow-xl ring-1 ring-black/5",
  viewport: "space-y-1 divide-y-0 py-0",
  group: "space-y-1 p-0",
  item: "h-8 rounded px-2 text-xs gap-2 text-[var(--app-text)] data-highlighted:before:bg-[var(--app-surface-soft)]",
  itemLeadingIcon: "size-3.5 text-[var(--app-muted)]",
  itemLabel: "text-xs font-normal leading-4",
};
</script>

<template>
  <UDropdownMenu
    :items="exportItems"
    :modal="false"
    :content="{ align: 'end', collisionPadding: 12, sideOffset: 6 }"
    :ui="menuUi"
  >
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      icon="i-lucide-download"
      trailing-icon="i-lucide-chevron-down"
      class="app-export-menu-button"
      :aria-label="String(translateText('Export'))"
    >
      {{ translateText("Export") }}
    </UButton>
  </UDropdownMenu>
</template>

<style scoped>
.app-export-menu-button {
  height: 36px;
  min-height: 36px;
  border: 1px solid var(--app-border) !important;
  background: var(--app-surface) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  box-shadow: none !important;
}

.app-export-menu-button:hover,
.app-export-menu-button:active,
.app-export-menu-button[data-state="open"] {
  border-color: var(--app-border) !important;
  background: var(--app-surface) !important;
  box-shadow: none !important;
}
</style>
