<script setup lang="ts" generic="TValue extends string">
import type { RoleOption } from "~/types/auth";

defineProps<{
  modelValue: TValue;
  roles: Array<RoleOption<TValue>>;
  switcherLabel: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: TValue];
}>();
</script>

<template>
  <div class="role-switcher" :aria-label="switcherLabel">
    <button
      v-for="role in roles"
      :key="role.value"
      class="role-button"
      :class="{ active: modelValue === role.value }"
      type="button"
      @click="emit('update:modelValue', role.value)"
    >
      {{ role.label }}
    </button>
  </div>
</template>
