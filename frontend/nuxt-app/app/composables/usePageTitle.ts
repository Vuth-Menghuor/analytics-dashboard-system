const pageTitles: Record<string, string> = {
  "/courses": "navigation.courses",
  "/institutes": "navigation.institutes",
  "/manager/dashboard": "pageTitle.managerDashboard",
  "/partner-requests": "navigation.partnerRequests",
  "/partner/dashboard": "pageTitle.partnerDashboard",
  "/profile": "pageTitle.profile",
  "/students": "navigation.students",
  "/users": "pageTitle.userManagement",
  "/visitor/courses": "navigation.courses",
  "/visitor/dashboard": "pageTitle.visitorDashboard",
  "/visitor/institutions": "navigation.institutes",
};

export const usePageTitle = () => {
  const route = useRoute();
  const { t } = useI18n();

  return computed(() => t(pageTitles[route.path] ?? "pageTitle.dashboard"));
};
