<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  copy?: string
}>()
</script>

<template>
  <header class="app-page-header">
    <div class="page-header-main">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="copy" class="page-copy">{{ copy }}</p>
    </div>

    <div v-if="$slots.default" class="toolbar page-header-actions">
      <slot />
    </div>
  </header>
</template>
