<script setup lang="ts">
import { resolveIconName } from "~/constants/icons";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
  }>(),
  {
    size: 18,
  },
);

const icon = computed(() => resolveIconName(props.name));
</script>

<template>
  <UIcon :name="icon" :size="props.size" aria-hidden="true" />
</template>
