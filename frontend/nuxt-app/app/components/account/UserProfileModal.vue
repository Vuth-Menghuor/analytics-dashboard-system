<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <AccountSettingsModal v-model:open="open" initial-section="profile" />
</template>
