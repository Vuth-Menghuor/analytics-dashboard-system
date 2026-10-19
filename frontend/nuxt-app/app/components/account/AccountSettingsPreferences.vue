<script setup lang="ts">
import type { AccountSettingsFormState } from "~/constants/accountSettings";

const themeOptions = [
  {
    label: "System",
    value: "system",
    description: "Match your device setting",
    icon: "i-lucide-monitor",
  },
  {
    label: "Light",
    value: "light",
    description: "Bright and focused",
    icon: "i-lucide-sun",
  },
  {
    label: "Dark",
    value: "dark",
    description: "Easy on the eyes",
    icon: "i-lucide-moon",
  },
] as const;

const props = withDefaults(
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
  <section class="preferences-page">
    <header class="preferences-heading">
      <span class="preferences-heading-icon">
        <UIcon name="i-lucide-sliders-horizontal" class="size-5" />
      </span>
      <div>
        <h3>
        {{ translateText(heading) }}
        </h3>
        <p>
        {{ translateText(description) }}
        </p>
      </div>
    </header>

    <div class="preferences-layout">
      <div class="preferences-main-card">
        <div class="preferences-card-header">
          <div>
            <h4>{{ translateText("Appearance") }}</h4>
            <p>{{ translateText("Choose how the dashboard looks while you work.") }}</p>
          </div>
        </div>

        <div class="theme-setting-header">
          <div>
            <p class="theme-setting-title">{{ translateText("Theme preference") }}</p>
            <p class="theme-setting-copy">{{ translateText("Select the color mode that feels best for your workspace.") }}</p>
          </div>
        </div>

        <div class="theme-preview-selector" role="radiogroup" :aria-label="translateText('Theme preference')">
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
              <span class="theme-preview-toolbar"><span /><span /><span /></span>
              <span class="theme-preview-body">
                <span class="theme-preview-sidebar"><span /><span /><span /><span /></span>
                <span class="theme-preview-content"><span class="theme-preview-avatar" /><span class="theme-preview-title" /><span class="theme-preview-line" /><span class="theme-preview-line" /></span>
              </span>
              <span v-if="formState.theme === option.value" class="theme-preview-check"><UIcon name="i-lucide-check" /></span>
            </span>
            <span class="theme-option-copy">
              <span class="theme-option-icon"><UIcon :name="option.icon" class="size-4" /></span>
              <span><span class="theme-preview-label">{{ translateText(option.label) }}</span><span class="theme-preview-description">{{ translateText(option.description) }}</span></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.preferences-page { display: grid; gap: 24px; padding: 28px; }
.preferences-heading { display: flex; align-items: center; gap: 13px; }
.preferences-heading-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; background: var(--app-primary-soft); color: var(--app-primary); }
.preferences-kicker { color: var(--app-primary); font-size: .7rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.preferences-heading h3 { margin: 2px 0 0; color: var(--app-heading); font-size: 1.25rem; font-weight: 750; line-height: 1.2; }
.preferences-heading p:last-child { margin-top: 4px; color: var(--app-muted); font-size: .86rem; }
.preferences-layout { display: grid; gap: 16px; max-width: 980px; }
.preferences-main-card { padding: 22px; border: 1px solid var(--app-border); border-radius: 13px; background: var(--app-surface); }
.preferences-card-header, .theme-setting-header { display: flex; align-items: flex-start; gap: 16px; }
.preferences-card-header { padding-bottom: 19px; border-bottom: 1px solid var(--app-border); }
.preferences-card-header h4, .theme-setting-title { margin: 0; color: var(--app-heading); font-size: .95rem; font-weight: 750; }
.preferences-card-header p, .theme-setting-copy { margin-top: 4px; color: var(--app-muted); font-size: .78rem; line-height: 1.5; }
.theme-setting-header { padding: 20px 0 15px; }
.theme-preview-selector {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  gap: 10px;
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
  aspect-ratio: 1.7;
  min-height: 96px;
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
.theme-preview-option-system .theme-preview-body { grid-template-columns: 50% 50%; }
.theme-preview-option-system .theme-preview-sidebar { background: #f3f8fc; }
.theme-preview-option-system .theme-preview-content { background: #0f172a; }
.theme-preview-option-system .theme-preview-content .theme-preview-line { background: #475569; }
.theme-preview-option-system .theme-preview-content .theme-preview-title { background: #94a3b8; }

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
  display: block;
  color: var(--app-heading);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.3;
}
.theme-option-copy { display: flex; align-items: center; gap: 8px; }
.theme-option-icon { display: grid; width: 29px; height: 29px; flex: none; place-items: center; border-radius: 8px; background: var(--app-surface-soft); color: var(--app-muted); }
.theme-preview-option.is-active .theme-option-icon { background: var(--app-primary-soft); color: var(--app-primary); }
.theme-preview-description { display: block; margin-top: 1px; color: var(--app-muted); font-size: .68rem; }

@media (max-width: 760px) {
  .preferences-page { padding: 20px; }
  .preferences-card-header, .theme-setting-header { display: grid; }
  .theme-preview-selector {
    grid-template-columns: 1fr;
  }
}
</style>
