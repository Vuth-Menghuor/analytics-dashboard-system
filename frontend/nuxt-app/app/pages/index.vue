<script setup lang="ts">
const auth = useAuthStore()

await navigateTo(auth.roleDashboardPath)
</script>

<template>
  <div />
</template>
