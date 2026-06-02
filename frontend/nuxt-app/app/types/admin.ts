export type AdminUserRole = "manager" | "partner" | "visitor";

export type AdminUserStatus = "Active" | "Inactive";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  institution_name: string | null;
  status: AdminUserStatus;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminUsersQuery = {
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  page?: number;
  perPage?: number;
};

export type PartnerRequestStatus = "pending" | "approved" | "rejected";

export type PartnerRequest = {
  id: number;
  state_province: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone_number: string;
  institution_name: string;
  id_card_path: string | null;
  status: PartnerRequestStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PartnerRequestsQuery = {
  search?: string;
  status?: PartnerRequestStatus;
  page?: number;
  perPage?: number;
};

export type PartnerRequestsResponse = {
  data: PartnerRequest[];
  meta: AdminUsersPagination;
};

export type PartnerRequestFormPayload = {
  stateProvince: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  institutionName: string;
  idCard?: File | null;
  password: string;
  passwordConfirmation: string;
};

export type AdminUsersPagination = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type AdminUsersResponse = {
  data: AdminUser[];
  meta: AdminUsersPagination;
};

export type AdminUserFormPayload = {
  name: string;
  email: string;
  role: AdminUserRole;
  institution_name?: string | null;
  password?: string;
  password_confirmation?: string;
};

export type LaravelPaginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};
