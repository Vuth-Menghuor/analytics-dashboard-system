<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});

await navigateTo("/learning-performance", { replace: true });
</script>

<template>
  <div />
</template>
