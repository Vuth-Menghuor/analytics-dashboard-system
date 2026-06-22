<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppActionMenu from "~/components/common/AppActionMenu.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import type { DropdownMenuItem } from "@nuxt/ui";
import AppDataTable from "~/components/common/AppDataTable.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import UserDeleteModal from "~/components/admin/UserDeleteModal.vue";
import UserFormModal from "~/components/admin/UserFormModal.vue";
import UserPasswordModal from "~/components/admin/UserPasswordModal.vue";
import { useUsersPage } from "~/composables/admin/useUsersPage";

const { t } = useI18n();
const { translateText } = useTranslateText();

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
  clearFilters,
  confirmDeleteUser,
  fetchUsers,
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

const getUserActionItems = (row: Record<string, unknown>): DropdownMenuItem[][] => [
  [
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect: () => openEditUser(row),
    },
    {
      label: "Password",
      icon: "i-lucide-key-round",
      onSelect: () => openPasswordReset(row),
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      disabled: Boolean(row.isCurrentUser),
      onSelect: () => openDeleteUser(row),
    },
  ],
];
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Administration"
      title="Users"
      copy="Manage Laravel application users for manager, partner, and visitor access. Moodle users remain read-only analytics data."
    >
      <div class="toolbar">
        <AppButton
          action="refresh"
          :label="t('text.refresh')"
          @click="fetchUsers"
        />
        <AppButton action="create" label="Create user" @click="openCreateUser" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar' }">
      <div class="analytics-filter-field wide">
        <label>{{ t("common.search") }}</label>
        <AppSearchInput
          v-model="searchQuery"
          :placeholder="String(translateText('Search name or email'))"
          :aria-label="t('common.search')"
          clearable
          @submit="submitSearch"
          @clear="submitSearch"
        />
      </div>
      <div class="analytics-filter-field">
        <label>{{ translateText("Role") }}</label>
        <AppSelect
          v-model="roleFilter"
          :items="roleOptions"
          value-key="value"
          :searchable="false"
          :aria-label="String(translateText('Role'))"
        />
      </div>
      <div class="analytics-filter-field">
        <label>{{ translateText("Status") }}</label>
        <AppSelect
          v-model="statusFilter"
          :items="statusOptions"
          value-key="value"
          :searchable="false"
          :aria-label="String(translateText('Status'))"
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
        min-width="980px"
      >
        <template #actions>
          <AppSearchInput
            v-model="searchQuery"
            class="dashboard-table-search"
            :placeholder="String(translateText('Search users'))"
            :aria-label="t('common.search')"
            clearable
            @submit="submitSearch"
            @clear="submitSearch"
          />
        </template>
        <template #cell-action="{ row }">
          <div class="toolbar table-actions">
            <AppActionMenu
              :items="getUserActionItems(row)"
              :aria-label="t('text.actionsFor', { name: row.name })"
              :title="String(translateText(row.isCurrentUser ? 'You cannot delete your own account' : 'More actions'))"
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
