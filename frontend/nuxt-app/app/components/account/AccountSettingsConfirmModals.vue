<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";

const isDiscardOpen = defineModel<boolean>("discardOpen", { required: true });
const isDeleteOpen = defineModel<boolean>("deleteOpen", { required: true });

defineProps<{
  closeSettings: () => void;
}>();

const { translateText } = useTranslateText();
</script>

<template>
  <UModal
    v-model:open="isDiscardOpen"
    :title="String(translateText('Discard changes?'))"
    :description="String(translateText('Any unsaved account changes will be lost.'))"
    :ui="{
      content:
        'max-w-md rounded-md bg-white text-slate-950 ring-1 ring-slate-200',
    }"
  >
    <template #footer="{ close: closeDiscard }">
      <div class="flex w-full justify-end gap-2">
        <AppButton
          action="cancel"
          :label="String(translateText('Keep editing'))"
          @click="closeDiscard"
        />
        <AppButton
          action="delete"
          icon=""
          :label="String(translateText('Discard'))"
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
    :title="String(translateText('Delete account?'))"
    :description="String(translateText('This is a destructive action and cannot be undone.'))"
    :ui="{
      content:
        'max-w-md rounded-md bg-white text-slate-950 ring-1 ring-slate-200',
    }"
  >
    <template #body>
      <div
        class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ translateText("Deleting this account would remove profile details, preferences, and local session data.") }}
      </div>
    </template>
    <template #footer="{ close: closeDelete }">
      <div class="flex w-full justify-end gap-2">
        <AppButton action="cancel" @click="closeDelete" />
        <AppButton
          action="delete"
          :label="String(translateText('Delete account'))"
          @click="closeDelete"
        />
      </div>
    </template>
  </UModal>
</template>
