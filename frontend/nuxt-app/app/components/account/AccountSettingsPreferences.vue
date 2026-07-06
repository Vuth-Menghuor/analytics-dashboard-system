<script setup lang="ts">
import type { AccountSettingsFormState } from "~/constants/accountSettings";

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

withDefaults(
  defineProps<{
    description?: string;
    formState: AccountSettingsFormState;
    heading?: string;
  }>(),
  {
    description:
      "Set dashboard defaults based on how this role uses the system.",
    heading: "Preference",
  },
);

const { translateText } = useTranslateText();
</script>

<template>
  <section class="grid gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">{{ translateText(heading) }}</h3>
      <p class="mt-1 text-sm text-slate-500">
        {{ translateText(description) }}
      </p>
    </div>

    <div class="grid gap-5">
      <div class="rounded-md border border-slate-200 bg-white p-5">
        <h4 class="font-bold text-slate-950">{{ translateText("Appearance") }}</h4>

        <div class="mt-5">
          <div class="grid gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-950">{{ translateText("Theme") }}</p>
              <p class="mt-1 text-xs text-slate-500">
                {{ translateText("Choose dashboard color mode.") }}
              </p>
            </div>
            <div class="theme-preview-selector" role="radiogroup">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                type="button"
                class="theme-preview-option"
                :class="[
                  `theme-preview-option-${option.value}`,
                  { 'is-active': formState.theme === option.value },
                ]"
                role="radio"
                :aria-checked="formState.theme === option.value"
                @click="formState.theme = option.value"
              >
                <span class="theme-preview-window" aria-hidden="true">
                  <span class="theme-preview-toolbar">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span class="theme-preview-body">
                    <span class="theme-preview-sidebar">
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                    <span class="theme-preview-content">
                      <span class="theme-preview-avatar" />
                      <span class="theme-preview-title" />
                      <span class="theme-preview-line" />
                      <span class="theme-preview-line" />
                      <span class="theme-preview-line theme-preview-line-short" />
                    </span>
                  </span>
                  <span
                    v-if="formState.theme === option.value"
                    class="theme-preview-check"
                  >
                    <UIcon name="i-lucide-check" />
                  </span>
                </span>
                <span class="theme-preview-label">
                  {{ translateText(option.label) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.theme-preview-selector {
  display: grid;
  gap: 16px;
  max-width: 640px;
  grid-template-columns: repeat(2, minmax(220px, 300px));
}

.theme-preview-option {
  --preview-bg: #ffffff;
  --preview-sidebar: #f3f8fc;
  --preview-border: #e2e8f0;
  --preview-primary: #0a3868;
  --preview-avatar: #94a3b8;
  --preview-line: #cbd5e1;
  --preview-strong: #64748b;

  display: grid;
  min-width: 0;
  gap: 9px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--app-text);
  text-align: left;
  cursor: pointer;
}

.theme-preview-window {
  position: relative;
  display: block;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1.55;
  min-height: 92px;
  max-height: 112px;
  border: 1px solid var(--preview-border);
  border-radius: 8px;
  background: var(--preview-bg);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--app-heading) 8%, transparent);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.theme-preview-option:hover .theme-preview-window {
  border-color: color-mix(in srgb, var(--app-primary) 45%, var(--app-border));
  box-shadow: 0 8px 18px color-mix(in srgb, var(--app-heading) 10%, transparent);
  transform: translateY(-1px);
}

.theme-preview-option:focus-visible {
  outline: 2px solid var(--app-primary);
  outline-offset: 4px;
  border-radius: 10px;
}

.theme-preview-option.is-active .theme-preview-window {
  border-color: var(--app-primary);
  box-shadow:
    0 0 0 1px var(--app-primary),
    0 8px 20px color-mix(in srgb, var(--app-primary) 18%, transparent);
}

.theme-preview-toolbar {
  position: absolute;
  top: 11px;
  left: 14px;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.theme-preview-toolbar span {
  width: 4px;
  height: 4px;
  border-radius: 999px;
}

.theme-preview-toolbar span:nth-child(1) {
  background: var(--app-error);
}

.theme-preview-toolbar span:nth-child(2) {
  background: var(--app-warning);
}

.theme-preview-toolbar span:nth-child(3) {
  background: var(--app-success);
}

.theme-preview-body {
  display: grid;
  height: 100%;
  grid-template-columns: 34% 1fr;
}

.theme-preview-sidebar,
.theme-preview-content {
  display: grid;
  align-content: start;
}

.theme-preview-sidebar {
  gap: 6px;
  padding: 28px 12px 0 14px;
  background: var(--preview-sidebar);
}

.theme-preview-sidebar span {
  height: 4px;
  border-radius: 999px;
  background: var(--preview-line);
}

.theme-preview-sidebar span:nth-child(1) {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--preview-avatar);
}

.theme-preview-sidebar span:nth-child(2) {
  width: 76%;
}

.theme-preview-sidebar span:nth-child(3) {
  width: 58%;
}

.theme-preview-sidebar span:nth-child(4) {
  width: 68%;
}

.theme-preview-content {
  gap: 7px;
  padding: 27px 16px;
  background: var(--preview-bg);
}

.theme-preview-avatar {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--preview-avatar);
}

.theme-preview-title {
  width: 42%;
  height: 5px;
  border-radius: 999px;
  background: var(--preview-strong);
}

.theme-preview-line {
  width: 82%;
  height: 4px;
  border-radius: 999px;
  background: var(--preview-line);
}

.theme-preview-line-short {
  width: 62%;
}

.theme-preview-option-dark {
  --preview-bg: #0f172a;
  --preview-sidebar: #0b1f35;
  --preview-border: #24324a;
  --preview-primary: #60a5fa;
  --preview-avatar: #64748b;
  --preview-line: #475569;
  --preview-strong: #94a3b8;
}

.theme-preview-check {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 999px;
  background: var(--app-primary);
  color: var(--app-on-primary);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--app-primary) 35%, transparent);
}

.theme-preview-check :deep(svg) {
  width: 13px;
  height: 13px;
  stroke-width: 3;
}

.theme-preview-label {
  color: var(--app-heading);
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.3;
}

@media (max-width: 760px) {
  .theme-preview-selector {
    grid-template-columns: 1fr;
  }
}
</style>
