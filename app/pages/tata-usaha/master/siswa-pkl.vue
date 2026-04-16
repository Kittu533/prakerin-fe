<template>
    <div class="space-y-4">
        <!-- Mass Management Section -->
        <MassManagementCard
            ref="massCard"
            entity-name="Siswa PKL"
            :loading="uploading"
            @upload="handleUpload"
            @download-template="downloadTemplate"
            @export-filtered="() => {}"
            @export-all="() => {}"
        />

        <!-- Filters Section -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div class="md:col-span-5 space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700">Cari Data</label>
                    <UInput
                        v-model="filters.search"
                        placeholder="Nama, NIS, atau Perusahaan..."
                        icon="i-heroicons-magnifying-glass"
                        size="lg"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500'
                        }"
                    />
                </div>
                <div class="md:col-span-4 space-y-1.5">
                    <label class="text-sm font-semibold text-slate-700">Filter Kelas</label>
                    <USelectMenu
                        v-model="filters.kelas"
                        :options="kelasOptions"
                        size="lg"
                        placeholder="Pilih Kelas"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500'
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
                        <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                        Refresh Data
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div v-if="loading" class="p-4 space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <UTable
                v-else
                :data="siswaList"
                :columns="columns"
                :ui="{
                    th: { base: 'bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider py-4' },
                    td: { base: 'py-4 align-middle' }
                }"
            >
                <!-- No Column -->
                <template #index-cell="{ row }">
                    <span class="text-sm text-slate-500 px-2">{{ ((pagination.page - 1) * pagination.limit) + row.index + 1 }}</span>
                </template>

                <!-- Identitas Siswa Column -->
                <template #identitas-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-bold text-slate-900">{{ row.original.nama_siswa }}</p>
                        <div class="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span>NIS. {{ row.original.nis }}</span>
                            <span v-if="row.original.nisn" class="text-slate-300">|</span>
                            <span v-if="row.original.nisn">NISN. {{ row.original.nisn }}</span>
                        </div>
                    </div>
                </template>

                <!-- Kelas & Program Column -->
                <template #kelas_program-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-semibold text-slate-800 text-sm">{{ row.original.kelas?.nama_kelas || '-' }}</p>
                        <p class="text-[10px] text-slate-500 uppercase">{{ row.original.kelas?.jurusan?.nama_jurusan || '-' }}</p>
                    </div>
                </template>

                <!-- TTL & Gender Column -->
                <template #ttl_gender-cell="{ row }">
                    <div class="space-y-0.5 text-xs">
                        <p class="text-slate-700 capitalize">
                            {{ row.original.tempat_lahir || '-' }}, 
                            {{ row.original.tanggal_lahir ? formatDate(row.original.tanggal_lahir) : '-' }}
                        </p>
                        <p class="text-[10px] font-bold" :class="row.original.jenis_kelamin === 'L' ? 'text-blue-600' : 'text-pink-600'">
                            {{ row.original.jenis_kelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }}
                        </p>
                    </div>
                </template>

                <!-- Status PKL Column (Added for PKL page) -->
                <template #status_pkl-cell="{ row }">
                    <div v-if="row.original.penempatan?.[0]" class="space-y-1">
                        <p class="text-[10px] font-bold text-slate-900 truncate max-w-[150px]">
                            {{ row.original.penempatan[0].perusahaan.nama_perusahaan }}
                        </p>
                        <UBadge variant="subtle" color="success" size="xs">Aktif</UBadge>
                    </div>
                    <span v-else class="text-xs text-slate-400 italic">Belum PKL</span>
                </template>

                <!-- Kontak Column -->
                <template #kontak-cell="{ row }">
                    <div v-if="row.original.no_hp" class="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <Icon name="i-heroicons-chat-bubble-left-right" class="w-3.5 h-3.5" />
                        {{ row.original.no_hp }}
                    </div>
                    <span v-else class="text-xs text-slate-400">-</span>
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
                            <Icon name="i-heroicons-eye" class="w-4 h-4" />
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                <p class="text-xs text-slate-500 font-medium">
                    Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
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
                        :disabled="pagination.page * pagination.limit >= pagination.total"
                        class="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        @click="changePage(pagination.page + 1)"
                    >
                        Next
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal v-model:open="showDetailModal" title="Detail Penempatan PKL" size="lg">
            <div v-if="selectedSiswa" class="p-6 space-y-6">
                <!-- Siswa Info -->
                <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div class="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Icon name="i-heroicons-user" class="w-8 h-8" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">{{ selectedSiswa.nama_siswa }}</h3>
                        <p class="text-sm text-slate-500">NIS. {{ selectedSiswa.nis }} | {{ selectedSiswa.kelas?.nama_kelas }}</p>
                    </div>
                </div>

                <!-- PKL Details -->
                <div v-if="selectedSiswa.penempatan?.[0]" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</p>
                            <p class="text-sm font-semibold text-slate-900">{{ selectedSiswa.penempatan[0].perusahaan.nama_perusahaan }}</p>
                            <p class="text-xs text-slate-500">{{ selectedSiswa.penempatan[0].perusahaan.alamat || '-' }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guru Pembimbing</p>
                            <p class="text-sm font-semibold text-slate-900">{{ selectedSiswa.penempatan[0].guru.nama_guru }}</p>
                            <p class="text-xs text-slate-500">NIP. {{ selectedSiswa.penempatan[0].guru.nip }}</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Periode PKL</p>
                            <p class="text-sm font-semibold text-slate-900">
                                {{ formatDate(selectedSiswa.penempatan[0].tanggal_mulai) }} - {{ formatDate(selectedSiswa.penempatan[0].tanggal_selesai) }}
                            </p>
                            <p class="text-xs text-slate-500">Tahun Ajaran {{ selectedSiswa.penempatan[0].tahun_ajaran?.nama_tahun_ajaran }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                            <UBadge variant="subtle" color="success" size="xs">Aktif Melaksanakan</UBadge>
                        </div>
                    </div>
                </div>
                <div v-else class="py-10 text-center">
                    <Icon name="i-heroicons-information-circle" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p class="text-slate-500 text-sm">Siswa ini belum memiliki data penempatan PKL aktif.</p>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end">
                    <UButton variant="neutral" @click="showDetailModal = false">Tutup</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useSiswaApi } from "~/composables/api/use-academic";
import MassManagementCard from "~/components/master/MassManagementCard.vue";

definePageMeta({ layout: "tata-usaha" });

const { getPklStudents, importExcel, downloadTemplate } = useSiswaApi();
const toast = useToast();

const massCard = ref<InstanceType<typeof MassManagementCard> | null>(null);
const loading = ref(false);
const uploading = ref(false);
const showDetailModal = ref(false);
const selectedSiswa = ref<any | null>(null);

const siswaList = ref<any[]>([]);
const pagination = ref({ page: 1, limit: 20, total: 0 });

const filters = ref({
    search: "",
    kelas: null
});

const kelasOptions = ref([]);

const columns = [
    { accessorKey: "index", header: "NO" },
    { accessorKey: "identitas", header: "IDENTITAS SISWA" },
    { accessorKey: "kelas_program", header: "KELAS & PROGRAM" },
    { accessorKey: "ttl_gender", header: "TTL & GENDER" },
    { accessorKey: "status_pkl", header: "STATUS PKL" },
    { accessorKey: "kontak", header: "KONTAK (WA)" },
    { accessorKey: "actions", header: "AKSI" },
];

async function fetchData() {
    loading.value = true;
    try {
        const result = await getPklStudents({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined,
        });

        if (result.success && result.data) {
            siswaList.value = result.data.data || [];
            pagination.value.total = result.data.meta?.total || 0;
        }
    } catch (err) {
        console.error("[SiswaPKL] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

async function handleUpload(file: File, mode: 'append' | 'replace') {
    uploading.value = true;
    try {
        const result = await importExcel(file, mode);
        
        if (result.success) {
            toast.add({
                title: "Berhasil",
                description: result.message || "Data siswa berhasil diunggah",
                color: "success"
            });
            massCard.value?.reset();
            fetchData();
        } else {
            toast.add({
                title: "Gagal",
                description: result.message || "Gagal mengunggah data siswa",
                color: "error"
            });
        }
    } catch (err: any) {
        console.error("[SiswaPKL] Error uploading:", err);
        toast.add({
            title: "Error",
            description: err.message || "Terjadi kesalahan sistem saat mengunggah",
            color: "error"
        });
    } finally {
        uploading.value = false;
    }
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function viewDetail(siswa: any) {
    selectedSiswa.value = siswa;
    showDetailModal.value = true;
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Monitoring Siswa PKL | Tata Usaha" });
</script>
