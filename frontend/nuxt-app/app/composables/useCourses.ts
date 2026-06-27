import { getCourses } from "~/services/analytics.service";
import type { Course } from "~/types/analytics";

export const useCourses = () => {
  const courses = ref<Course[]>([]);
  const selectedCourse = ref<Course | null>(null);
  const isLoading = ref(true);
  const error = ref("");

  const filters = reactive({
    query: "",
    category: "All categories",
    institute: "All institutes",
  });
  const appliedFilters = reactive({ ...filters });

  const refresh = async () => {
    isLoading.value = true;
    error.value = "";

    try {
      courses.value = await getCourses();
      selectedCourse.value = courses.value[0] ?? null;
    } catch {
      error.value = "Unable to load courses.";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(refresh);

  const filteredCourses = computed(() => {
    const query = appliedFilters.query.trim().toLowerCase();

    return courses.value.filter((course) => {
      const matchesQuery =
        !query ||
        [course.name, course.shortName].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesCategory =
        appliedFilters.category === "All categories" ||
        course.category === appliedFilters.category;
      const matchesInstitute =
        appliedFilters.institute === "All institutes" ||
        course.institute === appliedFilters.institute ||
        course.institutes?.includes(appliedFilters.institute);

      return matchesQuery && matchesCategory && matchesInstitute;
    });
  });

  const applyFilters = () => {
    appliedFilters.query = filters.query.trim();
    appliedFilters.category = filters.category;
    appliedFilters.institute = filters.institute;
  };

  return {
    appliedFilters,
    applyFilters,
    courses,
    error,
    filteredCourses,
    filters,
    isLoading,
    refresh,
    selectedCourse,
  };
};
