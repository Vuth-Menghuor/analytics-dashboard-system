<script setup lang="ts">
import { resolveIconName } from "~/constants/icons";

const props = defineProps<{
  name: string;
  size?: number | string;
}>();

const icon = computed(() => resolveIconName(props.name));
</script>

<template>
  <UIcon :name="icon" :size="size ?? 18" aria-hidden="true" />
</template>
