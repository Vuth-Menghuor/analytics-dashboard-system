<script setup lang="ts">
import { accountAccessSummaries } from "~/constants/accountSettings";
import type { AccessRoleCard, AuthRole } from "~/types/auth";

const props = defineProps<{
  institution: string;
  role: AuthRole;
  roleMeta: AccessRoleCard;
}>();

const summary = computed(() => accountAccessSummaries[props.role]);

const scopeValue = computed(() =>
  summary.value.scopeValue.replace("{{institution}}", props.institution),
);

const capabilityGridClass = computed(() =>
  summary.value.capabilities.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
);

const actionGridClass = computed(() =>
  summary.value.actions.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
);

const badgeClass = computed(() =>
  summary.value.badgeTone === "success"
    ? "bg-white text-emerald-700 ring-emerald-100"
    : "bg-white text-slate-600 ring-slate-200",
);
</script>

<template>
  <div class="rounded-md border border-slate-200 bg-white p-5">
    <div
      class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex items-start gap-3">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 ring-1 ring-slate-200"
        >
          <UIcon :name="roleMeta.icon" class="size-5" />
        </span>
        <div>
          <h4 class="font-bold text-slate-950">Access summary</h4>
          <p class="mt-1 text-sm text-slate-500">
            {{ roleMeta.label }} · {{ roleMeta.access }}
          </p>
        </div>
      </div>
      <span
        class="w-fit rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
      >
        Read only
      </span>
    </div>

    <div class="mt-4 grid gap-4">
      <div
        class="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      >
        <div>
          <p
            class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
          >
            {{ summary.scopeLabel }}
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-950">
            {{ scopeValue }}
          </p>
        </div>
        <div
          class="flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold ring-1"
          :class="badgeClass"
        >
          <UIcon
            v-if="summary.badgeIcon"
            :name="summary.badgeIcon"
            class="size-4"
          />
          <span v-else class="size-2 rounded-full bg-emerald-500" />
          {{ summary.badgeLabel }}
        </div>
      </div>

      <div class="grid gap-2 text-sm" :class="capabilityGridClass">
        <div
          v-for="item in summary.capabilities"
          :key="item.label"
          class="flex gap-3 rounded-md border border-slate-200 p-3"
          :class="
            item.muted
              ? 'bg-slate-50 text-slate-500'
              : 'bg-white text-slate-700'
          "
        >
          <UIcon
            :name="item.icon"
            class="mt-0.5 size-4 shrink-0"
            :class="item.muted ? '' : 'text-slate-500'"
          />
          <span class="text-sm">{{ item.label }}</span>
        </div>
      </div>

      <div
        class="grid gap-2 border-t border-slate-100 pt-3 text-sm"
        :class="actionGridClass"
      >
        <UButton
          v-for="item in summary.actions"
          :key="item.label"
          type="button"
          color="neutral"
          variant="outline"
          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <UIcon
            :name="item.icon"
            class="mt-0.5 size-4 shrink-0 text-slate-500"
          />
          <span class="text-sm">{{ item.label }}</span>
        </UButton>
      </div>
    </div>
  </div>
</template>
