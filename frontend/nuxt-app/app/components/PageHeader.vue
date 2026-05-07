<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  copy?: string
}>()
</script>

<template>
  <section class="page-header">
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="copy" class="page-copy">{{ copy }}</p>
    </div>
    <slot />
  </section>
</template>
