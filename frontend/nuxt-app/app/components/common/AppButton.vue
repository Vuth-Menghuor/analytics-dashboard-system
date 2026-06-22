<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

defineOptions({ inheritAttrs: false });

type AppButtonAction =
  | "refresh"
  | "export"
  | "search"
  | "create"
  | "clear"
  | "view"
  | "details"
  | "cancel"
  | "save"
  | "approve"
  | "reject"
  | "open"
  | "logout"
  | "more"
  | "delete";

const props = defineProps<
  ButtonProps & {
    action?: AppButtonAction;
  }
>();

const actionPresets: Record<
  AppButtonAction,
  Pick<
    ButtonProps,
    "label" | "icon" | "trailingIcon" | "color" | "variant" | "size" | "square"
  >
> = {
  refresh: {
    label: "Refresh",
    icon: "i-lucide-refresh-cw",
    color: "neutral",
    variant: "outline",
    size: "sm",
  },
  export: {
    label: "Export CSV",
    icon: "i-lucide-download",
    color: "neutral",
    variant: "outline",
    size: "sm",
  },
  search: {
    label: "Search",
    icon: "i-lucide-search",
    color: "neutral",
    variant: "outline",
    size: "sm",
  },
  create: {
    label: "Create",
    icon: "i-lucide-plus",
    color: "primary",
    variant: "solid",
    size: "sm",
  },
  clear: {
    label: "Clear filters",
    icon: "i-lucide-filter-x",
    color: "neutral",
    variant: "ghost",
    size: "sm",
  },
  view: {
    label: "View",
    icon: "i-lucide-eye",
    color: "neutral",
    variant: "outline",
    size: "sm",
  },
  details: {
    label: "View details",
    trailingIcon: "i-lucide-arrow-up-right",
    color: "neutral",
    variant: "ghost",
    size: "sm",
  },
  cancel: {
    label: "Cancel",
    color: "neutral",
    variant: "ghost",
    size: "sm",
  },
  save: {
    label: "Save",
    icon: "i-lucide-save",
    color: "primary",
    variant: "solid",
    size: "sm",
  },
  approve: {
    label: "Approve",
    icon: "i-lucide-check",
    color: "success",
    variant: "soft",
    size: "sm",
  },
  reject: {
    label: "Reject",
    icon: "i-lucide-x",
    color: "error",
    variant: "soft",
    size: "sm",
  },
  open: {
    label: "Open file",
    icon: "i-lucide-external-link",
    color: "neutral",
    variant: "outline",
    size: "sm",
  },
  logout: {
    label: "Log out",
    icon: "i-lucide-log-out",
    color: "error",
    variant: "solid",
    size: "sm",
  },
  more: {
    icon: "i-lucide-more-vertical",
    color: "neutral",
    variant: "ghost",
    size: "sm",
    square: true,
  },
  delete: {
    label: "Delete",
    icon: "i-lucide-trash-2",
    color: "error",
    variant: "solid",
    size: "sm",
  },
};

const preset = computed(() =>
  props.action ? actionPresets[props.action] : undefined,
);
const { translateText } = useTranslateText();

const buttonProps = computed(() => {
  const { action: _action, ...baseProps } = props;
  const label = props.label === "" ? undefined : props.label ?? preset.value?.label;

  return {
    ...baseProps,
    label: label ? String(translateText(label)) : label,
    icon: props.icon ?? preset.value?.icon,
    trailingIcon: props.trailingIcon ?? preset.value?.trailingIcon,
    color: props.color ?? preset.value?.color,
    variant: props.variant ?? preset.value?.variant,
    size: props.size ?? preset.value?.size,
    square: props.square ?? preset.value?.square,
  };
});

const buttonClasses = computed(() => ({
  "app-button--solid": buttonProps.value.variant === "solid",
  "app-button--details": props.action === "details",
  "app-button--square": Boolean(buttonProps.value.square),
}));
</script>

<template>
  <UButton
    v-bind="{ ...buttonProps, ...$attrs }"
    class="app-button"
    :class="buttonClasses"
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
  </UButton>
</template>

<style scoped>
.app-button {
  border: 1px solid var(--app-border);
  font-size: 0.75rem;
  font-weight: 500;
  height: 36px;
  min-height: 36px;
  line-height: 1;
  box-shadow: none;
}

.app-button:hover,
.app-button:active,
.app-button:focus-visible {
  border-color: var(--app-border);
  box-shadow: none;
}

.app-button--solid {
  border-color: transparent;
}

.app-button--details {
  font-weight: 400;
}

.app-button--square {
  width: 36px;
  min-width: 36px;
  border-color: transparent;
  padding: 0 !important;
  justify-content: center;
}

.app-button--square:hover,
.app-button--square:active,
.app-button--square:focus-visible {
  border-color: transparent;
}

.app-button--square :deep([data-slot="leadingIcon"]),
.app-button--square :deep([data-slot="trailingIcon"]) {
  margin: 0;
}
</style>
