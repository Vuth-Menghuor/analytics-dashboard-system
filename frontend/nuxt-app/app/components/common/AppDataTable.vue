<script setup lang="ts">
type TableValue = string | number | boolean | null | undefined

type TableRow = Record<string, TableValue>

type TableColumn = {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  tone?: 'default' | 'muted' | 'strong'
  rowHeader?: boolean
  type?: 'text' | 'status' | 'action'
  trueLabel?: string
  falseLabel?: string
  warningValues?: readonly TableValue[]
}

const props = withDefaults(defineProps<{
  title: string
  icon: string
  description?: string
  columns: readonly TableColumn[]
  rows: readonly TableRow[]
  rowKey: string
  minWidth?: string
}>(), {
  description: '',
  minWidth: '760px',
})

const { translateText } = useTranslateText()

const getRowKey = (row: TableRow, index: number) => String(row[props.rowKey] ?? index)

const missingValueLabels = new Set(['', 'n/a', 'na', 'not filled', 'not available'])

const isMissingValue = (value: TableValue) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && missingValueLabels.has(value.trim().toLowerCase()))

const getDisplayValue = (value: TableValue) => (isMissingValue(value) ? 'N/A' : value)

const getCellClass = (column: TableColumn) => ({
  number: column.align === 'right',
  'is-center': column.align === 'center',
  'is-action': column.type === 'action',
  'muted-text': column.tone === 'muted',
  'strong-text': column.tone === 'strong',
})

const getStatusLabel = (column: TableColumn, value: TableValue) => {
  if (typeof value === 'boolean') {
    return translateText(value ? column.trueLabel ?? 'Active' : column.falseLabel ?? 'Inactive')
  }

  return translateText(value ?? '')
}

const isWarningStatus = (column: TableColumn, value: TableValue) => {
  if (column.warningValues?.includes(value)) {
    return true
  }

  return value === false
}
</script>

<template>
  <UCard as="article" class="analytics-card" :ui="{ body: 'analytics-card-body' }">
    <div class="section-heading dashboard-data-table-heading">
      <div>
        <h2 class="section-title with-icon">
          <UIcon :name="icon" />
          {{ translateText(title) }}
        </h2>
        <p v-if="description">{{ translateText(description) }}</p>
      </div>
      <div class="dashboard-data-table-actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="dashboard-data-table-wrap">
      <table class="dashboard-data-table" :style="{ minWidth }">
        <colgroup>
          <col
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
          >
        </colgroup>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :class="getCellClass(column)"
            >
              <span v-if="column.type === 'action'" class="sr-only">
                {{ translateText(column.label) }}
              </span>
              <template v-else>
                {{ translateText(column.label) }}
              </template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="getRowKey(row, index)">
            <template v-for="column in columns" :key="column.key">
              <th
                v-if="column.rowHeader"
                scope="row"
                :class="getCellClass(column)"
                :title="String(getDisplayValue(row[column.key]))"
              >
                {{ translateText(getDisplayValue(row[column.key])) }}
              </th>
              <td
                v-else
                :class="getCellClass(column)"
                :title="column.type === 'action' ? undefined : String(getDisplayValue(row[column.key]))"
              >
                <span
                  v-if="column.type === 'status'"
                  class="status"
                  :class="{ warn: isWarningStatus(column, row[column.key]) }"
                >
                  {{ getStatusLabel(column, row[column.key]) }}
                </span>
                <slot
                  v-else-if="column.type === 'action'"
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                />
                <template v-else>
                  {{ translateText(getDisplayValue(row[column.key])) }}
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
