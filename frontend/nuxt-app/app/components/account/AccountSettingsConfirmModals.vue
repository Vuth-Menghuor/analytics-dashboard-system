<script setup lang="ts">
const isDiscardOpen = defineModel<boolean>("discardOpen", { required: true });
const isDeleteOpen = defineModel<boolean>("deleteOpen", { required: true });

defineProps<{
  closeSettings: () => void;
}>();
</script>

<template>
  <UModal
    v-model:open="isDiscardOpen"
    title="Discard changes?"
    description="Any unsaved account changes will be lost."
    :ui="{
      content:
        'max-w-md rounded-md bg-white text-slate-950 ring-1 ring-slate-200',
    }"
  >
    <template #footer="{ close: closeDiscard }">
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="Keep editing"
          @click="closeDiscard"
        />
        <UButton
          color="error"
          label="Discard"
          @click="
            () => {
              closeDiscard();
              closeSettings();
            }
          "
        />
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="isDeleteOpen"
    title="Delete account?"
    description="This is a destructive action and cannot be undone."
    :ui="{
      content:
        'max-w-md rounded-md bg-white text-slate-950 ring-1 ring-slate-200',
    }"
  >
    <template #body>
      <div
        class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        Deleting this account would remove profile details, preferences, and
        local session data.
      </div>
    </template>
    <template #footer="{ close: closeDelete }">
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="Cancel"
          @click="closeDelete"
        />
        <UButton
          color="error"
          icon="i-lucide-trash-2"
          label="Delete account"
          @click="closeDelete"
        />
      </div>
    </template>
  </UModal>
</template>
