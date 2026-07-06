<script setup lang="ts">
type SkeletonVariant = "metrics" | "filters" | "tabs" | "charts" | "table";

const props = withDefaults(
  defineProps<{
    variant: SkeletonVariant;
    count?: number;
    rows?: number;
    columns?: number;
    barCount?: number;
    chartHeight?: string;
    compactIndexes?: number[];
    containerClass?: string;
    wideIndexes?: number[];
  }>(),
  {
    count: 1,
    rows: 6,
    columns: 7,
    barCount: 7,
    chartHeight: "300px",
    compactIndexes: () => [],
    containerClass: "",
    wideIndexes: () => [],
  },
);

const items = computed(() => Array.from({ length: props.count }, (_, index) => index));
const rows = computed(() => Array.from({ length: props.rows }, (_, index) => index));
const columns = computed(() =>
  Array.from({ length: props.columns }, (_, index) => index),
);
const bars = computed(() =>
  Array.from({ length: props.barCount }, (_, index) => index + 1),
);

const isWide = (index: number) => props.wideIndexes.includes(index);
const isCompact = (index: number) => props.compactIndexes.includes(index);
</script>

<template>
  <section v-if="variant === 'metrics'" class="grid metrics" aria-busy="true">
    <UCard
      v-for="item in items"
      :key="item"
      as="article"
      class="metric app-loading-metric"
      :ui="{ body: 'metric-body app-loading-metric-body' }"
    >
      <div class="app-loading-head">
        <USkeleton class="app-skeleton-line app-skeleton-line--label" />
        <USkeleton class="app-skeleton-icon" />
      </div>
      <USkeleton class="app-skeleton-line app-skeleton-line--value" />
      <USkeleton class="app-skeleton-line app-skeleton-line--caption" />
    </UCard>
  </section>

  <UCard
    v-else-if="variant === 'filters'"
    as="section"
    class="app-loading-card"
    :ui="{ body: 'app-loading-filter-body' }"
    aria-busy="true"
  >
    <div class="app-loading-filter-head">
      <div>
        <USkeleton class="app-skeleton-line app-skeleton-line--title" />
        <USkeleton class="app-skeleton-line app-skeleton-line--copy" />
      </div>
      <USkeleton class="app-skeleton-line app-skeleton-line--badge" />
    </div>
    <div class="app-loading-filter-grid">
      <USkeleton
        v-for="item in items"
        :key="item"
        class="app-skeleton-input"
        :class="{ 'app-skeleton-input--wide': item === 0 }"
      />
    </div>
  </UCard>

  <nav v-else-if="variant === 'tabs'" class="app-loading-tabs" aria-busy="true">
    <USkeleton
      v-for="item in items"
      :key="item"
      class="app-skeleton-tab"
    />
  </nav>

  <section
    v-else-if="variant === 'charts'"
    :class="containerClass || 'grid analytics-chart-grid'"
    aria-busy="true"
  >
    <UCard
      v-for="item in items"
      :key="item"
      as="article"
      class="analytics-card app-loading-chart"
      :class="{
        'analytics-chart-wide': isWide(item),
        'analytics-chart-compact': isCompact(item),
      }"
      :ui="{ body: 'analytics-card-body app-loading-chart-body' }"
    >
      <div class="app-loading-head">
        <div>
          <USkeleton class="app-skeleton-line app-skeleton-line--chart-title" />
          <USkeleton class="app-skeleton-line app-skeleton-line--chart-copy" />
        </div>
        <USkeleton class="app-skeleton-line app-skeleton-line--badge" />
      </div>
      <div class="app-loading-plot" :style="{ minHeight: chartHeight }">
        <USkeleton
          v-for="bar in bars"
          :key="bar"
          class="app-skeleton-bar"
          :style="{ height: `${36 + ((bar * 19) % 56)}%` }"
        />
      </div>
    </UCard>
  </section>

  <UCard
    v-else
    as="section"
    class="analytics-card app-loading-table"
    :ui="{ body: 'analytics-card-body app-loading-table-body' }"
    aria-busy="true"
  >
    <div class="app-loading-head">
      <div>
        <USkeleton class="app-skeleton-line app-skeleton-line--table-title" />
        <USkeleton class="app-skeleton-line app-skeleton-line--table-copy" />
      </div>
      <USkeleton class="app-skeleton-line app-skeleton-line--table-action" />
    </div>
    <div
      class="app-loading-table-grid"
      :style="{ '--app-skeleton-columns': columns.length }"
    >
      <USkeleton
        v-for="column in columns"
        :key="`head-${column}`"
        class="app-skeleton-line app-skeleton-line--table-heading"
      />
      <template v-for="row in rows" :key="row">
        <USkeleton
          v-for="column in columns"
          :key="`${row}-${column}`"
          class="app-skeleton-line app-skeleton-line--table-cell"
        />
      </template>
    </div>
  </UCard>
</template>

<style scoped>
.app-loading-metric,
.app-loading-card,
.app-loading-chart,
.app-loading-table {
  border-color: var(--app-border);
  background: var(--app-surface);
  box-shadow: none;
}

.app-loading-metric :deep(.app-loading-metric-body) {
  min-height: 140px;
  padding: 18px 20px;
}

.app-loading-head,
.app-loading-filter-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.app-loading-head {
  margin-bottom: 28px;
}

.app-loading-filter-body {
  display: grid;
  gap: 16px;
}

.app-loading-filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(5, minmax(150px, 1fr)) auto;
  align-items: end;
  gap: 12px;
}

.app-skeleton-line,
.app-skeleton-input,
.app-skeleton-tab {
  border-radius: 999px;
}

.app-skeleton-line--label {
  width: 52%;
  height: 14px;
}

.app-skeleton-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
}

.app-skeleton-line--value {
  width: 44%;
  height: 30px;
  margin-bottom: 14px;
}

.app-skeleton-line--caption {
  width: 68%;
  height: 13px;
}

.app-skeleton-line--title {
  width: 210px;
  max-width: 60vw;
  height: 18px;
  margin-bottom: 12px;
}

.app-skeleton-line--copy {
  width: 360px;
  max-width: 70vw;
  height: 13px;
}

.app-skeleton-line--badge,
.app-skeleton-line--table-action {
  width: 96px;
  height: 24px;
}

.app-skeleton-input {
  height: 38px;
}

.app-loading-tabs {
  display: flex;
  gap: 28px;
  min-width: 0;
  overflow-x: auto;
  padding: 0 2px;
  scrollbar-width: none;
}

.app-loading-tabs::-webkit-scrollbar {
  display: none;
}

.app-skeleton-tab {
  width: 110px;
  height: 18px;
  flex: 0 0 auto;
}

.app-loading-chart :deep(.app-loading-chart-body) {
  display: grid;
  min-height: 360px;
  grid-template-rows: auto 1fr;
  gap: 28px;
}

.app-skeleton-line--chart-title,
.app-skeleton-line--table-title {
  width: 220px;
  max-width: 48vw;
  height: 18px;
  margin-bottom: 10px;
}

.app-skeleton-line--chart-copy,
.app-skeleton-line--table-copy {
  width: 320px;
  max-width: 56vw;
  height: 13px;
}

.app-loading-plot {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 18px;
  border-radius: 8px;
  padding: 20px 18px 8px;
  background: color-mix(in srgb, var(--app-surface-soft) 45%, transparent);
}

.app-skeleton-bar {
  width: min(42px, 9%);
  min-height: 42px;
  border-radius: 8px 8px 0 0;
}

.app-loading-table :deep(.app-loading-table-body) {
  display: grid;
  gap: 22px;
}

.app-loading-table-grid {
  display: grid;
  min-width: 840px;
  grid-template-columns: repeat(var(--app-skeleton-columns), minmax(80px, 1fr));
  gap: 14px 16px;
  overflow: hidden;
}

.app-skeleton-line--table-heading {
  height: 13px;
}

.app-skeleton-line--table-cell {
  height: 16px;
}

@media (max-width: 1279px) {
  .app-loading-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .app-skeleton-input--wide {
    grid-column: span 2;
  }
}

@media (max-width: 767px) {
  .app-loading-filter-head,
  .app-loading-head {
    flex-direction: column;
  }

  .app-loading-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .app-skeleton-input--wide {
    grid-column: auto;
  }

  .app-skeleton-line--badge,
  .app-skeleton-line--table-action {
    width: 120px;
  }

  .app-loading-plot {
    gap: 10px;
  }
}
</style>
