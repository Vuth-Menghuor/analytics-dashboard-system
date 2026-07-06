<script setup lang="ts">
import {
  accountOverviewDetailItems,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import AppButton from "~/components/common/AppButton.vue";
import type { AccessRoleCard } from "~/types/auth";

const props = defineProps<{
  avatarSrc?: string | null;
  displayEmail: string;
  displayName: string;
  formState: AccountSettingsFormState;
  roleMeta: AccessRoleCard;
  userInitial: string;
}>();

const emit = defineEmits<{
  navigate: [section: "profile" | "security"];
}>();

const { translateText } = useTranslateText();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const getDetailValue = (
  item: (typeof accountOverviewDetailItems)[number],
  formState: AccountSettingsFormState,
  displayEmail: string,
) => {
  if ("value" in item) return item.value;
  if (item.key === "email") return formState.email || displayEmail;

  return formState[item.key];
};

const findOptionLabel = (
  options: { label: string; value: string }[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? value;

const preferenceSummaryItems = computed(() => [
  {
    icon: "i-lucide-palette",
    label: "Theme",
    value: findOptionLabel(
      [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
      isMounted.value ? props.formState.theme : "system",
    ),
  },
]);
</script>

<template>
  <section class="grid gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">{{ translateText("Overview") }}</h3>
      <p class="mt-1 text-sm text-slate-500">
        {{ translateText("Review the current account, dashboard defaults, and alert status.") }}
      </p>
    </div>

    <div
      class="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] xl:items-start"
    >
      <div class="rounded-md border border-slate-200 bg-white p-5">
        <div class="flex min-w-0 gap-4">
          <span
            class="grid size-14 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200"
          >
            <UAvatar
              :src="avatarSrc ?? undefined"
              :text="userInitial"
              :alt="displayName"
              class="size-12"
            />
          </span>
          <div class="min-w-0">
            <p
              class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
            >
              {{ translateText("Signed in as") }}
            </p>
            <h4 class="mt-1 truncate text-lg font-bold text-slate-950">
              {{ formState.displayName || displayName }}
            </h4>
            <p class="mt-1 truncate text-sm text-slate-500">
              {{ formState.email || displayEmail }}
            </p>
          </div>
        </div>

        <div
          class="account-overview-detail-list mt-5 grid gap-0 pt-1 md:grid-cols-2"
        >
          <div
            v-for="item in accountOverviewDetailItems"
            :key="item.label"
            class="account-overview-detail-row grid gap-1 px-0 py-3 md:px-3 first:md:pl-0"
          >
            <dt class="text-sm font-semibold text-slate-500">
              {{ translateText(item.label) }}
            </dt>
            <dd class="truncate text-sm font-bold text-slate-950">
              {{ translateText(getDetailValue(item, formState, displayEmail)) }}
            </dd>
          </div>

          <div class="account-overview-detail-row grid gap-1 px-0 py-3 md:px-3">
            <dt class="text-sm font-semibold text-slate-500">{{ translateText("Dashboard role") }}</dt>
            <dd
              class="flex items-center gap-2 text-sm font-bold text-slate-950"
            >
              <span
                class="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              >
                <UIcon :name="roleMeta.icon" class="size-4" />
              </span>
              <span>{{ translateText(roleMeta.label) }}</span>
            </dd>
          </div>
        </div>
      </div>

      <aside class="grid gap-5">
        <div class="rounded-md border border-slate-200 bg-white p-5">
          <h4 class="font-bold text-slate-950">{{ translateText("Quick actions") }}</h4>
          <p class="mt-1 text-sm text-slate-500">
            {{ translateText("Jump to the settings that are changed most often.") }}
          </p>

          <div class="mt-4 grid gap-2">
            <AppButton
              type="button"
              color="neutral"
              variant="outline"
              size="sm"
              block
              class="justify-start"
              icon="i-lucide-user-pen"
              :label="String(translateText('Edit profile'))"
              @click="emit('navigate', 'profile')"
            />
            <AppButton
              type="button"
              color="neutral"
              variant="outline"
              size="sm"
              block
              class="justify-start"
              icon="i-lucide-lock-keyhole"
              :label="String(translateText('Change password'))"
              @click="emit('navigate', 'security')"
            />
          </div>
        </div>

        <div class="rounded-md border border-slate-200 bg-white p-5">
          <h4 class="font-bold text-slate-950">{{ translateText("Appearance") }}</h4>
          <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div
              v-for="item in preferenceSummaryItems"
              :key="item.label"
              class="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <span
                class="grid size-8 shrink-0 place-items-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200"
              >
                <UIcon :name="item.icon" class="size-4" />
              </span>
              <span class="min-w-0">
                <span class="block text-xs font-semibold text-slate-500">
                  {{ translateText(item.label) }}
                </span>
                <span class="block truncate text-sm font-bold text-slate-950">
                  {{ translateText(item.value) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
