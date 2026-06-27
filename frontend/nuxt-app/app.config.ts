import { defineAppConfig } from "nuxt/app";

export default defineAppConfig({
  ui: {
    toast: {
      slots: {
        root:
          "rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-xl ring-1 ring-black/5 gap-3",
        wrapper: "w-0 flex-1 flex flex-col gap-1",
        title: "text-sm font-semibold text-[var(--app-heading)]",
        description: "text-sm leading-5 text-[var(--app-muted)]",
        close: "p-1 text-[var(--app-muted)] hover:text-[var(--app-text)]",
        progress: "absolute inset-x-0 bottom-0",
      },
      variants: {
        color: {
          primary: {
            root:
              "border-[color-mix(in_srgb,var(--app-primary)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-primary)_8%,var(--app-surface))] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-[var(--app-primary)]",
            title: "text-[var(--app-heading)]",
          },
          success: {
            root:
              "border-[color-mix(in_srgb,var(--app-success)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-success)_8%,var(--app-surface))] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-[var(--app-success)]",
            title: "text-[var(--app-heading)]",
          },
          error: {
            root:
              "border-[color-mix(in_srgb,var(--app-error)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-error)_8%,var(--app-surface))] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-[var(--app-error)]",
            title: "text-[var(--app-heading)]",
          },
          warning: {
            root:
              "border-[color-mix(in_srgb,var(--app-warning)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--app-warning)_10%,var(--app-surface))] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-[var(--app-warning)]",
            title: "text-[var(--app-heading)]",
          },
        },
      },
    },
  },
});
