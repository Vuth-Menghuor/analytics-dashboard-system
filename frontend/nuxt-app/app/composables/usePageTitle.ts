const pageTitles: Record<string, string> = {
  "/analytics": "pageTitle.analytics",
  "/manager/dashboard": "pageTitle.managerDashboard",
  "/partner/dashboard": "pageTitle.partnerDashboard",
  "/profile": "pageTitle.profile",
  "/reports": "pageTitle.reports",
  "/users": "pageTitle.userManagement",
  "/visitor/dashboard": "pageTitle.visitorDashboard",
};

export const usePageTitle = () => {
  const route = useRoute();
  const { t } = useI18n();

  return computed(() => t(pageTitles[route.path] ?? "pageTitle.dashboard"));
};
