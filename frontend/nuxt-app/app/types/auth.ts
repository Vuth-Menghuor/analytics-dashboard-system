export type AuthRole = "manager" | "partner" | "visitor";

export type LoginRole = AuthRole;

export type RegistrationRole = Extract<AuthRole, "partner" | "visitor">;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

export type RoleOption<TValue extends string> = {
  label: string;
  value: TValue;
};

export type LoginRoleConfig = RoleOption<LoginRole> & {
  email: string;
  password: string;
};

export type AccessRoleCard = RoleOption<AuthRole> & {
  access: string;
  description: string;
  icon: string;
};
