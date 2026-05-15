<script setup lang="ts">
import { useAccountSettingsForm } from "~/composables/account/useAccountSettingsForm";
import { useUserProfile } from "~/composables/account/useUserProfile";
import { accessRoleCards } from "~/constants/auth";

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
  position: "",
  institution: "Institute of Technology of Cambodia",
  reportSignature: "",
  newPassword: "",
  confirmPassword: "",
  language: "en",
  chartType: "bar",
  defaultFilter: "institute",
  notifyEmail: true,
  notifyApproval: true,
  notifyReports: true,
  notifySystem: true,
  securityAlerts: true,
  dataExports: true,
  accessRequests: true,
  sessionTimeout: "30",
  twoFactor: false,
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
    label: "Preference",
    value: "preferences",
    icon: "i-lucide-sliders-horizontal",
    description: "UI defaults",
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: "i-lucide-bell-ring",
    description: "Alert settings",
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

const languageOptions = [
  { label: "English", value: "en" },
  { label: "Khmer", value: "km" },
];

const chartTypeOptions = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
  { label: "Pie", value: "pie" },
];

const defaultFilterOptions = [
  { label: "Institute", value: "institute" },
  { label: "Year", value: "year" },
  { label: "Department", value: "department" },
];

const sessionTimeoutOptions = [
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "60 min", value: "60" },
];

const roleMetaByValue = Object.fromEntries(
  accessRoleCards.map((role) => [role.value, role]),
) as Record<string, (typeof accessRoleCards)[number]>;

const activeRoleMeta = computed(() => {
  return (
    roleMetaByValue[displayRole.value] ?? {
      label: displayRole.value,
      access: "Account access",
      description: "Role information unavailable",
      icon: "i-lucide-shield",
      value: displayRole.value,
    }
  );
});

const roleCapabilities = computed(() => {
  switch (displayRole.value) {
    case "manager":
      return {
        canEditInstitute: true,
        canEditSecurity: true,
        canDeleteAccount: false,
        canSeeAdminAccess: true,
        canEditPreferences: true,
        canEditNotifications: true,
      };
    case "partner":
      return {
        canEditInstitute: true,
        canEditSecurity: true,
        canDeleteAccount: false,
        canSeeAdminAccess: false,
        canEditPreferences: true,
        canEditNotifications: true,
      };
    default:
      return {
        canEditInstitute: false,
        canEditSecurity: false,
        canDeleteAccount: false,
        canSeeAdminAccess: false,
        canEditPreferences: true,
        canEditNotifications: true,
      };
  }
});

const visibleSections = computed(() =>
  sections.filter((section) => {
    if (section.value === "security")
      return roleCapabilities.value.canEditSecurity;
    if (section.value === "preferences")
      return roleCapabilities.value.canEditPreferences;
    if (section.value === "notifications")
      return roleCapabilities.value.canEditNotifications;
    return true;
  }),
);

function normalizeSection(section: string) {
  if (section === "account") return "overview";
  if (section === "personal-info") return "profile";
  if (section === "appearance") return "preferences";
  if (section === "role" || section === "role-access") return "overview";

  return visibleSections.value.some((item) => item.value === section)
    ? section
    : "overview";
}

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return;

    activeSection.value = normalizeSection(props.initialSection);
    formState.displayName = name.value || displayName.value;
    formState.email = email.value || displayEmail.value;
    formState.position = activeRoleMeta.value.label;
    formState.institution =
      displayRole.value === "visitor" ? "Public access" : formState.institution;
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
            class="settings-scrollbar min-h-0 flex-1 overflow-y-auto p-3"
            aria-label="Account settings"
          >
            <button
              v-for="section in visibleSections"
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

          <div
            v-if="roleCapabilities.canDeleteAccount"
            class="border-t border-slate-200 p-3"
          >
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
          <div class="settings-scrollbar min-h-0 overflow-y-auto">
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
                          Email
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          {{ formState.email || displayEmail }}
                        </dd>
                      </div>
                      <div
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Phone number
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          {{ formState.phone }}
                        </dd>
                      </div>
                      <div
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Password
                        </dt>
                        <dd class="text-sm font-bold text-slate-950">
                          Enabled
                        </dd>
                      </div>
                      <div
                        class="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                      >
                        <dt class="text-sm font-semibold text-slate-500">
                          Dashboard role
                        </dt>
                        <dd
                          class="flex items-center gap-2 text-sm font-bold text-slate-950"
                        >
                          <span
                            class="grid size-7 place-items-center rounded-md bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                          >
                            <UIcon :name="activeRoleMeta.icon" class="size-4" />
                          </span>
                          <span>{{ activeRoleMeta.label }}</span>
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

                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <div
                      class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div class="flex items-start gap-3">
                        <span
                          class="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                        >
                          <UIcon :name="activeRoleMeta.icon" class="size-5" />
                        </span>
                        <div>
                          <h4 class="font-bold text-slate-950">
                            Access summary
                          </h4>
                          <p class="mt-1 text-sm text-slate-500">
                            {{ activeRoleMeta.label }} ·
                            {{ activeRoleMeta.access }}
                          </p>
                        </div>
                      </div>
                      <span
                        class="w-fit rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                      >
                        Read only
                      </span>
                    </div>

                    <div
                      v-if="displayRole === 'partner'"
                      class="mt-4 grid gap-4"
                    >
                      <div
                        class="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div>
                          <p
                            class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                          >
                            Assigned institute
                          </p>
                          <p class="mt-1 text-sm font-semibold text-slate-950">
                            {{ formState.institution }}
                          </p>
                        </div>
                        <div
                          class="flex w-fit items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
                        >
                          <span class="size-2 rounded-full bg-emerald-500" />
                          Active access
                        </div>
                      </div>

                      <div class="grid gap-2 text-sm md:grid-cols-2">
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-eye"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">View assigned institute data</span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-school"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Update institute profile</span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-file-check-2"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">
                            Submit and review institute reports
                          </span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-send"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">
                            Request access changes from a manager
                          </span>
                        </div>
                      </div>

                      <div
                        class="grid gap-2 border-t border-slate-100 pt-3 text-sm md:grid-cols-3"
                      >
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-send"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Request access change</span>
                        </button>
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-school"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">View institute profile</span>
                        </button>
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-message-circle"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Contact manager</span>
                        </button>
                      </div>
                    </div>

                    <div
                      v-else-if="displayRole === 'manager'"
                      class="mt-4 grid gap-4"
                    >
                      <div
                        class="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div>
                          <p
                            class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                          >
                            Access scope
                          </p>
                          <p class="mt-1 text-sm font-semibold text-slate-950">
                            All institutes and partner requests
                          </p>
                        </div>
                        <div
                          class="flex w-fit items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
                        >
                          <span class="size-2 rounded-full bg-emerald-500" />
                          Admin access
                        </div>
                      </div>

                      <div class="grid gap-2 text-sm md:grid-cols-3">
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-building-2"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Manage all institutes</span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-user-plus"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Assign partner accounts</span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-clipboard-check"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">
                            Approve or reject partner requests
                          </span>
                        </div>
                      </div>

                      <div
                        class="grid gap-2 border-t border-slate-100 pt-3 text-sm md:grid-cols-3"
                      >
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-building-2"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Manage institutes</span>
                        </button>
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-user-plus"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Invite partner</span>
                        </button>
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-inbox"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Review requests</span>
                        </button>
                      </div>
                    </div>

                    <div v-else class="mt-4 grid gap-4">
                      <div
                        class="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div>
                          <p
                            class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                          >
                            Access scope
                          </p>
                          <p class="mt-1 text-sm font-semibold text-slate-950">
                            Public dashboard and basic profile
                          </p>
                        </div>
                        <div
                          class="flex w-fit items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                        >
                          <UIcon name="i-lucide-lock-keyhole" class="size-4" />
                          Limited access
                        </div>
                      </div>

                      <div class="grid gap-2 text-sm md:grid-cols-2">
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-layout-dashboard"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">
                            View limited public dashboard data
                          </span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-slate-700"
                        >
                          <UIcon
                            name="i-lucide-user-pen"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Update basic profile only</span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-500"
                        >
                          <UIcon
                            name="i-lucide-lock"
                            class="mt-0.5 size-4 shrink-0"
                          />
                          <span class="text-sm">
                            Institute reports and private data are locked
                          </span>
                        </div>
                        <div
                          class="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-500"
                        >
                          <UIcon
                            name="i-lucide-shield-x"
                            class="mt-0.5 size-4 shrink-0"
                          />
                          <span class="text-sm">
                            User management and approvals are locked
                          </span>
                        </div>
                      </div>

                      <div
                        class="grid gap-2 border-t border-slate-100 pt-3 text-sm md:grid-cols-2"
                      >
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-send"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">Request partner access</span>
                        </button>
                        <button
                          type="button"
                          class="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <UIcon
                            name="i-lucide-layout-dashboard"
                            class="mt-0.5 size-4 shrink-0 text-slate-500"
                          />
                          <span class="text-sm">View public dashboard</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                v-else-if="activeSection === 'profile'"
                key="profile"
                class="mx-auto grid w-full max-w-[720px] gap-5 p-6"
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
                        <div
                          class="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5"
                        >
                          <span
                            class="grid size-8 shrink-0 place-items-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200"
                          >
                            <UIcon :name="activeRoleMeta.icon" class="size-4" />
                          </span>
                          <span class="min-w-0">
                            <span
                              class="block text-sm font-bold text-slate-950"
                            >
                              {{ activeRoleMeta.label }}
                            </span>
                            <span class="block text-xs text-slate-500">
                              {{ activeRoleMeta.access }}
                            </span>
                          </span>
                        </div>
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
                            {{ activeRoleMeta.label }}
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

              <section
                v-else-if="activeSection === 'preferences'"
                key="preferences"
                class="grid gap-5 p-6"
              >
                <div>
                  <h3 class="text-xl font-bold text-slate-950">Preference</h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Set dashboard defaults based on how this role uses the
                    system.
                  </p>
                </div>

                <div class="grid gap-5">
                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <h4 class="font-bold text-slate-950">Display defaults</h4>

                    <div class="mt-5 divide-y divide-slate-100">
                      <div class="grid gap-3 py-4 first:pt-0">
                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Theme
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Choose dashboard color mode.
                          </p>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-3">
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

                      <div
                        class="grid gap-3 py-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
                      >
                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Language
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Interface language.
                          </p>
                        </div>
                        <div
                          class="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1"
                        >
                          <button
                            v-for="option in languageOptions"
                            :key="option.value"
                            type="button"
                            class="rounded px-3 py-1.5 text-sm font-bold transition"
                            :class="
                              formState.language === option.value
                                ? 'bg-white text-slate-950 shadow-sm'
                                : 'text-slate-500 hover:text-slate-950'
                            "
                            @click="formState.language = option.value"
                          >
                            {{ option.label }}
                          </button>
                        </div>
                      </div>

                      <div
                        class="grid gap-3 py-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
                      >
                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Chart type
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Default chart style.
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="option in chartTypeOptions"
                            :key="option.value"
                            type="button"
                            class="rounded-md border px-3 py-2 text-sm font-bold capitalize transition"
                            :class="
                              formState.chartType === option.value
                                ? 'border-[#075A9B] bg-[#F3F8FC] text-[#075A9B]'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            "
                            @click="formState.chartType = option.value"
                          >
                            {{ option.label }}
                          </button>
                        </div>
                      </div>

                      <div
                        class="grid gap-3 py-4 last:pb-0 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
                      >
                        <div>
                          <p class="text-sm font-semibold text-slate-950">
                            Table density
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            Table spacing.
                          </p>
                        </div>
                        <div
                          class="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1"
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
                    </div>
                  </div>

                  <div class="rounded-md border border-slate-200 bg-white p-5">
                    <h4 class="font-bold text-slate-950">
                      Role-specific defaults
                    </h4>

                    <div class="mt-5 grid gap-4">
                      <div
                        class="rounded-md border border-slate-200 bg-slate-50 p-4"
                      >
                        <p class="text-sm font-semibold text-slate-950">
                          Default filter
                        </p>
                        <div class="mt-3 flex flex-wrap gap-2">
                          <button
                            v-for="option in defaultFilterOptions"
                            :key="option.value"
                            type="button"
                            class="rounded-md border px-3 py-2 text-sm font-bold transition"
                            :class="
                              formState.defaultFilter === option.value
                                ? 'border-[#075A9B] bg-white text-[#075A9B]'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            "
                            @click="formState.defaultFilter = option.value"
                          >
                            {{ option.label }}
                          </button>
                        </div>
                      </div>

                      <div
                        v-if="displayRole === 'manager'"
                        class="grid gap-3 md:grid-cols-2"
                      >
                        <div
                          class="rounded-md border border-slate-200 bg-slate-50 p-4"
                        >
                          <p class="text-sm font-semibold text-slate-950">
                            Default dashboard page
                          </p>
                          <p class="mt-1 text-sm text-slate-500">
                            Manager dashboard
                          </p>
                        </div>
                        <div
                          class="rounded-md border border-slate-200 bg-slate-50 p-4"
                        >
                          <p class="text-sm font-semibold text-slate-950">
                            Export format preference
                          </p>
                          <p class="mt-1 text-sm text-slate-500">
                            XLSX reports
                          </p>
                        </div>
                      </div>

                      <div
                        v-else-if="displayRole === 'partner'"
                        class="grid gap-3 md:grid-cols-2"
                      >
                        <div
                          class="rounded-md border border-slate-200 bg-slate-50 p-4"
                        >
                          <p class="text-sm font-semibold text-slate-950">
                            Default institute
                          </p>
                          <p class="mt-1 text-sm text-slate-500">
                            {{ formState.institution }}
                          </p>
                        </div>
                        <div
                          class="rounded-md border border-slate-200 bg-slate-50 p-4"
                        >
                          <p class="text-sm font-semibold text-slate-950">
                            Report view preference
                          </p>
                          <p class="mt-1 text-sm text-slate-500">
                            Institute reports
                          </p>
                        </div>
                      </div>

                      <div
                        v-else
                        class="rounded-md border border-slate-200 bg-slate-50 p-4"
                      >
                        <p class="text-sm font-semibold text-slate-950">
                          Visitor dashboard
                        </p>
                        <p class="mt-1 text-sm text-slate-500">
                          Limited public charts with simple year-based filters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section v-else key="notifications" class="grid gap-5 p-6">
                <div>
                  <h3 class="text-xl font-bold text-slate-950">
                    Notifications
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    Choose which alerts are useful for this account role.
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
                        Email notifications
                      </span>
                      <span class="block text-sm text-slate-500">
                        Receive important account updates by email.
                      </span>
                    </span>
                    <input
                      v-model="formState.notifyEmail"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label
                    v-if="displayRole === 'manager'"
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Partner approval requests
                      </span>
                      <span class="block text-sm text-slate-500">
                        Notify when a partner account needs review.
                      </span>
                    </span>
                    <input
                      v-model="formState.notifyApproval"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label
                    v-if="displayRole !== 'visitor'"
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Report update notification
                      </span>
                      <span class="block text-sm text-slate-500">
                        Notify when dashboard or institute reports change.
                      </span>
                    </span>
                    <input
                      v-model="formState.notifyReports"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Access request status
                      </span>
                      <span class="block text-sm text-slate-500">
                        Track partner access or role change requests.
                      </span>
                    </span>
                    <input
                      v-model="formState.accessRequests"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label
                    v-if="displayRole !== 'visitor'"
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Data export finished
                      </span>
                      <span class="block text-sm text-slate-500">
                        Notify when report exports are ready.
                      </span>
                    </span>
                    <input
                      v-model="formState.dataExports"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        Security alerts
                      </span>
                      <span class="block text-sm text-slate-500">
                        Warn me about sign-in and session changes.
                      </span>
                    </span>
                    <input
                      v-model="formState.securityAlerts"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
                  </label>

                  <label
                    v-if="displayRole !== 'partner'"
                    class="flex items-center justify-between gap-4 py-3 last:pb-0"
                  >
                    <span>
                      <span class="block text-sm font-semibold text-slate-950">
                        System alert notification
                      </span>
                      <span class="block text-sm text-slate-500">
                        Receive platform announcements and system alerts.
                      </span>
                    </span>
                    <input
                      v-model="formState.notifySystem"
                      type="checkbox"
                      class="size-4 accent-[#075A9B]"
                    />
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
