<script setup lang="ts">
import CourseAnalyticsView from "~/components/courses/CourseAnalyticsView.vue";

definePageMeta({
  middleware: ["role"],
  roles: ["manager", "partner", "visitor"],
});
</script>

<template>
  <CourseAnalyticsView />
</template>
