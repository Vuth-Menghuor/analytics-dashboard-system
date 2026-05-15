<script setup lang="ts">
import type { AccountSettingsFormState } from "~/constants/accountSettings";
import type { AccessRoleCard, AuthRole } from "~/types/auth";

defineProps<{
  activeRole: AuthRole;
  avatarSrc?: string | null;
  displayEmail: string;
  displayName: string;
  formState: AccountSettingsFormState;
  roleMeta: AccessRoleCard;
  userInitial: string;
}>();
</script>

<template>
  <section class="grid gap-2 px-4 py-6">
    <div class="pr-12">
      <h3 class="text-xl font-bold text-slate-950">Overview</h3>
      <p class="mt-1 text-sm text-slate-500">
        Review account status and access across the analytics dashboard.
      </p>
    </div>

    <div class="grid gap-5">
      <div class="rounded-md border border-slate-200 bg-white p-5">
        <div
          class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
        >
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
                Signed in as
              </p>
              <h4 class="mt-1 text-lg font-bold text-slate-950">
                {{ formState.displayName || displayName }}
              </h4>
              <p class="mt-1 text-sm text-slate-500">
                {{ formState.email || displayEmail }}
              </p>
            </div>
          </div>

          <div
            class="flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
          >
            <span class="size-2 rounded-full bg-emerald-500" />
            Active account
          </div>
        </div>

        <div
          class="mt-5 divide-y divide-slate-100 border-t border-slate-100 pt-1"
        >
          <div
            v-for="item in [
              { label: 'Email', value: formState.email || displayEmail },
              { label: 'Phone number', value: formState.phone },
              { label: 'Password', value: 'Enabled' },
              { label: 'Username', value: formState.username },
              { label: 'Institution', value: formState.institution },
            ]"
            :key="item.label"
            class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
          >
            <dt class="text-sm font-semibold text-slate-500">
              {{ item.label }}
            </dt>
            <dd class="text-sm font-bold text-slate-950">
              {{ item.value }}
            </dd>
          </div>

          <div
            class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
          >
            <dt class="text-sm font-semibold text-slate-500">Dashboard role</dt>
            <dd
              class="flex items-center gap-2 text-sm font-bold text-slate-950"
            >
              <span
                class="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              >
                <UIcon :name="roleMeta.icon" class="size-4" />
              </span>
              <span>{{ roleMeta.label }}</span>
            </dd>
          </div>
        </div>
      </div>

      <AccountAccessSummary
        :institution="formState.institution"
        :role="activeRole"
        :role-meta="roleMeta"
      />
    </div>
  </section>
</template>
