<script setup lang="ts">
import { useArchiveApi } from "~/composables/api/use-archive";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";

definePageMeta({ layout: "admin" });

const toast = useToast();
const archiveApi = useArchiveApi();
const periodeApi = usePeriodePKLApi();

const loading = ref(true);
const data = ref<any[]>([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const selectedPeriode = ref<string | null>(null);
const periodeOptions = ref<{ label: string; value: string }[]>([]);

// Archive Modal State
const isArchiveModalOpen = ref(false);
const isArchiving = ref(false);
const selectedPeriodeToArchive = ref<string | { value?: string } | null>(null);

function normalizePeriodeId(input: unknown): string | null {
    if (typeof input === "string") return input;
    if (input && typeof input === "object" && typeof (input as any).value === "string") {
        return (input as any).value;
    }
    return null;
}

async function fetchData() {
    const rawPeriode: any = selectedPeriode.value as any;
    const normalizedPeriodeId =
        typeof rawPeriode === "string"
            ? rawPeriode
            : typeof rawPeriode?.value === "string"
              ? rawPeriode.value
              : null;

    if (!normalizedPeriodeId) {
        data.value = [];
        total.value = 0;
        loading.value = false;
        return;
    }

    if (selectedPeriode.value !== normalizedPeriodeId) {
        selectedPeriode.value = normalizedPeriodeId;
    }

    loading.value = true;
    try {
        const response = await archiveApi.getArchivedPlacements({
            page: page.value,
            limit: limit.value,
            id_periode_pkl: normalizedPeriodeId,
        });
        if (response.success && response.data) {
            // Handle nested data structure if present
            const archiveData = response.data.data || response.data;
            data.value = Array.isArray(archiveData) ? archiveData : [];
            total.value =
                response.data.meta?.total ||
                response.data.pagination?.total ||
                response.meta?.total ||
                response.pagination?.total ||
                0;
        }
    } catch (error) {
        toast.add({ title: "Gagal memuat data arsip", color: "error" });
    } finally {
        loading.value = false;
    }
}

async function fetchPeriodeOptions() {
    try {
        const response = await periodeApi.getAll({ limit: 100 });
        if (response.success && response.data) {
            const periodeData = response.data.data || response.data;
            periodeOptions.value = (Array.isArray(periodeData) ? periodeData : []).map((item: any) => ({
                label: item.nama_periode,
                value: item.id_periode_pkl,
            }));

            const selectedExists = periodeOptions.value.some(
                (item) => item.value === selectedPeriode.value,
            );

            if (!selectedExists) {
                selectedPeriode.value = null;
            }

            if (!selectedPeriode.value && periodeOptions.value.length > 0) {
                selectedPeriode.value = periodeOptions.value[0].value;
            }
        }
    } catch (error) {
        console.error("Gagal memuat periode", error);
    }
}

async function handleArchive() {
    const periodeId = normalizePeriodeId(selectedPeriodeToArchive.value);
    if (!periodeId) return;

    isArchiving.value = true;
    try {
        const response = await archiveApi.archivePeriode(periodeId);
        if (response.success) {
            toast.add({ 
                title: "Berhasil!", 
                description: "Data periode PKL berhasil diarsipkan.", 
                color: "success" 
            });
            isArchiveModalOpen.value = false;
            selectedPeriodeToArchive.value = null;
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
    fetchPeriodeOptions();
});

watch([page, limit, selectedPeriode], () => fetchData());

watch(selectedPeriode, () => {
    page.value = 1;
});

useHead({ title: "Arsip Penempatan | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Arsip Penempatan
                </h1>
                <p class="text-sm text-slate-500">Daftar penempatan siswa arsip berdasarkan periode PKL.</p>
            </div>
            <UButton 
                icon="lucide:archive" 
                color="primary" 
                @click="isArchiveModalOpen = true"
            >
                Arsipkan Periode PKL
            </UButton>
        </div>

        <UCard>
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="w-full sm:max-w-md">
                    <UFormField label="Filter Periode PKL" required>
                        <USelectMenu
                            v-model="selectedPeriode"
                            :items="periodeOptions"
                            value-attribute="value"
                            option-attribute="label"
                            placeholder="Pilih Periode PKL"
                        />
                    </UFormField>
                </div>
            </div>
        </UCard>

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
                        <tr v-if="!selectedPeriode">
                            <td colspan="7" class="px-4 py-12 text-center text-slate-500">
                                <div class="flex flex-col items-center">
                                    <Icon name="lucide:calendar-range" class="w-10 h-10 text-slate-200 mb-2" />
                                    <p>Pilih periode PKL terlebih dahulu.</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="data.length === 0 && !loading">
                            <td colspan="7" class="px-4 py-12 text-center text-slate-500">
                                <div class="flex flex-col items-center">
                                    <Icon name="lucide:archive" class="w-10 h-10 text-slate-200 mb-2" />
                                    <p>Tidak ada data arsip untuk periode ini.</p>
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
                    <h3 class="text-lg font-bold text-slate-900 mb-2">Arsipkan Periode PKL</h3>
                    <p class="text-slate-500 text-sm mb-4">
                        Membuat snapshot data penempatan ke tabel arsip dan menyembunyikan data operasional.
                        Data sumber tetap tersimpan (soft archive) untuk keamanan dan audit.
                    </p>
                    
                    <div class="space-y-4">
                        <UFormField label="Pilih Periode PKL" required>
                            <USelectMenu 
                                v-model="selectedPeriodeToArchive" 
                                :items="periodeOptions" 
                                value-attribute="value"
                                option-attribute="label"
                                placeholder="Pilih Periode PKL"
                            />
                        </UFormField>

                        <UAlert 
                            icon="lucide:alert-triangle"
                            color="warning" 
                            variant="subtle"
                            title="Peringatan"
                            description="Tindakan ini akan menonaktifkan data operasional terkait dari daftar aktif."
                        />
                    </div>

                    <div class="flex items-center justify-end gap-3 mt-6">
                        <UButton color="neutral" variant="ghost" @click="isArchiveModalOpen = false" :disabled="isArchiving">
                            Batal
                        </UButton>
                        <UButton color="primary" @click="handleArchive" :loading="isArchiving" :disabled="!normalizePeriodeId(selectedPeriodeToArchive)">
                            Proses Arsip
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
