<script setup lang="ts">
import { usePenempatanApi } from "~/composables/api/use-internship";
import { useTahunAjaranApi, type TahunAjaran } from "~/composables/api/use-academic";

definePageMeta({ layout: "admin" });

const toast = useToast();
const penempatanApi = usePenempatanApi();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(false);
const tahunAjaranLoading = ref(true);
const academicYears = ref<TahunAjaran[]>([]);
const selectedYear = ref<string>("");

const result = ref<{
    summary: {
        total_unplaced_students: number;
        total_matched: number;
        total_remaining: number;
    };
    drafts: any[];
} | null>(null);

async function fetchAcademicYears() {
    tahunAjaranLoading.value = true;
    try {
        const response = await tahunAjaranApi.getAll({ limit: 100 });
        if (response.success && response.data) {
            // Handle nested data structure from safeFetch
            const yearsData = response.data.data || response.data;
            academicYears.value = Array.isArray(yearsData) ? yearsData : [];
            // Select active year by default
            const activeYear = academicYears.value.find((y: TahunAjaran) => y.status_aktif);
            if (activeYear) selectedYear.value = activeYear.id_tahun_ajaran;
        }
    } catch (error) {
        toast.add({ title: "Gagal memuat tahun ajaran", color: "error" });
    } finally {
        tahunAjaranLoading.value = false;
    }
}

async function generateDraft() {
    if (!selectedYear.value) {
        toast.add({ title: "Pilih tahun ajaran terlebih dahulu", color: "warning" });
        return;
    }

    loading.value = true;
    try {
        const response = await penempatanApi.getSmartDraft(selectedYear.value);
        if (response.success && response.data) {
            // Handle nested data structure if present
            const draftData = response.data.data || response.data;
            result.value = draftData;
            toast.add({ title: "Draft berhasil di-generate", color: "success" });
        }
    } catch (error: any) {
        toast.add({ title: error.message || "Gagal meng-generate draft", color: "error" });
    } finally {
        loading.value = false;
    }
}

onMounted(() => fetchAcademicYears());

useHead({ title: "Smart Placement Draft | Admin" });
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Smart Placement Draft
                </h1>
                <p class="text-sm text-slate-500">
                    Generate otomatis draf penempatan berdasarkan jurusan dan kuota.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <USelectMenu
                    v-model="selectedYear"
                    :options="academicYears"
                    value-attribute="id_tahun_ajaran"
                    option-attribute="nama_tahun_ajaran"
                    placeholder="Pilih Tahun Ajaran"
                    class="w-48"
                />
                <UButton
                    color="primary"
                    :loading="loading"
                    @click="generateDraft"
                >
                    <Icon name="lucide:wand-2" class="w-4 h-4 mr-2" />
                    Generate Draft
                </UButton>
            </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="result" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard class="bg-blue-50 border-blue-100">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-100 rounded-lg">
                        <Icon name="lucide:users" class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p class="text-xs text-blue-600 font-medium uppercase">Total Siswa Unplaced</p>
                        <p class="text-2xl font-bold text-blue-900">{{ result.summary.total_unplaced_students }}</p>
                    </div>
                </div>
            </UCard>
            <UCard class="bg-green-50 border-green-100">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-green-100 rounded-lg">
                        <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p class="text-xs text-green-600 font-medium uppercase">Siswa Terpilih (Matched)</p>
                        <p class="text-2xl font-bold text-green-900">{{ result.summary.total_matched }}</p>
                    </div>
                </div>
            </UCard>
            <UCard class="bg-amber-50 border-amber-100">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-amber-100 rounded-lg">
                        <Icon name="lucide:help-circle" class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p class="text-xs text-amber-600 font-medium uppercase">Belum Mendapat Tempat</p>
                        <p class="text-2xl font-bold text-amber-900">{{ result.summary.total_remaining }}</p>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Draft Table -->
        <UCard v-if="result" class="overflow-hidden">
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold text-slate-900">Hasil Rekomendasi</h3>
                    <UBadge color="neutral" variant="subtle">Hanya Draft - Tidak tersimpan di database</UBadge>
                </div>
            </template>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th class="px-4 py-3">Siswa</th>
                            <th class="px-4 py-3">Jurusan</th>
                            <th class="px-4 py-3">Rekomendasi Perusahaan</th>
                            <th class="px-4 py-3">Bidang Usaha</th>
                            <th class="px-4 py-3">Kecocokan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <tr v-for="draft in result.drafts" :key="draft.siswa_id" class="hover:bg-slate-50">
                            <td class="px-4 py-3">
                                <p class="font-medium text-slate-900">{{ draft.nama_siswa }}</p>
                                <p class="text-xs text-slate-500">{{ draft.nis }}</p>
                            </td>
                            <td class="px-4 py-3">{{ draft.jurusan }}</td>
                            <td class="px-4 py-3 text-slate-900 font-medium">{{ draft.nama_perusahaan }}</td>
                            <td class="px-4 py-3 text-slate-500">{{ draft.bidang_usaha || '-' }}</td>
                            <td class="px-4 py-3">
                                <UBadge 
                                    :color="draft.match_score === 1 ? 'success' : 'info'" 
                                    variant="subtle"
                                    size="xs"
                                >
                                    {{ draft.match_score === 1 ? 'Sesuai Jurusan' : 'Umum' }}
                                </UBadge>
                            </td>
                        </tr>
                        <tr v-if="result.drafts.length === 0">
                            <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                                Tidak ada siswa yang dapat dicocokkan.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </UCard>

        <!-- Empty State -->
        <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div class="p-4 bg-slate-50 rounded-full mb-4">
                <Icon name="lucide:wand-2" class="w-10 h-10 text-slate-300" />
            </div>
            <h3 class="text-lg font-medium text-slate-900">Siap untuk Generate?</h3>
            <p class="text-slate-500 max-w-sm text-center mt-2">
                Pilih tahun ajaran dan klik tombol "Generate Draft" untuk melihat rekomendasi penempatan siswa secara otomatis.
            </p>
        </div>

        <!-- Loading State -->
        <div v-else class="flex flex-col items-center justify-center py-20">
            <Icon name="lucide:loader-2" class="w-10 h-10 text-sky-500 animate-spin mb-4" />
            <p class="text-slate-600 font-medium">Menganalisis data dan mencocokkan siswa...</p>
        </div>
    </div>
</template>
