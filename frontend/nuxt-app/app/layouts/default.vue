<script setup lang="ts">
import AppSidebar from "~/components/layout/AppSidebar.vue";
import AppTopbar from "~/components/layout/AppTopbar.vue";
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-main">
      <AppTopbar />
      <div class="app-content">
        <slot />
      </div>
    </main>
  </div>
</template>
