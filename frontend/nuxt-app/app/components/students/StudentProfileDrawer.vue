<script setup lang="ts">
import {
  studentProfileDetails,
  studentProfileStats,
} from "~/constants/studentAnalytics";
import type { Student } from "~/types/analytics";

defineProps<{
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
</script>

<template>
  <USlideover v-model:open="open" title="Student Profile">
    <template #body>
      <div v-if="student" class="profile-drawer">
        <div>
          <h2>{{ student.name }}</h2>
          <p>{{ student.studentCode }} · {{ student.email }} · {{ student.username }}</p>
        </div>

        <div class="profile-badge-row">
          <UBadge :color="student.status === 'Active' ? 'success' : 'warning'" variant="soft">
            {{ student.status }}
          </UBadge>
          <UBadge :color="student.riskLevel === 'High' ? 'warning' : student.riskLevel === 'Medium' ? 'neutral' : 'success'" variant="soft">
            {{ student.riskLevel }} risk
          </UBadge>
          <UBadge color="primary" variant="soft">
            {{ student.institute }}
          </UBadge>
        </div>

        <div class="profile-stat-grid">
          <div v-for="stat in studentProfileStats" :key="stat.label">
            <span>{{ stat.label }}</span>
            <strong>{{ formatStudentValue(student, stat.key, stat.suffix) }}</strong>
          </div>
        </div>

        <UCard :ui="{ body: 'p-4' }">
          <h3>Learning Activity Summary</h3>
          <p>
            {{ student.name }} has recorded {{ student.learningHours }} learning hours with
            {{ student.completions }} completed courses from {{ student.enrollments }} enrollments.
            Last accessed course: {{ student.lastCourse }}.
          </p>
        </UCard>

        <UCard :ui="{ body: 'p-4' }">
          <h3>Moodle Profile Fields</h3>
          <dl class="student-profile-details">
            <div v-for="detail in studentProfileDetails" :key="detail.label">
              <dt>{{ detail.label }}</dt>
              <dd>
                {{
                  detail.type === 'boolean'
                    ? student[detail.key]
                      ? 'Yes'
                      : 'No'
                    : formatStudentValue(student, detail.key)
                }}
              </dd>
            </div>
          </dl>
        </UCard>
      </div>
    </template>
  </USlideover>
</template>
