import { api } from "~/services/api";
import type { Course, Student } from "~/types/analytics";
import type { AnalyticsPageConfig } from "~/types/analytics";
import type {
  CourseViewsApi,
  DashboardChartFilters,
  DashboardSummaryApi,
  InstituteAnalyticsFilters,
  InstituteAnalyticsResponse,
  PopularCourseApi,
  StudentCityDistributionApi,
  StudentAnalyticsOverviewApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
  StudentsQuery,
  StudentsResponse,
  StudentActivityApi,
  LearningActivityFilters,
  LearningActivityResponse,
  UserActivityApi,
} from "~/types/analytics-api";
import {
  analyticsPages,
  createLiveDashboardMetrics,
} from "~/constants/analyticsPages";

const analyticsChartRequestConfig = {
  timeout: 60000,
};

const analyticsSummaryRequestConfig = {
  timeout: 60000,
};

export const getDashboardSummary = async () => {
  const summary = await getDashboardSummaryData();
  const [gender, activeGender] = await Promise.allSettled([
    getStudentGenderDistribution(),
    getStudentGenderDistribution({ status: "Active" }),
  ]);

  return {
    ...analyticsPages.dashboard,
    endpoint: "GET /api/dashboard/summary",
    metrics: createLiveDashboardMetrics(
      summary,
      gender.status === "fulfilled" ? gender.value : [],
      activeGender.status === "fulfilled" ? activeGender.value : [],
    ),
    charts: [],
  } satisfies AnalyticsPageConfig;
};

export const getPublicDashboardSummary = async () => {
  const summary = await getPublicDashboardSummaryData();
  const [gender, activeGender] = await Promise.allSettled([
    getPublicStudentGenderDistribution(),
    getPublicStudentGenderDistribution({ status: "Active" }),
  ]);

  return {
    ...analyticsPages.dashboard,
    endpoint: "GET /api/public/dashboard/summary",
    metrics: createLiveDashboardMetrics(
      summary,
      gender.status === "fulfilled" ? gender.value : [],
      activeGender.status === "fulfilled" ? activeGender.value : [],
    ),
    charts: [],
  } satisfies AnalyticsPageConfig;
};

export const getDashboardSummaryData = async () => {
  const { data } = await api.get<DashboardSummaryApi>(
    "/dashboard/summary",
    analyticsSummaryRequestConfig,
  );
  return data;
};

export const getPublicDashboardSummaryData = async () => {
  const { data } = await api.get<DashboardSummaryApi>(
    "/public/dashboard/summary",
    analyticsSummaryRequestConfig,
  );
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

export const getPublicInstituteAnalytics = async (
  params: InstituteAnalyticsFilters = {},
) => {
  const { data } = await api.get<InstituteAnalyticsResponse>(
    "/public/dashboard/institutes",
    { params },
  );

  return data;
};

export const getStudentGenderDistribution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentGenderDistributionApi[]>(
    "/dashboard/students/gender",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getPublicStudentGenderDistribution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentGenderDistributionApi[]>(
    "/public/dashboard/students/gender",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getStudentsByInstitution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentInstitutionDistributionApi[]>(
    "/dashboard/students/by-institution",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getPublicStudentsByInstitution = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentInstitutionDistributionApi[]>(
    "/public/dashboard/students/by-institution",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getStudentAnalyticsOverview = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentAnalyticsOverviewApi>(
    "/dashboard/students/overview",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getStudentsByDepartment = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentDepartmentDistributionApi[]>(
    "/dashboard/students/by-department",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getPublicStudentsByDepartment = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentDepartmentDistributionApi[]>(
    "/public/dashboard/students/by-department",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getStudentsByCity = async (params: DashboardChartFilters = {}) => {
  const { data } = await api.get<StudentCityDistributionApi[]>(
    "/dashboard/students/by-city",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getPopularCourses = async (params: DashboardChartFilters = {}) => {
  const { data } = await api.get<PopularCourseApi[]>(
    "/dashboard/courses/popular",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getCourseViews = async () => {
  const { data } = await api.get<CourseViewsApi[]>("/dashboard/courses/views");
  return data;
};

export const getUserActivity = async (params: DashboardChartFilters = {}) => {
  const { data } = await api.get<UserActivityApi[]>(
    "/dashboard/users/activity",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getLearningActivity = async (
  params: LearningActivityFilters = {},
) => {
  const { data } = await api.get<LearningActivityResponse>(
    "/dashboard/learning-activity",
    { params, ...analyticsChartRequestConfig },
  );
  return data;
};

export const getStudentActivity = async (
  params: DashboardChartFilters = {},
) => {
  const { data } = await api.get<StudentActivityApi[]>(
    "/dashboard/students/activity",
    { params, ...analyticsChartRequestConfig },
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
