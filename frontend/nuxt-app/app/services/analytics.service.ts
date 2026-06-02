import { api } from "~/services/api";
import type { Course, Student } from "~/types/analytics";
import type {
  CourseCompletionApi,
  CourseViewsApi,
  DashboardSummaryApi,
  PopularCourseApi,
  StudentCityDistributionApi,
  StudentDepartmentDistributionApi,
  StudentGenderDistributionApi,
  StudentInstitutionDistributionApi,
  StudentsQuery,
  StudentsResponse,
  StudentActivityApi,
  UserActivityApi,
} from "~/types/analytics-api";
import {
  analyticsPages,
  createLiveDashboardMetrics,
} from "~/constants/analyticsPages";

export const getDashboardSummary = async () => {
  const summary = await getDashboardSummaryData();

  return {
    ...analyticsPages.dashboard,
    endpoint: "GET /api/dashboard/summary",
    metrics: createLiveDashboardMetrics(summary),
    charts: [],
  };
};

export const getDashboardSummaryData = async () => {
  const { data } = await api.get<DashboardSummaryApi>("/dashboard/summary");
  return data;
};

export const getStudentGenderDistribution = async () => {
  const { data } = await api.get<StudentGenderDistributionApi[]>(
    "/dashboard/students/gender",
  );
  return data;
};

export const getStudentsByInstitution = async () => {
  const { data } = await api.get<StudentInstitutionDistributionApi[]>(
    "/dashboard/students/by-institution",
  );
  return data;
};

export const getStudentsByDepartment = async () => {
  const { data } = await api.get<StudentDepartmentDistributionApi[]>(
    "/dashboard/students/by-department",
  );
  return data;
};

export const getStudentsByCity = async () => {
  const { data } = await api.get<StudentCityDistributionApi[]>(
    "/dashboard/students/by-city",
  );
  return data;
};

export const getPopularCourses = async () => {
  const { data } = await api.get<PopularCourseApi[]>(
    "/dashboard/courses/popular",
  );
  return data;
};

export const getCourseCompletion = async () => {
  const { data } = await api.get<CourseCompletionApi[]>(
    "/dashboard/courses/completion",
  );
  return data;
};

export const getCourseViews = async () => {
  const { data } = await api.get<CourseViewsApi[]>("/dashboard/courses/views");
  return data;
};

export const getUserActivity = async () => {
  const { data } = await api.get<UserActivityApi[]>(
    "/dashboard/users/activity",
  );
  return data;
};

export const getStudentActivity = async () => {
  const { data } = await api.get<StudentActivityApi[]>(
    "/dashboard/students/activity",
  );
  return data;
};

export const getAnalyticsPage = async (key: string) => {
  return analyticsPages[key];
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
