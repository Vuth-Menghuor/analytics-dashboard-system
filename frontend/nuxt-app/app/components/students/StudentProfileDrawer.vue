<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import {
  studentProfileDetails,
  studentProfileStats,
} from "~/constants/studentAnalytics";
import type { Student } from "~/types/analytics";

const props = defineProps<{
  loading?: boolean;
  student: Student | null;
}>();
const propsStudent = computed(() => props.student);
const runtimeConfig = useRuntimeConfig();
const failedAvatarUrl = ref("");
const { t } = useI18n();
const { translateText } = useTranslateText();

const open = defineModel<boolean>({ default: false });

const formatStudentValue = (
  student: Student,
  key: keyof Student,
  suffix = "",
) => {
  const value = student[key];

  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return `${value}${suffix}`;
};

const getBooleanValue = (value: unknown) => (value ? "Yes" : "No");

const studentAvatarSrc = computed(() => {
  const avatarUrl = propsStudent.value?.avatarUrl;

  if (!avatarUrl || avatarUrl === failedAvatarUrl.value) {
    return "";
  }

  if (/^https?:\/\//.test(avatarUrl)) {
    return avatarUrl;
  }

  return `${String(runtimeConfig.public.apiBaseUrl).replace(/\/$/, "")}${avatarUrl}`;
});

watch(
  () => propsStudent.value?.avatarUrl,
  () => {
    failedAvatarUrl.value = "";
  },
);

</script>

<template>
  <USlideover
    v-model:open="open"
    :title="t('text.studentProfile')"
    :ui="{ content: 'max-w-xl' }"
  >
    <template #body>
      <StatePanel v-if="loading" state="loading" />

      <div v-else-if="student" class="profile-drawer">
        <section class="student-profile-hero">
          <div class="student-profile-avatar">
            <img
              v-if="studentAvatarSrc"
              :src="studentAvatarSrc"
              :alt="student.avatarAlt || t('text.profilePictureAlt', { name: student.name })"
              @error="failedAvatarUrl = student.avatarUrl || ''"
            >
            <span v-else>
              {{ student.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="student-profile-identity">
            <p class="eyebrow">{{ translateText("Moodle student") }}</p>
            <h2>{{ student.name }}</h2>
            <div class="student-profile-meta">
              <span>
                <UIcon name="i-lucide-badge" />
                {{ student.studentCode || "-" }}
              </span>
              <span>
                <UIcon name="i-lucide-at-sign" />
                {{ student.username }}
              </span>
              <span v-if="student.email">
                <UIcon name="i-lucide-mail" />
                {{ student.email }}
              </span>
            </div>
          </div>
        </section>

        <div class="profile-badge-row student-profile-badges">
          <UBadge
            :color="student.status === 'Active' ? 'success' : 'warning'"
            variant="soft"
          >
            <UIcon
              :name="
                student.status === 'Active'
                  ? 'i-lucide-circle-check'
                  : 'i-lucide-circle-alert'
              "
            />
            {{ translateText(student.status) }}
          </UBadge>
          <UBadge color="primary" variant="soft">
            <UIcon name="i-lucide-building-2" />
            {{ student.institute }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            <UIcon name="i-lucide-users" />
            {{ translateText(student.gender) }}
          </UBadge>
        </div>

        <section class="profile-stat-grid student-profile-stats">
          <div v-for="stat in studentProfileStats" :key="stat.label">
            <span>{{ translateText(stat.label) }}</span>
            <strong>{{ formatStudentValue(student, stat.key, stat.suffix) }}</strong>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-activity" />
              {{ translateText("Student Activity") }}
            </h3>
          </div>

          <div class="student-profile-summary-grid">
            <div>
              <span>{{ translateText("Enrollments") }}</span>
              <strong>{{ student.enrollments }}</strong>
            </div>
            <div>
              <span>{{ translateText("Account status") }}</span>
              <strong>{{ translateText(student.status) }}</strong>
            </div>
            <div>
              <span>{{ translateText("Last login") }}</span>
              <strong>{{ student.lastLogin }}</strong>
            </div>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-user-round-search" />
              {{ translateText("Moodle Profile Fields") }}
            </h3>
          </div>
          <dl class="student-profile-details">
            <div v-for="detail in studentProfileDetails" :key="detail.label">
              <dt>{{ translateText(detail.label) }}</dt>
              <dd>
                {{
                  detail.type === 'boolean'
                    ? translateText(getBooleanValue(student[detail.key]))
                    : translateText(formatStudentValue(student, detail.key))
                }}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </USlideover>
</template>
