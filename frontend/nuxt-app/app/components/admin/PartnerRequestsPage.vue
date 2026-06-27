<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import { usePartnerRequestsPage } from "~/composables/admin/usePartnerRequestsPage";
import type { PartnerRequest } from "~/types/admin";

const { t } = useI18n();
const { translateText } = useTranslateText();

const {
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
} = usePartnerRequestsPage();

type PartnerRequestTableRow = PartnerRequest & {
  statusLabel: string;
  submittedAtLabel: string;
  action: number;
};

const asRequestRow = (row: Record<string, unknown>) =>
  row as PartnerRequestTableRow;

const isPendingRequestRow = (row: Record<string, unknown>) =>
  asRequestRow(row).status === "pending";

const openRequestDetailsFromRow = (row: Record<string, unknown>) => {
  openRequestDetails(asRequestRow(row));
};

const approveRequestFromRow = (row: Record<string, unknown>) => {
  approveRequest(asRequestRow(row));
};

const openRejectModalFromRow = (row: Record<string, unknown>) => {
  openRejectModal(asRequestRow(row));
};
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

    <UCard :ui="{ body: 'analytics-filter-bar admin-filter-bar admin-filter-bar--requests' }">
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
      <div class="analytics-filter-field">
        <label>{{ translateText("Institute") }}</label>
        <AppSelect
          v-model="institutionFilter"
          :items="institutionOptions"
          value-key="value"
          :searchable="false"
          :aria-label="String(translateText('Institute'))"
        />
      </div>
      <div class="analytics-filter-actions">
        <UBadge v-if="activeFilterCount" color="neutral" variant="soft">
          {{ activeFilterCount }} {{ translateText("active") }}
        </UBadge>
        <AppButton
          action="search"
          :label="String(translateText('Apply filters'))"
          @click="submitSearch"
        />
        <AppButton
          v-if="hasFilters"
          action="clear"
          :label="String(translateText('Clear filters'))"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <AppLoadingSkeleton v-if="isLoading" variant="table" :rows="6" :columns="7" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <AppDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="rows"
        :row-key="table.rowKey"
        min-width="1360px"
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
              @click="openRequestDetailsFromRow(row)"
            />
            <AppButton
              action="approve"
              :disabled="!isPendingRequestRow(row) || isReviewing"
              @click="approveRequestFromRow(row)"
            />
            <AppButton
              action="reject"
              :disabled="!isPendingRequestRow(row) || isReviewing"
              @click="openRejectModalFromRow(row)"
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
      :ui="{ content: 'max-w-2xl rounded-md partner-request-profile-modal' }"
    >
      <template #body>
        <div v-if="selectedRequest" class="partner-request-profile">
          <section class="partner-request-profile-hero">
            <span class="partner-request-profile-avatar">
              <UIcon name="i-lucide-user-round" />
            </span>
            <div class="partner-request-profile-identity">
              <h3>
                {{ selectedRequest.name }}
              </h3>
              <p>{{ selectedRequest.email }}</p>
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
          </section>

          <section class="partner-request-profile-section">
            <div class="partner-request-profile-section-header">
              <span class="partner-request-profile-section-icon">
                <UIcon name="i-lucide-clipboard-list" />
              </span>
              <div>
                <h3>{{ translateText("Profile details") }}</h3>
                <p>{{ translateText("Review the signup information before approving institute access.") }}</p>
              </div>
            </div>

            <dl class="partner-request-profile-grid">
              <div class="partner-request-profile-detail">
                <dt>
                  <UIcon name="i-lucide-building-2" />
                  {{ translateText("Institute") }}
                </dt>
                <dd>{{ selectedRequest.institution_name }}</dd>
              </div>
              <div class="partner-request-profile-detail">
                <dt>
                  <UIcon name="i-lucide-map-pin" />
                  {{ translateText("Province") }}
                </dt>
                <dd>{{ selectedRequest.state_province }}</dd>
              </div>
              <div class="partner-request-profile-detail">
                <dt>
                  <UIcon name="i-lucide-calendar-plus" />
                  {{ translateText("Submitted") }}
                </dt>
                <dd>{{ selectedSubmittedAtLabel }}</dd>
              </div>
              <div class="partner-request-profile-detail">
                <dt>
                  <UIcon name="i-lucide-activity" />
                  {{ t("text.status") }}
                </dt>
                <dd>{{ translateText(selectedRequest.status) }}</dd>
              </div>
            </dl>
          </section>

          <div
            v-if="selectedRequest.rejection_reason"
            class="partner-request-profile-rejection"
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

<style scoped>
.partner-request-profile {
  display: grid;
  gap: 16px;
}

.partner-request-profile-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--app-surface);
}

.partner-request-profile-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface-soft);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.partner-request-profile-identity {
  min-width: 0;
}

.partner-request-profile-identity h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.partner-request-profile-identity p {
  margin: 4px 0 0;
  color: var(--app-muted);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.partner-request-profile-section {
  display: grid;
  gap: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
  background: color-mix(in srgb, var(--app-surface-soft) 58%, transparent);
}

.partner-request-profile-section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.partner-request-profile-section-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: var(--app-surface);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.partner-request-profile-section-header h3 {
  margin: 0;
  color: var(--app-heading);
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.25;
}

.partner-request-profile-section-header p {
  margin: 3px 0 0;
  color: var(--app-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.partner-request-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.partner-request-profile-detail {
  min-width: 0;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-surface);
}

.partner-request-profile-detail dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-muted);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.3;
}

.partner-request-profile-detail dd {
  margin: 7px 0 0;
  color: var(--app-heading);
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.partner-request-profile-rejection {
  border: 1px solid color-mix(in srgb, var(--app-error) 35%, transparent);
  border-radius: 8px;
  padding: 14px;
  background: color-mix(in srgb, var(--app-error) 10%, var(--app-surface));
  color: var(--app-error);
  font-size: 0.84rem;
  line-height: 1.5;
}

:global(.partner-request-profile-modal [data-slot="body"]) {
  background: var(--app-bg);
}

:global(.partner-request-profile-modal [data-slot="header"]),
:global(.partner-request-profile-modal [data-slot="footer"]) {
  background: var(--app-surface);
}

@media (max-width: 640px) {
  .partner-request-profile-hero {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .partner-request-profile-hero :deep([data-slot="base"]) {
    grid-column: 1 / -1;
    width: fit-content;
  }

  .partner-request-profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
