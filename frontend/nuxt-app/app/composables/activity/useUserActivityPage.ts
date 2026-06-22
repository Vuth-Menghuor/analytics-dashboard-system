import { appColors } from "~/constants/colors";
import { studentInstituteAllOption } from "~/constants/studentAnalytics";
import { getLearningActivity } from "~/services/analytics.service";
import type { AnalyticsChart, AnalyticsTable } from "~/types/analytics";
import type {
  LearningActivityFilters,
  LearningActivityPaginationMeta,
  LearningActivityResponse,
} from "~/types/analytics-api";
import type { Metric } from "~/types/dashboard";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";
import { formatStudentInstituteLabel } from "~/utils/studentInstitute";

const allDepartmentOption = "All departments";
const allCityOption = "All cities";
const allCourseOption = "All courses";
const allActivityTypeOption = "All activity types";
const allUserStatusOption = "All user statuses";
type LearningActivityTab = "overview" | "organizations" | "courses";
type OrganizationDimension = "institutes" | "departments";
type LearningActivitySection =
  | "overview"
  | "institutes"
  | "departments"
  | "courses"
  | "students";
type PaginatedLearningActivitySection =
  | "institutes"
  | "departments"
  | "courses"
  | "students";

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 100000 ? "compact" : "standard",
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value);

const toSelectItems = (items: string[]) =>
  items.map((item) => ({
    label:
      item === studentInstituteAllOption ? item : formatStudentInstituteLabel(item),
    value: item,
  }));

export const useUserActivityPage = () => {
  const auth = useAuthStore();
  const activity = ref<LearningActivityResponse | null>(null);
  const activityLoading = ref(true);
  const activityError = ref("");
  const filterOptionsLoading = ref(false);
  const activeTab = ref<LearningActivityTab>("overview");
  const organizationDimension = ref<OrganizationDimension>("institutes");
  const loadedSections = ref<LearningActivitySection[]>([]);
  const sectionPagination = reactive<Record<PaginatedLearningActivitySection, {
    page: number;
    perPage: number;
  }>>({
    institutes: { page: 1, perPage: 30 },
    departments: { page: 1, perPage: 30 },
    courses: { page: 1, perPage: 25 },
    students: { page: 1, perPage: 10 },
  });
  const pageSizeOptions = [10, 25, 50, 100];
  let latestActivityRequestId = 0;

  const tabs: Array<{
    label: string;
    value: LearningActivityTab;
    icon: string;
  }> = [
    {
      label: "Overview",
      value: "overview",
      icon: "i-lucide-layout-dashboard",
    },
    {
      label: "Organizations",
      value: "organizations",
      icon: "i-lucide-building-2",
    },
    {
      label: "Courses",
      value: "courses",
      icon: "i-lucide-book-open",
    },
  ];
  const organizationDimensionOptions: Array<{
    label: string;
    value: OrganizationDimension;
  }> = [
    { label: "Institutes", value: "institutes" },
    { label: "Departments", value: "departments" },
  ];

  const filters = reactive({
    dateFrom: "2025-07-01",
    dateTo: "2025-07-28",
    institution: studentInstituteAllOption,
    department: allDepartmentOption,
    city: allCityOption,
    courseId: 0,
    activityType: allActivityTypeOption,
    userStatus: allUserStatusOption,
    search: "",
  });

  const partnerInstituteLabel = computed(() =>
    auth.user?.role === "partner" && auth.user.institution_name
      ? `Institute: ${auth.user.institution_name}`
      : "",
  );
  const isPartnerScoped = computed(() => Boolean(partnerInstituteLabel.value));

  if (auth.user?.role === "partner" && auth.user.institution_name) {
    filters.institution = auth.user.institution_name;
  }

  const currentQuery = (section: LearningActivitySection): LearningActivityFilters => {
    const pagination =
      section === "institutes" ||
      section === "departments" ||
      section === "courses" ||
      section === "students"
        ? sectionPagination[section]
        : null;

    return {
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      institution:
        filters.institution === studentInstituteAllOption
          ? undefined
          : filters.institution,
      department:
        filters.department === allDepartmentOption ? undefined : filters.department,
      city: filters.city === allCityOption ? undefined : filters.city,
      courseId: filters.courseId || undefined,
      activityType:
        filters.activityType === allActivityTypeOption
          ? undefined
          : filters.activityType,
      userStatus:
        filters.userStatus === allUserStatusOption ? undefined : filters.userStatus,
      search: filters.search.trim() || undefined,
      section,
      page: pagination?.page,
      perPage: pagination?.perPage,
    };
  };

  const mergeActivity = (
    current: LearningActivityResponse | null,
    response: LearningActivityResponse,
    section: LearningActivitySection,
  ): LearningActivityResponse => {
    if (!current || section === "overview") {
      return {
        ...response,
        institutes: section === "overview" ? current?.institutes ?? [] : response.institutes,
        departments: section === "overview" ? current?.departments ?? [] : response.departments,
        courses: section === "overview" ? current?.courses ?? [] : response.courses,
        students: section === "overview" ? current?.students ?? [] : response.students,
        meta: section === "overview" && current ? current.meta : response.meta,
      };
    }

    return {
      ...current,
      filters: response.filters,
      options: response.options,
      meta: {
        ...current.meta,
        ...(section === "institutes" ? { institutes: response.meta.institutes } : {}),
        ...(section === "departments" ? { departments: response.meta.departments } : {}),
        ...(section === "courses" ? { courses: response.meta.courses } : {}),
        ...(section === "students" ? { students: response.meta.students } : {}),
      },
      ...(section === "institutes" ? { institutes: response.institutes } : {}),
      ...(section === "departments" ? { departments: response.departments } : {}),
      ...(section === "courses" ? { courses: response.courses } : {}),
      ...(section === "students" ? { students: response.students } : {}),
    };
  };

  const markSectionLoaded = (section: LearningActivitySection) => {
    if (!loadedSections.value.includes(section)) {
      loadedSections.value = [...loadedSections.value, section];
    }
  };

  const loadSections = async (sections: LearningActivitySection[]) => {
    const requestId = ++latestActivityRequestId;

    activityLoading.value = true;
    activityError.value = "";

    try {
      const responses = await Promise.all(
        sections.map(async (section) => ({
          section,
          response: await getLearningActivity(currentQuery(section)),
        })),
      );

      if (requestId === latestActivityRequestId) {
        let mergedActivity = activity.value;

        responses.forEach(({ section, response }) => {
          mergedActivity = mergeActivity(mergedActivity, response, section);
          markSectionLoaded(section);
        });

        activity.value = mergedActivity;
      }
    } catch {
      if (requestId === latestActivityRequestId) {
        activity.value = null;
        activityError.value = "Unable to load learning activity analytics.";
      }
    } finally {
      if (requestId === latestActivityRequestId) {
        activityLoading.value = false;
        filterOptionsLoading.value = false;
      }
    }
  };

  const sectionsForTab = (
    tab: LearningActivityTab = activeTab.value,
  ): LearningActivitySection[] => {
    if (tab === "organizations") {
      return [organizationDimension.value, "students"];
    }

    return [tab, "students"];
  };

  const loadCurrentTab = (force = false) => {
    const sections = sectionsForTab();
    const pendingSections = force
      ? sections
      : sections.filter((section) => !loadedSections.value.includes(section));

    if (pendingSections.length > 0) {
      void loadSections(pendingSections);
    }
  };

  onMounted(() => loadCurrentTab());

  watch(activeTab, () => {
    loadCurrentTab();
  });

  watch(organizationDimension, () => {
    if (activeTab.value === "organizations") {
      loadCurrentTab();
    }
  });

  const reloadCurrentSection = () => {
    loadCurrentTab(true);
  };

  const refresh = () => reloadCurrentSection();
  const applyFilters = () => {
    resetPagination();
    loadedSections.value = [];
    activity.value = null;
    loadCurrentTab(true);
  };

  const changeInstitute = (institution: unknown) => {
    if (typeof institution === "string") {
      filters.institution = institution;
    }

    filters.department = allDepartmentOption;
    filters.city = allCityOption;
    filterOptionsLoading.value = true;
    resetPagination();
    loadedSections.value = [];
    activity.value = null;
    loadCurrentTab(true);
  };

  const changeDepartment = (department: unknown) => {
    if (typeof department === "string") {
      filters.department = department;
    }

    filters.city = allCityOption;
    filterOptionsLoading.value = true;
    resetPagination();
    loadedSections.value = [];
    activity.value = null;
    loadCurrentTab(true);
  };

  const clearFilters = () => {
    filters.dateFrom = "2025-07-01";
    filters.dateTo = "2025-07-28";
    if (!isPartnerScoped.value) {
      filters.institution = studentInstituteAllOption;
    }
    filters.department = allDepartmentOption;
    filters.city = allCityOption;
    filters.courseId = 0;
    filters.activityType = allActivityTypeOption;
    filters.userStatus = allUserStatusOption;
    filters.search = "";
    resetPagination();
    loadedSections.value = [];
    activity.value = null;
    loadCurrentTab(true);
  };

  const hasFilters = computed(
    () =>
      filters.dateFrom !== "2025-07-01" ||
      filters.dateTo !== "2025-07-28" ||
      (!isPartnerScoped.value &&
        filters.institution !== studentInstituteAllOption) ||
      filters.department !== allDepartmentOption ||
      filters.city !== allCityOption ||
      filters.courseId !== 0 ||
      filters.activityType !== allActivityTypeOption ||
      filters.userStatus !== allUserStatusOption ||
      Boolean(filters.search.trim()),
  );

  const instituteFilterOptions = computed(() =>
    toSelectItems([
      ...(isPartnerScoped.value ? [] : [studentInstituteAllOption]),
      ...(activity.value?.options.institutes ?? []),
    ]),
  );
  const departmentFilterOptions = computed(() =>
    toSelectItems([allDepartmentOption, ...(activity.value?.options.departments ?? [])]),
  );
  const cityFilterOptions = computed(() =>
    toSelectItems([allCityOption, ...(activity.value?.options.cities ?? [])]),
  );
  const courseFilterOptions = computed(() => [
    { label: allCourseOption, value: 0 },
    ...(activity.value?.options.courses ?? []).map((course) => ({
      label: course.name,
      value: course.id,
    })),
  ]);
  const activityTypeOptions = computed(() =>
    toSelectItems(activity.value?.options.activityTypes ?? [allActivityTypeOption]),
  );
  const userStatusOptions = computed(() =>
    toSelectItems(activity.value?.options.userStatuses ?? [allUserStatusOption]),
  );

  const summary = computed(
    () =>
      activity.value?.summary ?? {
        totalActivities: 0,
        activeUsers: 0,
        totalLogins: 0,
        courseViews: 0,
        assignmentSubmissions: 0,
        quizSubmissions: 0,
      },
  );

  const metrics = computed<Metric[]>(() => [
    {
      label: "Total Activities",
      value: formatCompact(summary.value.totalActivities),
      trend: "Matching current filters",
      icon: "Activity",
      color: appColors.blue,
    },
    {
      label: "Active Users",
      value: formatCompact(summary.value.activeUsers),
      trend: "Distinct users in activity logs",
      icon: "UserRoundCheck",
      color: appColors.success,
    },
    {
      label: "Total Logins",
      value: formatCompact(summary.value.totalLogins),
      trend: "Moodle login events",
      icon: "LogIn",
      color: appColors.purple,
    },
    {
      label: "Course Views",
      value: formatCompact(summary.value.courseViews),
      trend: "Core view activity",
      icon: "Eye",
      color: appColors.slate,
    },
    {
      label: "Assignment Submissions",
      value: formatCompact(summary.value.assignmentSubmissions),
      trend: "Submitted assignment events",
      icon: "ClipboardCheck",
      color: appColors.warning,
    },
    {
      label: "Quiz Submissions",
      value: formatCompact(summary.value.quizSubmissions),
      trend: "Submitted quiz events",
      icon: "CircleHelp",
      color: appColors.amber,
    },
  ]);

  const charts = computed<AnalyticsChart[]>(() => [
    {
      title: "Learning Activity Trend",
      description: "Logins, course views, submissions, quiz attempts, and forum activity.",
      icon: "i-lucide-chart-line",
      type: "line",
      wide: true,
      height: "380px",
      labels: activity.value?.trend.map((point) => point.period) ?? [],
      series: [
        {
          name: "Logins",
          data: activity.value?.trend.map((point) => point.logins) ?? [],
        },
        {
          name: "Course Views",
          data: activity.value?.trend.map((point) => point.courseViews) ?? [],
        },
        {
          name: "Assignments",
          data:
            activity.value?.trend.map(
              (point) => point.assignmentSubmissions,
            ) ?? [],
        },
        {
          name: "Quiz Attempts",
          data: activity.value?.trend.map((point) => point.quizAttempts) ?? [],
        },
        {
          name: "Forum Activity",
          data: activity.value?.trend.map((point) => point.forumActivity) ?? [],
        },
      ],
    },
    {
      title: "Activity by Type",
      description: "What users mostly do in Moodle.",
      icon: "i-lucide-bar-chart-3",
      type: "bar",
      wide: true,
      height: "420px",
      labels: activity.value?.activityTypes.map((point) => point.label) ?? [],
      series: [
        {
          name: "Activities",
          data: activity.value?.activityTypes.map((point) => point.total) ?? [],
        },
      ],
    },
  ]);

  const overviewCharts = computed(() => charts.value.slice(0, 2));
  const organizationTable = computed<AnalyticsTable>(() => {
    if (organizationDimension.value === "departments") {
      return {
        title: "Most Active Departments",
        description:
          "Departments ranked by Moodle activity volume, with student and course context.",
        icon: "i-lucide-network",
        rowKey: "department",
        columns: [
          { key: "rank", label: "Rank", tone: "muted" },
          { key: "department", label: "Department", rowHeader: true },
          { key: "activities", label: "Activities", tone: "strong" },
          { key: "activeStudents", label: "Active Students" },
          { key: "topCourse", label: "Top Course" },
        ],
        rows:
          activity.value?.departments.map((row, index) => ({
            rank:
              (paginationMeta("departments").currentPage - 1) *
                paginationMeta("departments").perPage +
              index +
              1,
            department: formatStudentDepartmentLabel(row.department),
            activities: row.activities.toLocaleString(),
            activeStudents: row.activeStudents.toLocaleString(),
            topCourse: row.topCourse,
          })) ?? [],
      };
    }

    return {
      title: "Most Active Institutes",
      description:
        "Institutes ranked by Moodle activity volume, with user, course, and activity-rate context.",
      icon: "i-lucide-building-2",
      rowKey: "institution",
      columns: [
        { key: "rank", label: "Rank", tone: "muted" },
        { key: "institution", label: "Institute", rowHeader: true },
        { key: "activities", label: "Activities", tone: "strong" },
        { key: "activeUsers", label: "Active Users" },
        { key: "courses", label: "Courses" },
        { key: "activityRate", label: "Activity Rate" },
      ],
      rows:
        activity.value?.institutes.map((row, index) => ({
          rank:
            (paginationMeta("institutes").currentPage - 1) *
              paginationMeta("institutes").perPage +
            index +
            1,
          institution: formatStudentInstituteLabel(row.institution),
          activities: row.activities.toLocaleString(),
          activeUsers: row.activeUsers.toLocaleString(),
          courses: row.courses.toLocaleString(),
          activityRate: `${row.activityRate.toLocaleString()}%`,
        })) ?? [],
    };
  });
  const courseTable = computed<AnalyticsTable>(() => ({
    title: "Most Active Courses",
    description:
      "Courses ranked by views, with assessment and completion activity for context.",
    icon: "i-lucide-book-open",
    rowKey: "id",
    columns: [
      { key: "rank", label: "Rank", tone: "muted" },
      { key: "course", label: "Course", rowHeader: true },
      { key: "views", label: "Views", tone: "strong" },
      { key: "assignments", label: "Assignments" },
      { key: "quizzes", label: "Quizzes" },
      { key: "completions", label: "Completions" },
    ],
    rows:
      activity.value?.courses.map((row, index) => ({
        id: row.id,
        rank:
          (paginationMeta("courses").currentPage - 1) *
            paginationMeta("courses").perPage +
          index +
          1,
        course: row.course,
        views: row.views.toLocaleString(),
        assignments: row.assignments.toLocaleString(),
        quizzes: row.quizzes.toLocaleString(),
        completions: row.completionRecords.toLocaleString(),
      })) ?? [],
  }));
  const studentTable = computed<AnalyticsTable>(() => ({
    title: "Student Activity Table",
    icon: "i-lucide-users",
    description: "All students matching the current activity filters.",
    rowKey: "id",
    columns: [
      { key: "student", label: "Student", rowHeader: true },
      { key: "institution", label: "Institute" },
      { key: "department", label: "Department" },
      { key: "lastLogin", label: "Last Login" },
      { key: "activities", label: "Activities", tone: "strong" },
      { key: "status", label: "Status", type: "status", warningValues: ["Inactive"] },
    ],
    rows:
      activity.value?.students.map((row) => ({
        ...row,
        activities: row.activities.toLocaleString(),
      })) ?? [],
  }));

  function resetPagination() {
    sectionPagination.institutes.page = 1;
    sectionPagination.departments.page = 1;
    sectionPagination.courses.page = 1;
    sectionPagination.students.page = 1;
  }

  const paginationMeta = (
    section: PaginatedLearningActivitySection,
  ): LearningActivityPaginationMeta =>
    activity.value?.meta[section] ?? {
      currentPage: sectionPagination[section].page,
      perPage: sectionPagination[section].perPage,
      total: 0,
      lastPage: 1,
    };

  const paginationLabel = (
    section: PaginatedLearningActivitySection,
    itemLabel: string,
  ) => {
    const meta = paginationMeta(section);

    if (!meta.total) {
      return `No ${itemLabel}`;
    }

    const start = (meta.currentPage - 1) * meta.perPage + 1;
    const end = Math.min(meta.currentPage * meta.perPage, meta.total);

    return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${meta.total.toLocaleString()} ${itemLabel}`;
  };

  const loadPaginatedSection = (section: PaginatedLearningActivitySection) => {
    loadedSections.value = loadedSections.value.filter((item) => item !== section);
    void loadSections([section]);
  };

  const setSectionPage = (
    section: PaginatedLearningActivitySection,
    page: number,
  ) => {
    sectionPagination[section].page = page;
    loadPaginatedSection(section);
  };

  const setSectionPerPage = (
    section: PaginatedLearningActivitySection,
    perPage: number,
  ) => {
    sectionPagination[section].perPage = perPage;
    sectionPagination[section].page = 1;
    loadPaginatedSection(section);
  };

  const studentPage = computed({
    get: () => sectionPagination.students.page,
    set: (page: number) => setSectionPage("students", page),
  });
  const studentPerPage = computed({
    get: () => sectionPagination.students.perPage,
    set: (perPage: number) => setSectionPerPage("students", perPage),
  });
  const coursePage = computed({
    get: () => sectionPagination.courses.page,
    set: (page: number) => setSectionPage("courses", page),
  });
  const coursePerPage = computed({
    get: () => sectionPagination.courses.perPage,
    set: (perPage: number) => setSectionPerPage("courses", perPage),
  });
  const organizationSection = computed<"institutes" | "departments">(
    () => organizationDimension.value,
  );
  const organizationPage = computed({
    get: () => sectionPagination[organizationSection.value].page,
    set: (page: number) => setSectionPage(organizationSection.value, page),
  });
  const organizationPerPage = computed({
    get: () => sectionPagination[organizationSection.value].perPage,
    set: (perPage: number) =>
      setSectionPerPage(organizationSection.value, perPage),
  });
  return {
    activeTab,
    activityError,
    activityLoading,
    activityTypeOptions,
    applyFilters,
    charts,
    changeDepartment,
    changeInstitute,
    cityFilterOptions,
    clearFilters,
    courseFilterOptions,
    coursePage,
    coursePaginationLabel: computed(() =>
      paginationLabel("courses", "courses"),
    ),
    coursePerPage,
    courseTable,
    courseTotal: computed(() => paginationMeta("courses").total),
    departmentFilterOptions,
    error: activityError,
    filterOptionsLoading,
    filters,
    hasFilters,
    instituteFilterOptions,
    isLoading: computed(() => activityLoading.value && !activity.value),
    isPartnerScoped,
    metrics,
    organizationDimension,
    organizationDimensionOptions,
    organizationPage,
    organizationPaginationLabel: computed(() =>
      paginationLabel(organizationSection.value, organizationSection.value),
    ),
    organizationPerPage,
    organizationTable,
    organizationTotal: computed(
      () => paginationMeta(organizationSection.value).total,
    ),
    partnerInstituteLabel,
    refresh,
    studentPage,
    studentPerPage,
    studentTable,
    studentTotal: computed(() => paginationMeta("students").total),
    studentPaginationLabel: computed(() => paginationLabel("students", "students")),
    tabs,
    userStatusOptions,
    overviewCharts,
    pageSizeOptions,
  };
};
