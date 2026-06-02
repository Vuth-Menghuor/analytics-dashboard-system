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
  },
  partner: {
    label: "Partner",
    value: "partner",
  },
  visitor: {
    label: "Visitor",
    value: "visitor",
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
  "ITC",
  "RUPP",
  "NUM",
  "RUA",
  "SRU",
  "UHST",
  "AEU",
  "NUBB",
];
