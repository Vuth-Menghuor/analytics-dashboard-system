const pageTitles: Record<string, string> = {
  "/courses": "navigation.courses",
  "/institutes": "navigation.institutes",
  "/learning-activity": "navigation.learningActivity",
  "/manager/dashboard": "pageTitle.managerDashboard",
  "/partner-requests": "navigation.partnerRequests",
  "/partner/dashboard": "pageTitle.partnerDashboard",
  "/profile": "pageTitle.profile",
  "/reports": "pageTitle.reports",
  "/students": "navigation.students",
  "/users": "pageTitle.userManagement",
  "/visitor/dashboard": "pageTitle.visitorDashboard",
};

export const usePageTitle = () => {
  const route = useRoute();
  const { t } = useI18n();

  return computed(() => t(pageTitles[route.path] ?? "pageTitle.dashboard"));
};
