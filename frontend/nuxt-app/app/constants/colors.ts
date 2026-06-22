export const lightColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  input: "#FFFFFF",
  surfaceSoft: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  heading: "#020617",
  muted: "#64748B",
  primary: "#0A3868",
  primaryHover: "#082F57",
  primarySoft: "#E8F2FA",
  primaryExtraSoft: "#F3F8FC",
  onPrimary: "#FFFFFF",
  onMedia: "#FFFFFF",
  mediaOverlay: "#0F172A",
  secondary: "#64748B",
  success: "#16A34A",
  warning: "#F59E0B",
  warningText: "#1E293B",
  error: "#DC2626",
  danger: "#DC2626",
  info: "#06B6D4",
  accentPurple: "#8B5CF6",
  disabled: "#64748B",
  outline: "#64748B",
  outlineVariant: "#E2E8F0",
} as const;

export const darkColors = {
  background: "#0B1120",
  surface: "#1E293B",
  surfaceSoft: "#0F172A",
  input: "#0F172A",
  surfaceContainer: "#1E293B",
  surfaceContainerHigh: "#273548",
  surfaceContainerHighest: "#334155",
  border: "#1E293B",
  outline: "#475569",
  outlineVariant: "#64748B",
  text: "#E2E8F0",
  heading: "#E2E8F0",
  muted: "#94A3B8",
  disabled: "#64748B",
  primary: "#9BC4E8",
  primaryHover: "#B6D6F0",
  primarySoft: "#1E293B",
  primaryExtraSoft: "#0F172A",
  onPrimary: "#0B1120",
  onMedia: "#FFFFFF",
  mediaOverlay: "#0F172A",
  secondary: "#94A3B8",
  success: "#86D996",
  warning: "#F5B873",
  warningText: "#0B1120",
  error: "#F2918A",
  danger: "#F2918A",
  info: "#7DD8E8",
  accentPurple: "#8B5CF6",
} as const;

export const chartPalette = [
  "#0A3868",
  "#06B6D4",
  "#F59E0B",
  "#16A34A",
  "#8B5CF6",
  "#EC4899",
] as const;

export const chartOtherColor = "#64748B";

export const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

// Backward-compatible semantic aliases for chart option builders.
export const appColors = {
  ...lightColors,
  primaryMuted: lightColors.primarySoft,
  neutral: lightColors.muted,
  amber: lightColors.warning,
  blue: chartPalette[0],
  cyan: chartPalette[1],
  purple: chartPalette[4],
  pink: chartPalette[5],
  slate: lightColors.muted,
  ink: lightColors.text,
  grid: lightColors.surfaceSoft,
  axis: lightColors.border,
  white: lightColors.surface,
} as const;

export const chartColors = chartPalette;
