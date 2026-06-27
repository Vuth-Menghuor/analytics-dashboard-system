import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserPassword,
} from "~/services/admin.service";
import type {
  AdminUser,
  AdminUserFormPayload,
  AdminUserRole,
  AdminUserStatus,
} from "~/types/admin";
import { useCsvExport } from "~/composables/common/useCsvExport";
import type { ExportFormat } from "~/utils/exportCsv";
import { schoolInstituteOptions } from "~/constants/auth";

const roleOptions = [
  { label: "All roles", value: "all" },
  { label: "Manager", value: "manager" },
  { label: "Partner", value: "partner" },
  { label: "Visitor", value: "visitor" },
] as const;

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
] as const;
const institutionOptions = [
  { label: "All institutes", value: "all" },
  ...schoolInstituteOptions.map((institute) => ({
    label: institute,
    value: institute,
  })),
] as const;

const formatUserDate = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

type UserExportRow = {
  name: string;
  email: string;
  roleLabel: string;
  instituteLabel: string;
  status: AdminUserStatus;
  createdAtLabel: string;
};

const userExportColumns = [
  { key: "name", label: "User" },
  { key: "email", label: "Email" },
  { key: "roleLabel", label: "Role" },
  { key: "instituteLabel", label: "Access Scope" },
  { key: "status", label: "Status" },
  { key: "createdAtLabel", label: "Created" },
] satisfies Array<{ key: keyof UserExportRow; label: string }>;

export const useUsersPage = () => {
  const toast = useToast();
  const { exportWithToast } = useCsvExport();
  const auth = useAuthStore();
  const { t } = useI18n();
  const users = ref<AdminUser[]>([]);
  const isLoading = ref(true);
  const isSaving = ref(false);
  const isDeleting = ref(false);
  const isResettingPassword = ref(false);
  const error = ref("");
  const searchQuery = ref("");
  const roleFilter = ref<(typeof roleOptions)[number]["value"]>("all");
  const statusFilter = ref<(typeof statusOptions)[number]["value"]>("all");
  const institutionFilter = ref<(typeof institutionOptions)[number]["value"]>("all");
  const formOpen = ref(false);
  const profileOpen = ref(false);
  const deleteOpen = ref(false);
  const passwordOpen = ref(false);
  const editingUser = ref<AdminUser | null>(null);
  const profileUser = ref<AdminUser | null>(null);
  const deletingUser = ref<AdminUser | null>(null);
  const passwordUser = ref<AdminUser | null>(null);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: null as number | null,
    to: null as number | null,
  });

  let latestRequestId = 0;

  const fetchUsers = async () => {
    const requestId = ++latestRequestId;

    isLoading.value = true;
    error.value = "";

    try {
      const response = await getAdminUsers({
        search: searchQuery.value.trim() || undefined,
        role:
          roleFilter.value === "all"
            ? undefined
            : (roleFilter.value as AdminUserRole),
        status:
          statusFilter.value === "all"
            ? undefined
            : (statusFilter.value as AdminUserStatus),
        institution:
          institutionFilter.value === "all" ? undefined : institutionFilter.value,
        page: pagination.value.currentPage,
        perPage: pagination.value.perPage,
      });

      if (requestId !== latestRequestId) {
        return;
      }

      users.value = response.data;
      pagination.value = response.meta;
    } catch {
      if (requestId === latestRequestId) {
        error.value = "Unable to load system users.";
        toast.add({
          title: "Unable to load users",
          description: "Please try again.",
          color: "error",
        });
      }
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
      }
    }
  };

  const refreshFromFirstPage = () => {
    pagination.value.currentPage = 1;
    fetchUsers();
  };

  const submitSearch = () => refreshFromFirstPage();

  const activeFilterCount = computed(
    () =>
      Number(Boolean(searchQuery.value.trim())) +
      Number(roleFilter.value !== "all") +
      Number(statusFilter.value !== "all") +
      Number(institutionFilter.value !== "all"),
  );
  const hasFilters = computed(() => activeFilterCount.value > 0);

  const clearFilters = () => {
    searchQuery.value = "";
    roleFilter.value = "all";
    statusFilter.value = "all";
    institutionFilter.value = "all";
    refreshFromFirstPage();
  };

  const setPage = (page: number) => {
    const nextPage = Math.min(
      Math.max(page, 1),
      Math.max(pagination.value.lastPage, 1),
    );

    if (nextPage === pagination.value.currentPage) {
      return;
    }

    pagination.value.currentPage = nextPage;
    fetchUsers();
  };

  const setPerPage = (perPage: number) => {
    if (perPage === pagination.value.perPage) {
      return;
    }

    pagination.value.currentPage = 1;
    pagination.value.perPage = perPage;
    fetchUsers();
  };

  const openCreateUser = () => {
    editingUser.value = null;
    formOpen.value = true;
  };

  const openEditUser = (user: AdminUser) => {
    editingUser.value = user;
    formOpen.value = true;
  };

  const openUserProfile = (user: AdminUser) => {
    profileUser.value = user;
    profileOpen.value = true;
  };

  const openDeleteUser = (user: AdminUser) => {
    if (user.id === auth.user?.id) {
      toast.add({
        title: "Cannot delete your own account",
        description: "Sign in with another manager account to remove this user.",
        color: "warning",
      });

      return;
    }

    deletingUser.value = user;
    deleteOpen.value = true;
  };

  const openPasswordReset = (user: AdminUser) => {
    passwordUser.value = user;
    passwordOpen.value = true;
  };

  const submitUser = async (payload: AdminUserFormPayload) => {
    isSaving.value = true;

    try {
      if (editingUser.value) {
        await updateAdminUser(editingUser.value.id, payload);
        toast.add({
          title: "User updated",
          description: `${payload.name} was saved.`,
          color: "success",
        });
      } else {
        await createAdminUser(payload);
        toast.add({
          title: "User created",
          description: `${payload.name} can now access the dashboard.`,
          color: "success",
        });
      }

      formOpen.value = false;
      await fetchUsers();
    } catch {
      toast.add({
        title: "Unable to save user",
        description: "Check the form fields and try again.",
        color: "error",
      });
    } finally {
      isSaving.value = false;
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser.value) {
      return;
    }

    isDeleting.value = true;

    try {
      await deleteAdminUser(deletingUser.value.id);
      toast.add({
        title: "User deleted",
        description: `${deletingUser.value.name} was removed from system users.`,
        color: "success",
      });
      deleteOpen.value = false;
      deletingUser.value = null;
      await fetchUsers();
    } catch {
      toast.add({
        title: "Unable to delete user",
        description: "You cannot delete your own account, or the request failed.",
        color: "error",
      });
    } finally {
      isDeleting.value = false;
    }
  };

  const submitPasswordReset = async (
    password: string,
    passwordConfirmation: string,
  ) => {
    if (!passwordUser.value) {
      return;
    }

    isResettingPassword.value = true;

    try {
      await updateAdminUserPassword(
        passwordUser.value.id,
        password,
        passwordConfirmation,
      );
      toast.add({
        title: "Password reset",
        description: `${passwordUser.value.name} can now sign in with the new password.`,
        color: "success",
      });
      passwordOpen.value = false;
      passwordUser.value = null;
    } catch {
      toast.add({
        title: "Unable to reset password",
        description: "Use at least 8 characters and confirm the password.",
        color: "error",
      });
    } finally {
      isResettingPassword.value = false;
    }
  };

  onMounted(fetchUsers);

  const rows = computed(() =>
    users.value.map((user) => ({
      ...user,
      roleLabel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      instituteLabel:
        user.role === "partner" ? user.institution_name || "Not assigned" : "System-wide",
      createdAtLabel: formatUserDate(user.created_at),
      isCurrentUser: user.id === auth.user?.id,
      action: user.id,
    })),
  );

  const table = {
    title: "System Users",
    icon: "i-lucide-users",
    description:
      "Laravel application accounts for manager, partner, and visitor access.",
    rowKey: "id",
    columns: [
      { key: "name", label: "User", rowHeader: true, width: "180px" },
      { key: "email", label: "Email", tone: "muted", width: "300px" },
      { key: "roleLabel", label: "Role", type: "status", width: "150px" },
      { key: "instituteLabel", label: "Access Scope", tone: "muted", width: "190px" },
      {
        key: "status",
        label: "Status",
        type: "status",
        warningValues: ["Inactive"],
        width: "150px",
      },
      { key: "createdAtLabel", label: "Created", tone: "muted", width: "240px" },
      { key: "action", label: "Actions", type: "action", width: "72px", align: "right" },
    ],
  } as const;

  const fetchAllUsersForExport = async (): Promise<UserExportRow[]> => {
    const firstPage = await getAdminUsers({ page: 1, perPage: 100 });
    const allUsers = [...firstPage.data];

    for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
      const response = await getAdminUsers({ page, perPage: 100 });
      allUsers.push(...response.data);
    }

    return allUsers.map((user) => ({
      name: user.name,
      email: user.email,
      roleLabel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      instituteLabel:
        user.role === "partner" ? user.institution_name || "Not assigned" : "System-wide",
      status: user.status,
      createdAtLabel: formatUserDate(user.created_at),
    }));
  };

  const exportUsers = async (format: ExportFormat = "csv") => {
    try {
      const rows = await fetchAllUsersForExport();

      void exportWithToast({
        filename: `ccun-system-users.${format === "excel" ? "xls" : "csv"}`,
        format,
        label: `All system users ${format === "excel" ? "Excel" : "CSV"} file`,
        columns: userExportColumns,
        rows,
      });
    } catch {
      toast.add({
        title: "Export failed",
        description: "Unable to load all system users for export.",
        icon: "i-lucide-circle-x",
        color: "error",
      });
    }
  };

  const paginationLabel = computed(() => {
    if (!pagination.value.total) {
      return t("text.noUsersFound");
    }

    return t("text.usersRange", {
      from: pagination.value.from ?? 1,
      to: pagination.value.to ?? users.value.length,
      total: pagination.value.total,
    });
  });

  return {
    activeFilterCount,
    deleteOpen,
    deletingUser,
    error,
    exportUsers,
    formOpen,
    isDeleting,
    isLoading,
    institutionFilter,
    institutionOptions,
    isResettingPassword,
    isSaving,
    hasFilters,
    pagination,
    paginationLabel,
    passwordOpen,
    passwordUser,
    profileOpen,
    profileUser,
    roleFilter,
    roleOptions,
    rows,
    searchQuery,
    statusFilter,
    statusOptions,
    table,
    editingUser,
    clearFilters,
    confirmDeleteUser,
    fetchUsers,
    openCreateUser,
    openDeleteUser,
    openEditUser,
    openUserProfile,
    openPasswordReset,
    setPage,
    setPerPage,
    submitSearch,
    submitPasswordReset,
    submitUser,
  };
};
