<script setup lang="ts">
import { useThemeStore } from "~/stores/theme";

useThemeStore();

const { locale } = useI18n();
const toaster = {
  position: "top-right" as const,
  ui: {
    viewport: "!top-[76px] right-4 w-[calc(100%-2rem)] sm:w-[28rem]",
  },
};

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}));
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
