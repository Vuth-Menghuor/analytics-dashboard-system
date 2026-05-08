<script setup lang="ts">
import { Eye, EyeOff } from "lucide-vue-next";

withDefaults(
  defineProps<{
    autocomplete?: string;
    hideLabel?: string;
    label: string;
    modelValue: string;
    placeholder?: string;
    required?: boolean;
    showLabel?: string;
  }>(),
  {
    autocomplete: "current-password",
    hideLabel: "Hide password",
    placeholder: "",
    required: false,
    showLabel: "Show password",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const showPassword = ref(false);
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <span class="password-field">
      <input
        class="input"
        :type="showPassword ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <button
        class="password-toggle"
        type="button"
        :aria-label="showPassword ? hideLabel : showLabel"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" :size="17" aria-hidden="true" />
        <Eye v-else :size="17" aria-hidden="true" />
      </button>
    </span>
  </label>
</template>
