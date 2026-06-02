<script setup lang="ts">
import { useThemeStore } from "~/stores/theme";

const themeStore = useThemeStore();
const { t } = useI18n();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const icon = computed(() =>
  isMounted.value && themeStore.isDark ? "i-lucide-moon" : "i-lucide-sun",
);

const label = computed(() =>
  isMounted.value && themeStore.isDark
    ? t("text.switchToLight")
    : t("text.switchToDark"),
);
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="sm"
    :icon="icon"
    :aria-label="label"
    class="topbar-icon-button"
    @click="themeStore.toggleTheme"
  />
</template>
