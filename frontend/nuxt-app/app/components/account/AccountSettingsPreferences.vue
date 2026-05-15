<script setup lang="ts">
import {
  accountChartTypeOptions,
  accountDefaultFilterOptions,
  accountDensityOptions,
  accountLanguageOptions,
  accountThemeModes,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import type { AuthRole } from "~/types/auth";

defineProps<{
  formState: AccountSettingsFormState;
  role: AuthRole;
}>();
</script>

<template>
  <section class="grid gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">Preference</h3>
      <p class="mt-1 text-sm text-slate-500">
        Set dashboard defaults based on how this role uses the system.
      </p>
    </div>

    <div class="grid gap-5">
      <div class="rounded-md border border-slate-200 bg-white p-5">
        <h4 class="font-bold text-slate-950">Display defaults</h4>

        <div class="mt-5 divide-y divide-slate-100">
          <div class="grid gap-3 py-4 first:pt-0">
            <div>
              <p class="text-sm font-semibold text-slate-950">Theme</p>
              <p class="mt-1 text-xs text-slate-500">
                Choose dashboard color mode.
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <UButton
                v-for="mode in accountThemeModes"
                :key="mode.value"
                type="button"
                color="neutral"
                variant="outline"
                class="!grid min-h-[112px] w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-md border p-4 text-left transition"
                :class="
                  formState.theme === mode.value
                    ? 'border-primary bg-primary-soft text-slate-950 ring-1 ring-primary/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                "
                @click="formState.theme = mode.value"
              >
                <span
                  class="row-span-2 grid size-9 shrink-0 place-items-center rounded-md"
                  :class="
                    formState.theme === mode.value
                      ? 'bg-white text-primary ring-1 ring-primary/20'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  <UIcon :name="mode.icon" class="size-4" />
                </span>
                <span class="block self-end text-sm font-bold leading-5">
                  {{ mode.label }}
                </span>
                <span class="block self-start text-xs leading-5 text-slate-500">
                  {{ mode.description }}
                </span>
              </UButton>
            </div>
          </div>

          <div
            class="grid gap-3 py-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
          >
            <div>
              <p class="text-sm font-semibold text-slate-950">Language</p>
              <p class="mt-1 text-xs text-slate-500">Interface language.</p>
            </div>
            <div
              class="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1"
            >
              <UButton
                v-for="option in accountLanguageOptions"
                :key="option.value"
                type="button"
                color="neutral"
                variant="ghost"
                class="rounded px-3 py-1.5 text-sm font-bold transition"
                :class="
                  formState.language === option.value
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                "
                @click="formState.language = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <div
            class="grid gap-3 py-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
          >
            <div>
              <p class="text-sm font-semibold text-slate-950">Chart type</p>
              <p class="mt-1 text-xs text-slate-500">Default chart style.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="option in accountChartTypeOptions"
                :key="option.value"
                type="button"
                color="neutral"
                variant="outline"
                class="rounded-md border px-3 py-2 text-sm font-bold capitalize transition"
                :class="
                  formState.chartType === option.value
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                "
                @click="formState.chartType = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <div
            class="grid gap-3 py-4 last:pb-0 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
          >
            <div>
              <p class="text-sm font-semibold text-slate-950">Table density</p>
              <p class="mt-1 text-xs text-slate-500">Table spacing.</p>
            </div>
            <div
              class="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1"
            >
              <UButton
                v-for="option in accountDensityOptions"
                :key="option.value"
                type="button"
                color="neutral"
                variant="ghost"
                class="rounded px-3 py-1.5 text-sm font-bold transition"
                :class="
                  formState.density === option.value
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                "
                @click="formState.density = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-md border border-slate-200 bg-white p-5">
        <h4 class="font-bold text-slate-950">Role-specific defaults</h4>

        <div class="mt-5 grid gap-4">
          <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-950">Default filter</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                v-for="option in accountDefaultFilterOptions"
                :key="option.value"
                type="button"
                color="neutral"
                variant="outline"
                class="rounded-md border px-3 py-2 text-sm font-bold transition"
                :class="
                  formState.defaultFilter === option.value
                    ? 'border-primary bg-white text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                "
                @click="formState.defaultFilter = option.value"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>

          <div v-if="role === 'manager'" class="grid gap-3 md:grid-cols-2">
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-950">
                Default dashboard page
              </p>
              <p class="mt-1 text-sm text-slate-500">Manager dashboard</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-950">
                Export format preference
              </p>
              <p class="mt-1 text-sm text-slate-500">XLSX reports</p>
            </div>
          </div>

          <div v-else-if="role === 'partner'" class="grid gap-3 md:grid-cols-2">
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-950">
                Default institute
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ formState.institution }}
              </p>
            </div>
            <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-950">
                Report view preference
              </p>
              <p class="mt-1 text-sm text-slate-500">Institute reports</p>
            </div>
          </div>

          <div
            v-else
            class="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-sm font-semibold text-slate-950">
              Visitor dashboard
            </p>
            <p class="mt-1 text-sm text-slate-500">
              Limited public charts with simple year-based filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
