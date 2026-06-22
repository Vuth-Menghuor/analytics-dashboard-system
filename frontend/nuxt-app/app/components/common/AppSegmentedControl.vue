<script setup lang="ts">
type SegmentOption = {
  label: string;
  value: string;
};

withDefaults(defineProps<{
  options: SegmentOption[];
  ariaLabel?: string;
  variant?: "joined" | "pill";
}>(), {
  variant: "joined",
});

const model = defineModel<string>({ required: true });
const { translateText } = useTranslateText();
</script>

<template>
  <div
    class="app-segmented-control"
    :class="`app-segmented-control--${variant}`"
    role="group"
    :aria-label="ariaLabel"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="app-segmented-control__button"
      :class="{ 'is-active': model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ translateText(option.label) }}
    </button>
  </div>
</template>

<style scoped>
.app-segmented-control {
  display: inline-flex;
  align-items: center;
}

.app-segmented-control--pill {
  flex-wrap: wrap;
  gap: 8px;
}

.app-segmented-control__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--app-border);
  margin-left: -1px;
  background: var(--app-surface);
  color: var(--app-text);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  box-shadow: none;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.app-segmented-control__button:first-child {
  margin-left: 0;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.app-segmented-control__button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.app-segmented-control__button:hover,
.app-segmented-control__button:active,
.app-segmented-control__button:focus-visible {
  border-color: var(--app-border);
  box-shadow: none;
}

.app-segmented-control__button:hover {
  background: var(--app-surface-soft);
}

.app-segmented-control__button:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
  position: relative;
  z-index: 1;
}

.app-segmented-control__button.is-active {
  background: var(--app-primary);
  border-color: var(--app-primary);
  color: var(--app-on-primary);
  position: relative;
  z-index: 1;
}

.app-segmented-control__button.is-active:hover {
  background: var(--app-primary-hover);
  border-color: var(--app-primary-hover);
}

.app-segmented-control--pill .app-segmented-control__button {
  margin-left: 0;
  border-radius: 6px;
  background: var(--app-surface);
  color: var(--app-muted);
}

.app-segmented-control--pill .app-segmented-control__button.is-active {
  background: var(--app-primary-soft);
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.app-segmented-control--pill .app-segmented-control__button.is-active:hover {
  background: var(--app-primary-soft);
  border-color: var(--app-primary);
}
</style>
