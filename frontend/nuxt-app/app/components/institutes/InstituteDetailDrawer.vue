<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import type {
  InstituteAnalyticsResponse,
  InstituteAnalyticsRow,
} from "~/types/analytics-api";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

defineProps<{
  loading?: boolean;
  institute: InstituteAnalyticsRow | null;
  departments: InstituteAnalyticsResponse["departments"];
  topCourses: InstituteAnalyticsResponse["topCourses"];
  snapshotLabel: string;
}>();

const open = defineModel<boolean>({ default: false });
const { t } = useI18n();
const { translateText } = useTranslateText();
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="t('text.instituteDetail')"
    :ui="{ content: 'max-w-4xl' }"
  >
    <template #body>
      <StatePanel v-if="loading" state="loading" />

      <div v-else-if="institute" class="profile-drawer">
        <section class="student-profile-hero">
          <div class="student-profile-avatar">
            {{ institute.institution.charAt(0).toUpperCase() }}
          </div>
          <div class="student-profile-identity">
            <p class="eyebrow">{{ translateText("Institute analytics") }}</p>
            <h2>{{ formatStudentInstituteLabel(institute.institution) }}</h2>
            <div class="student-profile-meta">
              <span>
                <UIcon name="i-lucide-calendar-clock" />
                {{ snapshotLabel }}
              </span>
              <span>
                <UIcon name="i-lucide-clock-3" />
                {{ t("text.lastActivityLabel", { value: institute.lastActivity ?? t("text.notRecorded") }) }}
              </span>
            </div>
          </div>
        </section>

        <section class="profile-stat-grid student-profile-stats">
          <div>
            <span>{{ translateText("Students") }}</span>
            <strong>{{ institute.students.toLocaleString() }}</strong>
          </div>
          <div>
            <span>{{ translateText("Courses") }}</span>
            <strong>{{ institute.courses.toLocaleString() }}</strong>
          </div>
          <div>
            <span>{{ translateText("Departments") }}</span>
            <strong>{{ institute.departments.toLocaleString() }}</strong>
          </div>
          <div>
            <span>{{ translateText("Snapshot active") }}</span>
            <strong>{{ institute.activeStudents.toLocaleString() }}</strong>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-network" />
              {{ translateText("Department Breakdown") }}
            </h3>
            <p>{{ translateText("Student distribution inside this institute.") }}</p>
          </div>

          <div class="dashboard-data-table-wrap">
            <table class="dashboard-data-table">
              <thead>
                <tr>
                  <th scope="col">{{ translateText("Department") }}</th>
                  <th scope="col" class="number">{{ translateText("Students") }}</th>
                  <th scope="col" class="number">{{ translateText("Share") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="department in departments" :key="department.department">
                  <th scope="row">
                    {{ formatStudentDepartmentLabel(department.department) }}
                  </th>
                  <td class="number">{{ department.students.toLocaleString() }}</td>
                  <td class="number">{{ department.share.toFixed(1) }}%</td>
                </tr>
                <tr v-if="!departments.length">
                  <td colspan="3" class="muted-text">
                    {{ translateText("No department data is available for this institute.") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-book-open" />
              {{ translateText("Top courses") }}
            </h3>
            <p>{{ translateText("Courses ranked by distinct enrolled students.") }}</p>
          </div>

          <div class="dashboard-data-table-wrap">
            <table class="dashboard-data-table">
              <thead>
                <tr>
                  <th scope="col">{{ translateText("Course") }}</th>
                  <th scope="col" class="number">{{ translateText("Students") }}</th>
                  <th scope="col" class="number">{{ translateText("Enrollment Records") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in topCourses" :key="course.course">
                  <th scope="row">{{ course.course }}</th>
                  <td class="number">{{ course.students.toLocaleString() }}</td>
                  <td class="number">
                    {{ course.enrollmentRecords.toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="!topCourses.length">
                  <td colspan="3" class="muted-text">
                    {{ translateText("No course enrollment data is available for this institute.") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </USlideover>
</template>
