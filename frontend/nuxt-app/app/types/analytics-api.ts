import type { Student } from "~/types/analytics";

export type DashboardMetricComparisonApi = {
  currentValue: number;
  previousValue: number;
  percentageChange: number | null;
  direction: "up" | "down" | "neutral";
};

export type DashboardSummaryApi = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalActiveStudents: number;
  totalInactiveStudents: number;
  totalEnrollments: number;
  comparisons?: {
    activeStudents?: DashboardMetricComparisonApi;
    totalEnrollments?: DashboardMetricComparisonApi;
    totalStudents?: DashboardMetricComparisonApi;
    totalCourses?: DashboardMetricComparisonApi;
  };
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
  overallTotalStudents?: number;
};

export type PopularCourseApi = {
  id: number;
  courseName: string;
  totalEnrollments: number;
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

export type LearningActivityFilters = {
  dateFrom?: string;
  dateTo?: string;
  institution?: string;
  department?: string;
  city?: string;
  courseId?: number;
  activityType?: string;
  userStatus?: string;
  search?: string;
  section?: "overview" | "trend" | "institutes" | "departments" | "courses" | "students" | "events" | "all";
  page?: number;
  perPage?: number;
};

export type LearningActivityResponse = {
  filters: LearningActivityFilters;
  options: {
    institutes: string[];
    departments: string[];
    cities: string[];
    courses: Array<{ id: number; name: string }>;
    activityTypes: string[];
    userStatuses: string[];
  };
  meta: {
    institutes: LearningActivityPaginationMeta;
    departments: LearningActivityPaginationMeta;
    courses: LearningActivityPaginationMeta;
    students: LearningActivityPaginationMeta;
    events: LearningActivityPaginationMeta;
  };
  summary: {
    totalActivities: number;
    activeUsers: number;
    totalLogins: number;
    courseViews: number;
    assignmentSubmissions: number;
    quizSubmissions: number;
    averageActivitiesPerStudent: number;
    mostActiveCourse: string;
    snapshotDate: string | null;
  };
  trend: Array<{
    period: string;
    logins: number;
    courseViews: number;
    assignmentSubmissions: number;
    quizAttempts: number;
    forumActivity: number;
  }>;
  activityTypes: Array<{
    label: string;
    total: number;
  }>;
  loginHours: Array<{
    hour: number;
    label: string;
    logins: number;
  }>;
  institutes: Array<{
    institution: string;
    activities: number;
    activeUsers: number;
    courses: number;
    activityRate: number;
  }>;
  departments: Array<{
    department: string;
    activities: number;
    activeStudents: number;
    topCourse: string;
  }>;
  courses: Array<{
    id: number;
    course: string;
    views: number;
  }>;
  students: LearningActivityStudentRow[];
  events: LearningActivityEventRow[];
};

export type LearningActivityEventRow = {
  id: number;
  time: string;
  student: string;
  course: string;
  activityType: string;
  description: string;
};

export type LearningActivityPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
};

export type LearningActivityStudentRow = {
  id: number;
  student: string;
  email: string;
  institution: string;
  department: string;
  city: string;
  course: string;
  lastLogin: string;
  activities: number;
  coursesAccessed: number;
  status: "Active" | "Inactive";
};

export type InstituteAnalyticsFilters = {
  search?: string;
  institution?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InstituteAnalyticsRow = {
  rank: number | null;
  institution: string;
  students: number;
  courses: number;
  enrollmentRecords: number;
  departments: number;
  activeStudents: number;
  activityRate: number;
  lastActivity: string | null;
  rankEligible: boolean;
};

export type InstituteAnalyticsResponse = {
  snapshotDate: string | null;
  filters: InstituteAnalyticsFilters & {
    selectedInstitute: string | null;
  };
  options: {
    institutes: string[];
    departments: string[];
  };
  summary: {
    institutes: number;
    students: number;
    courses: number;
    enrollmentRecords: number;
    activeStudents: number;
    activityRate: number;
  };
  institutes: InstituteAnalyticsRow[];
  enrollmentTrend: Array<{
    period: string;
    enrollments: number;
    students: number;
  }>;
  departments: Array<{
    department: string;
    students: number;
    share: number;
  }>;
  courses: Array<{
    course: string;
    students: number;
    enrollmentRecords: number;
  }>;
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

export type DashboardChartFilters = {
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
