<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  copy?: string
}>()
</script>

<template>
  <UPageHeader
    as="section"
    :headline="eyebrow"
    :title="title"
    :description="copy"
    :ui="{
      root: 'app-page-header',
      container: 'grid gap-2',
      wrapper: 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between',
      headline: 'eyebrow',
      title: 'page-title',
      description: 'page-copy',
      links: 'toolbar shrink-0',
    }"
  >
    <template #links>
      <slot />
    </template>
  </UPageHeader>
</template>
