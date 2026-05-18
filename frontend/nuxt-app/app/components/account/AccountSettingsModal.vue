<script setup lang="ts">
import { useAccountSettingsModal } from "~/composables/account/useAccountSettingsModal";

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(
  defineProps<{
    initialSection?: string;
  }>(),
  {
    initialSection: "overview",
  },
);

const {
  activeRole,
  activeRoleMeta,
  activeSection,
  avatarSrc,
  displayEmail,
  displayName,
  formState,
  isDeleteOpen,
  isDiscardOpen,
  roleCapabilities,
  saveAndClose,
  userInitial,
  visibleSections,
} = useAccountSettingsModal({
  initialSection: toRef(props, "initialSection"),
  open,
});
</script>

<template>
  <UModal
    v-model:open="open"
    title="Account settings"
    description="Manage dashboard account details."
    :ui="{
      content:
        'w-[90vw] max-w-[1080px] overflow-hidden rounded-md bg-white ring-1 ring-slate-200',
      body: '!overflow-hidden !p-0 sm:!p-0',
      header: 'hidden',
    }"
  >
    <template #body="{ close }">
      <div
        class="grid h-[760px] max-h-[90vh] bg-[#f5f7fb] text-[#172033] lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <AccountSettingsSidebar
          v-model:active-section="activeSection"
          v-model:delete-open="isDeleteOpen"
          :avatar-src="avatarSrc"
          :can-delete-account="roleCapabilities.canDeleteAccount"
          :display-email="displayEmail"
          :display-name="displayName"
          :sections="visibleSections"
          :user-initial="userInitial"
        />

        <main class="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
          <div class="settings-scrollbar min-h-0 overflow-y-auto">
            <Transition name="settings-fade" mode="out-in">
              <AccountSettingsOverview
                v-if="activeSection === 'overview'"
                key="overview"
                :active-role="activeRole"
                :avatar-src="avatarSrc"
                :display-email="displayEmail"
                :display-name="displayName"
                :form-state="formState"
                :role-meta="activeRoleMeta"
                :user-initial="userInitial"
              />
              <AccountSettingsProfile
                v-else-if="activeSection === 'profile'"
                key="profile"
                :avatar-src="avatarSrc"
                :display-name="displayName"
                :form-state="formState"
                :role-meta="activeRoleMeta"
                :user-initial="userInitial"
              />
              <AccountSettingsSecurity
                v-else-if="activeSection === 'security'"
                key="security"
                :form-state="formState"
              />
              <AccountSettingsPreferences
                v-else-if="activeSection === 'preferences'"
                key="preferences"
                :form-state="formState"
                :role="activeRole"
              />
              <AccountSettingsNotifications
                v-else
                key="notifications"
                :form-state="formState"
                :role="activeRole"
              />
            </Transition>
          </div>

          <footer
            class="flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4"
          >
            <UButton
              color="neutral"
              variant="outline"
              label="Cancel"
              class="rounded-md"
              @click="isDiscardOpen = true"
            />
            <UButton
              icon="i-lucide-save"
              label="Save Changes"
              class="rounded-md bg-primary hover:bg-primary-hover"
              @click="saveAndClose(close)"
            />
          </footer>
        </main>
      </div>

      <AccountSettingsConfirmModals
        v-model:discard-open="isDiscardOpen"
        v-model:delete-open="isDeleteOpen"
        :close-settings="close"
      />
    </template>
  </UModal>
</template>

<style scoped>
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 120ms ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
}

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
