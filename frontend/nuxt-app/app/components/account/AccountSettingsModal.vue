<script setup lang="ts">
import { useAccountSettingsForm } from "~/composables/account/useAccountSettingsForm";
import { useUserProfile } from "~/composables/account/useUserProfile";

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(
  defineProps<{
    initialSection?: string;
  }>(),
  {
    initialSection: "overview",
  },
);

const { displayEmail, displayName, email, handleSave, name, userInitial } =
  useAccountSettingsForm(open);
const { avatarSrc, displayRole } = useUserProfile();
const colorMode = useColorMode();

const activeSection = ref("overview");
const isDiscardOpen = ref(false);
const isDeleteOpen = ref(false);

const formState = reactive({
  displayName: "",
  username: "moodle.analyst",
  email: "",
  phone: "+855 12 345 678",
  role: "",
  institution: "Institute of Technology of Cambodia",
  reportSignature: "",
  newPassword: "",
  confirmPassword: "",
  theme: "system",
  density: "comfortable",
  accent: "dashboard",
});

const sections = [
  {
    label: "Overview",
    value: "overview",
    icon: "i-lucide-layout-dashboard",
    description: "Account snapshot",
  },
  {
    label: "User Profile",
    value: "profile",
    icon: "i-lucide-id-card",
    description: "Report identity",
  },
  {
    label: "Security",
    value: "security",
    icon: "i-lucide-shield-check",
    description: "Password access",
  },
  {
    label: "Appearance",
    value: "appearance",
    icon: "i-lucide-palette",
    description: "Theme display",
  },
  {
    label: "Preferences",
    value: "preferences",
    icon: "i-lucide-sliders-horizontal",
    description: "Interface defaults",
  },
];

const themeModes = [
  {
    label: "System",
    value: "system",
    icon: "i-lucide-monitor",
    description: "Follow device setting",
  },
  {
    label: "Light",
    value: "light",
    icon: "i-lucide-sun",
    description: "Bright dashboard UI",
  },
  {
    label: "Dark",
    value: "dark",
    icon: "i-lucide-moon",
    description: "Low-light workspace",
  },
];

const densityOptions = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

function normalizeSection(section: string) {
  if (section === "account") return "overview";
  if (section === "personal-info") return "profile";

  return sections.some((item) => item.value === section) ? section : "overview";
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return;

    activeSection.value = normalizeSection(props.initialSection);
    formState.displayName = name.value || displayName.value;
    formState.email = email.value || displayEmail.value;
    formState.role = displayRole.value;
    formState.reportSignature = name.value || displayName.value;
    formState.newPassword = "";
    formState.confirmPassword = "";
    formState.theme = colorMode.preference;
  },
  { immediate: true },
);

watch(
  () => formState.theme,
  (theme) => {
    colorMode.preference = theme;
  },
);

function saveAndClose(close: () => void) {
  name.value = formState.displayName.trim();
  email.value = formState.email.trim();
  handleSave(close);
}
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
        <aside
          class="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r"
        >
          <div class="border-b border-slate-200 bg-white p-5">
            <div class="flex items-center gap-3">
              <span
                class="grid size-12 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200"
              >
                <UAvatar
                  :src="avatarSrc"
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
            class="min-h-0 flex-1 overflow-y-auto p-3"
            aria-label="Account settings"
          >
            <button
              v-for="section in sections"
              :key="section.value"
              type="button"
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
                    ? 'bg-white text-[#075A9B] ring-1 ring-slate-200'
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
            </button>
          </nav>

          <div class="border-t border-slate-200 p-3">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600"
              @click="isDeleteOpen = true"
            >
              <UIcon name="i-lucide-trash-2" class="size-4" />
              Delete Account
            </button>
          </div>
        </aside>

        <main class="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
          <div class="min-h-0 overflow-y-auto">
            <Transition name="settings-fade" mode="out-in">
              <section
                v-if="activeSection === 'overview'"
                key="overview"
                class="grid gap-2 px-4 py-6"
              >
                <div class="pr-12">
                  <h3 class="text-xl font-bold text-slate-950">Overview</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Review account status and access across the analytics
                    dashboard.
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
                            :src="avatarSrc"
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
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Dashboard role
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          {{ formState.role || displayRole }}
                        </dd>
                      </div>
                      <div
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Username
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          {{ formState.username }}
                        </dd>
                      </div>
                      <div
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Institution
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          {{ formState.institution }}
                        </dd>
                      </div>
                    </div>
                  </div>

                  <aside
                    class="rounded-md border border-slate-200 bg-white p-5"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <h4 class="font-bold text-slate-950">Access status</h4>
                      <span
                        class="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                      >
                        Good
                      </span>
                    </div>
                    <div class="mt-5 grid gap-3 text-sm">
                      <div
                        class="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"
                      >
                        <span class="text-slate-500">Sessions</span>
                        <strong class="text-slate-950">3 active</strong>
                      </div>
                      <div
                        class="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"
                      >
                        <span class="text-slate-500">Alerts</span>
                        <strong class="text-slate-950">0 open</strong>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span class="text-slate-500">Report exports</span>
                        <strong class="text-slate-950">Enabled</strong>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>

              <section
                v-else-if="activeSection === 'profile'"
                key="profile"
                class="grid gap-5 p-6"
              >
                <div>
                  <h3 class="text-xl font-bold text-slate-950">User Profile</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Manage the report identity shown in menus and exports.
                  </p>
                </div>

                <div class="grid gap-5">
                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <h4
                      class="flex items-center gap-2 font-bold text-slate-950"
                    >
                      <span class="h-5 w-1 rounded bg-slate-300" />
                      Profile details
                    </h4>
                    <p class="mt-1 text-sm text-slate-500">
                      These fields identify the account owner in menus and
                      exports.
                    </p>

                    <div class="mt-5 grid gap-4">
                      <UFormField label="Display name">
                        <UInput
                          v-model="formState.displayName"
                          class="w-full"
                        />
                      </UFormField>
                      <UFormField label="Email">
                        <UInput
                          v-model="formState.email"
                          class="w-full"
                          type="email"
                        />
                      </UFormField>
                      <UFormField label="Username">
                        <UInput v-model="formState.username" class="w-full" />
                      </UFormField>
                      <UFormField label="Phone">
                        <UInput
                          v-model="formState.phone"
                          class="w-full"
                          type="tel"
                        />
                      </UFormField>
                      <UFormField label="Dashboard role">
                        <UInput v-model="formState.role" class="w-full" />
                      </UFormField>
                      <UFormField label="Institution">
                        <UInput
                          v-model="formState.institution"
                          class="w-full"
                        />
                      </UFormField>
                      <UFormField label="Report signature">
                        <UInput
                          v-model="formState.reportSignature"
                          class="w-full"
                        />
                      </UFormField>
                    </div>
                  </div>

                  <aside
                    class="rounded-md border border-slate-200 bg-white p-5"
                  >
                    <div
                      class="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4"
                    >
                      <div>
                        <h4 class="font-bold text-slate-950">
                          Profile preview
                        </h4>
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

                    <div
                      class="flex flex-col gap-4 sm:flex-row sm:items-center"
                    >
                      <span
                        class="grid size-20 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200"
                      >
                        <UAvatar
                          :src="avatarSrc"
                          :text="userInitial"
                          :alt="displayName"
                          class="size-16"
                        />
                      </span>

                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <h4
                            class="truncate text-base font-bold text-slate-950"
                          >
                            {{ formState.displayName || displayName }}
                          </h4>
                          <span
                            class="rounded bg-[#E8F2FA] px-2 py-1 text-xs font-bold text-[#075A9B]"
                          >
                            {{ formState.role || displayRole }}
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

              <section
                v-else-if="activeSection === 'security'"
                key="security"
                class="grid gap-5 p-6"
              >
                <div>
                  <h3 class="text-xl font-bold text-slate-950">Security</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Protect access to Moodle analytics and local reports.
                  </p>
                </div>

                <div class="rounded-md border border-slate-200 bg-white p-5">
                  <h4 class="flex items-center gap-2 font-bold text-slate-950">
                    <span class="h-5 w-1 rounded bg-slate-300" />
                    Password
                  </h4>

                  <div class="mt-5 grid gap-4">
                    <UFormField label="New password">
                      <UInput
                        v-model="formState.newPassword"
                        class="w-full"
                        type="password"
                      />
                    </UFormField>
                    <UFormField label="Confirm password">
                      <UInput
                        v-model="formState.confirmPassword"
                        class="w-full"
                        type="password"
                      />
                    </UFormField>
                  </div>

                  <div
                    class="mt-5 flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="mt-0.5 size-4 shrink-0"
                    />
                    <p>
                      Two-factor authentication can be added later when backend
                      verification is connected.
                    </p>
                  </div>
                </div>
              </section>

              <section
                v-else-if="activeSection === 'appearance'"
                key="appearance"
                class="grid gap-5 p-6"
              >
                <div>
                  <h3 class="text-xl font-bold text-slate-950">Appearance</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Set the dashboard theme and visual density for analytics
                    work.
                  </p>
                </div>

                <div class="grid gap-5">
                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <h4
                      class="flex items-center gap-2 font-bold text-slate-950"
                    >
                      <span class="h-5 w-1 rounded bg-slate-300" />
                      Theme
                    </h4>
                    <p class="mt-1 text-sm text-slate-500">
                      Choose how the dashboard should appear on this device.
                    </p>

                    <div class="mt-5 grid gap-3 sm:grid-cols-3">
                      <button
                        v-for="mode in themeModes"
                        :key="mode.value"
                        type="button"
                        class="rounded-md border p-4 text-left transition"
                        :class="
                          formState.theme === mode.value
                            ? 'border-[#075A9B] bg-[#F3F8FC] text-slate-950 ring-1 ring-[#075A9B]/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        "
                        @click="formState.theme = mode.value"
                      >
                        <span
                          class="grid size-9 place-items-center rounded-md"
                          :class="
                            formState.theme === mode.value
                              ? 'bg-white text-[#075A9B] ring-1 ring-[#075A9B]/20'
                              : 'bg-slate-100 text-slate-500'
                          "
                        >
                          <UIcon :name="mode.icon" class="size-4" />
                        </span>
                        <span class="mt-3 block text-sm font-bold">
                          {{ mode.label }}
                        </span>
                        <span class="mt-1 block text-xs text-slate-500">
                          {{ mode.description }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <h4
                      class="flex items-center gap-2 font-bold text-slate-950"
                    >
                      <span class="h-5 w-1 rounded bg-slate-300" />
                      Dashboard display
                    </h4>

                    <div
                      class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"
                    >
                      <div class="grid gap-4">
                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Table density
                          </p>
                          <div
                            class="mt-2 inline-flex rounded-md border border-slate-200 bg-slate-50 p-1"
                          >
                            <button
                              v-for="option in densityOptions"
                              :key="option.value"
                              type="button"
                              class="rounded px-3 py-1.5 text-sm font-bold transition"
                              :class="
                                formState.density === option.value
                                  ? 'bg-white text-slate-950 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-950'
                              "
                              @click="formState.density = option.value"
                            >
                              {{ option.label }}
                            </button>
                          </div>
                        </div>

                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Accent color
                          </p>
                          <div class="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition"
                              :class="
                                formState.accent === 'dashboard'
                                  ? 'border-[#075A9B] bg-[#F3F8FC] text-[#075A9B]'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              "
                              @click="formState.accent = 'dashboard'"
                            >
                              <span class="size-3 rounded-sm bg-[#075A9B]" />
                              Dashboard blue
                            </button>
                            <button
                              type="button"
                              class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition"
                              :class="
                                formState.accent === 'neutral'
                                  ? 'border-slate-400 bg-slate-100 text-slate-950'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              "
                              @click="formState.accent = 'neutral'"
                            >
                              <span class="size-3 rounded-sm bg-slate-500" />
                              Neutral
                            </button>
                          </div>
                        </div>
                      </div>

                      <aside
                        class="rounded-md border border-slate-200 bg-slate-50 p-4"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <span
                            class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                          >
                            Preview
                          </span>
                          <span
                            class="rounded bg-white px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                          >
                            {{ formState.theme }}
                          </span>
                        </div>
                        <div
                          class="mt-4 rounded-md border border-slate-200 bg-white p-3"
                        >
                          <div class="flex items-center justify-between">
                            <span class="text-sm font-bold text-slate-950">
                              Completion rate
                            </span>
                            <span
                              class="text-sm font-bold"
                              :class="
                                formState.accent === 'dashboard'
                                  ? 'text-[#075A9B]'
                                  : 'text-slate-700'
                              "
                            >
                              84%
                            </span>
                          </div>
                          <div class="mt-3 h-2 rounded bg-slate-100">
                            <div
                              class="h-2 rounded"
                              :class="
                                formState.accent === 'dashboard'
                                  ? 'bg-[#075A9B]'
                                  : 'bg-slate-500'
                              "
                              style="width: 84%"
                            />
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                </div>
              </section>

              <section v-else key="preferences" class="grid gap-5 p-6">
                <div>
                  <h3 class="text-xl font-bold text-slate-950">Preferences</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Small interface defaults for repeated dashboard work.
                  </p>
                </div>

                <div
                  class="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white p-5"
                >
                  <label
                    class="flex items-center justify-between gap-4 py-3 first:pt-0"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Compact dashboard tables
                      </span>
                      <span class="block text-sm text-slate-500">
                        Use tighter spacing for scanning cohorts.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>
                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Email report alerts
                      </span>
                      <span class="block text-sm text-slate-500">
                        Notify me when scheduled exports finish.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>
                  <label
                    class="flex items-center justify-between gap-4 py-3 last:pb-0"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Reduce motion
                      </span>
                      <span class="block text-sm text-slate-500">
                        Keep modal transitions minimal.
                      </span>
                    </span>
                    <input type="checkbox" class="size-4 accent-[#075A9B]" />
                  </label>
                </div>
              </section>
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
              class="rounded-md bg-[#075A9B] hover:bg-[#064B82]"
              @click="saveAndClose(close)"
            />
          </footer>
        </main>
      </div>

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
                  close();
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
</style>
