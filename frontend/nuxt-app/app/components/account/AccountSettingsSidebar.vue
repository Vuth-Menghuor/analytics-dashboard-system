<script setup lang="ts">
import type { AccountSettingsSection } from "~/constants/accountSettings";

const activeSection = defineModel<string>("activeSection", { required: true });
const isDeleteOpen = defineModel<boolean>("deleteOpen", { required: true });

defineProps<{
  avatarSrc?: string | null;
  canDeleteAccount: boolean;
  displayEmail: string;
  displayName: string;
  sections: AccountSettingsSection[];
  userInitial: string;
}>();
</script>

<template>
  <aside
    class="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r"
  >
    <div class="border-b border-slate-200 bg-white p-5">
      <div class="flex items-center gap-3">
        <span
          class="grid size-12 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200"
        >
          <UAvatar
            :src="avatarSrc ?? undefined"
            :text="userInitial"
            :alt="displayName"
            class="size-10"
          />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-950">
            {{ displayName }}
          </p>
          <p class="truncate text-xs text-slate-500">
            {{ displayEmail }}
          </p>
        </div>
      </div>
    </div>

    <nav
      class="settings-scrollbar min-h-0 flex-1 overflow-y-auto p-3"
      aria-label="Account settings"
    >
      <UButton
        v-for="section in sections"
        :key="section.value"
        type="button"
        color="neutral"
        variant="ghost"
        class="mb-1 flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition"
        :class="
          activeSection === section.value
            ? 'border-slate-300 bg-slate-100 text-slate-950'
            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        "
        @click="activeSection = section.value"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-md"
          :class="
            activeSection === section.value
              ? 'bg-white text-primary ring-1 ring-slate-200'
              : 'bg-slate-100 text-slate-500'
          "
        >
          <UIcon :name="section.icon" class="size-4" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-bold">{{ section.label }}</span>
          <span class="block truncate text-xs opacity-75">
            {{ section.description }}
          </span>
        </span>
      </UButton>
    </nav>

    <div v-if="canDeleteAccount" class="border-t border-slate-200 p-3">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600"
        @click="isDeleteOpen = true"
      >
        <UIcon name="i-lucide-trash-2" class="size-4" />
        Delete Account
      </UButton>
    </div>
  </aside>
</template>

<style scoped>
.settings-scrollbar {
  scrollbar-color: #cbd5e1 transparent;
  scrollbar-width: thin;
}

.settings-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.settings-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.settings-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.settings-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
