<!-- UI Redesign in progress -->
<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10 px-4 sm:px-6">
        <!-- Hero & Stats Section -->
        <div class="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div class="flex items-center gap-5">
                    <div class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-sky-100 bg-sky-50 shadow-inner">
                        <img src="/assets/img/logo-skanda.png" alt="Logo" class="h-14 w-14 object-contain" />
                    </div>
                    <div class="space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="rounded-full bg-sky-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">SKANDA Dashboard</span>
                            <span class="rounded-full bg-slate-100 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">Disposisi Surat</span>
                        </div>
                        <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900">
                            Manajemen Disposisi Surat
                        </h1>
                        <p class="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                            Kelola penerima multi-pihak, instruksi kerja, dan pantau tindak lanjut surat masuk secara terstruktur dalam satu workspace.
                        </p>
                    </div>
                </div>

                <div class="grid min-w-[320px] grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-2 xl:min-w-[420px]">
                    <div class="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">Total</div>
                        <div class="mt-2 text-3xl font-black text-sky-700">{{ statusSummary.total }}</div>
                    </div>
                    <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Aktif</div>
                        <div class="mt-2 text-3xl font-black text-amber-700">{{ statusSummary.aktif }}</div>
                    </div>
                    <div class="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">Deadline</div>
                        <div class="mt-2 text-3xl font-black text-rose-700">{{ statusSummary.deadline }}</div>
                    </div>
                    <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Tuntas</div>
                        <div class="mt-2 text-3xl font-black text-emerald-700">{{ statusSummary.selesai }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Unified Workspace Card -->
        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <!-- Toolbar: Filters & Actions -->
            <div class="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                <div class="flex flex-col gap-6">
                    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div class="flex-1 min-w-[300px] relative">
                            <input
                                v-model="filters.search"
                                type="text"
                                placeholder="Cari nomor surat, asal, atau perihal..."
                                class="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
                                @keyup.enter="applyFilters"
                            />
                            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icon name="lucide:search" class="h-4 w-4" />
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-3">
                            <UButton
                                color="primary"
                                class="rounded-2xl bg-sky-700 px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white transition hover:bg-sky-800 active:scale-95 shadow-md shadow-sky-100"
                                @click="openCreateModal"
                            >
                                <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
                                Buat Disposisi
                            </UButton>
                            <button
                                class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50 active:scale-95"
                                @click="resetFilters"
                            >
                                <Icon name="lucide:rotate-ccw" class="mr-2 h-4 w-4" />
                                Reset
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Status:</span>
                            <button
                                v-for="option in statusFilterOptions"
                                :key="option.value"
                                class="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                :class="filters.status === option.value ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'"
                                @click="filters.status = option.value; applyFilters()"
                            >
                                {{ option.label }}
                            </button>
                        </div>

                        <div class="h-6 w-px bg-slate-200 hidden lg:block"></div>

                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mr-2">Prioritas:</span>
                            <button
                                v-for="option in prioritasFilterOptions"
                                :key="option.value"
                                class="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                :class="filters.prioritas === option.value ? 'bg-sky-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'"
                                @click="filters.prioritas = option.value; applyFilters()"
                            >
                                {{ option.label }}
                            </button>
                        </div>

                        <div class="ml-auto flex items-center gap-3">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tampilkan</span>
                            <select
                                v-model="pagination.limit"
                                class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-400"
                                @change="applyFilters"
                            >
                                <option :value="10">10</option>
                                <option :value="25">25</option>
                                <option :value="50">50</option>
                                <option :value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table Section -->
            <div class="overflow-x-auto">
                <table class="w-full min-w-[1200px] border-collapse text-left">
                    <thead>
                        <tr class="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                            <th class="px-8 py-5">Informasi Surat & Tanggal</th>
                            <th class="px-8 py-5">Penerima & Instruksi</th>
                            <th class="px-8 py-5 text-center">Tenggat & Prioritas</th>
                            <th class="px-8 py-5 text-center">Status</th>
                            <th class="px-8 py-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="loading">
                            <td colspan="5" class="px-8 py-20 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
                                    <span class="text-xs font-black uppercase tracking-widest text-slate-400">Memuat data disposisi...</span>
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="disposisiList.length === 0">
                            <td colspan="5" class="px-8 py-20 text-center">
                                <div class="flex flex-col items-center gap-4">
                                    <div class="rounded-full bg-slate-50 p-6">
                                        <Icon name="lucide:file-question" class="h-12 w-12 text-slate-300" />
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-base font-black text-slate-900 uppercase tracking-tight">Belum ada data disposisi</p>
                                        <p class="text-xs font-medium text-slate-500">Coba ubah filter atau buat disposisi baru.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <template v-for="item in disposisiList" :key="item.id">
                            <tr
                                class="group cursor-pointer align-top transition-colors hover:bg-slate-50"
                                :class="isRowExpanded(item.id) ? 'bg-slate-50/50' : ''"
                                @click="toggleRow(item.id)"
                            >
                                <td class="px-8 py-6">
                                    <div class="flex items-start gap-4">
                                        <div
                                            class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-sky-500"
                                            :class="isRowExpanded(item.id) ? 'border-sky-200 bg-sky-50 text-sky-500 shadow-inner' : ''"
                                        >
                                            <Icon
                                                :name="isRowExpanded(item.id) ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                                                class="h-5 w-5"
                                            />
                                        </div>
                                        <div class="space-y-1.5">
                                            <div class="text-[13px] font-bold tracking-tight text-slate-800 line-clamp-1" :title="item.surat_masuk?.nomor_surat">
                                                {{ item.surat_masuk?.nomor_surat || '-' }}
                                            </div>
                                            <div class="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                                                {{ item.surat_masuk?.asal_surat || '-' }}
                                            </div>
                                            <div class="text-xs font-medium text-slate-400 line-clamp-1 italic">
                                                {{ formatDate(item.tanggal_disposisi) }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-8 py-6">
                                    <div class="space-y-3">
                                        <div class="flex flex-wrap gap-1.5">
                                            <span
                                                v-for="penerima in item.penerima_disposisi"
                                                :key="penerima"
                                                class="rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600 border border-slate-200"
                                            >
                                                {{ penerima }}
                                            </span>
                                        </div>
                                        <div class="flex flex-wrap gap-1.5">
                                            <span
                                                v-for="instruksi in item.instruksi_labels"
                                                :key="instruksi"
                                                class="rounded-lg bg-sky-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-sky-700 border border-sky-100"
                                            >
                                                {{ instruksi }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-8 py-6 text-center">
                                    <div class="inline-flex flex-col items-center gap-2">
                                        <div class="text-xs font-bold text-slate-800">
                                            {{ item.batas_waktu ? formatDate(item.batas_waktu) : '-' }}
                                        </div>
                                        <span
                                            class="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] border"
                                            :class="[
                                                item.prioritas === 'segera' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                item.prioritas === 'biasa' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            ]"
                                        >
                                            {{ item.prioritas_label }}
                                        </span>
                                    </div>
                                </td>
                                <td class="px-8 py-6 text-center">
                                    <span
                                        class="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm"
                                        :class="[
                                            item.status === 'baru' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                            item.status === 'proses' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        ]"
                                    >
                                        {{ item.status_label }}
                                    </span>
                                </td>
                                <td class="px-8 py-6">
                                    <div class="flex items-center justify-center gap-1">
                                        <button
                                            class="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"
                                            title="Detail Lengkap"
                                            @click.stop="viewDetail(item)"
                                        >
                                            <Icon name="lucide:eye" class="h-4 w-4" />
                                        </button>
                                        <button
                                            class="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                                            title="Edit Disposisi"
                                            @click.stop="editDisposisi(item)"
                                        >
                                            <Icon name="lucide:pencil" class="h-4 w-4" />
                                        </button>
                                        <button
                                            v-if="item.status !== 'selesai'"
                                            class="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                            title="Tandai Selesai"
                                            @click.stop="setStatus(item, 'selesai')"
                                        >
                                            <Icon name="lucide:check-circle" class="h-4 w-4" />
                                        </button>
                                        <button
                                            class="p-2.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                            title="Hapus"
                                            @click.stop="confirmDelete(item)"
                                        >
                                            <Icon name="lucide:trash-2" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <!-- Expanded Detail Content -->
                            <tr v-if="isRowExpanded(item.id)" class="bg-slate-50/30">
                                <td colspan="5" class="px-8 py-0">
                                    <div class="mb-8 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                                        <div class="grid lg:grid-cols-12">
                                            <!-- Letter Info Left -->
                                            <div class="lg:col-span-5 border-r border-slate-100 bg-slate-50/30 p-8 space-y-6">
                                                <div class="space-y-4">
                                                    <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Informasi Surat Masuk</div>
                                                    <div class="space-y-2">
                                                        <h4 class="text-xl font-black text-slate-900 leading-tight">
                                                            {{ item.surat_masuk?.perihal || '-' }}
                                                        </h4>
                                                        <div class="flex items-center gap-2">
                                                            <Icon name="lucide:hash" class="h-4 w-4 text-sky-500" />
                                                            <span class="text-sm font-bold text-slate-700">{{ item.surat_masuk?.nomor_surat || '-' }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="flex flex-col gap-3 pt-4 border-t border-slate-200/60">
                                                        <div class="flex justify-between items-center text-xs">
                                                            <span class="font-bold text-slate-400 uppercase tracking-widest">Asal Surat</span>
                                                            <span class="font-black text-sky-700">{{ item.surat_masuk?.asal_surat || '-' }}</span>
                                                        </div>
                                                        <div class="flex justify-between items-center text-xs">
                                                            <span class="font-bold text-slate-400 uppercase tracking-widest">Tanggal Surat</span>
                                                            <span class="font-bold text-slate-700">{{ formatDate(item.surat_masuk?.tanggal_surat) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Disposition Details Right -->
                                            <div class="lg:col-span-7 p-8 space-y-8">
                                                <div class="grid sm:grid-cols-2 gap-8">
                                                    <div class="space-y-4">
                                                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-500">Instruksi Kerja</div>
                                                        <div class="flex flex-col gap-2">
                                                            <div
                                                                v-for="label in item.instruksi_labels"
                                                                :key="label"
                                                                class="flex items-center gap-2 text-sm font-bold text-slate-700 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100/50"
                                                            >
                                                                <Icon name="lucide:check-square" class="h-4 w-4 text-sky-600" />
                                                                {{ label }}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="space-y-4">
                                                        <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Penerima Disposisi</div>
                                                        <div class="flex flex-col gap-2">
                                                            <div
                                                                v-for="penerima in item.penerima_disposisi"
                                                                :key="penerima"
                                                                class="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50"
                                                            >
                                                                <Icon name="lucide:user" class="h-4 w-4 text-slate-400" />
                                                                {{ penerima }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="space-y-4 pt-6 border-t border-slate-100">
                                                    <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Catatan Tambahan</div>
                                                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-sm font-medium leading-relaxed text-slate-600 italic">
                                                        {{ item.catatan || 'Tidak ada catatan tambahan.' }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Pagination Footer -->
            <div class="border-t border-slate-100 bg-slate-50/50 px-8 py-5">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Menampilkan
                        <span class="text-slate-900">{{ pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1 }}</span>
                        sampai
                        <span class="text-slate-900">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                        dari
                        <span class="text-slate-900">{{ pagination.total }}</span>
                        Data Disposisi
                    </p>

                    <div class="flex items-center gap-2">
                        <button
                            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            :disabled="pagination.page === 1"
                            @click="changePage(pagination.page - 1)"
                        >
                            Sebelumnya
                        </button>
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white shadow-lg shadow-slate-200">
                            {{ pagination.page }}
                        </div>
                        <button
                            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            :disabled="pagination.page * pagination.limit >= pagination.total"
                            @click="changePage(pagination.page + 1)"
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Keep existing Modals -->
        <DisposisiFormModal
            v-model:open="showCreateModal"
            :is-editing="isEditing"
            :saving="saving"
            :form="form"
            :form-meta="formMeta"
            :surat-masuk-select-options="suratMasukSelectOptions"
            :management-list="managementList"
            :selected-recipient-names="selectedRecipientNames"
            :form-error="formError"
            @toggle-recipient="toggleRecipient"
            @toggle-instruksi="toggleInstruksi"
            @save="saveDisposisi"
        />

        <DisposisiDetailModal
            v-model:open="showDetailModal"
            :disposisi="selectedDisposisi"
            :format-date="formatDate"
            :get-status-color="getStatusColor"
            :get-prioritas-color="getPrioritasColor"
            @set-status="setStatus"
        />
    </div>
</template>

<script setup lang="ts">
import { useDisposisiPage } from "~/composables/tata-usaha/use-disposisi-page";
import DisposisiDetailModal from "~/components/tata-usaha/disposisi/DisposisiDetailModal.vue";
import DisposisiFormModal from "~/components/tata-usaha/disposisi/DisposisiFormModal.vue";

definePageMeta({ layout: "tata-usaha" });

const {
    loading,
    saving,
    showCreateModal,
    showDetailModal,
    isEditing,
    selectedDisposisi,
    managementList,
    disposisiList,
    pagination,
    filters,
    form,
    formError,
    formMeta,
    columns,
    statusFilterOptions,
    prioritasFilterOptions,
    suratMasukSelectOptions,
    selectedRecipientNames,
    statusSummary,
    formatDate,
    getStatusColor,
    getPrioritasColor,
    openCreateModal,
    toggleRecipient,
    toggleInstruksi,
    applyFilters,
    resetFilters,
    viewDetail,
    editDisposisi,
    saveDisposisi,
    setStatus,
    confirmDelete,
    changePage,
} = useDisposisiPage();

const expandedRows = ref<Set<string>>(new Set());

function toggleRow(id: string) {
    if (expandedRows.value.has(id)) {
        expandedRows.value.delete(id);
    } else {
        expandedRows.value.add(id);
    }
}

function isRowExpanded(id: string) {
    return expandedRows.value.has(id);
}

useHead({ title: "Disposisi | Tata Usaha" });
</script>
