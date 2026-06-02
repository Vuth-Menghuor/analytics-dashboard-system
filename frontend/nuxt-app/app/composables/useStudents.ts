import { getStudents } from "~/services/analytics.service";
import type { Student } from "~/types/analytics";

export const useStudents = () => {
  const students = ref<Student[]>([]);

  const pagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  let latestRequestId = 0;
  const isLoading = ref(true);
  const error = ref("");

  const filters = reactive({
    query: "",
    institute: "All institutes",
    department: "All departments",
    city: "All cities",
    gender: "All genders",
    status: "All statuses",
  });

  const getStudentQuery = () => ({
    search: filters.query.trim() || undefined,
    institution:
      filters.institute === "All institutes" ? undefined : filters.institute,
    department:
      filters.department === "All departments" ? undefined : filters.department,
    city: filters.city === "All cities" ? undefined : filters.city,
    gender: filters.gender === "All genders" ? undefined : filters.gender,
    status: filters.status === "All statuses" ? undefined : filters.status,
  });

  const refresh = async () => {
    const requestId = ++latestRequestId;

    isLoading.value = true;
    error.value = "";

    try {
      const response = await getStudents({
        ...getStudentQuery(),
        page: pagination.value.currentPage,
        perPage: pagination.value.perPage,
      });

      if (requestId === latestRequestId) {
        students.value = response.data;
        pagination.value = response.meta;
      }
    } catch {
      if (requestId === latestRequestId) {
        error.value = "Unable to load students.";
      }
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
      }
    }
  };

  const refreshFromFirstPage = () => {
    pagination.value.currentPage = 1;
    refresh();
  };

  watch(
    () => [
      filters.institute,
      filters.department,
      filters.city,
      filters.gender,
      filters.status,
    ],
    refreshFromFirstPage,
  );

  const applySearch = (query: string) => {
    filters.query = query;
    refreshFromFirstPage();
  };

  const setPage = (page: number) => {
    const nextPage = Math.min(
      Math.max(page, 1),
      Math.max(pagination.value.lastPage, 1),
    );

    if (nextPage === pagination.value.currentPage) {
      return;
    }

    pagination.value.currentPage = nextPage;
    refresh();
  };

  const setPerPage = (perPage: number) => {
    if (perPage === pagination.value.perPage) {
      return;
    }

    pagination.value.currentPage = 1;
    pagination.value.perPage = perPage;
    refresh();
  };

  onMounted(refresh);

  return {
    error,
    filters,
    isLoading,
    pagination,
    applySearch,
    refresh,
    setPage,
    setPerPage,
    students,
  };
};
