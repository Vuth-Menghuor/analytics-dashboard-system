import type {
  LoginRole,
  LoginRoleConfig,
  RegistrationRole,
  RoleOption,
} from "~/types/auth";

export const APP_NAME = "Analytics Dashboard System";

export const loginRoleConfigByValue: Record<LoginRole, LoginRoleConfig> = {
  manager: {
    label: "Manager",
    value: "manager",
    email: "manager@example.com",
    password: "password",
  },
  partner: {
    label: "Partner",
    value: "partner",
    email: "partner@example.com",
    password: "password",
  },
  visitor: {
    label: "Visitor",
    value: "visitor",
    email: "visitor@example.com",
    password: "password",
  },
};

export const loginRoles = Object.values(loginRoleConfigByValue);

export const registrationRoles: Array<RoleOption<RegistrationRole>> = [
  { label: "Visitor", value: "visitor" },
  { label: "Partner", value: "partner" },
];

export const partnerInstitutes = [
  "Institute of Technology of Cambodia",
  "Royal University of Phnom Penh",
  "National University of Management",
];

export const partnerDepartments = [
  "Computer Science",
  "Information Technology",
  "Data Analytics",
  "Business Intelligence",
];

export const partnerPositions = [
  "Lecturer",
  "Researcher",
  "Coordinator",
  "Department Lead",
];
