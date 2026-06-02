<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import {
  studentProfileDetails,
  studentProfileStats,
} from "~/constants/studentAnalytics";
import type { Student } from "~/types/analytics";

defineProps<{
  loading?: boolean;
  student: Student | null;
}>();

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
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Student Profile"
    :ui="{ content: 'max-w-xl' }"
  >
    <template #body>
      <StatePanel v-if="loading" state="loading" />

      <div v-else-if="student" class="profile-drawer">
        <section class="student-profile-hero">
          <div class="student-profile-avatar">
            {{ student.name.charAt(0).toUpperCase() }}
          </div>
          <div class="student-profile-identity">
            <p class="eyebrow">Moodle student</p>
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
              <span>
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
            {{ student.status }}
          </UBadge>
          <UBadge color="primary" variant="soft">
            <UIcon name="i-lucide-building-2" />
            {{ student.institute }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            <UIcon name="i-lucide-users" />
            {{ student.gender }}
          </UBadge>
        </div>

        <section class="profile-stat-grid student-profile-stats">
          <div v-for="stat in studentProfileStats" :key="stat.label">
            <span>{{ stat.label }}</span>
            <strong>{{ formatStudentValue(student, stat.key, stat.suffix) }}</strong>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-book-open-check" />
              Enrollment Summary
            </h3>
            <p>Moodle enrollment and completion activity for this student.</p>
          </div>

          <div class="student-profile-summary-grid">
            <div>
              <span>Enrollments</span>
              <strong>{{ student.enrollments }}</strong>
            </div>
            <div>
              <span>Completed courses</span>
              <strong>{{ student.completions }}</strong>
            </div>
            <div>
              <span>Last login</span>
              <strong>{{ student.lastLogin }}</strong>
            </div>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-user-round-search" />
              Moodle Profile Fields
            </h3>
            <p>Read-only profile fields imported from Moodle.</p>
          </div>
          <dl class="student-profile-details">
            <div v-for="detail in studentProfileDetails" :key="detail.label">
              <dt>{{ detail.label }}</dt>
              <dd>
                {{
                  detail.type === 'boolean'
                    ? getBooleanValue(student[detail.key])
                    : formatStudentValue(student, detail.key)
                }}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </USlideover>
</template>
