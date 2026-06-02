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
  <UIcon
    :name="icon"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    aria-hidden="true"
  />
</template>
