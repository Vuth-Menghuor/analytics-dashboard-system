<script setup lang="ts">
import type { Student } from "~/types/analytics";

defineProps<{
  student: Student | null;
}>();

const open = defineModel<boolean>({ default: false });
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
          <div>
            <span>Last login</span>
            <strong>{{ student.lastLogin }}</strong>
          </div>
          <div>
            <span>Enrollments</span>
            <strong>{{ student.enrollments }}</strong>
          </div>
          <div>
            <span>Completions</span>
            <strong>{{ student.completions }}</strong>
          </div>
          <div>
            <span>Average grade</span>
            <strong>{{ student.averageGrade }}%</strong>
          </div>
          <div>
            <span>Attendance</span>
            <strong>{{ student.attendanceRate }}%</strong>
          </div>
          <div>
            <span>Quiz average</span>
            <strong>{{ student.quizAverage }}%</strong>
          </div>
          <div>
            <span>Assignments</span>
            <strong>{{ student.assignmentSubmissionRate }}%</strong>
          </div>
          <div>
            <span>Learning hours</span>
            <strong>{{ student.learningHours }}</strong>
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
            <div>
              <dt>Institute</dt>
              <dd>{{ student.institute }}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{{ student.department }}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{{ student.city }}</dd>
            </div>
            <div>
              <dt>Confirmed</dt>
              <dd>{{ student.confirmed ? 'Yes' : 'No' }}</dd>
            </div>
          </dl>
        </UCard>
      </div>
    </template>
  </USlideover>
</template>
