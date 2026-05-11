import {
  dashboardMetrics,
  dashboardNavItems,
  dashboardReports,
  dashboardUsers,
  weeklyTraffic,
} from "~/constants/dashboard";

export const useDashboardData = () => {
  return {
    metrics: dashboardMetrics,
    navItems: dashboardNavItems,
    reports: dashboardReports,
    users: dashboardUsers,
    weeklyTraffic,
  };
};
