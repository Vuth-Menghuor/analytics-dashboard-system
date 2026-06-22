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
    engagement: "All engagement",
  });

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
    const query = filters.query.trim().toLowerCase();

    return courses.value.filter((course) => {
      const matchesQuery =
        !query ||
        [course.name, course.shortName].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesCategory =
        filters.category === "All categories" ||
        course.category === filters.category;
      const matchesInstitute =
        filters.institute === "All institutes" ||
        course.institute === filters.institute ||
        course.institutes?.includes(filters.institute);

      return matchesQuery && matchesCategory && matchesInstitute;
    });
  });

  return {
    courses,
    error,
    filteredCourses,
    filters,
    isLoading,
    refresh,
    selectedCourse,
  };
};
