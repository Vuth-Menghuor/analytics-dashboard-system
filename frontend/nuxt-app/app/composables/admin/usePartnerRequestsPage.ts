import {
  approvePartnerRequest,
  getPartnerRequests,
  rejectPartnerRequest,
} from "~/services/admin.service";
import type { PartnerRequest, PartnerRequestStatus } from "~/types/admin";
import { schoolInstituteOptions } from "~/constants/auth";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
] as const;
const institutionOptions = [
  { label: "All institutes", value: "all" },
  ...schoolInstituteOptions.map((institute) => ({
    label: institute,
    value: institute,
  })),
] as const;

const statusLabels: Record<PartnerRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const formatRequestDate = (value: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const usePartnerRequestsPage = () => {
  const toast = useToast();
  const { t } = useI18n();
  const requests = ref<PartnerRequest[]>([]);
  const isLoading = ref(true);
  const isReviewing = ref(false);
  const error = ref("");
  const searchQuery = ref("");
  const statusFilter = ref<(typeof statusOptions)[number]["value"]>("all");
  const institutionFilter = ref<(typeof institutionOptions)[number]["value"]>("all");
  const selectedRequest = ref<PartnerRequest | null>(null);
  const detailsOpen = ref(false);
  const rejectModalOpen = ref(false);
  const rejectionReason = ref("Unable to verify institute affiliation.");
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: null as number | null,
    to: null as number | null,
  });

  let latestRequestId = 0;

  const fetchRequests = async () => {
    const requestId = ++latestRequestId;

    isLoading.value = true;
    error.value = "";

    try {
      const response = await getPartnerRequests({
        search: searchQuery.value.trim() || undefined,
        status:
          statusFilter.value === "all"
            ? undefined
            : (statusFilter.value as PartnerRequestStatus),
        institution:
          institutionFilter.value === "all" ? undefined : institutionFilter.value,
        page: pagination.value.currentPage,
        perPage: pagination.value.perPage,
      });

      if (requestId !== latestRequestId) {
        return;
      }

      requests.value = response.data;
      pagination.value = response.meta;
    } catch {
      if (requestId === latestRequestId) {
        error.value = "Unable to load partner requests.";
        toast.add({
          title: "Unable to load partner requests",
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
    fetchRequests();
  };

  const submitSearch = () => refreshFromFirstPage();

  const activeFilterCount = computed(
    () =>
      Number(Boolean(searchQuery.value.trim())) +
      Number(statusFilter.value !== "all") +
      Number(institutionFilter.value !== "all"),
  );
  const hasFilters = computed(() => activeFilterCount.value > 0);

  const clearFilters = () => {
    searchQuery.value = "";
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
    fetchRequests();
  };

  const setPerPage = (perPage: number) => {
    if (perPage === pagination.value.perPage) {
      return;
    }

    pagination.value.currentPage = 1;
    pagination.value.perPage = perPage;
    fetchRequests();
  };

  const approveRequest = async (request: PartnerRequest) => {
    isReviewing.value = true;

    try {
      await approvePartnerRequest(request.id);
      toast.add({
        title: "Partner approved",
        description: `${request.name} can now sign in as a partner.`,
        color: "success",
      });
      if (selectedRequest.value?.id === request.id) {
        detailsOpen.value = false;
        selectedRequest.value = null;
      }
      await fetchRequests();
    } catch {
      toast.add({
        title: "Unable to approve request",
        description: "The request may already be reviewed or the email already exists.",
        color: "error",
      });
    } finally {
      isReviewing.value = false;
    }
  };

  const openRequestDetails = (request: PartnerRequest) => {
    selectedRequest.value = request;
    detailsOpen.value = true;
  };

  const openRejectModal = (request: PartnerRequest) => {
    selectedRequest.value = request;
    rejectionReason.value =
      request.rejection_reason || "Unable to verify institute affiliation.";
    detailsOpen.value = false;
    rejectModalOpen.value = true;
  };

  const confirmRejectRequest = async () => {
    if (!selectedRequest.value) {
      return;
    }

    isReviewing.value = true;

    try {
      await rejectPartnerRequest(
        selectedRequest.value.id,
        rejectionReason.value.trim() || undefined,
      );
      toast.add({
        title: "Partner request rejected",
        description: `${selectedRequest.value.name} was marked as rejected.`,
        color: "success",
      });
      rejectModalOpen.value = false;
      selectedRequest.value = null;
      await fetchRequests();
    } catch {
      toast.add({
        title: "Unable to reject request",
        description: "The request may already be reviewed.",
        color: "error",
      });
    } finally {
      isReviewing.value = false;
    }
  };

  onMounted(fetchRequests);

  const rows = computed(() =>
    requests.value.map((request) => ({
      ...request,
      statusLabel: statusLabels[request.status],
      submittedAtLabel: formatRequestDate(request.created_at),
      action: request.id,
    })),
  );

  const selectedSubmittedAtLabel = computed(() =>
    formatRequestDate(selectedRequest.value?.created_at ?? null),
  );

  const pendingCount = computed(
    () => requests.value.filter((request) => request.status === "pending").length,
  );
  const pendingBadgeLabel = computed(() =>
    statusFilter.value === "pending"
      ? t("text.pendingCount", { count: pagination.value.total.toLocaleString() })
      : t("text.pendingOnPageCount", { count: pendingCount.value.toLocaleString() }),
  );

  const table = {
    title: "Partner Requests",
    icon: "i-lucide-user-plus",
    description:
      "Partner access requests submitted from signup. Approval creates a Laravel system user with partner role.",
    rowKey: "id",
    columns: [
      { key: "name", label: "Applicant", rowHeader: true, width: "180px" },
      { key: "email", label: "Email", tone: "muted", width: "230px" },
      { key: "institution_name", label: "Institute", width: "160px" },
      { key: "state_province", label: "Province", tone: "muted", width: "170px" },
      {
        key: "statusLabel",
        label: "Status",
        type: "status",
        warningValues: ["Pending", "Rejected"],
        width: "130px",
      },
      { key: "submittedAtLabel", label: "Submitted", tone: "muted", width: "190px" },
      { key: "action", label: "Actions", type: "action", width: "300px" },
    ],
  } as const;

  const paginationLabel = computed(() => {
    if (!pagination.value.total) {
      return t("text.noPartnerRequestsFound");
    }

    return t("text.partnerRequestsRange", {
      from: pagination.value.from ?? 1,
      to: pagination.value.to ?? requests.value.length,
      total: pagination.value.total,
    });
  });

  return {
    activeFilterCount,
    detailsOpen,
    error,
    hasFilters,
    institutionFilter,
    institutionOptions,
    isLoading,
    isReviewing,
    pagination,
    paginationLabel,
    pendingBadgeLabel,
    rows,
    searchQuery,
    selectedSubmittedAtLabel,
    selectedRequest,
    rejectionReason,
    rejectModalOpen,
    statusFilter,
    statusOptions,
    table,
    approveRequest,
    clearFilters,
    confirmRejectRequest,
    fetchRequests,
    openRejectModal,
    openRequestDetails,
    setPage,
    setPerPage,
    submitSearch,
  };
};
