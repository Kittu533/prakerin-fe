<script setup lang="ts">
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    createColumnHelper,
    type ColumnDef,
    getPaginationRowModel,
    getFilteredRowModel,
    type SortingState,
    getSortedRowModel,
} from "@tanstack/vue-table";
import { ref, computed, watch, h } from "vue";
import { formatDateTime } from "~/utils/format-date";

type T = any;

const props = defineProps<{
    data: T[];
    columns: ColumnDef<T, any>[];
    title?: string;
    description?: string;
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: string[];
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: string;
    withTime?: boolean;
}>();

const page = ref(1);
const search = ref("");
const sorting = ref<SortingState>([]);

const effectivePageSize = computed(() => props.pageSize ?? 10);
const isSearchable = computed(() => props.searchable ?? true);
const searchPlaceholder = computed(
    () => props.searchPlaceholder || "Cari data...",
);

const effectiveColumns = computed(() => {
    if (!props.withTime) return props.columns;

    const cols = [...props.columns];
    const actionIndex = cols.findIndex(
        (c) => c.id === "aksi" || c.id === "actions",
    );

    const timeCols: ColumnDef<T, any>[] = [
        {
            id: "created_at",
            header: "Dibuat",
            cell: ({ row }) =>
                h(
                    "span",
                    { class: "text-xs text-slate-500" },
                    formatDateTime(row.original.created_at),
                ),
        },
        {
            id: "updated_at",
            header: "Diperbarui",
            cell: ({ row }) =>
                h(
                    "span",
                    { class: "text-xs text-slate-500" },
                    formatDateTime(row.original.updated_at),
                ),
        },
    ];

    if (actionIndex !== -1) {
        cols.splice(actionIndex, 0, ...timeCols);
    } else {
        cols.push(...timeCols);
    }

    return cols;
});

/* ---------- TABLE INSTANCE ---------- */
const table = useVueTable({
    get data() {
        return props.data;
    },
    get columns() {
        return effectiveColumns.value;
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
        get pagination() {
            return {
                pageIndex: page.value - 1,
                pageSize: effectivePageSize.value,
            };
        },
        get sorting() {
            return sorting.value;
        },
        get globalFilter() {
            return search.value;
        },
    },
    onSortingChange: (updaterOrValue) => {
        sorting.value =
            typeof updaterOrValue === "function"
                ? updaterOrValue(sorting.value)
                : updaterOrValue;
    },
    onPaginationChange: (updaterOrValue) => {
        page.value =
            typeof updaterOrValue === "function"
                ? updaterOrValue({
                      pageIndex: page.value - 1,
                      pageSize: effectivePageSize.value,
                  }).pageIndex + 1
                : updaterOrValue.pageIndex + 1;
    },
});

/* ---------- COMPUTED VALUES ---------- */
const totalItems = computed(() => table.getFilteredRowModel().rows.length);
const currentPage = computed(() => table.getState().pagination.pageIndex + 1);
const totalPages = computed(() => table.getPageCount());
const paginatedRows = computed(() => table.getRowModel().rows);

/* ---------- WATCH SEARCH ---------- */
watch(search, () => {
    page.value = 1;
});

/* ---------- HELPER FUNCTIONS ---------- */
function firstPage() {
    table.firstPage();
    page.value = 1;
}

function prevPage() {
    table.previousPage();
    page.value = table.getState().pagination.pageIndex + 1;
}

function nextPage() {
    table.nextPage();
    page.value = table.getState().pagination.pageIndex + 1;
}

function lastPage() {
    table.lastPage();
    page.value = table.getPageCount();
}

function canPrevPage() {
    return table.getCanPreviousPage();
}

function canNextPage() {
    return table.getCanNextPage();
}

/* ---------- SORTING ---------- */
function toggleSort(columnId: string) {
    const currentSort = sorting.value.find((s) => s.id === columnId);
    if (currentSort) {
        if (currentSort.desc) {
            // Remove sort
            sorting.value = sorting.value.filter((s) => s.id !== columnId);
        } else {
            // Toggle to desc
            sorting.value = sorting.value.map((s) =>
                s.id === columnId ? { ...s, desc: true } : s,
            );
        }
    } else {
        // Add asc sort
        sorting.value = [...sorting.value, { id: columnId, desc: false }];
    }
}

function getSortIndicator(columnId: string) {
    const sort = sorting.value.find((s) => s.id === columnId);
    if (!sort) return null;
    return sort.desc ? "desc" : "asc";
}
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

            <div
                class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3"
            >
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
        <div
            class="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm"
        >
            <div class="overflow-x-auto relative">
                <!-- Loading State -->
                <div v-if="loading" class="p-4 space-y-3">
                    <div
                        v-for="i in 5"
                        :key="i"
                        class="h-16 bg-gray-100 rounded-lg animate-pulse"
                    />
                </div>

                <template v-else>
                    <!-- Empty State -->
                    <div
                        v-if="paginatedRows.length === 0"
                        class="py-12 sm:py-16 px-4 text-center"
                    >
                        <div
                            class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-4"
                        >
                            <Icon
                                :name="emptyIcon || 'lucide:inbox'"
                                class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                            />
                        </div>
                        <h3
                            class="text-base sm:text-lg font-semibold text-gray-700 mb-1"
                        >
                            {{ emptyTitle || "Tidak ada data" }}
                        </h3>
                        <p class="text-sm text-gray-500 max-w-sm mx-auto">
                            {{
                                emptyDescription ||
                                "Belum ada data yang tersedia"
                            }}
                        </p>
                    </div>

                    <table v-else class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr
                                v-for="headerGroup in table.getHeaderGroups()"
                                :key="headerGroup.id"
                            >
                                <th
                                    v-for="header in headerGroup.headers"
                                    :key="header.id"
                                    :colSpan="header.colSpan"
                                    :class="[
                                        'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                                        header.column.getCanSort() &&
                                            'cursor-pointer hover:bg-gray-100 transition-colors select-none',
                                        // Sticky action column
                                        (header.id === 'aksi' ||
                                            header.id === 'actions') &&
                                            'sticky right-0 z-30 bg-gray-50 backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-200 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0',
                                    ]"
                                    @click="
                                        header.column.getCanSort()
                                            ? toggleSort(header.id)
                                            : null
                                    "
                                >
                                    <div class="flex items-center gap-2">
                                        <FlexRender
                                            v-if="!header.isPlaceholder"
                                            :render="
                                                header.column.columnDef.header
                                            "
                                            :props="header.getContext()"
                                        />
                                        <!-- Sort Indicator -->
                                        <span
                                            v-if="header.column.getCanSort()"
                                            class="flex items-center"
                                        >
                                            <Icon
                                                v-if="
                                                    getSortIndicator(
                                                        header.id,
                                                    ) === 'asc'
                                                "
                                                name="i-lucide-arrow-up"
                                                class="w-3 h-3 text-gray-500"
                                            />
                                            <Icon
                                                v-else-if="
                                                    getSortIndicator(
                                                        header.id,
                                                    ) === 'desc'
                                                "
                                                name="i-lucide-arrow-down"
                                                class="w-3 h-3 text-gray-500"
                                            />
                                            <Icon
                                                v-else
                                                name="i-lucide-arrow-up-down"
                                                class="w-3 h-3 text-gray-400"
                                            />
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr
                                v-for="row in paginatedRows"
                                :key="row.id"
                                class="transition-colors hover:bg-gray-50/50"
                            >
                                <td
                                    v-for="cell in row.getVisibleCells()"
                                    :key="cell.id"
                                    :class="[
                                        'px-4 py-3 text-sm text-gray-700 whitespace-nowrap align-middle',
                                        // Sticky action column
                                        (cell.column.id === 'aksi' ||
                                            cell.column.id === 'actions') &&
                                            'sticky right-0 z-20 bg-white backdrop-blur-sm shadow-[-4px_0_12px_rgba(0,0,0,0.08)] border-l border-gray-100 sm:static sm:right-auto sm:z-0 sm:shadow-none sm:border-l-0',
                                    ]"
                                >
                                    <FlexRender
                                        :render="cell.column.columnDef.cell"
                                        :props="cell.getContext()"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </template>
            </div>
        </div>

        <!-- Footer -->
        <div
            v-if="!loading && data.length > 0"
            class="flex flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row"
        >
            <p class="text-xs sm:text-sm text-gray-600">
                Menampilkan
                <span class="font-semibold text-gray-900">
                    {{ paginatedRows.length }}
                </span>
                dari
                <span class="font-semibold text-gray-900">
                    {{ totalItems }}
                </span>
                entri
            </p>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center gap-2">
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-chevrons-left"
                    :disabled="!canPrevPage()"
                    @click="firstPage"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-chevron-left"
                    :disabled="!canPrevPage()"
                    @click="prevPage"
                />
                <span class="text-sm text-gray-600 px-2">
                    Hal {{ currentPage }} dari {{ totalPages }}
                </span>
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-chevron-right"
                    :disabled="!canNextPage()"
                    @click="nextPage"
                />
                <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-chevrons-right"
                    :disabled="!canNextPage()"
                    @click="lastPage"
                />
            </div>
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

    :deep(thead th.sticky) {
        z-index: 30 !important;
    }

    :deep(tbody td.sticky) {
        z-index: 20 !important;
    }

    :deep(table) {
        border-collapse: separate;
        border-spacing: 0;
    }
}

/* Smooth transitions for responsive breakpoints */
:deep(th),
:deep(td) {
    transition:
        box-shadow 0.2s ease-in-out,
        background-color 0.2s ease-in-out;
}
</style>
