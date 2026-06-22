<script setup lang="ts">
type OptionCard = {
  label: string;
  value: string;
  icon?: string;
  description?: string;
};

defineProps<{
  options: readonly OptionCard[];
}>();

const model = defineModel<string>({ required: true });
const { translateText } = useTranslateText();
</script>

<template>
  <div class="app-option-card-group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="app-option-card"
      :class="{ 'is-active': model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      <span v-if="option.icon" class="app-option-card-icon" aria-hidden="true">
        <UIcon :name="option.icon" />
      </span>
      <span class="app-option-card-copy">
        <span class="app-option-card-label">{{ translateText(option.label) }}</span>
        <span v-if="option.description" class="app-option-card-description">
          {{ translateText(option.description) }}
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.app-option-card-group {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.app-option-card {
  display: grid;
  min-height: 112px;
  width: 100%;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 12px;
  align-items: center;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--app-surface);
  color: var(--app-muted);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.app-option-card:hover {
  background: var(--app-surface-soft);
}

.app-option-card:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 2px;
}

.app-option-card.is-active {
  border-color: var(--app-primary);
  background: var(--app-primary-soft);
  color: var(--app-text);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-primary) 20%, transparent);
}

.app-option-card-icon {
  display: grid;
  width: 36px;
  height: 36px;
  grid-row: span 2;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface-soft);
  color: var(--app-muted);
}

.app-option-card-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.app-option-card.is-active .app-option-card-icon {
  background: var(--app-surface);
  color: var(--app-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-primary) 20%, transparent);
}

.app-option-card-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.app-option-card-label {
  color: var(--app-text);
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.25;
}

.app-option-card-description {
  color: var(--app-muted);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.35;
}

@media (max-width: 640px) {
  .app-option-card-group {
    grid-template-columns: 1fr;
  }
}
</style>
