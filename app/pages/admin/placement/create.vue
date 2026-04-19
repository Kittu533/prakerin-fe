<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { usePenempatanApi } from "~/composables/api/use-internship";
import {
    useSiswaApi,
    useGuruApi,
    useKelasApi,
    useJurusanApi,
} from "~/composables/api/use-academic";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";

definePageMeta({ layout: "admin" });

const toast = useToast();
const router = useRouter();
const penempatanApi = usePenempatanApi();
const siswaApi = useSiswaApi();
const guruApi = useGuruApi();
const perusahaanApi = usePerusahaanApi();
const kelasApi = useKelasApi();
const jurusanApi = useJurusanApi();
const periodePKLApi = usePeriodePKLApi();

// State
const loading = ref(false);
const submitting = ref(false);
const fetchingSiswa = ref(false);

// Filters
const selectedJurusan = ref<string | undefined>();
const selectedKelas = ref<string | undefined>();
const searchSiswa = ref("");

// Type definitions
type OptionItem = { label: string; value: string };

// Options
const jurusanOptions = ref<OptionItem[]>([]);
const allKelasList = ref<any[]>([]);

const kelasOptions = computed<OptionItem[]>(() => {
    if (!selectedJurusan.value) {
        return allKelasList.value.map((k) => ({
            label: k.nama_kelas,
            value: k.id_kelas,
        }));
    }
    // Filter by jurusan
    return allKelasList.value
        .filter((k) => k.id_jurusan === selectedJurusan.value)
        .map((k) => ({
            label: k.nama_kelas,
            value: k.id_kelas,
        }));
});
const siswaList = ref<any[]>([]);
const perusahaanOptions = ref<OptionItem[]>([]);
const guruOptions = ref<OptionItem[]>([]);
const periodePKLOptions = ref<OptionItem[]>([]);
const activePeriode = ref<any>(null);

// Existing penempatan (for validation)
const existingPenempatan = ref<Set<string>>(new Set());

// Form data
const formData = ref<Record<string, any>>({
    siswa_id: undefined as string | undefined,
    perusahaan_id: undefined as string | undefined,
    guru_pembimbing_id: undefined as string | undefined,
    id_periode_pkl: undefined as string | undefined,
    tahun_ajaran_id: "01900000-0000-0000-0000-000000000001", // Default UUID for 2024/2025
    tanggal_mulai: "",
    tanggal_selesai: "",
});

// Computed: Filtered siswa (only without penempatan in selected periode)
const availableSiswa = computed(() => {
    let filtered = siswaList.value;

    // Filter by kelas 12 only (FITUR 2: Validasi Kelas 12)
    filtered = filtered.filter((s) => {
        const kelasName = s.kelas?.nama_kelas || "";
        return (
            kelasName.includes("12") ||
            kelasName.includes("XII") ||
            kelasName.includes("xii")
        );
    });

    // Filter by kelas
    if (selectedKelas.value) {
        filtered = filtered.filter(
            (s) => s.kelas?.id_kelas === selectedKelas.value,
        );
    }

    // Filter by search
    if (searchSiswa.value) {
        const search = searchSiswa.value.toLowerCase();
        filtered = filtered.filter((s) =>
            s.nama_siswa?.toLowerCase().includes(search),
        );
    }

    // Filter out students with existing penempaton in the selected periode
    return filtered.filter((s) => !existingPenempatan.value.has(s.id_siswa));
});

// Computed: Selected siswa info
const selectedSiswaInfo = computed(() => {
    if (!formData.value.siswa_id) return null;
    return siswaList.value.find((s) => s.id_siswa === formData.value.siswa_id);
});

// Computed: Has existing penempaton
const hasExistingPenempatan = computed(() => {
    return (
        formData.value.siswa_id &&
        existingPenempatan.value.has(formData.value.siswa_id)
    );
});

// Fetch initial data
const fetchInitialData = async () => {
    loading.value = true;
    try {
        const [
            jurusanRes,
            kelasRes,
            perusahaanRes,
            guruRes,
            penempatanRes,
            periodeRes,
        ] = await Promise.all([
            jurusanApi.getAll({ limit: 100 }),
            kelasApi.getAll({ limit: 100 }),
            perusahaanApi.getAll({ limit: 100, mou_aktif: true }),
            guruApi.getAll({ limit: 100 }),
            penempatanApi.getAll({ limit: 1000 }),
            periodePKLApi.getAll({ limit: 100 }),
        ]);

        if (jurusanRes.success) {
            jurusanOptions.value = (jurusanRes.data || []).map((j) => ({
                label: j.nama_jurusan || j.nama_jurusan,
                value: j.id_jurusan,
            }));
        }

        if (kelasRes.success) {
            allKelasList.value = kelasRes.data || [];
        }

        if (perusahaanRes.success) {
            perusahaanOptions.value = (perusahaanRes.data || []).map((p) => ({
                label: p.nama_perusahaan,
                value: p.id_perusahaan,
            }));
        }

        if (guruRes.success) {
            guruOptions.value = (guruRes.data || []).map((g) => ({
                label: g.nama_guru,
                value: g.id_guru,
            }));
        }

        // Periode PKL options (FITUR 5: Auto-Population)
        if (periodeRes.success) {
            const activePeriodes = (periodeRes.data || []).filter(
                (p) => p.status === "aktif" || p.status === "draft",
            );
            periodePKLOptions.value = activePeriodes.map((p) => ({
                label: `${p.nama_periode} (${p.tahun_ajaran?.nama_tahun_ajaran || "-"})`,
                value: p.id_periode_pkl,
            }));

            // Auto-select active periode
            const active = activePeriodes.find((p) => p.status === "aktif");
            if (active) {
                activePeriode.value = active;
                formData.value.id_periode_pkl = active.id_periode_pkl;
                formData.value.tahun_ajaran_id = active.id_tahun_ajaran;
                // Auto-fill dates from periode
                formData.value.tanggal_mulai =
                    active.tanggal_mulai.split("T")[0];
                formData.value.tanggal_selesai =
                    active.tanggal_selesai.split("T")[0];
            }
        }

        // Store existing penempatan
        if (penempatanRes.success) {
            const activePenempatan = (penempatanRes.data || []).filter(
                (p) => p.status_penempatan === "aktif",
            );
            existingPenempatan.value = new Set(
                activePenempatan.map((p) => p.siswa_id),
            );
        }
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.add({
            title: "Gagal memuat data",
            color: "error",
        });
    } finally {
        loading.value = false;
    }
};

// Fetch siswa by kelas
const fetchSiswaByKelas = async () => {
    if (!selectedKelas.value) {
        siswaList.value = [];
        return;
    }

    fetchingSiswa.value = true;
    try {
        const response = await siswaApi.getAll({
            kelas_id: selectedKelas.value,
            limit: 100,
        });

        if (response.success) {
            siswaList.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch siswa:", error);
    } finally {
        fetchingSiswa.value = false;
    }
};

// Handle periode change (FITUR 5: Auto-Population)
const handlePeriodeChange = () => {
    const selectedPeriode = periodePKLOptions.value.find(
        (p) => p.value === formData.value.id_periode_pkl,
    );
    if (selectedPeriode) {
        // Find the full periode object
        const periode = activePeriode.value;
        if (
            periode &&
            periode.id_periode_pkl === formData.value.id_periode_pkl
        ) {
            formData.value.tahun_ajaran_id = periode.id_tahun_ajaran;
            formData.value.tanggal_mulai = periode.tanggal_mulai.split("T")[0];
            formData.value.tanggal_selesai =
                periode.tanggal_selesai.split("T")[0];
        }
    }
};

// Format date helper
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// Calculate duration in months
const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
};

// Get active periode duration
const activePeriodeDuration = computed(() => {
    if (!activePeriode.value) return 6;
    if (activePeriode.value.durasi_bulan)
        return activePeriode.value.durasi_bulan;
    if (activePeriode.value.stats?.durasi_bulan)
        return activePeriode.value.stats.durasi_bulan;
    return calculateDuration(
        activePeriode.value.tanggal_mulai,
        activePeriode.value.tanggal_selesai,
    );
});

// Watch kelas selection
watch(selectedKelas, () => {
    formData.value.siswa_id = undefined;
    fetchSiswaByKelas();
});

// Watch jurusan selection - filter kelas
watch(selectedJurusan, () => {
    selectedKelas.value = undefined;
    formData.value.siswa_id = undefined;
});

// Get siswa status badge
const getSiswaStatus = (siswa: any) => {
    if (existingPenempatan.value.has(siswa.id_siswa)) {
        return {
            label: "Sudah Ditempatkan",
            color: "error",
            icon: "lucide:x-circle",
        };
    }
    return {
        label: "Tersedia",
        color: "success",
        icon: "lucide:check-circle",
    };
};

// Handle form submission
const handleSubmit = async () => {
    // Validate periode PKL
    if (!formData.value.id_periode_pkl) {
        toast.add({
            title: "Pilih periode PKL terlebih dahulu",
            color: "error",
        });
        return;
    }

    // Validate
    if (!formData.value.siswa_id) {
        toast.add({ title: "Pilih siswa terlebih dahulu", color: "error" });
        return;
    }

    if (hasExistingPenempatan.value) {
        toast.add({
            title: "Siswa sudah memiliki penempatan aktif",
            description:
                "Pilih siswa lain atau ubah status penempatan yang sudah ada",
            color: "error",
        });
        return;
    }

    if (!formData.value.perusahaan_id || !formData.value.guru_pembimbing_id) {
        toast.add({ title: "Lengkapi semua field wajib", color: "error" });
        return;
    }

    if (!formData.value.tanggal_mulai || !formData.value.tanggal_selesai) {
        toast.add({ title: "Tanggal harus diisi", color: "error" });
        return;
    }

    // Validate dates
    const startDate = new Date(formData.value.tanggal_mulai);
    const endDate = new Date(formData.value.tanggal_selesai);

    if (endDate <= startDate) {
        toast.add({
            title: "Tanggal selesai harus lebih besar dari tanggal mulai",
            color: "error",
        });
        return;
    }

    // Check minimum 6 months
    const minEndDate = new Date(startDate);
    minEndDate.setMonth(minEndDate.getMonth() + 6);
    if (endDate < minEndDate) {
        toast.add({ title: "PKL minimal 6 bulan", color: "error" });
        return;
    }

    submitting.value = true;
    try {
        const response = await penempatanApi.create({
            siswa_id: formData.value.siswa_id,
            perusahaan_id: formData.value.perusahaan_id,
            guru_pembimbing_id: formData.value.guru_pembimbing_id,
            id_periode_pkl: formData.value.id_periode_pkl,
            tahun_ajaran_id:
                formData.value.tahun_ajaran_id ||
                "01900000-0000-0000-0000-000000000001",
            tanggal_mulai: formData.value.tanggal_mulai,
            tanggal_selesai: formData.value.tanggal_selesai,
        });

        if (response.success) {
            toast.add({
                title: "Berhasil Menyimpan!",
                description: "Data penempatan telah disimpan.",
                color: "success",
                icon: "i-heroicons-check-circle"
            });
            router.push("/admin/placement");
        } else {
            toast.add({
                title: "Gagal Menyimpan!",
                description: response.message || "Terjadi kesalahan saat menyimpan data.",
                color: "error",
                icon: "i-heroicons-x-circle"
            });
        }
    } catch (error) {
        console.error("Error creating penempatan:", error);
        toast.add({
            title: "Gagal Menyimpan!",
            description: "Terjadi kesalahan jaringan atau server.",
            color: "error",
            icon: "i-heroicons-x-circle"
        });
    } finally {
        submitting.value = false;
    }
};

// Handle cancel
const handleCancel = () => {
    router.push("/admin/placement");
};

// Statistics
const stats = computed(() => {
    const totalSiswa = siswaList.value.length;
    const placedSiswa = siswaList.value.filter((s) =>
        existingPenempatan.value.has(s.id_siswa),
    ).length;
    const availableSiswaCount = totalSiswa - placedSiswa;

    return {
        total: totalSiswa,
        placed: placedSiswa,
        available: availableSiswaCount,
    };
});

onMounted(() => {
    fetchInitialData();
});

useHead({ title: "Tambah Penempatan | Admin" });
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <UButton variant="ghost" color="neutral" size="sm" icon="lucide:arrow-left" class="shrink-0"
                @click="handleCancel">
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Tambah Penempatan PKL
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Pilih siswa dan atur penempatan di industri
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Periode PKL Selection (FITUR 5: Auto-Population) -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 class="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                            0. Pilih Periode PKL
                        </h3>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Periode PKL Selector -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Periode PKL
                                <span class="text-red-500 ml-1">*</span>
                            </label>
                            <USelectMenu v-model="formData.id_periode_pkl" :items="periodePKLOptions" value-key="value"
                                placeholder="Pilih periode PKL" size="lg" class="w-full" @change="handlePeriodeChange">
                                <template #label>
                                    <span v-if="formData.id_periode_pkl">
                                        {{
                                            periodePKLOptions.find(
                                                (p) =>
                                                    p.value ===
                                                    formData.id_periode_pkl,
                                            )?.label
                                        }}
                                    </span>
                                    <span v-else class="text-slate-400">Pilih periode PKL</span>
                                </template>
                            </USelectMenu>
                            <p class="text-xs text-slate-500 mt-1">
                                Pilih periode PKL untuk menentukan tahun ajaran
                                dan tanggal otomatis.
                            </p>
                        </div>

                        <!-- Active Periode Info -->
                        <div v-if="
                            activePeriode &&
                            formData.id_periode_pkl ===
                            activePeriode.id_periode_pkl
                        " class="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 shrink-0" />
                            <div class="flex-1">
                                <p class="text-sm font-medium text-green-900">
                                    Periode Aktif:
                                    {{ activePeriode.nama_periode }}
                                </p>
                                <p class="text-xs text-green-700">
                                    {{
                                        formatDate(activePeriode.tanggal_mulai)
                                    }}
                                    -
                                    {{
                                        formatDate(
                                            activePeriode.tanggal_selesai,
                                        )
                                    }}
                                    •
                                    {{ activePeriodeDuration }} bulan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Siswa Selection -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 class="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                            1. Pilih Siswa (Kelas 12)
                        </h3>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Filter: Jurusan -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Jurusan
                            </label>
                            <USelectMenu v-model="selectedJurusan" :items="jurusanOptions" value-key="value"
                                placeholder="Pilih jurusan" size="lg" class="w-full">
                                <template #label>
                                    <span v-if="selectedJurusan">
                                        {{
                                            jurusanOptions.find(
                                                (j) =>
                                                    j.value === selectedJurusan,
                                            )?.label
                                        }}
                                    </span>
                                    <span v-else class="text-slate-400">Pilih jurusan</span>
                                </template>
                            </USelectMenu>
                        </div>

                        <!-- Filter: Kelas -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Kelas
                            </label>
                            <USelectMenu v-model="selectedKelas" :items="kelasOptions" value-key="value"
                                placeholder="Pilih kelas" :disabled="!selectedJurusan" size="lg" class="w-full">
                                <template #label>
                                    <span v-if="selectedKelas">
                                        {{
                                            kelasOptions.find(
                                                (k) =>
                                                    k.value === selectedKelas,
                                            )?.label
                                        }}
                                    </span>
                                    <span v-else class="text-slate-400">
                                        {{
                                            selectedJurusan
                                                ? "Pilih kelas"
                                                : "Pilih jurusan terlebih dahulu"
                                        }}
                                    </span>
                                </template>
                            </USelectMenu>
                        </div>

                        <!-- Statistics -->
                        <div v-if="selectedKelas && !fetchingSiswa"
                            class="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div class="text-center">
                                <p class="text-lg font-bold text-slate-900">
                                    {{ stats.total }}
                                </p>
                                <p class="text-xs text-slate-500">
                                    Total Siswa
                                </p>
                            </div>
                            <div class="text-center">
                                <p class="text-lg font-bold text-green-600">
                                    {{ stats.available }}
                                </p>
                                <p class="text-xs text-slate-500">Tersedia</p>
                            </div>
                            <div class="text-center">
                                <p class="text-lg font-bold text-amber-600">
                                    {{ stats.placed }}
                                </p>
                                <p class="text-xs text-slate-500">
                                    Ditempatkan
                                </p>
                            </div>
                        </div>

                        <!-- Loading siswa -->
                        <div v-if="fetchingSiswa" class="flex justify-center py-8">
                            <UIcon name="lucide:loader-2" class="w-8 h-8 animate-spin text-slate-400" />
                        </div>

                        <!-- Search & Select Siswa -->
                        <div v-if="selectedKelas && !fetchingSiswa">
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Cari Siswa
                                <span v-if="stats.available > 0" class="text-green-600 ml-1">
                                    ({{ stats.available }} tersedia)
                                </span>
                            </label>
                            <UInput v-model="searchSiswa" placeholder="Cari nama siswa..." icon="lucide:search"
                                size="lg" class="w-full mb-3" />

                            <!-- Siswa List -->
                            <div
                                class="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                                <div v-if="availableSiswa.length === 0" class="p-4 text-center text-slate-500">
                                    <Icon name="lucide:users" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p>
                                        {{
                                            searchSiswa
                                                ? "Tidak ditemukan"
                                                : "Tidak ada siswa tersedia"
                                        }}
                                    </p>
                                </div>

                                <div v-for="siswa in availableSiswa" :key="siswa.id_siswa"
                                    class="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                    :class="{
                                        'bg-sky-50 ring-1 ring-sky-200':
                                            formData.siswa_id ===
                                            siswa.id_siswa,
                                    }" @click="formData.siswa_id = siswa.id_siswa">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm font-semibold shrink-0">
                                        {{
                                            siswa.nama_siswa
                                                ?.split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                        }}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-slate-900">
                                            {{ siswa.nama_siswa }}
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            NIS: {{ siswa.nis || "-" }}
                                        </p>
                                    </div>
                                    <div class="shrink-0">
                                        <Icon :name="formData.siswa_id ===
                                                siswa.id_siswa
                                                ? 'lucide:check-circle-2'
                                                : 'lucide:circle'
                                            " :class="formData.siswa_id ===
                                                    siswa.id_siswa
                                                    ? 'text-sky-600'
                                                    : 'text-slate-300'
                                                " class="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Selected Siswa Info -->
                        <div v-if="selectedSiswaInfo"
                            class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600 shrink-0" />
                            <div class="flex-1">
                                <p class="text-sm font-medium text-green-900">
                                    Siswa Terpilih:
                                    {{ selectedSiswaInfo.nama_siswa }}
                                </p>
                                <p class="text-xs text-green-700">
                                    {{ selectedSiswaInfo.kelas?.nama_kelas }} •
                                    NIS: {{ selectedSiswaInfo.nis }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Placement Details -->
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 class="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                            2. Detail Penempatan
                        </h3>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Perusahaan -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Perusahaan
                                <span class="text-red-500 ml-1">*</span>
                            </label>
                            <USelectMenu v-model="formData.perusahaan_id" :items="perusahaanOptions" value-key="value"
                                placeholder="Pilih perusahaan" size="lg" class="w-full" />
                        </div>

                        <!-- Guru Pembimbing -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">
                                Guru Pembimbing
                                <span class="text-red-500 ml-1">*</span>
                            </label>
                            <USelectMenu v-model="formData.guru_pembimbing_id" :items="guruOptions" value-key="value"
                                placeholder="Pilih guru pembimbing" size="lg" class="w-full" />
                        </div>

                        <!-- Dates -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">
                                    Tanggal Mulai
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <UInput v-model="formData.tanggal_mulai" type="date" size="lg" class="w-full" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">
                                    Tanggal Selesai
                                    <span class="text-red-500 ml-1">*</span>
                                </label>
                                <UInput v-model="formData.tanggal_selesai" type="date" size="lg" class="w-full" />
                            </div>
                        </div>

                        <!-- Duration Calculator -->
                        <div v-if="
                            formData.tanggal_mulai &&
                            formData.tanggal_selesai
                        " class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                            <div class="flex items-center gap-2 text-sm">
                                <Icon name="lucide:calendar" class="w-4 h-4 text-sky-600" />
                                <span class="text-sky-900">
                                    Durasi:
                                    <span class="font-semibold">
                                        {{
                                            Math.round(
                                                (new Date(
                                                    formData.tanggal_selesai,
                                                ).getTime() -
                                                    new Date(
                                                        formData.tanggal_mulai,
                                                    ).getTime()) /
                                                (1000 * 60 * 60 * 24 * 30),
                                            )
                                        }}
                                        bulan
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Info & Summary -->
            <div class="lg:col-span-1 space-y-4">
                <!-- Info Card -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 sticky top-6">
                    <div class="flex gap-3">
                        <Icon name="lucide:info" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div class="text-sm text-blue-900">
                            <p class="font-semibold mb-2">Informasi Penting:</p>
                            <ul class="space-y-1.5">
                                <li class="flex items-start gap-2">
                                    <Icon name="lucide:check" class="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Pilih periode PKL untuk auto-fill
                                        tanggal dan tahun ajaran</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon name="lucide:check" class="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Hanya siswa kelas 12 yang dapat
                                        mengikuti PKL</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon name="lucide:check" class="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Hanya siswa tanpa penempatan aktif yang
                                        tersedia</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon name="lucide:check" class="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Durasi PKL minimal 6 bulan</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Summary Card -->
                <div v-if="formData.siswa_id && formData.perusahaan_id"
                    class="bg-white border border-slate-200 rounded-xl p-4 sticky top-6">
                    <h4 class="font-semibold text-slate-900 mb-3">
                        Ringkasan Penempatan
                    </h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Siswa</span>
                            <span class="font-medium text-slate-900">{{
                                selectedSiswaInfo?.nama_siswa
                                }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Kelas</span>
                            <span class="font-medium text-slate-900">{{
                                selectedSiswaInfo?.kelas?.nama_kelas
                                }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Perusahaan</span>
                            <span class="font-medium text-slate-900">
                                {{
                                    perusahaanOptions.find(
                                        (p) =>
                                            p.value === formData.perusahaan_id,
                                    )?.label
                                }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Guru Pembimbing</span>
                            <span class="font-medium text-slate-900">
                                {{
                                    guruOptions.find(
                                        (g) =>
                                            g.value ===
                                            formData.guru_pembimbing_id,
                                    )?.label
                                }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <UButton variant="outline" color="neutral" size="lg" @click="handleCancel">
                Batal
            </UButton>
            <UButton color="primary" size="lg" :loading="submitting" :disabled="!formData.id_periode_pkl ||
                !formData.siswa_id ||
                !formData.perusahaan_id ||
                !formData.guru_pembimbing_id
                " @click="handleSubmit">
                <Icon name="lucide:check" class="w-4 h-4" />
                Simpan Penempatan
            </UButton>
        </div>
    </div>
</template>
