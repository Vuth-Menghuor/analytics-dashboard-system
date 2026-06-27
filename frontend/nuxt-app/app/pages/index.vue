<script setup lang="ts">
const auth = useAuthStore();

auth.refreshSession();

await navigateTo(auth.isAuthenticated ? auth.roleDashboardPath : "/login");
</script>

<template>
  <div />
</template>
