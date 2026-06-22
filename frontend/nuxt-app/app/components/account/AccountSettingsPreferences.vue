<script setup lang="ts">
import {
  accountThemeModes,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import AppOptionCardGroup from "~/components/common/AppOptionCardGroup.vue";

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
            <AppOptionCardGroup
              v-model="formState.theme"
              :options="accountThemeModes"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
