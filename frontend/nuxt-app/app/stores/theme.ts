import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark" | "system";

const themeModes = ["light", "dark", "system"] as const;

const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === "string" && themeModes.includes(value as ThemeMode);

export const useThemeStore = defineStore("theme", () => {
  const colorMode = useColorMode();

  const mode = computed<ThemeMode>({
    get: () =>
      isThemeMode(colorMode.preference) ? colorMode.preference : "system",
    set: (value) => {
      colorMode.preference = value;
    },
  });

  const isDark = computed(() => colorMode.value === "dark");

  watchEffect(() => {
    if (!import.meta.client) return;

    document.documentElement.classList.toggle("dark", isDark.value);
    document.documentElement.dataset.theme = isDark.value ? "dark" : "light";
  });

  const setTheme = (value: ThemeMode) => {
    mode.value = value;
  };

  const toggleTheme = () => {
    setTheme(isDark.value ? "light" : "dark");
  };

  return {
    mode,
    isDark,
    setTheme,
    toggleTheme,
  };
});
