import {
  studentCityAllOption,
  studentDepartmentAllOption,
  studentGenderOptions,
  studentInstituteAllOption,
  studentStatusOptions,
  studentTableColumns,
} from "~/constants/studentAnalytics";
import { appColors } from "~/constants/colors";
import type {
  AnalyticsChart,
  AnalyticsTable,
  Student,
} from "~/types/analytics";
import {
  getDashboardSummaryData,
  getStudent,
  getStudentActivity,
  getStudentGenderDistribution,
  getStudentsByCity,
  getStudentsByDepartment,
  getStudentsByInstitution,
} from "~/services/analytics.service";
import type {
  DashboardSummaryApi,
  StudentCityDistributionApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
  StudentActivityApi,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";

export const useStudentAnalyticsView = () => {
  const auth = useAuthStore();
  const {
    applySearch,
    error,
    filters,
    isLoading,
    pagination,
    setPage,
    setPerPage,
    students,
  } = useStudents();
  const selectedStudent = ref<Student | null>(null);
  const selectedStudentIsLoading = ref(false);
  const profileOpen = ref(false);
  const liveError = ref("");
  const liveIsLoading = ref(true);
  const searchQuery = ref(filters.query);
  const dashboardSummary = ref<DashboardSummaryApi | null>(null);
  const studentsByInstitution = ref<StudentInstitutionDistributionApi[]>([]);
  const studentsByDepartment = ref<StudentDepartmentDistributionApi[]>([]);
  const studentsByCity = ref<StudentCityDistributionApi[]>([]);
  const genderDistribution = ref<StudentGenderDistributionApi[]>([]);
  const studentActivity = ref<StudentActivityApi[]>([]);
  const partnerInstitute = computed(() =>
    auth.user?.role === "partner" ? auth.user.institution_name || "" : "",
  );
  const isPartnerScoped = computed(() => Boolean(partnerInstitute.value));
  const partnerInstituteLabel = computed(() =>
    isPartnerScoped.value ? `Institute: ${partnerInstitute.value}` : "",
  );

  if (isPartnerScoped.value) {
    filters.institute = partnerInstitute.value;
  }

  const loadLiveStudentCharts = async () => {
    liveIsLoading.value = true;
    liveError.value = "";

    const [
      summary,
      institutions,
      departmentsData,
      citiesData,
      genderData,
      activityData,
    ] = await Promise.allSettled([
      getDashboardSummaryData(),
      getStudentsByInstitution(),
      getStudentsByDepartment(),
      getStudentsByCity(),
      getStudentGenderDistribution(),
      getStudentActivity(),
    ]);

    if (summary.status === "fulfilled") {
      dashboardSummary.value = summary.value;
    }

    if (institutions.status === "fulfilled") {
      studentsByInstitution.value = institutions.value;
    }

    if (departmentsData.status === "fulfilled") {
      studentsByDepartment.value = departmentsData.value;
    }

    if (citiesData.status === "fulfilled") {
      studentsByCity.value = citiesData.value;
    }

    if (genderData.status === "fulfilled") {
      genderDistribution.value = genderData.value;
    }

    if (activityData.status === "fulfilled") {
      studentActivity.value = activityData.value;
    }

    const loadedCount = [
      summary,
      institutions,
      departmentsData,
      citiesData,
      genderData,
      activityData,
    ].filter((result) => result.status === "fulfilled").length;

    if (loadedCount === 0) {
      liveError.value = "Unable to load live student analytics.";
    }

    liveIsLoading.value = false;
  };

  onMounted(loadLiveStudentCharts);

  const institutes = computed(() =>
    isPartnerScoped.value
      ? [partnerInstitute.value]
      : [
          studentInstituteAllOption,
          ...studentsByInstitution.value.map((point) => point.institution),
        ],
  );
  const departments = computed(() => [
    studentDepartmentAllOption,
    ...new Set(studentsByDepartment.value.map((point) => point.department)),
  ]);
  const cities = computed(() => [
    studentCityAllOption,
    ...studentsByCity.value.map((point) => point.city),
  ]);

  const activeStudents = computed(() =>
    students.value.filter((student) => student.status === "Active"),
  );
  const inactiveStudents = computed(() =>
    students.value.filter((student) => student.status === "Inactive"),
  );
  const metrics = computed<Metric[]>(() => [
    {
      label: "Total Students",
      value: pagination.value.total.toLocaleString(),
      trend: "Matching current filters",
      icon: "Users",
      color: appColors.primaryHover,
      sparkline: [22, 26, 31, 38, 42, 48, 52, 58],
    },
    {
      label: "Active Students",
      value: (
        dashboardSummary.value?.totalActiveStudents ??
        activeStudents.value.length
      ).toLocaleString(),
      trend: "Confirmed and not suspended",
      icon: "UserRoundCheck",
      color: appColors.success,
      sparkline: [18, 21, 29, 34, 39, 42, 47, 51],
    },
    {
      label: "Inactive Students",
      value: (
        dashboardSummary.value?.totalInactiveStudents ??
        inactiveStudents.value.length
      ).toLocaleString(),
      trend: "Suspended, unconfirmed, or never logged in",
      icon: "UserCircle",
      color: appColors.warning,
      sparkline: [
        7,
        6,
        6,
        5,
        5,
        4,
        4,
        dashboardSummary.value?.totalInactiveStudents ??
          inactiveStudents.value.length,
      ],
    },
    {
      label: "Never Logged In",
      value: (
        studentActivity.value.find(
          (point) => point.loginStatus === "Never logged in",
        )?.totalStudents ?? 0
      ).toLocaleString(),
      trend: "Students without a Moodle login",
      icon: "UserRoundX",
      color: appColors.warning,
      sparkline: [12, 10, 9, 9, 8, 7, 6, 5],
    },
  ]);

  const countBy = (key: keyof Student) => {
    const totals = new Map<string, number>();
    students.value.forEach((student) => {
      const value = student[key];
      if (value === undefined || value === null) {
        return;
      }

      totals.set(String(value), (totals.get(String(value)) ?? 0) + 1);
    });

    return totals;
  };

  const byInstitute = computed(() => countBy("institute"));
  const byDepartment = computed(() => countBy("department"));
  const byCity = computed(() => countBy("city"));

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Students by Institute",
      icon: "i-lucide-building-2",
      type: "horizontalBar",
      labels:
        studentsByInstitution.value.length > 0
          ? studentsByInstitution.value
              .slice(0, 12)
              .map((point) => point.institution)
          : [...byInstitute.value.keys()],
      series: [
        {
          name: "Students",
          data:
            studentsByInstitution.value.length > 0
              ? studentsByInstitution.value
                  .slice(0, 12)
                  .map((point) => point.totalStudents)
              : [...byInstitute.value.values()],
        },
      ],
    },
    {
      title: "Students by Department",
      icon: "i-lucide-list-ordered",
      type: "horizontalBar",
      labels:
        studentsByDepartment.value.length > 0
          ? studentsByDepartment.value
              .slice(0, 10)
              .map((point) => point.department)
          : [...byDepartment.value.keys()].slice(0, 10),
      series: [
        {
          name: "Students",
          data:
            studentsByDepartment.value.length > 0
              ? studentsByDepartment.value
                  .slice(0, 10)
                  .map((point) => point.totalStudents)
              : [...byDepartment.value.values()].slice(0, 10),
        },
      ],
    },
    {
      title: "Students by City",
      icon: "i-lucide-map-pin",
      type: "horizontalBar",
      labels:
        studentsByCity.value.length > 0
          ? studentsByCity.value.slice(0, 12).map((point) => point.city)
          : [...byCity.value.keys()],
      series: [
        {
          name: "Students",
          data:
            studentsByCity.value.length > 0
              ? studentsByCity.value
                  .slice(0, 12)
                  .map((point) => point.totalStudents)
              : [...byCity.value.values()],
        },
      ],
    },
    {
      title: "Gender Distribution",
      icon: "i-lucide-pie-chart",
      type: "donut",
      labels:
        genderDistribution.value.length > 0
          ? genderDistribution.value.map((point) => point.gender)
          : ["Male", "Female", "Not filled"],
      series: [
        {
          name: "Students",
          data:
            genderDistribution.value.length > 0
              ? genderDistribution.value.map((point) => point.totalStudents)
              : [
                  students.value.filter((student) => student.gender === "Male")
                    .length,
                  students.value.filter(
                    (student) => student.gender === "Female",
                  ).length,
                  students.value.filter(
                    (student) => student.gender === "Not filled",
                  ).length,
                ],
        },
      ],
    },
    {
      title: "Student Login Activity",
      icon: "i-lucide-activity",
      type: "bar",
      labels:
        studentActivity.value.length > 0
          ? studentActivity.value.map((point) => point.loginStatus)
          : ["Active", "Inactive"],
      series: [
        {
          name: "Students",
          data:
            studentActivity.value.length > 0
              ? studentActivity.value.map((point) => point.totalStudents)
              : [
                  dashboardSummary.value?.totalActiveStudents ??
                    students.value.filter(
                      (student) => student.status === "Active",
                    ).length,
                  dashboardSummary.value?.totalInactiveStudents ??
                    students.value.filter(
                      (student) => student.status === "Inactive",
                    ).length,
                ],
        },
      ],
    },
  ]);

  const studentTableRows = computed(() =>
    students.value.map((student) => ({
      ...student,
      action: student.id,
    })),
  );

  const studentPageOptions = [10, 20, 30, 50, 100];
  const studentPage = computed({
    get: () => pagination.value.currentPage,
    set: (page: number) => setPage(page),
  });
  const studentPerPage = computed({
    get: () => pagination.value.perPage,
    set: (perPage: number) => setPerPage(perPage),
  });
  const studentTotal = computed(() => pagination.value.total);

  const submitSearch = () => {
    applySearch(searchQuery.value);
  };

  watch(partnerInstitute, (institute) => {
    if (institute) {
      filters.institute = institute;
    }
  });

  watch(
    () => filters.institute,
    (institute) => {
      if (partnerInstitute.value && institute !== partnerInstitute.value) {
        filters.institute = partnerInstitute.value;
      }
    },
  );

  const table = computed<AnalyticsTable>(() => ({
    title: "Student List",
    icon: "i-lucide-users",
    rowKey: "id",
    columns: studentTableColumns,
    rows: studentTableRows.value,
  }));

  const paginationLabel = computed(() => {
    if (studentTotal.value === 0) {
      return "No students found";
    }

    const start = (studentPage.value - 1) * studentPerPage.value + 1;
    const end = Math.min(
      studentPage.value * studentPerPage.value,
      studentTotal.value,
    );

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${studentTotal.value.toLocaleString()}`;
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

  return {
    charts,
    cities,
    departments,
    error,
    filters,
    genderOptions: [...studentGenderOptions],
    institutes,
    isLoading,
    isPartnerScoped,
    liveError,
    liveIsLoading,
    metrics,
    paginationLabel,
    partnerInstituteLabel,
    profileOpen,
    searchQuery,
    selectedStudent,
    selectedStudentIsLoading,
    statusOptions: [...studentStatusOptions],
    studentPage,
    studentPageOptions,
    studentPerPage,
    studentTotal,
    table,
    submitSearch,
    viewStudent,
  };
};
