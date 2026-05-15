<script setup lang="ts">
import StudentAnalyticsView from "~/components/students/StudentAnalyticsView.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner"],
});
</script>

<template>
  <StudentAnalyticsView />
</template>
