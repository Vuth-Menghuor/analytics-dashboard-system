import type {
  AccessRoleCard,
  LoginRole,
  LoginRoleConfig,
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

export const accessRoleCards: AccessRoleCard[] = [
  {
    label: "Manager",
    value: "manager",
    icon: "i-lucide-shield-check",
    access: "System administrator access",
    description: "Manage platform and review partners",
  },
  {
    label: "Partner",
    value: "partner",
    icon: "i-lucide-school",
    access: "School / institute representative",
    description: "Submit and manage institute data",
  },
  {
    label: "Visitor",
    value: "visitor",
    icon: "i-lucide-eye",
    access: "Public or guest access",
    description: "View limited dashboard information",
  },
];

export const stateProvinceOptions = [
  "Phnom Penh",
  "Kandal",
  "Siem Reap",
  "Battambang",
  "Kampong Cham",
];

export const schoolInstituteOptions = [
  "Institute of Technology of Cambodia",
  "Royal University of Phnom Penh",
  "National University of Management",
  "Royal University of Law and Economics",
  "Cambodia Academy of Digital Technology",
];
