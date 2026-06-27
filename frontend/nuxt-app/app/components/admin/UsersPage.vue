<script setup lang="ts">
import AppSearchInput from "~/components/common/AppSearchInput.vue";
import AppActionMenu from "~/components/common/AppActionMenu.vue";
import AppButton from "~/components/common/AppButton.vue";
import AppSelect from "~/components/common/AppSelect.vue";
import AppExportMenu from "~/components/common/AppExportMenu.vue";
import type { DropdownMenuItem } from "@nuxt/ui";
import AppDataTable from "~/components/common/AppDataTable.vue";
import AppLoadingSkeleton from "~/components/common/AppLoadingSkeleton.vue";
import PageHeader from "~/components/common/PageHeader.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import UserDeleteModal from "~/components/admin/UserDeleteModal.vue";
import UserFormModal from "~/components/admin/UserFormModal.vue";
import UserPasswordModal from "~/components/admin/UserPasswordModal.vue";
import UserProfileModal from "~/components/admin/UserProfileModal.vue";
import { useUsersPage } from "~/composables/admin/useUsersPage";

const { t } = useI18n();
const { translateText } = useTranslateText();

const {
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
  openPasswordReset,
  openUserProfile,
  setPage,
  setPerPage,
  submitSearch,
  submitPasswordReset,
  submitUser,
} = useUsersPage();

const getUserActionItems = (row: Record<string, unknown>): DropdownMenuItem[][] => [
  [
    {
      label: "View profile",
      icon: "i-lucide-eye",
      onSelect: () => openUserProfile(row),
    },
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
        <AppButton action="create" label="Create user" @click="openCreateUser" />
      </div>
    </PageHeader>

    <UCard :ui="{ body: 'analytics-filter-bar admin-filter-bar admin-filter-bar--users' }">
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
        min-width="1180px"
        table-class="admin-users-table"
      >
        <template #actions>
          <div class="dashboard-table-toolbar">
            <AppSearchInput
              v-model="searchQuery"
              class="dashboard-table-search"
              :placeholder="String(translateText('Search users'))"
              :aria-label="t('common.search')"
              clearable
              @submit="submitSearch"
              @clear="submitSearch"
            />
            <div class="dashboard-table-toolbar-actions">
              <AppExportMenu @select="exportUsers" />
            </div>
          </div>
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
    <UserProfileModal
      v-model:open="profileOpen"
      :user="profileUser"
    />
    <UserDeleteModal
      v-model:open="deleteOpen"
      :user="deletingUser"
      :loading="isDeleting"
      @confirm="confirmDeleteUser"
    />
  </div>
</template>
