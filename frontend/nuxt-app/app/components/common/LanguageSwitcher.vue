<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const options = computed(() =>
  locales.value.map((item) => ({
    label: item.name || item.code,
    value: item.code,
  })),
);
</script>

<template>
  <USelect
    :aria-label="$t('common.language')"
    :items="options"
    :model-value="locale"
    class="w-32"
    size="sm"
    @update:model-value="setLocale(String($event))"
  />
</template>
