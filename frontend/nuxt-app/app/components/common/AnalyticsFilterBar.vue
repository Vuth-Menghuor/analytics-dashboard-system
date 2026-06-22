<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import type { AnalyticsFilter } from "~/types/analytics";

const props = defineProps<{
  filters: AnalyticsFilter[];
}>();

const model = defineModel<Record<string, string>>({ default: () => ({}) });

const { translateText } = useTranslateText();

watch(
  () => props.filters,
  (filters) => {
    filters.forEach((filter) => {
      if (model.value[filter.key] === undefined) {
        model.value[filter.key] = filter.options?.[0] ?? "";
      }
    });
  },
  { immediate: true },
);
</script>

<template>
  <UCard v-if="filters.length" :ui="{ body: 'analytics-filter-bar' }">
    <div
      v-for="filter in filters"
      :key="filter.key"
      class="analytics-filter-field"
    >
      <label>{{ translateText(filter.label) }}</label>
      <AppSearchInput
        v-if="filter.type === 'search'"
        v-model="model[filter.key]"
        :placeholder="String(translateText(filter.placeholder || 'Search...'))"
        :aria-label="String(translateText(filter.label))"
        clearable
      />
      <AppSelect
        v-else
        v-model="model[filter.key]"
        :items="
          (filter.options || []).map((item) => ({
            label: String(translateText(item)),
            value: item,
          }))
        "
        value-key="value"
        :searchable="false"
        :aria-label="String(translateText(filter.label))"
      />
    </div>
  </UCard>
</template>
