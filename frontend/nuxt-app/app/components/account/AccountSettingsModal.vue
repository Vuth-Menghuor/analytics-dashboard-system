<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { useAccountSettingsForm } from "~/composables/account/useAccountSettingsForm";

const open = defineModel<boolean>("open", { default: false });
const { displayEmail, displayName, email, handleSave, name, userInitial } =
  useAccountSettingsForm(open);

const isDiscardOpen = ref(false);
const isDeleteOpen = ref(false);
const activeSection = ref("personal-info");

const pronounOptions = ["She/her", "He/him", "They/them", "Prefer not to say"];
const countryOptions = ["Cambodia", "Thailand", "Vietnam", "Singapore", "United States"];
const timezoneOptions = [
  "Asia/Phnom_Penh",
  "Asia/Bangkok",
  "Asia/Ho_Chi_Minh",
  "Asia/Singapore",
  "UTC",
];
const languageOptions = ["English", "Khmer", "French", "Spanish"];

const formState = reactive({
  firstName: "",
  lastName: "",
  displayName: "",
  pronouns: "Prefer not to say",
  bio: "Curious student focused on analytics, dashboard design, and accessible learning systems.",
  city: "Phnom Penh",
  country: "Cambodia",
  timezone: "Asia/Phnom_Penh",
  language: "English",
  interests: ["Analytics", "Dashboard design", "Learning systems"],
  email: "",
  phone: "+855 12 345 678",
  linkedin: "https://linkedin.com/in/student",
  github: "https://github.com/student",
  website: "https://portfolio.example.edu",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  notifications: {
    assignmentDeadlines: true,
    gradeReleased: true,
    forumReplies: true,
    courseAnnouncements: true,
    badgeEarned: false,
  },
});

const sectionNavItems = [
  [
    { label: "Account", type: "label" as const },
    {
      label: "Personal info",
      icon: "i-lucide-user",
      value: "personal-info",
      onSelect: () => setActiveSection("personal-info"),
    },
    {
      label: "Password & security",
      icon: "i-lucide-shield-check",
      value: "password-security",
      onSelect: () => setActiveSection("password-security"),
    },
    {
      label: "Privacy",
      icon: "i-lucide-lock",
      value: "privacy",
      onSelect: () => setActiveSection("privacy"),
    },
  ],
  [
    { label: "Preferences", type: "label" as const },
    {
      label: "Notifications",
      icon: "i-lucide-bell",
      value: "notifications",
      onSelect: () => setActiveSection("notifications"),
    },
    {
      label: "Language & region",
      icon: "i-lucide-languages",
      value: "language-region",
      onSelect: () => setActiveSection("language-region"),
    },
    {
      label: "Accessibility",
      icon: "i-lucide-accessibility",
      value: "accessibility",
      onSelect: () => setActiveSection("accessibility"),
    },
  ],
  [
    { label: "Danger zone", type: "label" as const },
    {
      label: "Delete account",
      icon: "i-lucide-trash-2",
      value: "delete-account",
      color: "error" as const,
      onSelect: () => {
        activeSection.value = "delete-account";
        isDeleteOpen.value = true;
      },
    },
  ],
];

const passwordStrength = computed(() => {
  const password = formState.newPassword;
  let score = 0;

  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  return score;
});

const strengthTone = computed(() => {
  if (passwordStrength.value >= 75) return "bg-emerald-500";
  if (passwordStrength.value >= 50) return "bg-sky-500";
  if (passwordStrength.value >= 25) return "bg-amber-500";
  return "bg-slate-200";
});

const strengthLabel = computed(() => {
  if (!formState.newPassword) return "No password entered";
  if (passwordStrength.value >= 75) return "Strong";
  if (passwordStrength.value >= 50) return "Good";
  if (passwordStrength.value >= 25) return "Weak";
  return "Very weak";
});

const cardUi = {
  root: "rounded-lg border border-slate-200 bg-white shadow-none",
  header: "px-4 py-3",
  body: "p-4",
};

const sectionMeta: Record<string, { icon: string; title: string; description: string }> = {
  "personal-info": {
    icon: "i-lucide-user",
    title: "Personal info",
    description: "Update your public profile, contact details, and student identity.",
  },
  "password-security": {
    icon: "i-lucide-shield-check",
    title: "Password & security",
    description: "Manage your login password and review account security.",
  },
  privacy: {
    icon: "i-lucide-lock",
    title: "Privacy",
    description: "Control who can see profile and contact information.",
  },
  notifications: {
    icon: "i-lucide-bell",
    title: "Notifications",
    description: "Choose which Moodle-style events should notify you.",
  },
  "language-region": {
    icon: "i-lucide-languages",
    title: "Language & region",
    description: "Set locale, country, and timezone preferences.",
  },
  accessibility: {
    icon: "i-lucide-accessibility",
    title: "Accessibility",
    description: "Tune interface preferences for comfortable repeated use.",
  },
  "delete-account": {
    icon: "i-lucide-trash-2",
    title: "Delete account",
    description: "Review destructive account actions.",
  },
};

const activeSectionMeta = computed(
  () => sectionMeta[activeSection.value] ?? sectionMeta["personal-info"],
);

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return;

    const parts = (name.value || displayName.value).trim().split(/\s+/);
    formState.firstName = parts[0] ?? "";
    formState.lastName = parts.slice(1).join(" ");
    formState.displayName = name.value || displayName.value;
    formState.email = email.value || displayEmail.value;
    formState.currentPassword = "";
    formState.newPassword = "";
    formState.confirmPassword = "";
  },
  { immediate: true },
);

function setActiveSection(section: string) {
  activeSection.value = section;
}

function validate(state: typeof formState): FormError[] {
  const errors: FormError[] = [];

  if (!state.firstName.trim()) {
    errors.push({ name: "firstName", message: "First name is required" });
  }

  if (!state.displayName.trim()) {
    errors.push({ name: "displayName", message: "Display name is required" });
  }

  if (!state.email.trim()) {
    errors.push({ name: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ name: "email", message: "Enter a valid email address" });
  }

  if (state.newPassword && state.newPassword.length < 8) {
    errors.push({ name: "newPassword", message: "Use at least 8 characters" });
  }

  if (state.newPassword && state.newPassword !== state.confirmPassword) {
    errors.push({ name: "confirmPassword", message: "Passwords do not match" });
  }

  return errors;
}

function onSubmit(event: FormSubmitEvent<typeof formState>, close: () => void) {
  name.value = event.data.displayName.trim();
  email.value = event.data.email.trim();
  handleSave(close);
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Account settings"
    description="Update your Moodle profile and preferences."
    :ui="{
      content: 'max-w-6xl rounded-xl overflow-hidden',
      body: 'p-0',
    }"
  >
    <template #body="{ close }">
      <div class="flex max-h-[84vh] flex-col bg-slate-50">
        <div class="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            aria-label="Back"
            @click="isDiscardOpen = true"
          />
          <div class="min-w-0">
            <h2 class="truncate text-base font-semibold text-slate-950">
              Edit profile
            </h2>
            <p class="text-sm text-slate-500">
              Manage your account details, preferences, and security.
            </p>
          </div>
          </div>

          <div class="flex rounded-lg bg-slate-100 p-1">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-user-round"
              label="Profile"
              class="text-slate-600"
              @click="close"
            />
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-pencil"
              label="Edit profile"
            />
          </div>
        </div>

        <div class="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="hidden border-r border-slate-200 bg-white p-4 lg:block">
            <UNavigationMenu
              v-model="activeSection"
              orientation="vertical"
              type="single"
              :items="sectionNavItems"
              color="primary"
              variant="link"
              class="w-full"
            />
          </aside>

          <UForm
            :state="formState"
            :validate="validate"
            class="min-h-0 overflow-y-auto"
            @submit="(event) => onSubmit(event, close)"
          >
            <div class="space-y-5 p-5 sm:p-6">
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <div class="flex items-start gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <UIcon :name="activeSectionMeta.icon" class="size-4" />
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-base font-semibold text-slate-950">
                      {{ activeSectionMeta.title }}
                    </h3>
                    <p class="text-sm text-slate-500">
                      {{ activeSectionMeta.description }}
                    </p>
                  </div>
                </div>
              </div>

              <template v-if="activeSection === 'personal-info'">
              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-camera" class="size-4 text-primary" />
                      <h3 class="text-sm font-semibold text-slate-950">
                        Profile photo
                      </h3>
                    </div>
                    <UBadge color="neutral" variant="soft">Public</UBadge>
                  </div>
                </template>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center gap-4">
                    <UAvatar :text="userInitial" size="3xl" class="ring-2 ring-white" />
                    <div>
                      <p class="text-sm font-medium text-slate-950">
                        {{ formState.displayName || displayName }}
                      </p>
                      <p class="text-sm text-slate-500">
                        PNG, JPG, or WEBP up to 4 MB.
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-lucide-upload"
                      color="neutral"
                      variant="outline"
                      label="Upload"
                    />
                    <UButton
                      color="error"
                      variant="ghost"
                      label="Remove"
                    />
                  </div>
                </div>
              </UCard>

              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-user" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Personal info
                    </h3>
                  </div>
                </template>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="First name" name="firstName" required>
                    <UInput v-model="formState.firstName" class="w-full" />
                  </UFormField>
                  <UFormField label="Last name" name="lastName">
                    <UInput v-model="formState.lastName" class="w-full" />
                  </UFormField>
                  <UFormField label="Display name" name="displayName" required>
                    <UInput v-model="formState.displayName" class="w-full" />
                  </UFormField>
                  <UFormField label="Pronouns" name="pronouns">
                    <USelect
                      v-model="formState.pronouns"
                      :items="pronounOptions"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Bio" name="bio" class="md:col-span-2">
                    <UTextarea
                      v-model="formState.bio"
                      autoresize
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="City" name="city">
                    <UInput v-model="formState.city" class="w-full" />
                  </UFormField>
                  <UFormField label="Country" name="country">
                    <USelect
                      v-model="formState.country"
                      :items="countryOptions"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField id="language-region" label="Timezone" name="timezone">
                    <USelect
                      v-model="formState.timezone"
                      :items="timezoneOptions"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Interests" name="interests">
                    <UInputTags
                      v-model="formState.interests"
                      placeholder="Add interest"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </UCard>

              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-at-sign" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Contact & social
                    </h3>
                  </div>
                </template>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Email" name="email" required>
                    <UInput
                      v-model="formState.email"
                      icon="i-lucide-mail"
                      type="email"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Phone" name="phone">
                    <UInput
                      v-model="formState.phone"
                      icon="i-lucide-phone"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="LinkedIn" name="linkedin">
                    <UInput
                      v-model="formState.linkedin"
                      icon="i-lucide-linkedin"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="GitHub" name="github">
                    <UInput
                      v-model="formState.github"
                      icon="i-lucide-github"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Website" name="website" class="md:col-span-2">
                    <UInput
                      v-model="formState.website"
                      icon="i-lucide-globe"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </UCard>
              </template>

              <template v-else-if="activeSection === 'password-security'">
              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-shield-check" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Password & security
                    </h3>
                  </div>
                </template>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Current password" name="currentPassword">
                    <UInput
                      v-model="formState.currentPassword"
                      type="password"
                      class="w-full"
                    />
                  </UFormField>
                  <div class="hidden md:block" />
                  <UFormField label="New password" name="newPassword">
                    <UInput
                      v-model="formState.newPassword"
                      type="password"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Confirm password" name="confirmPassword">
                    <UInput
                      v-model="formState.confirmPassword"
                      type="password"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-slate-700">
                      Password strength
                    </span>
                    <span class="text-sm text-slate-500">{{ strengthLabel }}</span>
                  </div>
                  <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="strengthTone"
                      :style="{ width: `${passwordStrength}%` }"
                    />
                  </div>
                </div>
              </UCard>
              </template>

              <template v-else-if="activeSection === 'notifications'">
              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-bell" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Notification preferences
                    </h3>
                  </div>
                </template>

                <div class="divide-y divide-slate-100">
                  <label class="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span>
                      <span class="block text-sm font-medium text-slate-950">
                        Assignment deadlines
                      </span>
                      <span class="block text-sm text-slate-500">
                        Reminders before assignments close.
                      </span>
                    </span>
                    <USwitch v-model="formState.notifications.assignmentDeadlines" />
                  </label>
                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-medium text-slate-950">
                        Grade released
                      </span>
                      <span class="block text-sm text-slate-500">
                        Notify when instructors publish grades.
                      </span>
                    </span>
                    <USwitch v-model="formState.notifications.gradeReleased" />
                  </label>
                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-medium text-slate-950">
                        Forum replies
                      </span>
                      <span class="block text-sm text-slate-500">
                        Replies to discussions you follow.
                      </span>
                    </span>
                    <USwitch v-model="formState.notifications.forumReplies" />
                  </label>
                  <label class="flex items-center justify-between gap-4 py-3">
                    <span>
                      <span class="block text-sm font-medium text-slate-950">
                        Course announcements
                      </span>
                      <span class="block text-sm text-slate-500">
                        News and updates from enrolled courses.
                      </span>
                    </span>
                    <USwitch v-model="formState.notifications.courseAnnouncements" />
                  </label>
                  <label class="flex items-center justify-between gap-4 py-3 last:pb-0">
                    <span>
                      <span class="block text-sm font-medium text-slate-950">
                        Badge earned
                      </span>
                      <span class="block text-sm text-slate-500">
                        Achievement and completion badge alerts.
                      </span>
                    </span>
                    <USwitch v-model="formState.notifications.badgeEarned" />
                  </label>
                </div>
              </UCard>
              </template>

              <template v-else-if="activeSection === 'privacy'">
              <div class="grid gap-5 md:grid-cols-2">
                <UCard :ui="cardUi">
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-lock" class="size-4 text-primary" />
                      <h3 class="text-sm font-semibold text-slate-950">Privacy</h3>
                    </div>
                  </template>
                  <p class="text-sm text-slate-600">
                    Profile visibility is limited to enrolled course members and
                    instructors. Contact details are hidden from guests.
                  </p>
                </UCard>

                <UCard :ui="cardUi">
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-eye" class="size-4 text-primary" />
                      <h3 class="text-sm font-semibold text-slate-950">
                        Visibility
                      </h3>
                    </div>
                  </template>
                  <p class="text-sm text-slate-600">
                    Course participants can see your display name, role, and profile
                    tags. Email and phone details stay visible only to staff.
                  </p>
                </UCard>
              </div>
              </template>

              <template v-else-if="activeSection === 'language-region'">
              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-languages" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Language & region
                    </h3>
                  </div>
                </template>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField label="Language" name="language">
                    <USelect
                      v-model="formState.language"
                      :items="languageOptions"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Country" name="country">
                    <USelect
                      v-model="formState.country"
                      :items="countryOptions"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Timezone" name="timezone" class="md:col-span-2">
                    <USelect
                      v-model="formState.timezone"
                      :items="timezoneOptions"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </UCard>
              </template>

              <template v-else-if="activeSection === 'accessibility'">
              <UCard :ui="cardUi">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-accessibility" class="size-4 text-primary" />
                    <h3 class="text-sm font-semibold text-slate-950">
                      Accessibility
                    </h3>
                  </div>
                </template>
                <div class="space-y-3 text-sm text-slate-600">
                  <p>
                    The edit profile experience keeps visible labels, keyboard-friendly
                    controls, and predictable card sections.
                  </p>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    High-contrast focus states and readable spacing are enabled through
                    the Nuxt UI defaults.
                  </div>
                </div>
              </UCard>
              </template>

              <template v-else-if="activeSection === 'delete-account'">
              <UCard
                :ui="{
                  root: 'rounded-lg border border-red-200 bg-white shadow-none',
                  header: 'px-4 py-3',
                  body: 'p-4',
                }"
              >
                <template #header>
                  <div class="flex items-center gap-2 text-red-700">
                    <UIcon name="i-lucide-trash-2" class="size-4" />
                    <h3 class="text-sm font-semibold">Delete account</h3>
                  </div>
                </template>
                <div class="space-y-4">
                  <p class="text-sm text-slate-600">
                    Deleting an account removes local profile data and ends the current
                    session. This action is shown separately to reduce accidental clicks.
                  </p>
                  <UButton
                    color="error"
                    icon="i-lucide-trash-2"
                    label="Delete account"
                    @click="isDeleteOpen = true"
                  />
                </div>
              </UCard>
              </template>
            </div>

            <div class="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p class="text-sm text-slate-500">* required fields</p>
              <div class="flex justify-end gap-2">
                <UButton
                  color="neutral"
                  variant="outline"
                  label="Cancel"
                  @click="isDiscardOpen = true"
                />
                <UButton
                  type="submit"
                  color="primary"
                  icon="i-lucide-save"
                  label="Save changes"
                />
              </div>
            </div>
          </UForm>
        </div>
      </div>

      <UModal
        v-model:open="isDiscardOpen"
        title="Discard changes?"
        description="Any unsaved profile changes will be lost."
        :ui="{ content: 'max-w-md rounded-xl' }"
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
              @click="() => { closeDiscard(); close(); }"
            />
          </div>
        </template>
      </UModal>

      <UModal
        v-model:open="isDeleteOpen"
        title="Delete account?"
        description="This is a destructive action and cannot be undone."
        :ui="{ content: 'max-w-md rounded-xl' }"
      >
        <template #body>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
