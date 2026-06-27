<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    ariaLabel?: string;
    shortcut?: boolean;
    clearable?: boolean;
  }>(),
  {
    placeholder: "",
    ariaLabel: "Search",
    shortcut: false,
    clearable: false,
  },
);

const emit = defineEmits<{
  submit: [value: string];
  clear: [];
}>();

const model = defineModel<string>({ default: "" });
const input = ref<HTMLInputElement | null>(null);
const { translateText } = useTranslateText();

const focus = () => input.value?.focus();

const clear = () => {
  model.value = "";
  emit("clear");
  focus();
};

const handleShortcut = (event: KeyboardEvent) => {
  if (
    props.shortcut &&
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    focus();
  }
};

onMounted(() => window.addEventListener("keydown", handleShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleShortcut));

defineExpose({ focus });
</script>

<template>
  <label v-bind="$attrs" class="dashboard-search-input">
    <UIcon name="i-lucide-search" class="dashboard-search-icon" />
    <input
      ref="input"
      v-model="model"
      type="search"
      :aria-label="String(translateText(ariaLabel))"
      :placeholder="String(translateText(placeholder))"
      @keydown.enter.prevent="emit('submit', model)"
    />
    <button
      v-if="clearable && model"
      type="button"
      class="dashboard-search-clear"
      :aria-label="String(translateText('Clear search'))"
      @click="clear"
    >
      <UIcon name="i-lucide-x" />
    </button>
    <span v-else-if="shortcut" class="dashboard-search-shortcut" aria-hidden="true">
      ⌘ + K
    </span>
  </label>
</template>

<style scoped>
.dashboard-search-input {
  display: flex;
  width: 100%;
  height: 38px;
  min-width: 0;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 0 12px;
  background: var(--app-surface);
  color: var(--app-muted);
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.dashboard-search-input:focus-within {
  border-color: var(--app-border);
  background: var(--app-surface);
  box-shadow: none;
}

.dashboard-search-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.dashboard-search-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--app-text);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1;
  outline: none;
}

.dashboard-search-input input::placeholder {
  color: var(--app-muted);
  font-weight: 400;
  opacity: 1;
}

.dashboard-search-input input::-webkit-search-cancel-button {
  display: none;
}

.dashboard-search-shortcut {
  flex: 0 0 auto;
  color: var(--app-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}

.dashboard-search-clear {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 5px;
  padding: 0;
  background: transparent;
  color: var(--app-muted);
  cursor: pointer;
}

.dashboard-search-clear:hover {
  background: var(--app-surface-soft);
  color: var(--app-text);
}

.dashboard-search-clear svg {
  width: 13px;
  height: 13px;
}
</style>
