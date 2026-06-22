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
  const foregroundColor = computed(() =>
    accentColor.value.toLowerCase() === appColors.warning.toLowerCase()
      ? appColors.warningText
      : appColors.onPrimary,
  );
  const comparison = computed(() => {
    if (metric.value.change) {
      return {
        direction: metric.value.changeDirection ?? "up",
        period: metric.value.changePeriod ?? "from last month",
        value: metric.value.change,
      };
    }

    const sparkline = metric.value.sparkline;

    if (!sparkline || sparkline.length < 2) {
      return null;
    }

    const previous = sparkline.at(-2) ?? 0;
    const current = sparkline.at(-1) ?? 0;

    if (previous <= 0) {
      return null;
    }

    const percent = ((current - previous) / previous) * 100;
    const rounded = Math.abs(percent) >= 10 ? percent.toFixed(0) : percent.toFixed(1);
    const direction =
      percent > 0 ? "up" : percent < 0 ? "down" : "neutral";
    const sign = percent > 0 ? "+" : "";

    return {
      direction,
      period: metric.value.changePeriod ?? "from last month",
      value: `${sign}${rounded}%`,
    };
  });

  return {
    accentColor,
    accentSoftColor,
    backgroundColor,
    foregroundColor,
    comparison,
  };
};
