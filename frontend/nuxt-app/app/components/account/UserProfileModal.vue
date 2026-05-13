<script setup lang="ts">
import { useUserProfile } from "~/composables/account/useUserProfile";

const open = defineModel<boolean>("open", { default: false });
const accountSettingsOpen = ref(false);

const { avatarSrc, displayEmail, displayName, displayRole, userInitial } =
  useUserProfile();

// ── Profile ──────────────────────────────────────────────
const profileTags = ["Computer Science", "Year 3", "Blended learning"];

const contactRows = computed(() => [
  { icon: "i-lucide-mail", label: "Email", value: displayEmail.value },
  {
    icon: "i-lucide-map-pin",
    label: "Campus",
    value: "Main campus, Room B-204",
  },
  {
    icon: "i-lucide-clock",
    label: "Timezone",
    value: "Asia / Phnom Penh (UTC+7)",
  },
  {
    icon: "i-lucide-calendar-check",
    label: "Last access",
    value: "Today at 09:42",
  },
]);

const quickStats = [
  { label: "Courses", value: "6" },
  { label: "Completed", value: "18" },
  { label: "GPA", value: "3.72" },
  { label: "Badges", value: "9" },
];

const achievements = [
  { icon: "i-lucide-award", label: "Dean's list" },
  { icon: "i-lucide-trophy", label: "Top quiz" },
  { icon: "i-lucide-star", label: "Peer mentor" },
  { icon: "i-lucide-medal", label: "Research" },
];

const courses = [
  {
    title: "Learning Analytics and Dashboards",
    code: "LMS 304",
    completion: 92,
  },
  { title: "Database Systems", code: "CSE 221", completion: 76 },
  { title: "Human Computer Interaction", code: "DES 210", completion: 58 },
  { title: "Academic Writing", code: "ENG 118", completion: 41 },
];

const grades = [
  {
    course: "Learning Analytics",
    item: "Dashboard critique",
    score: "94%",
    grade: "A",
    color: "success" as const,
  },
  {
    course: "Database Systems",
    item: "Normalization quiz",
    score: "87%",
    grade: "B+",
    color: "primary" as const,
  },
  {
    course: "Human Computer Interaction",
    item: "Prototype review",
    score: "79%",
    grade: "B",
    color: "warning" as const,
  },
];

const activities = [
  {
    dot: "bg-emerald-500",
    title: "Submitted Dashboard critique",
    detail: "Learning Analytics and Dashboards",
    time: "18 min ago",
  },
  {
    dot: "bg-blue-500",
    title: "Viewed Week 8 lecture notes",
    detail: "Database Systems",
    time: "1 hr ago",
  },
  {
    dot: "bg-amber-500",
    title: "Commented on group prototype",
    detail: "Human Computer Interaction",
    time: "Yesterday",
  },
  {
    dot: "bg-violet-500",
    title: "Earned Peer mentor badge",
    detail: "Student community",
    time: "Mon 14:25",
  },
];

// ── Helpers ───────────────────────────────────────────────
const progressColor = (n: number) =>
  n >= 85 ? "success" : n >= 60 ? "primary" : "warning";

const cardUi = {
  root: "rounded-xl border border-slate-200 bg-white shadow-none",
  header: "px-4 py-3 border-b border-slate-100",
  body: "p-4",
};
</script>

<template>
  <!-- ── User profile modal ─────────────────────────────── -->
  <UModal
    v-model:open="open"
    title="User profile"
    description="Course progress, grades, and recent activity."
    :ui="{ content: 'max-w-6xl rounded-2xl overflow-hidden', body: 'p-0' }"
  >
    <template #body="{ close }">
      <div class="max-h-[84vh] overflow-y-auto bg-slate-50">
        <!-- Header / cover -->
        <section class="relative bg-white">
          <div
            class="h-32 bg-gradient-to-br from-slate-50 via-sky-100 to-emerald-50"
          />

          <div class="px-6 pb-5">
            <div
              class="-mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
            >
              <!-- Avatar + name -->
              <div class="flex items-end gap-4">
                <div class="relative shrink-0">
                  <UAvatar
                    :src="avatarSrc"
                    :text="userInitial"
                    :alt="displayName"
                    size="3xl"
                    class="ring-4 ring-white shadow-sm"
                  />
                  <span
                    class="absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-white bg-emerald-500"
                    aria-label="Online"
                  />
                </div>

                <div class="pb-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2
                      class="text-xl font-semibold tracking-tight text-slate-950 truncate"
                    >
                      {{ displayName }}
                    </h2>
                    <UBadge color="success" variant="soft" size="sm"
                      >Online</UBadge
                    >
                  </div>
                  <p class="mt-0.5 text-sm text-slate-500">{{ displayRole }}</p>
                  <div class="mt-2.5 flex flex-wrap gap-1.5">
                    <UBadge
                      v-for="tag in profileTags"
                      :key="tag"
                      color="neutral"
                      variant="soft"
                      size="sm"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap gap-2 pb-1">
                <UButton
                  icon="i-lucide-message-circle"
                  label="Message"
                  color="neutral"
                  variant="outline"
                  size="sm"
                />
                <UButton
                  icon="i-lucide-pencil"
                  label="Edit profile"
                  color="primary"
                  size="sm"
                  @click="accountSettingsOpen = true"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Body grid -->
        <div class="grid gap-4 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <!-- Sidebar -->
          <aside class="space-y-4">
            <!-- Contact -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center gap-2 text-slate-900">
                  <UIcon name="i-lucide-contact" class="size-4 text-primary" />
                  <h3 class="text-sm font-semibold">Contact</h3>
                </div>
              </template>
              <div class="divide-y divide-slate-100">
                <div
                  v-for="row in contactRows"
                  :key="row.label"
                  class="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span
                    class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200 text-slate-400"
                  >
                    <UIcon :name="row.icon" class="size-3.5" />
                  </span>
                  <span class="min-w-0">
                    <span
                      class="block text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {{ row.label }}
                    </span>
                    <span class="block truncate text-sm text-slate-800">{{
                      row.value
                    }}</span>
                  </span>
                </div>
              </div>
            </UCard>

            <!-- Quick stats -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center gap-2 text-slate-900">
                  <UIcon
                    name="i-lucide-chart-no-axes-column"
                    class="size-4 text-primary"
                  />
                  <h3 class="text-sm font-semibold">Quick stats</h3>
                </div>
              </template>
              <div class="grid grid-cols-2 gap-2.5">
                <div
                  v-for="stat in quickStats"
                  :key="stat.label"
                  class="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <p class="text-xl font-semibold text-slate-950 leading-none">
                    {{ stat.value }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">{{ stat.label }}</p>
                </div>
              </div>
            </UCard>

            <!-- Achievements -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center gap-2 text-slate-900">
                  <UIcon
                    name="i-lucide-badge-check"
                    class="size-4 text-primary"
                  />
                  <h3 class="text-sm font-semibold">Achievements</h3>
                </div>
              </template>
              <div class="grid grid-cols-4 gap-2">
                <UTooltip
                  v-for="a in achievements"
                  :key="a.label"
                  :text="a.label"
                >
                  <button
                    type="button"
                    class="grid aspect-square w-full place-items-center rounded-lg border border-slate-200 bg-slate-50 text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    :aria-label="a.label"
                  >
                    <UIcon :name="a.icon" class="size-5" />
                  </button>
                </UTooltip>
              </div>
            </UCard>
          </aside>

          <!-- Main -->
          <main class="space-y-4">
            <!-- Courses -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-slate-900">
                    <UIcon
                      name="i-lucide-book-open"
                      class="size-4 text-primary"
                    />
                    <h3 class="text-sm font-semibold">Enrolled courses</h3>
                  </div>
                  <UBadge color="neutral" variant="soft" size="sm"
                    >{{ courses.length }} active</UBadge
                  >
                </div>
              </template>
              <div class="space-y-3">
                <div
                  v-for="course in courses"
                  :key="course.code"
                  class="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-slate-900">
                        {{ course.title }}
                      </p>
                      <p class="text-xs text-slate-400 mt-0.5">
                        {{ course.code }}
                      </p>
                    </div>
                    <span class="shrink-0 text-sm font-semibold text-slate-600">
                      {{ course.completion }}%
                    </span>
                  </div>
                  <UProgress
                    :model-value="course.completion"
                    :color="progressColor(course.completion)"
                    size="sm"
                    class="mt-2.5"
                  />
                </div>
              </div>
            </UCard>

            <!-- Grades -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center gap-2 text-slate-900">
                  <UIcon
                    name="i-lucide-clipboard-check"
                    class="size-4 text-primary"
                  />
                  <h3 class="text-sm font-semibold">Recent grades</h3>
                </div>
              </template>
              <div class="overflow-x-auto -mx-4 px-4">
                <table class="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr
                      class="border-b border-slate-100 text-left text-xs text-slate-400"
                    >
                      <th class="pb-2 pr-4 font-medium">Course</th>
                      <th class="pb-2 pr-4 font-medium">Activity</th>
                      <th class="pb-2 pr-4 font-medium">Score</th>
                      <th class="pb-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr
                      v-for="g in grades"
                      :key="`${g.course}-${g.item}`"
                      class="group"
                    >
                      <td class="py-2.5 pr-4 text-slate-800">{{ g.course }}</td>
                      <td class="py-2.5 pr-4 text-slate-500">{{ g.item }}</td>
                      <td class="py-2.5 pr-4 font-medium text-slate-800">
                        {{ g.score }}
                      </td>
                      <td class="py-2.5">
                        <UBadge :color="g.color" variant="soft" size="sm">{{
                          g.grade
                        }}</UBadge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>

            <!-- Activity -->
            <UCard :ui="cardUi">
              <template #header>
                <div class="flex items-center gap-2 text-slate-900">
                  <UIcon name="i-lucide-activity" class="size-4 text-primary" />
                  <h3 class="text-sm font-semibold">Recent activity</h3>
                </div>
              </template>
              <div class="divide-y divide-slate-50">
                <div
                  v-for="act in activities"
                  :key="act.title"
                  class="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span
                    class="mt-2 size-2 shrink-0 rounded-full"
                    :class="act.dot"
                  />
                  <div class="min-w-0 flex-1">
                    <div
                      class="flex flex-wrap items-baseline justify-between gap-x-2"
                    >
                      <p class="text-sm font-medium text-slate-900">
                        {{ act.title }}
                      </p>
                      <time class="text-xs text-slate-400 shrink-0">{{
                        act.time
                      }}</time>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ act.detail }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>
          </main>
        </div>

        <!-- Footer -->
        <div
          class="flex justify-end border-t border-slate-100 bg-white px-6 py-3"
        >
          <UButton
            color="neutral"
            variant="ghost"
            label="Close"
            size="sm"
            @click="close"
          />
        </div>
      </div>
    </template>
  </UModal>

  <AccountSettingsModal v-model:open="accountSettingsOpen" />
</template>
