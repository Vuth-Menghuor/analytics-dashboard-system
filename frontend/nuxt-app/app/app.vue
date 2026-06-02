<script setup lang="ts">
import { useThemeStore } from "~/stores/theme";

useThemeStore();

const { locale } = useI18n();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}));
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
