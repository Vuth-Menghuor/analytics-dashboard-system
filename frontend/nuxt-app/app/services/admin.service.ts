import { api } from "~/services/api";
import type {
  AdminUser,
  AdminUserFormPayload,
  AdminUsersQuery,
  AdminUsersResponse,
  LaravelPaginator,
  PartnerRequest,
  PartnerRequestFormPayload,
  PartnerRequestsQuery,
  PartnerRequestsResponse,
} from "~/types/admin";

const normalizeUsersResponse = (
  response: LaravelPaginator<AdminUser>,
): AdminUsersResponse => ({
  data: response.data,
  meta: {
    currentPage: response.current_page,
    lastPage: response.last_page,
    perPage: response.per_page,
    total: response.total,
    from: response.from,
    to: response.to,
  },
});

export const getAdminUsers = async (params: AdminUsersQuery = {}) => {
  const { data } = await api.get<LaravelPaginator<AdminUser>>("/admin/users", {
    params,
  });

  return normalizeUsersResponse(data);
};

export const createAdminUser = async (payload: AdminUserFormPayload) => {
  const { data } = await api.post<AdminUser>("/admin/users", payload);
  return data;
};

export const updateAdminUser = async (
  id: number,
  payload: AdminUserFormPayload,
) => {
  const { data } = await api.put<AdminUser>(`/admin/users/${id}`, payload);
  return data;
};

export const deleteAdminUser = async (id: number) => {
  await api.delete(`/admin/users/${id}`);
};

export const updateAdminUserPassword = async (
  id: number,
  password: string,
  passwordConfirmation: string,
) => {
  const { data } = await api.patch<AdminUser>(`/admin/users/${id}/password`, {
    password,
    password_confirmation: passwordConfirmation,
  });
  return data;
};

const normalizePartnerRequestsResponse = (
  response: LaravelPaginator<PartnerRequest>,
): PartnerRequestsResponse => ({
  data: response.data,
  meta: {
    currentPage: response.current_page,
    lastPage: response.last_page,
    perPage: response.per_page,
    total: response.total,
    from: response.from,
    to: response.to,
  },
});

export const submitPartnerRequest = async (
  payload: PartnerRequestFormPayload,
) => {
  const formData = new FormData();

  formData.append("state_province", payload.stateProvince);
  formData.append("first_name", payload.firstName);
  formData.append("last_name", payload.lastName);
  formData.append("email", payload.email);
  formData.append("phone_number", payload.phoneNumber);
  formData.append("institution_name", payload.institutionName);
  formData.append("password", payload.password);
  formData.append("password_confirmation", payload.passwordConfirmation);

  if (payload.googleIdToken) {
    formData.append("google_id_token", payload.googleIdToken);
  }

  if (payload.idCard) {
    formData.append("id_card", payload.idCard);
  }

  const { data } = await api.post<PartnerRequest>(
    "/partner-requests",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};

export const getPartnerRequests = async (
  params: PartnerRequestsQuery = {},
) => {
  const { data } = await api.get<LaravelPaginator<PartnerRequest>>(
    "/admin/partner-requests",
    { params },
  );

  return normalizePartnerRequestsResponse(data);
};

export const approvePartnerRequest = async (id: number) => {
  const { data } = await api.patch<PartnerRequest>(
    `/admin/partner-requests/${id}/approve`,
  );

  return data;
};

export const rejectPartnerRequest = async (id: number, reason?: string) => {
  const { data } = await api.patch<PartnerRequest>(
    `/admin/partner-requests/${id}/reject`,
    { reason },
  );

  return data;
};
