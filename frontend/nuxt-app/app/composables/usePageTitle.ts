const pageTitles: Record<string, string> = {
  "/analytics": "Analytics",
  "/manager/dashboard": "Manager Dashboard",
  "/partner/dashboard": "Partner Dashboard",
  "/profile": "Profile",
  "/reports": "Reports",
  "/users": "User Management",
  "/visitor/dashboard": "Visitor Dashboard",
};

export const usePageTitle = () => {
  const route = useRoute();

  return computed(() => pageTitles[route.path] ?? "Dashboard");
};
