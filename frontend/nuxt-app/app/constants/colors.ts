export const appColors = {
  primary: "#0C447C",
  primaryHover: "#0A3868",
  primarySoft: "#f3f8fc",
  primaryMuted: "#e8f2fa",
  secondary: "#64748b",
  success: "#0f8b57",
  warning: "#d97706",
  purple: "#8847d8",
  slate: "#475569",
  ink: "#020617",
  grid: "#edf1f6",
  axis: "#d9e1ec",
  white: "#ffffff",
} as const;

export const chartColors = [
  appColors.primaryHover,
  appColors.purple,
  appColors.success,
  appColors.warning,
  appColors.slate,
] as const;
