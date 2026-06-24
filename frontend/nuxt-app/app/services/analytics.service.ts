import { api } from "~/services/api";
import type { Course, Student } from "~/types/analytics";
import type {
  AnalyticsChart,
  AnalyticsPageConfig,
} from "~/types/analytics";
import type {
  CourseViewsApi,
  DashboardChartFilters,
  DashboardSummaryApi,
  InstituteAnalyticsFilters,
  InstituteAnalyticsResponse,
  PopularCourseApi,
  StudentCityDistributionApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
  StudentsQuery,
  StudentsResponse,
  StudentActivityApi,
  StudentActivityTrendApi,
  LearningActivityFilters,
  LearningActivityResponse,
  UserActivityApi,
} from "~/types/analytics-api";
import {
  analyticsPages,
  createLiveDashboardMetrics,
} from "~/constants/analyticsPages";
import { formatStudentDepartmentLabel } from "~/utils/studentDepartment";

export const getDashboardSummary = async () => {
  const summary = await getDashboardSummaryData();
  const [
    institutions,
    departments,
    gender,
    activeGender,
    studentActivity,
    popularCourses,
    userActivity,
  ] = await Promise.allSettled([
    getStudentsByInstitution(),
    getStudentsByDepartment(),
    getStudentGenderDistribution(),
    getStudentGenderDistribution({ status: "Active" }),
    getStudentActivityTrend(),
    getPopularCourses(),
    getUserActivity(),
  ]);

  return {
    ...analyticsPages.dashboard,
    endpoint: "GET /api/dashboard/summary",
    metrics: createLiveDashboardMetrics(
      summary,
      gender.status === "fulfilled" ? gender.value : [],
      activeGender.status === "fulfilled" ? activeGender.value : [],
    ),
    charts: createDashboardCharts({
      institutions:
        institutions.status === "fulfilled" ? institutions.value : [],
      departments: departments.status === "fulfilled" ? departments.value : [],
      gender: gender.status === "fulfilled" ? gender.value : [],
      studentActivity:
        studentActivity.status === "fulfilled" ? studentActivity.value : [],
      popularCourses:
        popularCourses.status === "fulfilled" ? popularCourses.value : [],
      userActivity:
        userActivity.status === "fulfilled" ? userActivity.value : [],
    }),
  } satisfies AnalyticsPageConfig;
};

const createDashboardCharts = ({
  institutions,
  departments,
  gender,
  studentActivity,
  popularCourses,
  userActivity,
}: {
  institutions: StudentInstitutionDistributionApi[];
  departments: StudentDepartmentDistributionApi[];
  gender: StudentGenderDistributionApi[];
  studentActivity: StudentActivityTrendApi[];
  popularCourses: PopularCourseApi[];
  userActivity: UserActivityApi[];
}): AnalyticsChart[] => [
  {
    title: "Student Activity",
    description: "Are students actively using the platform?",
    icon: "i-lucide-activity",
    type: "line",
    height: "320px",
    wide: true,
    labels: studentActivity.map((point) => point.period),
    series: [
      {
        name: "Students",
        data: studentActivity.map((point) => point.totalStudents),
      },
    ],
  },
  {
    title: "Student Distribution by Institution",
    description: "Which institution contributes the most students?",
    icon: "i-lucide-building-2",
    type: "horizontalBar",
    height: "360px",
    wide: true,
    labels: institutions.slice(0, 10).map((point) => point.institution),
    series: [
      {
        name: "Students",
        data: institutions.slice(0, 10).map((point) => point.totalStudents),
      },
    ],
  },
  {
    title: "Student Distribution by Department",
    description: "Which departments have the largest learner population?",
    icon: "i-lucide-network",
    type: "horizontalBar",
    height: "360px",
    wide: true,
    labels: departments
      .slice(0, 10)
      .map((point) => formatStudentDepartmentLabel(point.department)),
    series: [
      {
        name: "Students",
        data: departments.slice(0, 10).map((point) => point.totalStudents),
      },
    ],
  },
  {
    title: "Gender Distribution",
    description: "What is the student demographic balance?",
    icon: "i-lucide-pie-chart",
    type: "donut",
    labels: gender.map((point) => point.gender),
    series: [
      {
        name: "Students",
        data: gender.map((point) => point.totalStudents),
      },
    ],
  },
  {
    title: "Popular Courses",
    description: "Which courses attract the highest enrollment?",
    icon: "i-lucide-users",
    type: "horizontalBar",
    height: "360px",
    wide: true,
    labels: popularCourses.slice(0, 10).map((course) => course.courseName),
    series: [
      {
        name: "Enrollments",
        data: popularCourses
          .slice(0, 10)
          .map((course) => course.totalEnrollments),
      },
    ],
  },
  {
    title: "User Login Status",
    description: "How many users are active, inactive, or never logged in?",
    icon: "i-lucide-activity",
    type: "donut",
    labels: userActivity.map((point) => point.loginStatus),
    series: [
      {
        name: "Users",
        data: userActivity.map((point) => point.totalUsers),
      },
    ],
  },
];

export const getDashboardSummaryData = async () => {
  const { data } = await api.get<DashboardSummaryApi>("/dashboard/summary");
  return data;
};

export const getInstituteAnalytics = async (
  params: InstituteAnalyticsFilters = {},
) => {
  const { data } = await api.get<InstituteAnalyticsResponse>(
    "/dashboard/institutes",
    { params },
  );

  return data;
};

export const getStudentGenderDistribution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentGenderDistributionApi[]>(
    "/dashboard/students/gender",
    { params },
  );
  return data;
};

export const getStudentsByInstitution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentInstitutionDistributionApi[]>(
    "/dashboard/students/by-institution",
    { params },
  );
  return data;
};

export const getStudentsByDepartment = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentDepartmentDistributionApi[]>(
    "/dashboard/students/by-department",
    { params },
  );
  return data;
};

export const getStudentsByCity = async (params: DashboardChartFilters = {}) => {
  const { data } = await api.get<StudentCityDistributionApi[]>(
    "/dashboard/students/by-city",
    { params },
  );
  return data;
};

export const getPopularCourses = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<PopularCourseApi[]>(
    "/dashboard/courses/popular",
    { params },
  );
  return data;
};

export const getCourseViews = async () => {
  const { data } = await api.get<CourseViewsApi[]>("/dashboard/courses/views");
  return data;
};

export const getUserActivity = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<UserActivityApi[]>(
    "/dashboard/users/activity",
    { params },
  );
  return data;
};

export const getLearningActivity = async (
  params: LearningActivityFilters = {},
) => {
  const { data } = await api.get<LearningActivityResponse>(
    "/dashboard/learning-activity",
    {
      params,
      timeout: 60000,
    },
  );
  return data;
};

export const getStudentActivity = async (params: DashboardChartFilters = {}) => {
  const { data } = await api.get<StudentActivityApi[]>(
    "/dashboard/students/activity",
    { params },
  );
  return data;
};

export const getStudentActivityTrend = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentActivityTrendApi[]>(
    "/dashboard/students/activity-trend",
    { params },
  );
  return data;
};


export const getStudents = async (params: StudentsQuery = {}) => {
  const { data } = await api.get<StudentsResponse>("/dashboard/students", {
    params,
  });
  return data;
};

export const getStudent = async (id: number) => {
  const { data } = await api.get<Student>(`/dashboard/students/${id}`);
  return data;
};

export const getCourses = async () => {
  const { data } = await api.get<Course[]>("/dashboard/courses");
  return data;
};
