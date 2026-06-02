<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  copy?: string;
}>();

const { translateText } = useTranslateText();
</script>

<template>
  <header class="app-page-header">
    <div class="page-header-main">
      <p v-if="eyebrow" class="eyebrow">{{ translateText(eyebrow) }}</p>
      <h1 class="page-title">{{ translateText(title) }}</h1>
      <p v-if="copy" class="page-copy">{{ translateText(copy) }}</p>
    </div>

    <div v-if="$slots.default" class="toolbar page-header-actions">
      <slot />
    </div>
  </header>
</template>
