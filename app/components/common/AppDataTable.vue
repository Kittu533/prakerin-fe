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
      col.id === 'actions' || col.accessorKey === 'actions'

    if (isActionCol) {
      meta.class = {
        th:
          'whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wide ' +
          'sticky right-0 z-20 bg-white/95 backdrop-blur-sm shadow-[-2px_0_8px_rgba(0,0,0,0.04)] ' +
          'md:static md:right-auto md:z-0 md:shadow-none',
        td:
          'text-sm text-gray-700 align-middle ' +
          'sticky right-0 z-10 bg-white/95 backdrop-blur-sm shadow-[-2px_0_8px_rgba(0,0,0,0.04)] ' +
          'md:static md:right-auto md:z-0 md:shadow-none'
      }
    } else {
      meta.class = {
        th: 'whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wide',
        td: 'text-sm text-gray-700 align-middle'
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
      <div class="overflow-x-auto">
        <UTable
          :data="paginatedItems"
          :columns="enhancedColumns"
          :ui="{
            wrapper: 'min-w-full',
            base: 'min-w-[640px] sm:min-w-full',
            thead: 'bg-gray-50/80',
            tr: {
              base: 'border-b border-gray-100 transition-colors hover:bg-gray-50/50',
              selected: '',
              active: ''
            },
            th: {
              base: 'px-2 sm:px-3 md:px-4 py-2.5 sm:py-3.5 text-left bg-gray-50/80',
              padding: '',
              color: '',
              font: '',
              size: ''
            },
            td: {
              base: 'px-2 sm:px-3 md:px-4 py-3 sm:py-4 bg-white',
              padding: '',
              color: '',
              font: '',
              size: ''
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