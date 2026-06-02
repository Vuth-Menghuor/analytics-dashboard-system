import type { Student } from "~/types/analytics";

export type DashboardSummaryApi = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalActiveStudents: number;
  totalInactiveStudents: number;
  totalEnrollments: number;
  totalCourseCompletions: number;
  totalQuizAttempts: number;
  totalAssignmentsSubmitted: number;
};

export type StudentGenderDistributionApi = {
  gender: string;
  totalStudents: number;
  percentage: number;
};

export type StudentDepartmentDistributionApi = {
  institution: string;
  department: string;
  totalStudents: number;
  percentage: number;
};

export type StudentInstitutionDistributionApi = {
  institution: string;
  totalStudents: number;
};

export type StudentCityDistributionApi = {
  city: string;
  totalStudents: number;
};

export type PopularCourseApi = {
  id: number;
  courseName: string;
  totalEnrollments: number;
};

export type CourseCompletionApi = {
  id: number;
  courseName: string;
  totalEnrolledStudents: number;
  completedStudents: number;
  completionRatePercentage: number;
};

export type CourseViewsApi = {
  id: number;
  courseName: string;
  totalViews: number;
};

export type UserActivityApi = {
  loginStatus: string;
  totalUsers: number;
};

export type StudentActivityApi = {
  loginStatus: string;
  totalStudents: number;
};

export type StudentsQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  institution?: string;
  department?: string;
  city?: string;
  gender?: string;
  status?: string;
};

export type StudentsResponse = {
  data: Student[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
};
