<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10">
        <!-- FORM INPUT SURAT KELUAR -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <div 
                class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                @click="isFormExpanded = !isFormExpanded"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-50 rounded-lg">
                        <Icon name="lucide:pen-tool" class="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Form Input Surat Keluar</h2>
                        <p class="text-xs text-slate-500 font-medium">Input data surat baru atau gunakan template</p>
                    </div>
                </div>
                <Icon 
                    :name="isFormExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                    class="w-5 h-5 text-slate-400" 
                />
            </div>

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
            >
                <div v-show="isFormExpanded" class="p-6 space-y-6">
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <UFormField label="Metode Pembuatan Surat" help="Pilih bagaimana Anda ingin membuat nomor dan konten surat">
                            <div class="flex flex-wrap items-center gap-6 mt-2">
                                <label class="flex items-center gap-3 cursor-pointer group bg-white px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-all shadow-sm">
                                    <input 
                                        type="radio" 
                                        v-model="formMetode" 
                                        value="manual" 
                                        class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span class="text-sm font-semibold text-slate-700">Hanya Ambil Nomor (Manual)</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer group bg-white px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-400 transition-all shadow-sm">
                                    <input 
                                        type="radio" 
                                        v-model="formMetode" 
                                        value="otomatis" 
                                        class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                    />
                                    <span class="text-sm font-semibold text-slate-700">Gunakan Template Otomatis</span>
                                </label>
                            </div>
                        </UFormField>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Template Selection -->
                        <div v-if="formMetode === 'otomatis'" class="lg:col-span-2">
                            <UFormField label="Pilih Template Dokumen" required>
                                <div class="flex gap-3 mt-1">
                                    <USelect
                                        v-model="form.template_id"
                                        :items="templateOptions"
                                        placeholder="-- Pilih Template Surat --"
                                        class="flex-1"
                                        icon="lucide:file-text"
                                    />
                                    <UButton variant="soft" color="primary" class="shrink-0" @click="showTemplateModal = true">
                                        <Icon name="lucide:plus-circle" class="w-4 h-4 mr-2" />
                                        Template Baru
                                    </UButton>
                                </div>
                            </UFormField>
                        </div>

                        <UFormField label="Klasifikasi Surat" required>
                            <USelect
                                v-model="form.klasifikasi_surat"
                                :items="klasifikasiOptions"
                                placeholder="-- Pilih Klasifikasi --"
                                class="w-full mt-1"
                                icon="lucide:tag"
                            />
                        </UFormField>

                        <UFormField label="Ditujukan Kepada" required>
                            <UInput 
                                v-model="form.ditujukan_kepada" 
                                placeholder="Contoh: Kepala Dinas Pendidikan Kota Semarang" 
                                class="w-full mt-1"
                                icon="lucide:user"
                            />
                        </UFormField>

                        <UFormField label="Perihal Surat" required class="lg:col-span-1">
                            <UTextarea 
                                v-model="form.perkara" 
                                placeholder="Jelaskan isi singkat perihal surat..." 
                                :rows="3"
                                class="w-full mt-1"
                            />
                        </UFormField>

                        <UFormField label="Dasar / Lampiran (Opsional)" class="lg:col-span-1">
                            <UTextarea 
                                v-model="form.isi_lampiran" 
                                placeholder="Sebutkan dasar hukum atau lampiran terkait..." 
                                :rows="3"
                                class="w-full mt-1"
                            />
                        </UFormField>
                    </div>

                    <div class="flex justify-end pt-4 border-t border-slate-100">
                        <UButton 
                            color="success" 
                            size="lg"
                            class="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold shadow-md hover:shadow-lg transition-all" 
                            @click="saveSurat"
                            :loading="saving"
                        >
                            <Icon name="lucide:send" class="w-5 h-5 mr-2" />
                            PROSES & SIMPAN DATA
                        </UButton>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- PANEL PENCARIAN & CETAK DATA -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <div 
                class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                @click="isSearchPanelExpanded = !isSearchPanelExpanded"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-50 rounded-lg">
                        <Icon name="lucide:search" class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Panel Pencarian & Cetak Data</h2>
                        <p class="text-xs text-slate-500 font-medium">Filter data surat untuk keperluan cetak atau ekspor</p>
                    </div>
                </div>
                <Icon 
                    :name="isSearchPanelExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                    class="w-5 h-5 text-slate-400" 
                />
            </div>

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
            >
                <div v-show="isSearchPanelExpanded" class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <UFormField label="Dari Tanggal">
                            <UInput v-model="filters.start_date" type="date" class="w-full" icon="lucide:calendar" />
                        </UFormField>
                        
                        <UFormField label="Sampai Tanggal">
                            <UInput v-model="filters.end_date" type="date" class="w-full" icon="lucide:calendar" />
                        </UFormField>
                        
                        <UFormField label="Kata Kunci">
                            <UInput 
                                v-model="filters.search" 
                                placeholder="No Surat, Tujuan, Perihal..." 
                                class="w-full"
                                icon="lucide:search"
                            />
                        </UFormField>
                        
                        <div class="flex items-end h-full pb-0.5">
                            <UButton color="neutral" variant="soft" class="w-full justify-center h-[38px]" @click="resetFilters">
                                <Icon name="lucide:rotate-ccw" class="w-4 h-4 mr-2" />
                                Reset Filter
                            </UButton>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UButton color="primary" class="bg-blue-600 hover:bg-blue-700 justify-center font-bold py-3 shadow-sm" @click="fetchData">
                            <Icon name="lucide:printer" class="w-5 h-5 mr-2" />
                            CETAK DATA TERFILTER
                        </UButton>
                        <UButton color="neutral" class="bg-slate-800 hover:bg-slate-900 text-white justify-center font-bold py-3 shadow-sm" @click="fetchData">
                            <Icon name="lucide:download" class="w-5 h-5 mr-2" />
                            EKSPOR SEMUA DATA
                        </UButton>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- TABLE SECTION -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div class="flex items-center gap-2">
                    <Icon name="lucide:list" class="w-5 h-5 text-slate-500" />
                    <h3 class="font-bold text-slate-700 text-sm uppercase">Daftar Surat Keluar</h3>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-slate-500">Tampilkan:</span>
                    <USelect
                        v-model="pagination.limit"
                        :items="[10, 25, 50, 100]"
                        size="xs"
                        class="w-20"
                        @update:modelValue="fetchData"
                    />
                </div>
            </div>

            <div v-if="loading" class="p-8 space-y-4">
                <div v-for="i in 5" :key="i" class="flex gap-4">
                    <USkeleton class="h-10 w-20" />
                    <USkeleton class="h-10 flex-1" />
                    <USkeleton class="h-10 w-32" />
                    <USkeleton class="h-10 w-24" />
                </div>
            </div>

            <div v-else-if="suratKeluar.length === 0" class="p-20 text-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="p-4 bg-slate-50 rounded-full">
                        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300" />
                    </div>
                    <p class="text-slate-500 font-medium">Belum ada data surat keluar</p>
                    <UButton variant="link" color="primary" @click="isFormExpanded = true">Buat Surat Sekarang</UButton>
                </div>
            </div>

            <UTable v-else :data="suratKeluar" :columns="columns" class="w-full">
                <template #nomor_surat-cell="{ row }">
                    <div class="flex flex-col">
                        <span class="font-bold text-blue-700">{{ row.original.nomor_surat }}</span>
                        <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ row.original.klasifikasi_surat }}</span>
                    </div>
                </template>
                <template #tanggal_surat-cell="{ row }">
                    <span class="text-slate-600 font-medium">{{ formatDate(row.original.tanggal_surat) }}</span>
                </template>
                <template #ditujukan_kepada-cell="{ row }">
                    <div class="max-w-[200px] truncate font-medium text-slate-700" :title="row.original.ditujukan_kepada">
                        {{ row.original.ditujukan_kepada }}
                    </div>
                </template>
                <template #perkara-cell="{ row }">
                    <div class="max-w-[300px] truncate text-slate-600 italic" :title="row.original.perkara">
                        "{{ row.original.perkara }}"
                    </div>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="sm" class="font-bold uppercase tracking-widest text-[10px]">
                        {{ row.original.status }}
                    </UBadge>
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex items-center gap-1">
                        <UTooltip text="Lihat Detail">
                            <UButton variant="ghost" color="neutral" size="xs" @click="viewDetail(row.original)">
                                <Icon name="lucide:eye" class="w-4 h-4" />
                            </UButton>
                        </UTooltip>
                        <UTooltip text="Edit Surat">
                            <UButton variant="ghost" color="neutral" size="xs" @click="editSurat(row.original)">
                                <Icon name="lucide:pencil" class="w-4 h-4" />
                            </UButton>
                        </UTooltip>
                        <UTooltip text="Hapus">
                            <UButton variant="ghost" color="error" size="xs" @click="confirmDelete(row.original)">
                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                            </UButton>
                        </UTooltip>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div class="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-slate-100 bg-slate-50/30 gap-4">
                <p class="text-sm text-slate-500 font-medium">
                    Menampilkan <span class="text-slate-900 font-bold">{{ ((pagination.page - 1) * pagination.limit) + 1 }}</span> 
                    sampai <span class="text-slate-900 font-bold">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> 
                    dari <span class="text-slate-900 font-bold">{{ pagination.total }}</span> data
                </p>
                
                <div class="flex items-center gap-2">
                    <UButton 
                        variant="outline" 
                        color="neutral" 
                        size="sm" 
                        :disabled="pagination.page === 1" 
                        @click="changePage(pagination.page - 1)"
                    >
                        <Icon name="lucide:chevron-left" class="w-4 h-4 mr-1" />
                        Sebelumnya
                    </UButton>
                    
                    <div class="flex items-center gap-1 mx-2">
                        <UButton 
                            v-for="p in Math.ceil(pagination.total / pagination.limit)" 
                            :key="p"
                            size="sm"
                            :variant="pagination.page === p ? 'solid' : 'ghost'"
                            :color="pagination.page === p ? 'primary' : 'neutral'"
                            class="w-9 h-9 justify-center rounded-lg font-bold"
                            @click="changePage(p)"
                        >
                            {{ p }}
                        </UButton>
                    </div>

                    <UButton 
                        variant="outline" 
                        color="neutral" 
                        size="sm" 
                        :disabled="pagination.page * pagination.limit >= pagination.total" 
                        @click="changePage(pagination.page + 1)"
                    >
                        Berikutnya
                        <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal 
            v-model:open="showDetailModal" 
            title="Detail Surat Keluar" 
            description="Informasi lengkap surat keluar yang dipilih"
            size="lg"
        >
            <template #body>
                <div v-if="selectedSurat" class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nomor Surat</p>
                            <p class="font-bold text-blue-700 text-lg">{{ selectedSurat.nomor_surat }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tanggal Surat</p>
                            <p class="font-bold text-slate-700">{{ formatDate(selectedSurat.tanggal_surat) }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ditujukan Kepada</p>
                            <p class="font-semibold text-slate-800">{{ selectedSurat.ditujukan_kepada }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Klasifikasi</p>
                            <UBadge color="primary" variant="soft" class="font-bold uppercase">{{ selectedSurat.klasifikasi_surat }}</UBadge>
                        </div>
                        <div class="space-y-1 text-sm">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sifat Surat</p>
                            <p class="font-medium text-slate-700 capitalize">{{ selectedSurat.sifat_surat }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Penandatangan</p>
                            <p class="font-medium text-slate-700">{{ selectedSurat.penandatangan }}</p>
                        </div>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Perihal</p>
                        <p class="text-slate-700 leading-relaxed">{{ selectedSurat.perkara || '-' }}</p>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Lampiran / Keterangan</p>
                        <p class="text-slate-700 leading-relaxed italic">{{ selectedSurat.isi_lampiran || 'Tidak ada lampiran' }}</p>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton variant="soft" color="neutral" @click="showDetailModal = false">Tutup</UButton>
                    <UButton color="primary" @click="editSurat(selectedSurat!); showDetailModal = false">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit Data
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- MODAL UNGGAH & KONVERSI TEMPLATE -->
        <UModal 
            v-model:open="showTemplateModal" 
            title="Unggah & Konversi Template" 
            description="Upload template surat dalam format Word (.docx) untuk dikonversi otomatis"
            size="md"
        >
            <template #body>
                <div class="space-y-6">
                    <!-- Info/Warning Box -->
                    <div class="bg-[#FFF9E6] border border-[#FFE082] rounded-xl p-5 space-y-4">
                        <div class="flex items-center gap-2">
                            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-[#B8860B]" />
                            <h4 class="text-xs font-black text-[#856404] uppercase tracking-wider">Wajib Ada Tag Berikut:</h4>
                        </div>
                        
                        <ul class="text-[13px] space-y-1.5 text-[#856404] font-medium ml-1">
                            <li>1. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;NO_SURAT&gt;&gt;</span> (Nomor Lengkap)</li>
                            <li>2. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;TGL_SURAT&gt;&gt;</span> (Tanggal Hari Ini)</li>
                            <li>3. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;TUJUAN&gt;&gt;</span> (Penerima Surat)</li>
                            <li>4. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;PERIHAL&gt;&gt;</span> (Isi Ringkas Surat)</li>
                        </ul>

                        <p class="text-[11px] text-[#D32F2F] font-semibold leading-snug pt-1">
                            *File akan otomatis dikonversi ke format Google Docs agar bisa diproses sistem.
                        </p>
                    </div>

                    <!-- Form Fields -->
                    <div class="space-y-5">
                        <UFormField label="Nama Template:">
                            <UInput 
                                v-model="templateForm.nama" 
                                placeholder="Contoh: Surat Tugas Guru" 
                                class="w-full font-medium"
                            />
                        </UFormField>

                        <UFormField label="Pilih File Word (.docx):">
                            <div class="flex items-center w-full border border-slate-200 rounded-lg overflow-hidden group hover:border-blue-400 transition-colors">
                                <label class="bg-slate-50 px-4 py-2 border-r border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 shrink-0">
                                    Choose file
                                    <input type="file" class="hidden" accept=".docx" @change="handleFileChange" />
                                </label>
                                <span class="px-4 py-2 text-sm text-slate-400 truncate flex-1 bg-white">
                                    {{ templateForm.file?.name || 'No file chosen' }}
                                </span>
                            </div>
                        </UFormField>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-center gap-3 w-full pb-2">
                    <UButton 
                        color="success" 
                        class="bg-[#388E3C] hover:bg-[#2E7D32] px-8 font-bold py-2.5 h-auto text-sm"
                        :loading="uploadingTemplate"
                        @click="handleUploadTemplate"
                    >
                        <Icon name="lucide:upload" class="w-5 h-5 mr-2" />
                        Unggah & Konversi
                    </UButton>
                    <UButton 
                        variant="solid" 
                        color="neutral" 
                        class="bg-[#607D8B] hover:bg-[#546E7A] px-10 font-bold py-2.5 h-auto text-sm text-white"
                        @click="showTemplateModal = false"
                    >
                        Cancel
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useSuratKeluar, type SuratKeluar } from "~/composables/api/use-surat-keluar";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const { getAll, create, update, remove } = useSuratKeluar();
const { showConfirmation, showSuccess } = useSweetAlert();

const loading = ref(false);
const saving = ref(false);
const showDetailModal = ref(false);
const showTemplateModal = ref(false);
const isEditing = ref(false);
const uploadingTemplate = ref(false);
const selectedSurat = ref<SuratKeluar | null>(null);

const isFormExpanded = ref(true);
const isSearchPanelExpanded = ref(false);
const formMetode = ref('manual');

const templateForm = ref({
    nama: "",
    file: null as File | null
});

const suratKeluar = ref<SuratKeluar[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });

const filters = ref({
    search: "",
    start_date: "",
    end_date: "",
});

const form = ref({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split('T')[0],
    ditujukan_kepada: "",
    alamat_tujuan: "",
    perkara: "",
    klasifikasi_surat: undefined,
    sifat_surat: "biasa",
    isi_lampiran: "",
    penandatangan: "Admin TU",
    tanggal_kirim: "",
    bukti_pengiriman: "",
    template_id: undefined,
});

const columns = [
    { accessorKey: "nomor_surat", header: "No. Surat" },
    { accessorKey: "tanggal_surat", header: "Tanggal" },
    { accessorKey: "ditujukan_kepada", header: "Ditujukan" },
    { accessorKey: "perkara", header: "Perihal" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
];

const templateOptions = [
    { label: 'Template Surat PKL', value: 'pkl' },
    { label: 'Template Surat Izin', value: 'izin' },
];

const klasifikasiOptions = [
    { label: 'Biasa', value: 'biasa' },
    { label: 'Penting', value: 'penting' },
    { label: 'Segera', value: 'segera' },
    { label: 'Rahasia', value: 'rahasia' },
];

const sifatOptions = [
    { value: "biasa", label: "Biasa" },
    { value: "urgent", label: "Urgent" },
    { value: "konfidensial", label: "Konfidensial" },
];

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "terkirim": return "success";
        case "sedang_diproses": return "warning";
        case "ditolak": return "error";
        default: return "neutral";
    }
}

function resetForm() {
    form.value = {
        nomor_surat: "",
        tanggal_surat: new Date().toISOString().split('T')[0],
        ditujukan_kepada: "",
        alamat_tujuan: "",
        perkara: "",
        klasifikasi_surat: undefined,
        sifat_surat: "biasa",
        isi_lampiran: "",
        penandatangan: "Admin TU",
        tanggal_kirim: "",
        bukti_pengiriman: "",
        template_id: undefined,
    };
    isEditing.value = false;
    selectedSurat.value = null;
}

function resetFilters() {
    filters.value = {
        search: "",
        start_date: "",
        end_date: "",
    };
    fetchData();
}

async function fetchData() {
    loading.value = true;
    try {
        const result = await getAll({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined,
            start_date: filters.value.start_date || undefined,
            end_date: filters.value.end_date || undefined,
        });

        if (result.success && result.data) {
            suratKeluar.value = result.data.data || [];
            pagination.value.total = result.data.total || 0;
        }
    } catch (err) {
        console.error("[SuratKeluar] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

function viewDetail(surat: SuratKeluar) {
    selectedSurat.value = surat;
    showDetailModal.value = true;
}

function editSurat(surat: SuratKeluar) {
    selectedSurat.value = surat;
    isEditing.value = true;
    isFormExpanded.value = true;
    form.value = {
        nomor_surat: surat.nomor_surat,
        tanggal_surat: surat.tanggal_surat.split("T")[0],
        ditujukan_kepada: surat.ditujukan_kepada,
        alamat_tujuan: surat.alamat_tujuan || "",
        perkara: surat.perkara || "",
        klasifikasi_surat: surat.klasifikasi_surat as any,
        sifat_surat: surat.sifat_surat,
        isi_lampiran: surat.isi_lampiran || "",
        penandatangan: surat.penandatangan,
        tanggal_kirim: surat.tanggal_kirim?.split("T")[0] || "",
        bukti_pengiriman: surat.bukti_pengiriman || "",
        template_id: undefined,
    };
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveSurat() {
    if (!form.value.ditujukan_kepada || !form.value.klasifikasi_surat) {
        // Simple validation check before saving
        return;
    }

    saving.value = true;
    try {
        const data = {
            ...form.value,
            tanggal_surat: new Date(form.value.tanggal_surat).toISOString(),
            tanggal_kirim: form.value.tanggal_kirim ? new Date(form.value.tanggal_kirim).toISOString() : undefined,
        };

        let result;
        if (isEditing.value && selectedSurat.value) {
            result = await update(selectedSurat.value.id, data);
        } else {
            result = await create(data as any);
        }

        if (result.success) {
            await showSuccess("Berhasil", `Surat keluar berhasil ${isEditing.value ? "diperbarui" : "disimpan"}`);
            resetForm();
            fetchData();
        }
    } catch (err) {
        console.error("[SuratKeluar] Error saving:", err);
    } finally {
        saving.value = false;
    }
}

async function confirmDelete(surat: SuratKeluar) {
    const result = await showConfirmation(
        "Konfirmasi Hapus",
        `Apakah Anda yakin ingin menghapus surat ${surat.nomor_surat}? Data yang dihapus tidak dapat dikembalikan.`
    );

    if (result.isConfirmed) {
        const deleteResult = await remove(surat.id);
        if (deleteResult.success) {
            await showSuccess("Berhasil", "Surat keluar berhasil dihapus");
            fetchData();
        }
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        templateForm.value.file = file;
    }
}

async function handleUploadTemplate() {
    if (!templateForm.value.nama || !templateForm.value.file) {
        return;
    }

    uploadingTemplate.value = true;
    try {
        // Simulating upload process
        await new Promise(resolve => setTimeout(resolve, 1500));
        await showSuccess("Berhasil", "Template berhasil diunggah dan dikonversi");
        showTemplateModal.value = false;
        templateForm.value = { nama: "", file: null };
    } catch (err) {
        console.error("Upload error:", err);
    } finally {
        uploadingTemplate.value = false;
    }
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Surat Keluar | Tata Usaha" });
</script>
