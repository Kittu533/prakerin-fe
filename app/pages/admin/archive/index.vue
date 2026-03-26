<script setup lang="ts">
import { useArchiveApi } from "~/composables/api/use-archive";
import { useTahunAjaranApi } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const toast = useToast();
const archiveApi = useArchiveApi();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(true);
const data = ref<any[]>([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);

// Archive Modal State
const isArchiveModalOpen = ref(false);
const isArchiving = ref(false);
const selectedTahunAjaran = ref("");
const tahunAjaranOptions = ref<{ label: string; value: string }[]>([]);

async function fetchData() {
    loading.value = true;
    try {
        const response = await archiveApi.getArchivedPlacements({
            page: page.value,
            limit: limit.value
        });
        if (response.success && response.data) {
            // Handle nested data structure if present
            const archiveData = response.data.data || response.data;
            data.value = Array.isArray(archiveData) ? archiveData : [];
            total.value = response.data.pagination?.total || response.pagination?.total || 0;
        }
    } catch (error) {
        toast.add({ title: "Gagal memuat data arsip", color: "error" });
    } finally {
        loading.value = false;
    }
}

async function fetchTahunAjaran() {
    try {
        const response = await tahunAjaranApi.getAll({ limit: 100 });
        if (response.success && response.data) {
            // Handle nested data structure from safeFetch
            const yearsData = response.data.data || response.data;
            tahunAjaranOptions.value = (Array.isArray(yearsData) ? yearsData : []).map((item: any) => ({
                label: item.nama_tahun_ajaran,
                value: item.id_tahun_ajaran
            }));
        }
    } catch (error) {
        console.error("Gagal memuat tahun ajaran", error);
    }
}

async function handleArchive() {
    if (!selectedTahunAjaran.value) return;

    isArchiving.value = true;
    try {
        const response = await archiveApi.archiveYear(selectedTahunAjaran.value);
        if (response.success) {
            toast.add({ 
                title: "Berhasil!", 
                description: "Data tahun ajaran berhasil diarsipkan.", 
                color: "success" 
            });
            isArchiveModalOpen.value = false;
            fetchData();
        } else {
            toast.add({ 
                title: "Gagal", 
                description: response.message || "Gagal mengarsipkan data.", 
                color: "error" 
            });
        }
    } catch (error: any) {
        toast.add({ 
            title: "Error", 
            description: error.data?.message || "Terjadi kesalahan server.", 
            color: "error" 
        });
    } finally {
        isArchiving.value = false;
    }
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

onMounted(() => {
    fetchData();
    fetchTahunAjaran();
});

watch([page, limit], () => fetchData());

useHead({ title: "Arsip Penempatan | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Arsip Penempatan
                </h1>
                <p class="text-sm text-slate-500">Daftar penempatan siswa yang telah diarsipkan (Cold Storage).</p>
            </div>
            <UButton 
                icon="lucide:archive" 
                color="primary" 
                @click="isArchiveModalOpen = true"
            >
                Arsipkan Tahun Ajaran
            </UButton>
        </div>

        <UCard class="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th class="px-4 py-3">Siswa</th>
                            <th class="px-4 py-3">Perusahaan</th>
                            <th class="px-4 py-3">Guru Pembimbing</th>
                            <th class="px-4 py-3">Tahun Ajaran</th>
                            <th class="px-4 py-3">Periode</th>
                            <th class="px-4 py-3">Status Akhir</th>
                            <th class="px-4 py-3">Tgl Diarsipkan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <tr v-for="item in data" :key="item.id_archive_penempatan" class="hover:bg-slate-50">
                            <td class="px-4 py-3">
                                <p class="font-medium text-slate-900">{{ item.nama_siswa }}</p>
                                <p class="text-xs text-slate-500">{{ item.nis }}</p>
                            </td>
                            <td class="px-4 py-3 text-slate-700">{{ item.nama_perusahaan }}</td>
                            <td class="px-4 py-3 text-slate-700">{{ item.nama_guru }}</td>
                            <td class="px-4 py-3 text-slate-600">{{ item.nama_tahun_ajaran }}</td>
                            <td class="px-4 py-3 text-slate-600">
                                {{ formatDate(item.tanggal_mulai) }} - {{ formatDate(item.tanggal_selesai) }}
                            </td>
                            <td class="px-4 py-3">
                                <UBadge 
                                    :color="item.status_penempatan === 'selesai' ? 'success' : 'neutral'" 
                                    variant="subtle"
                                    size="xs"
                                    class="capitalize"
                                >
                                    {{ item.status_penempatan }}
                                </UBadge>
                            </td>
                            <td class="px-4 py-3 text-slate-500">{{ formatDate(item.archived_at) }}</td>
                        </tr>
                        <tr v-if="data.length === 0 && !loading">
                            <td colspan="7" class="px-4 py-12 text-center text-slate-500">
                                <div class="flex flex-col items-center">
                                    <Icon name="lucide:archive" class="w-10 h-10 text-slate-200 mb-2" />
                                    <p>Belum ada data yang diarsipkan.</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="loading">
                            <td colspan="7" class="px-4 py-12 text-center">
                                <Icon name="lucide:loader-2" class="w-6 h-6 text-sky-500 animate-spin" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination (Simple) -->
            <template v-if="total > limit" #footer>
                <div class="flex items-center justify-between">
                    <p class="text-xs text-slate-500">Menampilkan {{ data.length }} dari {{ total }} data</p>
                    <div class="flex gap-2">
                        <UButton 
                            variant="outline" 
                            size="xs" 
                            :disabled="page === 1" 
                            @click="page--"
                        >Sebelumnya</UButton>
                        <UButton 
                            variant="outline" 
                            size="xs" 
                            :disabled="page * limit >= total" 
                            @click="page++"
                        >Selanjutnya</UButton>
                    </div>
                </div>
            </template>
        </UCard>

        <!-- Archive Modal -->
        <UModal v-model:open="isArchiveModalOpen">
            <template #content>
                <div class="p-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-2">Arsipkan Tahun Ajaran</h3>
                    <p class="text-slate-500 text-sm mb-4">
                        Memindahkan data penempatan, absensi, dan penilaian ke tabel arsip. 
                        Data yang aslinya akan dihapus dari tabel operasional.
                    </p>
                    
                    <div class="space-y-4">
                        <UFormField label="Pilih Tahun Ajaran" required>
                            <USelectMenu 
                                v-model="selectedTahunAjaran" 
                                :items="tahunAjaranOptions" 
                                value-attribute="value"
                                option-attribute="label"
                                placeholder="Pilih Tahun Ajaran"
                            />
                        </UFormField>

                        <UAlert 
                            icon="lucide:alert-triangle"
                            color="warning" 
                            variant="subtle"
                            title="Peringatan"
                            description="Tindakan ini tidak dapat dibatalkan secara otomatis dari UI."
                        />
                    </div>

                    <div class="flex items-center justify-end gap-3 mt-6">
                        <UButton color="neutral" variant="ghost" @click="isArchiveModalOpen = false" :disabled="isArchiving">
                            Batal
                        </UButton>
                        <UButton color="primary" @click="handleArchive" :loading="isArchiving" :disabled="!selectedTahunAjaran">
                            Proses Arsip
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
