<script setup lang="ts">
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
  <UFormField :label="label" class="field auth-password-field">
    <UInput
      class="w-full"
      :type="showPassword ? 'text' : 'password'"
      :model-value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      size="md"
      variant="outline"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          square
          type="button"
          :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="showPassword ? hideLabel : showLabel"
          :ui="{ leadingIcon: 'size-4' }"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>
  </UFormField>
</template>
