<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { usePartnerRequestsPage } from "~/composables/admin/usePartnerRequestsPage";

const { t } = useI18n();

const {
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
} = usePartnerRequestsPage();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Administration"
      title="Partner Requests"
      copy="Review partner signup requests and approve institute-based access. Approved requests become Laravel system users with partner role."
    >
      <div class="toolbar">
        <UBadge color="warning" variant="soft">
          {{ pendingCount }} pending
        </UBadge>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :label="t('text.refresh')"
          @click="fetchRequests"
        />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field wide">
        <label>{{ t("common.search") }}</label>
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search name, email, or institute"
          @keydown.enter="submitSearch"
        />
      </div>
      <div class="analytics-filter-field">
        <label>{{ t("text.status") }}</label>
        <USelect v-model="statusFilter" :items="statusOptions" />
      </div>
      <div class="analytics-filter-field">
        <label>&nbsp;</label>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-search"
          label="Search"
          @click="submitSearch"
        />
      </div>
    </UCard>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="rows"
        :row-key="table.rowKey"
        min-width="1180px"
      >
        <template #cell-action="{ row }">
          <div class="toolbar table-actions">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-eye"
              label="View"
              @click="openRequestDetails(row)"
            />
            <UButton
              size="sm"
              color="success"
              variant="soft"
              icon="i-lucide-check"
              label="Approve"
              :disabled="row.status !== 'pending' || isReviewing"
              @click="approveRequest(row)"
            />
            <UButton
              size="sm"
              color="error"
              variant="soft"
              icon="i-lucide-x"
              label="Reject"
              :disabled="row.status !== 'pending' || isReviewing"
              @click="openRejectModal(row)"
            />
          </div>
        </template>
      </DashboardDataTable>

      <div class="student-pagination">
        <span>{{ paginationLabel }}</span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ t("text.rowsPerPage") }}</span>
            <USelect
              :model-value="pagination.perPage"
              :items="[10, 25, 50]"
              :aria-label="t('text.rowsPerPage')"
              class="max-w-[100px]"
              @update:model-value="setPerPage(Number($event))"
            />
          </div>

          <div class="toolbar">
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-chevron-left"
              :disabled="pagination.currentPage <= 1"
              @click="setPage(pagination.currentPage - 1)"
            />
            <span class="text-sm text-gray-500">
              Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
            </span>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-chevron-right"
              :disabled="pagination.currentPage >= pagination.lastPage"
              @click="setPage(pagination.currentPage + 1)"
            />
          </div>
        </div>
      </div>
    </template>

    <UModal
      v-model:open="detailsOpen"
      title="Partner request details"
      description="Review the signup information before approving institute access."
      :ui="{ content: 'max-w-2xl rounded-md' }"
    >
      <template #body>
        <div v-if="selectedRequest" class="grid gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-default p-4">
            <div>
              <p class="text-sm text-muted">Applicant</p>
              <h3 class="text-lg font-semibold text-highlighted">
                {{ selectedRequest.name }}
              </h3>
              <p class="text-sm text-muted">{{ selectedRequest.email }}</p>
            </div>
            <UBadge
              :color="
                selectedRequest.status === 'approved'
                  ? 'success'
                  : selectedRequest.status === 'rejected'
                    ? 'error'
                    : 'warning'
              "
              variant="soft"
            >
              {{ selectedRequest.status }}
            </UBadge>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">Institute</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.institution_name }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">Province</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.state_province }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">Phone</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.phone_number }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">Submitted</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.created_at || "Not available" }}
              </p>
            </div>
          </div>

          <div class="rounded-md border border-default p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-medium text-highlighted">ID card document</p>
                <p class="text-sm text-muted">
                  {{ selectedRequest.id_card_path ? "Uploaded by applicant" : "No document uploaded" }}
                </p>
              </div>
              <UButton
                v-if="selectedIdCardUrl"
                :to="selectedIdCardUrl"
                target="_blank"
                color="neutral"
                variant="outline"
                icon="i-lucide-external-link"
                label="Open file"
              />
            </div>
          </div>

          <div
            v-if="selectedRequest.rejection_reason"
            class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <strong>Rejection reason:</strong>
            {{ selectedRequest.rejection_reason }}
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" label="Close" @click="close" />
          <UButton
            v-if="selectedRequest?.status === 'pending'"
            color="error"
            variant="soft"
            icon="i-lucide-x"
            label="Reject"
            :disabled="isReviewing"
            @click="openRejectModal(selectedRequest)"
          />
          <UButton
            v-if="selectedRequest?.status === 'pending'"
            color="success"
            icon="i-lucide-check"
            label="Approve"
            :loading="isReviewing"
            @click="approveRequest(selectedRequest)"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="rejectModalOpen"
      title="Reject partner request?"
      description="Add a short reason so the review decision is clear later."
      :ui="{ content: 'max-w-lg rounded-md' }"
    >
      <template #body>
        <div class="grid gap-4">
          <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Reject <strong>{{ selectedRequest?.name }}</strong> from partner access?
          </div>

          <UFormField label="Reason">
            <UTextarea
              v-model="rejectionReason"
              :rows="4"
              placeholder="Unable to verify institute affiliation."
            />
          </UFormField>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
          <UButton
            color="error"
            icon="i-lucide-x"
            label="Reject request"
            :loading="isReviewing"
            @click="confirmRejectRequest"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
