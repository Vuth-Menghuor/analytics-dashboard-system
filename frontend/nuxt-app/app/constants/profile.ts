export const profileSecurityItems = [
  {
    title: "Password",
    description: "Use a strong, unique password.",
    actionLabel: "Update",
    color: "neutral",
  },
  {
    title: "Active Session",
    description: "Sign out from this device.",
    actionLabel: "Log out",
    color: "error",
    action: "logout",
  },
] as const;
