<template>
    <div class="space-y-4">
        <!-- Mass Management Section -->
        <MassManagementCard
            ref="massCard"
            entity-name="Personil"
            :loading="uploading"
            @upload="handleUpload"
            @download-template="handleDownloadTemplate"
            @export-filtered="exportFiltered"
            @export-all="exportAll"
        />

        <div class="flex justify-end">
            <UButton
                to="/tata-usaha/ttd-digital"
                color="primary"
                variant="soft"
                class="font-bold"
            >
                <Icon name="lucide:signature" class="w-4 h-4 mr-2" />
                Buka Master TTD Digital
            </UButton>
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div class="md:col-span-5 space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700"
                        >Cari Data</label
                    >
                    <UInput
                        v-model="filters.search"
                        placeholder="Nama, NIP, atau Jabatan..."
                        icon="i-heroicons-magnifying-glass"
                        size="lg"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500',
                        }"
                    />
                </div>
                <div class="md:col-span-4 space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700"
                        >Filter Kelompok</label
                    >
                    <USelectMenu
                        v-model="filters.kelompok"
                        :options="kelompokOptions"
                        size="lg"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500',
                        }"
                    />
                </div>
                <div class="md:col-span-3">
                    <UButton
                        variant="outline"
                        color="neutral"
                        block
                        size="lg"
                        class="h-11 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                        @click="fetchData"
                    >
                        <Icon
                            name="i-heroicons-arrow-path"
                            class="w-4 h-4 mr-2"
                        />
                        Refresh Data
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div
            class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        >
            <div v-if="loading" class="p-4 space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <UTable
                v-else
                :data="guruListView"
                :columns="columns"
                :ui="{
                    th: {
                        base: 'bg-slate-50 text-slate-900 font-bold uppercase text-[11px] tracking-wider py-4',
                    },
                    td: { base: 'py-4 align-middle' },
                }"
            >
                <!-- No Column -->
                <template #index-cell="{ row }">
                    <span class="text-sm text-slate-500 px-2">{{
                        row.index + 1
                    }}</span>
                </template>

                <!-- Nama & NIP Column -->
                <template #nama_guru-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-bold text-slate-900">
                            {{ row.original.nama_guru }}
                        </p>
                        <p class="text-[11px] text-slate-400 font-medium">
                            NIP. {{ row.original.nip }}
                        </p>
                    </div>
                </template>

                <!-- Jabatan / Kelompok Column -->
                <template #jabatan-cell="{ row }">
                    <div class="space-y-1.5">
                        <p class="font-bold text-slate-900 text-sm">
                            {{ row.original.jabatan || "Guru" }}
                        </p>
                        <UBadge
                            color="primary"
                            variant="subtle"
                            size="sm"
                            class="bg-blue-100 text-blue-600 border-none font-semibold px-2 py-0.5 rounded text-[10px]"
                        >
                            {{ row.original.kelompok || "Lainnya" }}
                        </UBadge>
                    </div>
                </template>

                <!-- Pangkat Column -->
                <template #pangkat-cell="{ row }">
                    <span class="text-sm text-slate-600">{{
                        row.original.pangkat || "-"
                    }}</span>
                </template>

                <!-- Gol/Ruang Column -->
                <template #golongan-cell="{ row }">
                    <span class="text-sm text-slate-600"
                        >({{ row.original.golongan || "-" }})</span
                    >
                </template>

                <!-- WhatsApp Column -->
                <template #no_hp-cell="{ row }">
                    <a
                        v-if="row.original.no_hp"
                        :href="`https://wa.me/${row.original.no_hp}`"
                        target="_blank"
                        class="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <Icon
                            name="i-heroicons-chat-bubble-left-right"
                            class="w-4 h-4"
                        />
                        {{ row.original.no_hp }}
                    </a>
                    <span v-else class="text-slate-400">-</span>
                </template>

                <!-- Aksi Column -->
                <template #actions-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <UButton
                            variant="outline"
                            color="neutral"
                            size="xs"
                            class="p-1.5 border-blue-600 text-blue-600 hover:bg-blue-50 rounded"
                            @click="viewDetail(row.original)"
                        >
                            <Icon
                                name="i-heroicons-pencil-square"
                                class="w-4 h-4"
                            />
                        </UButton>
                        <UButton
                            variant="outline"
                            color="error"
                            size="xs"
                            class="p-1.5 border-red-500 text-red-500 hover:bg-red-50 rounded"
                            @click="confirmDelete(row.original)"
                        >
                            <Icon name="i-heroicons-trash" class="w-4 h-4" />
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div
                class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30"
            >
                <p class="text-xs text-slate-500 font-medium">
                    Showing
                    {{ (pagination.page - 1) * pagination.limit + 1 }} to
                    {{
                        Math.min(
                            pagination.page * pagination.limit,
                            pagination.total,
                        )
                    }}
                    of {{ pagination.total }}
                </p>
                <div class="flex items-center gap-2">
                    <UButton
                        variant="neutral"
                        size="xs"
                        :disabled="pagination.page === 1"
                        class="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        @click="changePage(pagination.page - 1)"
                    >
                        Previous
                    </UButton>
                    <UButton
                        variant="neutral"
                        size="xs"
                        :disabled="
                            pagination.page * pagination.limit >=
                            pagination.total
                        "
                        class="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        @click="changePage(pagination.page + 1)"
                    >
                        Next
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal
            :open="showDetailModal"
            @update:open="showDetailModal = $event"
            title="Detail Guru"
            description="Informasi lengkap data guru yang dipilih."
            size="lg"
        >
            <template #body>
                <div v-if="selectedGuru" class="p-4 space-y-3">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-slate-500 font-medium mb-1">NIP</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.nip }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Nama</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.nama_guru }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Jabatan</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.jabatan || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Kelompok</p>
                            <UBadge
                                v-if="selectedGuru.kelompok"
                                color="primary"
                                variant="subtle"
                                size="sm"
                            >
                                {{ selectedGuru.kelompok }}
                            </UBadge>
                            <p v-else class="font-bold text-slate-900">-</p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Pangkat</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.pangkat || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Gol/Ruang</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.golongan || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">No. HP</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.no_hp || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Email</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedGuru.email || "-" }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end">
                    <UButton variant="neutral" @click="showDetailModal = false"
                        >Tutup</UButton
                    >
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useMasterGuruPage } from "~/composables/tata-usaha/use-master-guru-page";
import MassManagementCard from "~/components/master/MassManagementCard.vue";

definePageMeta({ layout: "tata-usaha" });

const {
    massCard,
    loading,
    uploading,
    showDetailModal,
    selectedGuru,
    guruListView,
    pagination,
    filters,
    kelompokOptions,
    columns,
    fetchData,
    handleUpload,
    handleDownloadTemplate,
    exportFiltered,
    exportAll,
    viewDetail,
    confirmDelete,
    changePage,
} = useMasterGuruPage();

useHead({ title: "Data Guru | Tata Usaha" });
</script>
