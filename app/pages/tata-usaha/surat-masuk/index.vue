<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10">
        <!-- Header & Action -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Surat Masuk</h2>
                <p class="text-sm text-slate-500 font-medium tracking-tight">Kelola dan arsipkan surat masuk administrasi sekolah</p>
            </div>
            <UButton 
                color="success" 
                size="lg" 
                class="bg-emerald-600 hover:bg-emerald-700 px-6 font-bold shadow-md transition-all"
                @click="openCreateModal"
            >
                <Icon name="lucide:plus" class="w-5 h-5 mr-2" />
                TAMBAH SURAT
            </UButton>
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
                        <p class="text-xs text-slate-500 font-medium">Filter data surat masuk untuk cetak atau laporan</p>
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
                                placeholder="No Agenda, No Surat, Asal..." 
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
                    <h3 class="font-bold text-slate-700 text-sm uppercase">Daftar Surat Masuk</h3>
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

            <div v-else-if="suratMasuk.length === 0" class="p-20 text-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="p-4 bg-slate-50 rounded-full">
                        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300" />
                    </div>
                    <p class="text-slate-500 font-medium">Belum ada data surat masuk</p>
                    <UButton variant="link" color="primary" @click="openCreateModal">Input Surat Sekarang</UButton>
                </div>
            </div>

            <UTable v-else :data="suratMasuk" :columns="columns" class="w-full">
                <template #nomor_agenda-cell="{ row }">
                    <span class="font-bold text-slate-900">{{ row.original.nomor_agenda }}</span>
                </template>
                <template #nomor_surat-cell="{ row }">
                    <div class="flex flex-col">
                        <span class="font-bold text-blue-700">{{ row.original.nomor_surat }}</span>
                        <span class="text-[10px] text-slate-400 uppercase tracking-tighter">{{ row.original.klasifikasi_surat }}</span>
                    </div>
                </template>
                <template #tanggal_surat-cell="{ row }">
                    <span class="text-slate-600 font-medium">{{ formatDate(row.original.tanggal_surat) }}</span>
                </template>
                <template #asal_surat-cell="{ row }">
                    <div class="max-w-[200px] truncate font-medium text-slate-700" :title="row.original.asal_surat">
                        {{ row.original.asal_surat }}
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
                    <UButton variant="outline" color="neutral" size="sm" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">
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

                    <UButton variant="outline" color="neutral" size="sm" :disabled="pagination.page * pagination.limit >= pagination.total" @click="changePage(pagination.page + 1)">
                        Berikutnya
                        <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
                    </UButton>
                </div>
            </div>
        </div>

        <!-- MODAL INPUT SURAT BARU -->
        <UModal 
            v-model:open="showCreateModal" 
            title="Input Surat Baru" 
            description="Formulir untuk memasukkan data surat masuk baru ke dalam sistem"
            size="lg" 
            :close-button="{ icon: 'lucide:x', color: 'white', variant: 'ghost' }"
            :ui="{
                header: 'bg-[#1b5e20] text-white',
                title: 'text-lg font-bold uppercase tracking-tight',
                description: 'text-emerald-100'
            }"
        >
            <template #body>
                <div class="space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="ASAL SURAT">
                            <UInput v-model="form.asal_surat" placeholder="Masukkan asal surat" class="w-full" />
                        </UFormField>
                        <UFormField label="NOMOR SURAT">
                            <UInput v-model="form.nomor_surat" placeholder="Masukkan nomor surat" class="w-full" />
                        </UFormField>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Tanggal Surat">
                            <UInput v-model="form.tanggal_surat" type="date" class="w-full" icon="lucide:calendar" />
                        </UFormField>
                        <UFormField label="SIFAT SURAT">
                            <USelect
                                v-model="form.sifat_surat"
                                :items="sifatOptions"
                                placeholder="Pilih Sifat"
                                class="w-full"
                            />
                        </UFormField>
                    </div>

                    <UFormField label="PERIHAL">
                        <UInput v-model="form.perkara" placeholder="Masukkan perihal surat" class="w-full" />
                    </UFormField>

                    <UFormField label="KETERANGAN / CATATAN">
                        <UTextarea v-model="form.keterangan" placeholder="Tambahkan catatan jika ada" :rows="3" class="w-full" />
                    </UFormField>

                    <div class="space-y-3">
                        <div class="flex items-center gap-2 text-[#2e7d32]">
                            <Icon name="lucide:send" class="w-4 h-4" />
                            <h4 class="text-xs font-black uppercase tracking-wider">Teruskan ke Manajemen:</h4>
                        </div>

                        <div class="space-y-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
                            <div v-for="staff in managementList" :key="staff.name" 
                                class="flex items-center gap-4 bg-white p-3 rounded-md border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                @click="toggleStaff(staff.name)"
                            >
                                <input 
                                    type="checkbox"
                                    :checked="form.teruskan_ke.includes(staff.name)"
                                    @change.stop="toggleStaff(staff.name)"
                                    @click.stop
                                    class="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                                />
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-800">{{ staff.name }}</span>
                                    <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                        <Icon name="lucide:user-cog" class="w-3.5 h-3.5" />
                                        {{ staff.role }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <USwitch v-model="form.arsipkan" color="primary" />
                            <span class="text-sm font-bold text-slate-700">Arsipkan Surat (Selesai)</span>
                        </div>
                    </div>

                    <UFormField label="UPLOAD FILE (Optional)">
                        <div class="flex items-center w-full border border-slate-200 rounded-lg overflow-hidden group hover:border-emerald-400 transition-colors">
                            <label class="bg-slate-50 px-4 py-2 border-r border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 shrink-0">
                                Choose file
                                <input type="file" class="hidden" @change="handleFileChange" />
                            </label>
                            <span class="px-4 py-2 text-sm text-slate-400 truncate flex-1 bg-white">
                                {{ form.file?.name || 'No file chosen' }}
                            </span>
                        </div>
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-3 w-full px-4 pb-2">
                    <UButton 
                        variant="soft" 
                        color="neutral" 
                        class="bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 font-bold"
                        @click="showCreateModal = false"
                    >
                        Batal
                    </UButton>
                    <UButton 
                        color="success" 
                        class="bg-[#2e7d32] hover:bg-[#1b5e20] px-10 font-bold shadow-md"
                        :loading="saving"
                        @click="saveSurat"
                    >
                        SIMPAN
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- Detail Modal -->
        <UModal 
            v-model:open="showDetailModal" 
            title="Detail Surat Masuk" 
            description="Informasi lengkap surat masuk yang dipilih"
            size="lg"
        >
            <template #body>
                <div v-if="selectedSurat" class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nomor Agenda</p>
                            <p class="font-bold text-slate-700">{{ selectedSurat.nomor_agenda }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</p>
                            <UBadge :color="getStatusColor(selectedSurat.status)" variant="soft" class="font-bold uppercase tracking-wider">
                                {{ selectedSurat.status }}
                            </UBadge>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nomor Surat</p>
                            <p class="font-bold text-blue-700 text-lg">{{ selectedSurat.nomor_surat }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Asal Surat</p>
                            <p class="font-bold text-slate-700">{{ selectedSurat.asal_surat }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tanggal Surat</p>
                            <p class="font-medium text-slate-700">{{ formatDate(selectedSurat.tanggal_surat) }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tanggal Diterima</p>
                            <p class="font-medium text-slate-700 font-bold">{{ formatDate(selectedSurat.tanggal_diterima) }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Klasifikasi</p>
                            <p class="font-medium text-slate-700 uppercase">{{ selectedSurat.klasifikasi_surat }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sifat</p>
                            <p class="font-medium text-slate-700 capitalize">{{ selectedSurat.sifat_surat }}</p>
                        </div>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ditujukan Kepada</p>
                        <p class="font-semibold text-slate-800">{{ selectedSurat.ditujukan_kepada }}</p>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Perihal</p>
                        <p class="text-slate-700 italic leading-relaxed">{{ selectedSurat.perkara || '-' }}</p>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Keterangan</p>
                        <p class="text-slate-700 leading-relaxed">{{ selectedSurat.keterangan || '-' }}</p>
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
    </div>
</template>

<script setup lang="ts">
import { useSuratMasuk, type SuratMasuk } from "~/composables/api/use-surat-masuk";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const { getAll, create, update, remove } = useSuratMasuk();
const { showConfirmation, showSuccess } = useSweetAlert();

const loading = ref(false);
const saving = ref(false);
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const isEditing = ref(false);
const selectedSurat = ref<SuratMasuk | null>(null);

const isSearchPanelExpanded = ref(false);

const suratMasuk = ref<SuratMasuk[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });

const filters = ref({
    search: "",
    start_date: "",
    end_date: "",
});

const form = ref({
    nomor_agenda: "",
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split('T')[0],
    tanggal_diterima: new Date().toISOString().split('T')[0],
    asal_surat: "",
    perkara: "",
    klasifikasi_surat: undefined,
    sifat_surat: "Biasa",
    ditujukan_kepada: "",
    keterangan: "",
    teruskan_ke: [] as string[],
    arsipkan: false,
    file: null as File | null
});

const managementList = [
    { name: "Bonar Tobing, S.Pd", role: "Kepala Sekolah" },
    { name: "Budi Santoso, M.Kom", role: "Kepala Sub Bagian Tata Usaha" },
    { name: "Djarot Saiful, S.Pd", role: "Waka Kurikulum" },
    { name: "Gede Pasek, M.Kom", role: "Waka Kesiswaan" },
];

const columns = [
    { accessorKey: "nomor_agenda", header: "No. Agenda" },
    { accessorKey: "nomor_surat", header: "No. Surat" },
    { accessorKey: "tanggal_surat", header: "Tanggal" },
    { accessorKey: "asal_surat", header: "Asal Surat" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
];

const klasifikasiOptions = [
    { label: 'Biasa', value: 'biasa' },
    { label: 'Penting', value: 'penting' },
    { label: 'Segera', value: 'segera' },
    { label: 'Rahasia', value: 'rahasia' },
];

const sifatOptions = [
    { label: 'Biasa', value: 'Biasa' },
    { label: 'Urgent', value: 'Urgent' },
    { label: 'Konfidensial', value: 'Konfidensial' },
];

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "terkonfirmasi": return "success";
        case "sedang_diproses": return "warning";
        case "ditolak": return "error";
        default: return "neutral";
    }
}

function resetForm() {
    form.value = {
        nomor_agenda: "",
        nomor_surat: "",
        tanggal_surat: new Date().toISOString().split('T')[0],
        tanggal_diterima: new Date().toISOString().split('T')[0],
        asal_surat: "",
        perkara: "",
        klasifikasi_surat: undefined,
        sifat_surat: "Biasa",
        ditujukan_kepada: "",
        keterangan: "",
        teruskan_ke: [],
        arsipkan: false,
        file: null
    };
    isEditing.value = false;
    selectedSurat.value = null;
}

function openCreateModal() {
    resetForm();
    showCreateModal.value = true;
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
            suratMasuk.value = result.data.data || [];
            pagination.value.total = result.data.total || 0;
        }
    } catch (err) {
        console.error("[SuratMasuk] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

function viewDetail(surat: SuratMasuk) {
    selectedSurat.value = surat;
    showDetailModal.value = true;
}

function editSurat(surat: SuratMasuk) {
    selectedSurat.value = surat;
    isEditing.value = true;
    form.value = {
        nomor_agenda: surat.nomor_agenda,
        nomor_surat: surat.nomor_surat,
        tanggal_surat: surat.tanggal_surat.split("T")[0],
        tanggal_diterima: surat.tanggal_diterima.split("T")[0],
        asal_surat: surat.asal_surat,
        perkara: surat.perkara || "",
        klasifikasi_surat: surat.klasifikasi_surat as any,
        sifat_surat: surat.sifat_surat,
        ditujukan_kepada: surat.ditujukan_kepada,
        keterangan: surat.keterangan || "",
        teruskan_ke: [],
        arsipkan: surat.status === 'selesai',
        file: null
    };
    showCreateModal.value = true;
}

async function saveSurat() {
    if (!form.value.asal_surat || !form.value.nomor_surat) {
        return;
    }

    saving.value = true;
    try {
        const data = {
            ...form.value,
            tanggal_surat: new Date(form.value.tanggal_surat).toISOString(),
            tanggal_diterima: new Date(form.value.tanggal_diterima).toISOString(),
            status: form.value.arsipkan ? 'selesai' : 'sedang_diproses'
        };

        let result;
        if (isEditing.value && selectedSurat.value) {
            result = await update(selectedSurat.value.id, data);
        } else {
            result = await create(data as any);
        }

        if (result.success) {
            await showSuccess("Berhasil", `Surat masuk berhasil ${isEditing.value ? "diperbarui" : "disimpan"}`);
            showCreateModal.value = false;
            resetForm();
            fetchData();
        } else {
            await showConfirmation("Gagal", result.message, { showCancelButton: false });
        }
    } catch (err) {
        console.error("[SuratMasuk] Error saving:", err);
    } finally {
        saving.value = false;
    }
}

async function confirmDelete(surat: SuratMasuk) {
    const result = await showConfirmation(
        "Konfirmasi Hapus",
        `Apakah Anda yakin ingin menghapus surat ${surat.nomor_surat}? Data yang dihapus tidak dapat dikembalikan.`
    );

    if (result.isConfirmed) {
        const deleteResult = await remove(surat.id);
        if (deleteResult.success) {
            await showSuccess("Berhasil", "Surat masuk berhasil dihapus");
            fetchData();
        }
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

function toggleStaff(name: string) {
    const index = form.value.teruskan_ke.indexOf(name);
    if (index > -1) {
        form.value.teruskan_ke.splice(index, 1);
    } else {
        form.value.teruskan_ke.push(name);
    }
}

function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        form.value.file = file;
    }
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Surat Masuk | Tata Usaha" });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #aaa;
}
</style>
