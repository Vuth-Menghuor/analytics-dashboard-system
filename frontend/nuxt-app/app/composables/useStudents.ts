import { getStudents } from "~/services/analytics.service";
import type { Student } from "~/types/analytics";

export const useStudents = () => {
  const students = ref<Student[]>([]);
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

  const refresh = async () => {
    isLoading.value = true;
    error.value = "";

    try {
      students.value = await getStudents();
    } catch {
      error.value = "Unable to load students.";
    } finally {
      isLoading.value = false;
    }
  };

  const filteredStudents = computed(() => {
    const query = filters.query.trim().toLowerCase();

    return students.value.filter((student) => {
      const matchesQuery = !query || [student.name, student.email, student.username].some((value) => value.toLowerCase().includes(query));
      const matchesInstitute = filters.institute === "All institutes" || student.institute === filters.institute;
      const matchesDepartment = filters.department === "All departments" || student.department === filters.department;
      const matchesCity = filters.city === "All cities" || student.city === filters.city;
      const matchesGender = filters.gender === "All genders" || student.gender === filters.gender;
      const matchesStatus = filters.status === "All statuses" || student.status === filters.status;

      return matchesQuery && matchesInstitute && matchesDepartment && matchesCity && matchesGender && matchesStatus;
    });
  });

  onMounted(refresh);

  return { error, filteredStudents, filters, isLoading, refresh, students };
};
