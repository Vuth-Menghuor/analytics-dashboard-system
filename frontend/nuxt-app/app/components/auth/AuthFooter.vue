<script setup lang="ts">
import { APP_NAME } from "~/constants/auth";

defineProps<{
  linkTarget: string;
}>();
</script>

<template>
  <footer class="auth-footer">
    <span>© 2026 {{ APP_NAME }}</span>
    <NuxtLink :to="linkTarget">Privacy Policy</NuxtLink>
    <NuxtLink :to="linkTarget">Terms &amp; Conditions</NuxtLink>
  </footer>
</template>
