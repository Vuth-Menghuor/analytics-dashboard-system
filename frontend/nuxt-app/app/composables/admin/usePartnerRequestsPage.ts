import {
  approvePartnerRequest,
  getPartnerRequests,
  rejectPartnerRequest,
} from "~/services/admin.service";
import type { PartnerRequest, PartnerRequestStatus } from "~/types/admin";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
] as const;

const statusLabels: Record<PartnerRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const getStorageUrl = (path: string | null) => {
  if (!path) {
    return "";
  }

  const runtimeConfig = useRuntimeConfig();
  const apiBaseUrl = runtimeConfig.public.apiBaseUrl.replace(/\/api\/?$/, "");

  return `${apiBaseUrl}/storage/${path}`;
};

export const usePartnerRequestsPage = () => {
  const toast = useToast();
  const requests = ref<PartnerRequest[]>([]);
  const isLoading = ref(true);
  const isReviewing = ref(false);
  const error = ref("");
  const searchQuery = ref("");
  const statusFilter = ref<(typeof statusOptions)[number]["value"]>("pending");
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

  watch(statusFilter, refreshFromFirstPage);
  onMounted(fetchRequests);

  const rows = computed(() =>
    requests.value.map((request) => ({
      ...request,
      statusLabel: statusLabels[request.status],
      idCardLabel: request.id_card_path ? "Uploaded" : "Not uploaded",
      action: request.id,
    })),
  );

  const selectedIdCardUrl = computed(() =>
    getStorageUrl(selectedRequest.value?.id_card_path ?? null),
  );

  const pendingCount = computed(
    () => requests.value.filter((request) => request.status === "pending").length,
  );

  const table = {
    title: "Partner Requests",
    icon: "i-lucide-user-plus",
    description:
      "Partner access requests submitted from signup. Approval creates a Laravel system user with partner role.",
    rowKey: "id",
    columns: [
      { key: "name", label: "Applicant", rowHeader: true },
      { key: "email", label: "Email", tone: "muted" },
      { key: "institution_name", label: "Institute" },
      { key: "state_province", label: "Province", tone: "muted" },
      { key: "idCardLabel", label: "ID Card", type: "status" },
      {
        key: "statusLabel",
        label: "Status",
        type: "status",
        warningValues: ["Pending", "Rejected"],
      },
      { key: "created_at", label: "Submitted", tone: "muted" },
      { key: "action", label: "Actions", type: "action" },
    ],
  } as const;

  const paginationLabel = computed(() => {
    if (!pagination.value.total) {
      return "No partner requests found";
    }

    return `${pagination.value.from ?? 1}-${pagination.value.to ?? requests.value.length} of ${pagination.value.total} partner requests`;
  });

  return {
    detailsOpen,
    error,
    isLoading,
    isReviewing,
    pagination,
    paginationLabel,
    pendingCount,
    rows,
    searchQuery,
    selectedIdCardUrl,
    selectedRequest,
    rejectionReason,
    rejectModalOpen,
    statusFilter,
    statusOptions,
    table,
    approveRequest,
    confirmRejectRequest,
    fetchRequests,
    openRejectModal,
    openRequestDetails,
    setPage,
    setPerPage,
    submitSearch,
  };
};
