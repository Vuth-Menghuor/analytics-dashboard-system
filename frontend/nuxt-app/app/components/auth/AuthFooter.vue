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
</script>

<template>
  <footer class="auth-footer">
    <span>© 2026 {{ APP_NAME }}</span>
    <NuxtLink :to="privacyTo ?? linkTarget">Privacy Policy</NuxtLink>
    <NuxtLink :to="termsTo ?? linkTarget">Terms &amp; Conditions</NuxtLink>
  </footer>
</template>
