<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { usePartnerRequestsPage } from "~/composables/admin/usePartnerRequestsPage";

const { t } = useI18n();
const { translateText } = useTranslateText();

const {
  detailsOpen,
  error,
  isLoading,
  isReviewing,
  pagination,
  paginationLabel,
  pendingBadgeLabel,
  rows,
  searchQuery,
  selectedIdCardUrl,
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
          {{ pendingBadgeLabel }}
        </UBadge>
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field wide">
        <label>{{ t("common.search") }}</label>
        <AppSearchInput
          v-model="searchQuery"
          :placeholder="String(translateText('Search name, email, or institute'))"
          :aria-label="t('common.search')"
          clearable
          @submit="submitSearch"
          @clear="submitSearch"
        />
      </div>
      <div class="analytics-filter-field">
        <label>{{ t("text.status") }}</label>
        <AppSelect
          v-model="statusFilter"
          :items="statusOptions"
          value-key="value"
          :searchable="false"
          :aria-label="t('text.status')"
        />
      </div>
      <div class="analytics-filter-field compact">
        <AppButton
          action="clear"
          label=""
          square
          :aria-label="String(translateText('Clear filters'))"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="rows"
        :row-key="table.rowKey"
        min-width="1490px"
      >
        <template #actions>
          <AppSearchInput
            v-model="searchQuery"
            class="dashboard-table-search"
            :placeholder="String(translateText('Search requests'))"
            :aria-label="t('common.search')"
            clearable
            @submit="submitSearch"
            @clear="submitSearch"
          />
        </template>
        <template #cell-action="{ row }">
          <div class="toolbar table-actions">
            <AppButton
              action="view"
              @click="openRequestDetails(row)"
            />
            <AppButton
              action="approve"
              :disabled="row.status !== 'pending' || isReviewing"
              @click="approveRequest(row)"
            />
            <AppButton
              action="reject"
              :disabled="row.status !== 'pending' || isReviewing"
              @click="openRejectModal(row)"
            />
          </div>
        </template>
      </AppDataTable>

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
              {{ t("text.pageOf", { current: pagination.currentPage, total: pagination.lastPage }) }}
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
      :title="String(translateText('Partner request details'))"
      :description="String(translateText('Review the signup information before approving institute access.'))"
      :ui="{ content: 'max-w-2xl rounded-md' }"
    >
      <template #body>
        <div v-if="selectedRequest" class="grid gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-default p-4">
            <div>
              <p class="text-sm text-muted">{{ translateText("Applicant") }}</p>
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
              {{ translateText(selectedRequest.status) }}
            </UBadge>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">{{ translateText("Institute") }}</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.institution_name }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">{{ translateText("Province") }}</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.state_province }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">{{ translateText("Phone") }}</p>
              <p class="font-medium text-highlighted">
                {{ selectedRequest.phone_number }}
              </p>
            </div>
            <div class="rounded-md border border-default p-3">
              <p class="text-xs uppercase text-muted">{{ translateText("Submitted") }}</p>
              <p class="font-medium text-highlighted">
                {{ selectedSubmittedAtLabel }}
              </p>
            </div>
          </div>

          <div class="rounded-md border border-default p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-medium text-highlighted">{{ translateText("ID card document") }}</p>
                <p class="text-sm text-muted">
                  {{ translateText(selectedRequest.id_card_path ? "Uploaded by applicant" : "No document uploaded") }}
                </p>
              </div>
              <AppButton
                v-if="selectedIdCardUrl"
                action="open"
                :to="selectedIdCardUrl"
                target="_blank"
              />
            </div>
          </div>

          <div
            v-if="selectedRequest.rejection_reason"
            class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <strong>{{ translateText("Rejection reason:") }}</strong>
            {{ selectedRequest.rejection_reason }}
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <AppButton action="cancel" :label="String(translateText('Close'))" @click="close" />
          <AppButton
            v-if="selectedRequest?.status === 'pending'"
            action="reject"
            :disabled="isReviewing"
            @click="openRejectModal(selectedRequest)"
          />
          <AppButton
            v-if="selectedRequest?.status === 'pending'"
            action="approve"
            :loading="isReviewing"
            @click="approveRequest(selectedRequest)"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="rejectModalOpen"
      :title="String(translateText('Reject partner request?'))"
      :description="String(translateText('Add a short reason so the review decision is clear later.'))"
      :ui="{ content: 'max-w-lg rounded-md' }"
    >
      <template #body>
        <div class="grid gap-4">
          <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ t("text.rejectPartnerAccessConfirm", { name: selectedRequest?.name ?? "" }) }}
          </div>

          <UFormField :label="String(translateText('Reason'))">
            <UTextarea
              v-model="rejectionReason"
              :rows="4"
              :placeholder="String(translateText('Unable to verify institute affiliation.'))"
            />
          </UFormField>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <AppButton action="cancel" @click="close" />
          <AppButton
            action="reject"
            :label="String(translateText('Reject request'))"
            :loading="isReviewing"
            @click="confirmRejectRequest"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
