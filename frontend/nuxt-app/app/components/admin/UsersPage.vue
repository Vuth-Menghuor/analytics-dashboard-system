<script setup lang="ts">
import DashboardDataTable from "~/components/common/DashboardDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import UserDeleteModal from "~/components/admin/UserDeleteModal.vue";
import UserFormModal from "~/components/admin/UserFormModal.vue";
import UserPasswordModal from "~/components/admin/UserPasswordModal.vue";
import { useUsersPage } from "~/composables/admin/useUsersPage";

const { t } = useI18n();

const {
  deleteOpen,
  deletingUser,
  error,
  formOpen,
  isDeleting,
  isLoading,
  isResettingPassword,
  isSaving,
  pagination,
  paginationLabel,
  passwordOpen,
  passwordUser,
  roleFilter,
  roleOptions,
  rows,
  searchQuery,
  statusFilter,
  statusOptions,
  table,
  editingUser,
  confirmDeleteUser,
  openCreateUser,
  openDeleteUser,
  openEditUser,
  openPasswordReset,
  setPage,
  setPerPage,
  submitSearch,
  submitPasswordReset,
  submitUser,
} = useUsersPage();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Administration"
      title="Users"
      copy="Manage Laravel application users for manager, partner, and visitor access. Moodle users remain read-only analytics data."
    >
      <UButton icon="i-lucide-plus" label="Create user" @click="openCreateUser" />
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field wide">
        <label>{{ t("common.search") }}</label>
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search name or email"
          @keydown.enter="submitSearch"
        />
      </div>
      <div class="analytics-filter-field">
        <label>Role</label>
        <USelect v-model="roleFilter" :items="roleOptions" />
      </div>
      <div class="analytics-filter-field">
        <label>Status</label>
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
        min-width="980px"
      >
        <template #cell-action="{ row }">
          <div class="toolbar table-actions">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-pencil"
              label="Edit"
              @click="openEditUser(row)"
            />
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-key-round"
              label="Password"
              @click="openPasswordReset(row)"
            />
            <UButton
              size="sm"
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              label="Delete"
              :disabled="Boolean(row.isCurrentUser)"
              :title="
                row.isCurrentUser
                  ? 'You cannot delete your own account'
                  : 'Delete user'
              "
              @click="openDeleteUser(row)"
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

    <UserFormModal
      v-model:open="formOpen"
      :user="editingUser"
      :loading="isSaving"
      @submit="submitUser"
    />
    <UserPasswordModal
      v-model:open="passwordOpen"
      :user="passwordUser"
      :loading="isResettingPassword"
      @submit="submitPasswordReset"
    />
    <UserDeleteModal
      v-model:open="deleteOpen"
      :user="deletingUser"
      :loading="isDeleting"
      @confirm="confirmDeleteUser"
    />
  </div>
</template>
