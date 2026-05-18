<script setup lang="ts">
import {
  accountProfileFields,
  type AccountSettingsFormState,
} from "~/constants/accountSettings";
import type { AccessRoleCard } from "~/types/auth";

defineProps<{
  avatarSrc?: string | null;
  displayName: string;
  formState: AccountSettingsFormState;
  roleMeta: AccessRoleCard;
  userInitial: string;
}>();
</script>

<template>
  <section class="mx-auto grid w-full max-w-[720px] gap-5 p-6">
    <div>
      <h3 class="text-xl font-bold text-slate-950">User Profile</h3>
      <p class="mt-1 text-sm text-slate-500">
        Manage the report identity shown in menus and exports.
      </p>
    </div>

    <div class="grid gap-5">
      <div class="rounded-md border border-slate-200 bg-white p-5">
        <h4 class="flex items-center gap-2 font-bold text-slate-950">
          <span class="h-5 w-1 rounded bg-slate-300" />
          Profile details
        </h4>
        <p class="mt-1 text-sm text-slate-500">
          These fields identify the account owner in menus and exports.
        </p>

        <div class="mt-5 grid gap-4">
          <UFormField
            v-for="field in accountProfileFields.slice(0, 4)"
            :key="field.key"
            :label="field.label"
          >
            <UInput
              v-model="formState[field.key]"
              class="w-full"
              :type="field.type || 'text'"
            />
          </UFormField>
          <UFormField label="Dashboard role">
            <div
              class="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              <span
                class="grid size-8 shrink-0 place-items-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200"
              >
                <UIcon :name="roleMeta.icon" class="size-4" />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-bold text-slate-950">
                  {{ roleMeta.label }}
                </span>
                <span class="block text-xs text-slate-500">
                  {{ roleMeta.access }}
                </span>
              </span>
            </div>
          </UFormField>
          <UFormField
            v-for="field in accountProfileFields.slice(4)"
            :key="field.key"
            :label="field.label"
          >
            <UInput
              v-model="formState[field.key]"
              class="w-full"
              :type="field.type || 'text'"
            />
          </UFormField>
        </div>
      </div>

      <aside class="rounded-md border border-slate-200 bg-white p-5">
        <div
          class="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4"
        >
          <div>
            <h4 class="font-bold text-slate-950">Profile preview</h4>
            <p class="mt-1 text-sm text-slate-500">
              Shown in menus and exported reports.
            </p>
          </div>
          <span
            class="rounded bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-600"
          >
            Live
          </span>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            class="grid size-20 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200"
          >
            <UAvatar
              :src="avatarSrc ?? undefined"
              :text="userInitial"
              :alt="displayName"
              class="size-16"
            />
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="truncate text-base font-bold text-slate-950">
                {{ formState.displayName || displayName }}
              </h4>
              <span
                class="rounded bg-primary-muted px-2 py-1 text-xs font-bold text-primary"
              >
                {{ roleMeta.label }}
              </span>
            </div>

            <div
              class="mt-3 flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            >
              <UIcon
                name="i-lucide-school"
                class="mt-0.5 size-4 shrink-0 text-slate-500"
              />
              <span class="min-w-0 truncate font-semibold">
                {{ formState.institution }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
