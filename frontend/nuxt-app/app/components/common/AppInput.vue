<script setup lang="ts">
import type { InputProps } from "@nuxt/ui";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputProps>(), {
  size: "sm",
  variant: "outline",
});

const model = defineModel<InputProps["modelValue"]>();
</script>

<template>
  <UInput
    v-bind="{ ...props, ...$attrs }"
    v-model="model"
    class="app-input"
    :ui="{
      base: 'h-9 border border-[var(--app-border)] bg-[var(--app-surface)] !text-[0.75rem] font-normal text-[var(--app-text)] placeholder:text-[var(--app-muted)] placeholder:font-normal shadow-none ring-0 focus-visible:ring-0',
      leadingIcon: 'size-4 text-[var(--app-muted)]',
      trailingIcon: 'size-4 text-[var(--app-muted)]',
    }"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>
    <template v-if="$slots.default">
      <slot />
    </template>
    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </UInput>
</template>

<style scoped>
.app-input:hover,
.app-input:focus-within {
  border-color: var(--app-border) !important;
  box-shadow: none !important;
}
</style>
