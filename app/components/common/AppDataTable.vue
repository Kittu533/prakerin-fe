<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  items: any[]
  columns: TableColumn<any>[]
  title?: string
  description?: string
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
}>()

const page = ref(1)
const search = ref('')

const effectivePageSize = computed(() => props.pageSize ?? 10)
const isSearchable = computed(() => props.searchable ?? true)
const searchPlaceholder = computed(
  () => props.searchPlaceholder || 'Cari data...'
)

/* ---------- FILTERING ---------- */
const filteredItems = computed(() => {
  if (!search.value) return props.items
  const q = search.value.toLowerCase()

  return props.items.filter((row) => {
    const keys =
      props.searchKeys && props.searchKeys.length
        ? props.searchKeys
        : Object.keys(row)

    const text = keys
      .map((k) => String((row as any)[k] ?? ''))
      .join(' ')
      .toLowerCase()

    return text.includes(q)
  })
})

/* ---------- PAGINATION ---------- */
const totalItems = computed(() => filteredItems.value.length)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * effectivePageSize.value
  return filteredItems.value.slice(start, start + effectivePageSize.value)
})

watch(search, () => {
  page.value = 1
})

/* ---------- ENHANCED COLUMNS ---------- */
const enhancedColumns = computed<TableColumn<any>[]>(() =>
  props.columns.map((raw) => {
    const col = { ...raw } as TableColumn<any> & {
      meta?: { class?: { th?: string; td?: string } }
    }

    const meta = { ...(col.meta ?? {}) }
    const cls = { ...(meta.class ?? {}) }

    const isActionCol = 
      col.id === 'actions' || 
      col.id === 'aksi' || 
      (col as any).accessorKey === 'actions' || 
      (col as any).accessorKey === 'aksi' ||
      (col.header && typeof col.header === 'string' && (col.header.toLowerCase() === 'aksi' || col.header.toLowerCase() === 'actions'))

    if (isActionCol) {
      meta.class = {
        th: cls.th
          ? `${cls.th} sticky right-0 z-30 bg-gray-50 backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-200 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0`
          : 'whitespace-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider sticky right-0 z-30 bg-gray-50 backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-200 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0',
        td: cls.td
          ? `${cls.td} sticky right-0 z-20 bg-white backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-100 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0`
          : 'text-sm text-gray-700 align-middle sticky right-0 z-20 bg-white backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-100 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0'
      }
    } else {
      meta.class = {
        th: cls.th || 'whitespace-nowrap text-xs font-semibold text-gray-700 uppercase tracking-wider',
        td: cls.td || 'text-sm text-gray-700 align-middle'
      }
    }

    col.meta = meta
    return col
  })
)
</script>

<template>
  <section class="space-y-4">
    <!-- Header & Toolbar -->
    <div
      v-if="title || $slots['toolbar-right']"
      class="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div v-if="title" class="space-y-1">
        <h2 class="text-base sm:text-lg font-semibold text-gray-900">
          {{ title }}
        </h2>
        <p v-if="description" class="text-xs sm:text-sm text-gray-500">
          {{ description }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <UInput
          v-if="isSearchable"
          v-model="search"
          size="sm"
          class="w-full sm:w-56 md:w-64"
          icon="i-lucide-search"
          :placeholder="searchPlaceholder"
        />
        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- Table Wrapper -->
    <div class="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="overflow-x-auto relative">
        <UTable
          :data="paginatedItems"
          :columns="enhancedColumns"
          :ui="{
            wrapper: 'min-w-full',
            table: 'min-w-[640px] sm:min-w-full',
            thead: 'bg-gray-50 border-b border-gray-200',
            tr: {
              base: 'border-b border-gray-100 transition-colors hover:bg-gray-50/50'
            },
            th: {
              base: 'px-4 py-3 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider bg-gray-50'
            },
            td: {
              base: 'px-4 py-3 bg-white border-b border-gray-100'
            },
            tbody: 'divide-y divide-gray-100 bg-white'
          }"
        />
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row"
    >
      <p class="text-xs sm:text-sm text-gray-600">
        Menampilkan
        <span class="font-semibold text-gray-900">
          {{ paginatedItems.length }}
        </span>
        dari
        <span class="font-semibold text-gray-900">
          {{ totalItems }}
        </span>
        entri
      </p>

      <UPagination
        v-model:page="page"
        :items-per-page="effectivePageSize"
        :total="totalItems"
        :size="'sm'"
        :show-edges="false"
        class="text-xs sm:text-sm"
      />
    </div>
  </section>
</template>

<style scoped>
/* Enhanced sticky column support */
@media (max-width: 639px) {
  :deep(.sticky) {
    position: sticky !important;
    right: 0 !important;
  }
  
  /* Ensure sticky columns stay on top during scroll */
  :deep(thead th.sticky) {
    z-index: 30 !important;
  }
  
  :deep(tbody td.sticky) {
    z-index: 20 !important;
  }
  
  /* Prevent content overlap with sticky column */
  :deep(table) {
    border-collapse: separate;
    border-spacing: 0;
  }
}

/* Smooth transitions for responsive breakpoints */
:deep(th), :deep(td) {
  transition: box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>