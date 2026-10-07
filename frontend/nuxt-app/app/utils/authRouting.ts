import type { AuthUser } from "../types/auth";

export const dashboardPathFor = (user: AuthUser | null) => {
  if (user?.role === "manager") return "/manager/dashboard";
  if (user?.role === "partner") return "/partner/dashboard";
  if (user?.role === "visitor") return "/visitor/dashboard";

  return "/login";
};
