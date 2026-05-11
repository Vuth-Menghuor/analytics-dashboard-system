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
  warningValues?: TableValue[]
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

const getRowKey = (row: TableRow, index: number) => String(row[props.rowKey] ?? index)

const getCellClass = (column: TableColumn) => [
  column.align === 'right' ? 'number' : '',
  column.align === 'center' ? 'is-center' : '',
  column.tone === 'muted' ? 'muted-text' : '',
  column.tone === 'strong' ? 'strong-text' : '',
]

const getStatusLabel = (column: TableColumn, value: TableValue) => {
  if (typeof value === 'boolean') {
    return value ? column.trueLabel ?? 'Active' : column.falseLabel ?? 'Inactive'
  }

  return value ?? ''
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
    <div class="section-heading">
      <h2 class="section-title with-icon">
        <UIcon :name="icon" />
        {{ title }}
      </h2>
      <p v-if="description">{{ description }}</p>
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
              :class="{ 'is-center': column.align === 'center' }"
            >
              {{ column.label }}
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
              >
                {{ row[column.key] }}
              </th>
              <td v-else :class="getCellClass(column)">
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
                  {{ row[column.key] }}
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
