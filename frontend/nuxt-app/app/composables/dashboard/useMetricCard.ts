import type { Metric } from "~/types/dashboard";
import type { Ref } from "vue";
import { appColors } from "~/constants/colors";

const DEFAULT_ACCENT_COLOR = appColors.primary;

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

export const useMetricCard = (metric: Ref<Metric>) => {
  const accentColor = computed(() => metric.value.color ?? DEFAULT_ACCENT_COLOR);
  const accentRgb = computed(() => hexToRgb(accentColor.value));
  const accentSoftColor = computed(() => {
    const { r, g, b } = accentRgb.value;

    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  });
  const backgroundColor = computed(() => accentColor.value);

  return {
    accentColor,
    accentSoftColor,
    backgroundColor,
  };
};
