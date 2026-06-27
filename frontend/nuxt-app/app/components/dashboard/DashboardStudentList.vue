<script setup lang="ts">
import AppButton from "~/components/common/AppButton.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import StudentProfileDrawer from "~/components/students/StudentProfileDrawer.vue";
import { studentTableColumns } from "~/constants/studentAnalytics";
import { getStudent } from "~/services/analytics.service";
import type { AnalyticsTable, Student } from "~/types/analytics";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentGenderLabel } from "~/utils/studentGender";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

const { t } = useI18n();
const {
  error,
  isLoading,
  pagination,
  setPage,
  setPerPage,
  students,
} = useStudents();

const selectedStudent = ref<Student | null>(null);
const selectedStudentIsLoading = ref(false);
const profileOpen = ref(false);
const studentPageOptions = [10, 20, 30, 50, 100];

const studentRows = computed(() =>
  students.value.map((student) => ({
    ...student,
    institute: formatStudentInstituteLabel(student.institute),
    department: formatStudentDepartmentLabel(student.department),
    gender: formatStudentGenderLabel(student.gender),
    action: student.id,
  })),
);

const table = computed<AnalyticsTable>(() => ({
  title: "Student List",
  icon: "i-lucide-users",
  description: "Latest Moodle student records from the student analytics page.",
  rowKey: "id",
  columns: studentTableColumns,
  rows: studentRows.value,
}));

const studentPage = computed({
  get: () => pagination.value.currentPage,
  set: (page: number) => setPage(page),
});
const studentPerPage = computed({
  get: () => pagination.value.perPage,
  set: (perPage: number) => setPerPage(perPage),
});
const paginationLabel = computed(() => {
  if (pagination.value.total === 0) {
    return "No students found";
  }

  const start = (pagination.value.currentPage - 1) * pagination.value.perPage + 1;
  const end = Math.min(
    pagination.value.currentPage * pagination.value.perPage,
    pagination.value.total,
  );

  return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${pagination.value.total.toLocaleString()}`;
});

const viewStudent = async (
  id: number | string | boolean | null | undefined,
) => {
  if (id === undefined || id === null) {
    selectedStudent.value = null;
    profileOpen.value = false;
    return;
  }

  const studentId = Number(id);

  selectedStudent.value =
    students.value.find((student) => student.id === studentId) ?? null;
  profileOpen.value = Boolean(selectedStudent.value);
  selectedStudentIsLoading.value = true;

  try {
    selectedStudent.value = await getStudent(studentId);
    profileOpen.value = true;
  } catch {
    selectedStudent.value = null;
    profileOpen.value = false;
  } finally {
    selectedStudentIsLoading.value = false;
  }
};
</script>

<template>
  <AppLoadingSkeleton
    v-if="isLoading"
    variant="table"
    :rows="6"
    :columns="7"
  />

  <StatePanel
    v-else-if="error"
    state="error"
    :description="error"
  />

  <template v-else>
    <AppDataTable
      :title="table.title"
      :icon="table.icon"
      :description="table.description"
      :columns="table.columns"
      :rows="table.rows"
      :row-key="table.rowKey"
      min-width="1628px"
    >
      <template #cell-action="{ value }">
        <AppButton
          action="view"
          :label="t('text.view')"
          @click="viewStudent(value)"
        />
      </template>
    </AppDataTable>

    <div class="student-pagination">
      <span>{{ paginationLabel }}</span>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>

          <USelect
            v-model="studentPerPage"
            :items="studentPageOptions"
            :aria-label="t('text.rowsPerPage')"
            class="max-w-[100px]"
          />
        </div>

        <UPagination
          v-model:page="studentPage"
          :total="pagination.total"
          :items-per-page="studentPerPage"
          :ui="{ first: 'hidden', last: 'hidden' }"
        />
      </div>
    </div>

    <StudentProfileDrawer
      v-model="profileOpen"
      :student="selectedStudent"
      :loading="selectedStudentIsLoading"
    />
  </template>
</template>
