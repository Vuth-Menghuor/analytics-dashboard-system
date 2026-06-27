<script setup lang="ts">
import StatePanel from "~/components/common/StatePanel.vue";
import type {
  InstituteAnalyticsResponse,
  InstituteAnalyticsRow,
} from "~/types/analytics-api";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

const props = defineProps<{
  loading?: boolean;
  institute: InstituteAnalyticsRow | null;
  departments: InstituteAnalyticsResponse["departments"];
  courses: InstituteAnalyticsResponse["courses"];
  snapshotLabel: string;
}>();

const open = defineModel<boolean>({ default: false });
const { t } = useI18n();
const { translateText } = useTranslateText();
const coursePage = ref(1);
const coursePerPage = ref(10);
const coursePageOptions = [10, 20, 50];
const courseTotal = computed(() => props.courses.length);
const paginatedCourses = computed(() => {
  const start = (coursePage.value - 1) * coursePerPage.value;

  return props.courses.slice(start, start + coursePerPage.value);
});
const coursePaginationLabel = computed(() => {
  if (courseTotal.value === 0) {
    return "No courses found";
  }

  const start = (coursePage.value - 1) * coursePerPage.value + 1;
  const end = Math.min(coursePage.value * coursePerPage.value, courseTotal.value);

  return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${courseTotal.value.toLocaleString()}`;
});

watch(
  () => [props.courses, coursePerPage.value],
  () => {
    coursePage.value = 1;
  },
);
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
                </tr>
              </thead>
              <tbody>
                <tr v-for="department in departments" :key="department.department">
                  <th scope="row">
                    {{ formatStudentDepartmentLabel(department.department) }}
                  </th>
                  <td class="number">{{ department.students.toLocaleString() }}</td>
                </tr>
                <tr v-if="!departments.length">
                  <td colspan="2" class="muted-text">
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
              {{ translateText("Courses") }}
            </h3>
            <p>{{ translateText("Course enrollment summary for this institute.") }}</p>
          </div>

          <div class="dashboard-data-table-wrap institute-course-table-wrap">
            <table class="dashboard-data-table institute-course-table">
              <thead>
                <tr>
                  <th scope="col">{{ translateText("Course") }}</th>
                  <th scope="col" class="number">{{ translateText("Students") }}</th>
                  <th scope="col" class="number">{{ translateText("Enrollment Records") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="course in paginatedCourses" :key="course.course">
                  <th scope="row">{{ course.course }}</th>
                  <td class="number">{{ course.students.toLocaleString() }}</td>
                  <td class="number">
                    {{ course.enrollmentRecords.toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="!courses.length">
                  <td colspan="3" class="muted-text">
                    {{ translateText("No course enrollment data is available for this institute.") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="courses.length" class="student-pagination drawer-pagination">
            <span>{{ coursePaginationLabel }}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
                <USelect
                  v-model="coursePerPage"
                  :items="coursePageOptions"
                  :aria-label="t('text.rowsPerPage')"
                  class="max-w-[100px]"
                />
              </div>

              <UPagination
                v-model:page="coursePage"
                :total="courseTotal"
                :items-per-page="coursePerPage"
                :ui="{ first: 'hidden', last: 'hidden' }"
              />
            </div>
          </div>
        </section>
      </div>
    </template>
  </USlideover>
</template>

<style scoped>
.institute-course-table-wrap {
  overflow-x: auto;
}

.institute-course-table {
  width: max-content;
  min-width: 100%;
  table-layout: auto;
}

.institute-course-table tbody th {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.institute-course-table th:first-child,
.institute-course-table td:first-child {
  min-width: 360px;
}

.institute-course-table .number {
  min-width: 132px;
}
</style>
