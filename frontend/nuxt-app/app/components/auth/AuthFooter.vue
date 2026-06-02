<script setup lang="ts">
import { APP_NAME } from "~/constants/auth";

withDefaults(
  defineProps<{
    linkTarget?: string;
    privacyTo?: string;
    termsTo?: string;
  }>(),
  {
    linkTarget: "/",
    privacyTo: undefined,
    termsTo: undefined,
  },
);

const { translateText } = useTranslateText();
</script>

<template>
  <footer class="auth-footer">
    <span>© 2026 {{ APP_NAME }}</span>
    <NuxtLink :to="privacyTo ?? linkTarget">{{ translateText("Privacy Policy") }}</NuxtLink>
    <NuxtLink :to="termsTo ?? linkTarget">{{ translateText("Terms & Conditions") }}</NuxtLink>
  </footer>
</template>
