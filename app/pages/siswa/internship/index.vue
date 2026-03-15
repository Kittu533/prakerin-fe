<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Status PKL
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Informasi lengkap penempatan dan tempat PKL Anda
                </p>
            </div>
            <UButton
                v-if="placementState === 'placed'"
                icon="lucide:layout-dashboard"
                variant="outline"
                to="/siswa/dashboard"
            >
                Ke Dashboard
            </UButton>
        </div>

        <!-- Loading Skeleton -->
        <template v-if="pageLoading">
            <div class="grid lg:grid-cols-3 gap-4">
                <USkeleton class="h-32 rounded-xl" />
                <USkeleton class="h-32 rounded-xl" />
                <USkeleton class="h-32 rounded-xl" />
            </div>
            <USkeleton class="h-64 rounded-xl" />
        </template>

        <template v-else>
            <!-- STATE: SUDAH DITEMPATKAN -->
            <template v-if="placementState === 'placed'">
                <SiswaInternshipPlacementStatus :placement="placementData" />

                <!-- Detailed Info Sections -->
                <div class="grid lg:grid-cols-2 gap-4">
                    <SiswaInternshipCompanyCard :placement="placementData" />
                    <SiswaInternshipMentorCard :placement="placementData" />
                </div>

                <!-- Guru Pembimbing & Jadwal -->
                <div class="grid lg:grid-cols-2 gap-4">
                    <SiswaInternshipTeacherCard :placement="placementData" />
                    <SiswaInternshipScheduleCard :placement="placementData" />
                </div>

                <!-- Surat Pengantar -->
                <div
                    v-if="placementData?.nomor_surat_pengantar"
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2"
                    >
                        <Icon
                            name="lucide:file-text"
                            class="w-5 h-5 text-slate-600"
                        />
                        <h3 class="font-semibold text-slate-900">
                            Dokumen Penempatan
                        </h3>
                    </div>
                    <div class="p-5">
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                            <div>
                                <p class="text-xs text-slate-500 mb-1">
                                    Nomor Surat Pengantar
                                </p>
                                <p class="font-semibold text-slate-900 text-lg">
                                    {{ placementData.nomor_surat_pengantar }}
                                </p>
                            </div>
                            <UButton variant="soft" color="primary" size="sm">
                                <Icon
                                    name="lucide:download"
                                    class="w-4 h-4 mr-2"
                                />
                                Download Surat
                            </UButton>
                        </div>
                    </div>
                </div>

                <!-- Info Box -->
                <div
                    class="bg-sky-50 rounded-xl border border-sky-200 p-4 flex items-start gap-3"
                >
                    <Icon
                        name="lucide:info"
                        class="w-5 h-5 text-sky-600 shrink-0 mt-0.5"
                    />
                    <div>
                        <p class="text-sm font-medium text-sky-900">
                            Informasi Aktivitas PKL
                        </p>
                        <p class="text-sm text-sky-700 mt-1">
                            Anda sudah memiliki penempatan PKL yang aktif.
                            Silakan lakukan aktivitas PKL seperti absensi
                            harian, mengisi logbook kegiatan, dan melihat
                            penilaian melalui menu yang tersedia.
                        </p>
                    </div>
                </div>
            </template>

            <!-- STATE: PENGHAJUAN DIPROSES / DITOLAK -->
            <template
                v-else-if="
                    placementState === 'processing' ||
                    placementState === 'rejected'
                "
            >
                <SiswaInternshipApplicationStatus
                    :application="applicationData"
                    :tahun-ajaran-name="activeTahunAjaranName"
                    @retry="startNewApplication"
                />
            </template>

            <!-- STATE: FORM PENGAJUAN (BELUM MENGHAJUAN) -->
            <template v-else>
                <!-- Hidden file input for document upload -->
                <input
                    ref="fileInput"
                    type="file"
                    class="hidden"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    @change="handleFileUpload"
                />

                <SiswaInternshipApplicationForm
                    :step="step"
                    :mode="mode"
                    :search-query="search"
                    :selected-field="filterField"
                    :selected-company-id="selectedCompanyId"
                    :loading="loadingCompanies"
                    :submitting="submitting"
                    :companies="companies"
                    :form-data="mandiriForm"
                    :field-options="fieldOptions"
                    :can-proceed="canProceedValue"
                    @select-mode="selectMode"
                    @select-company="selectCompany"
                    @update:search-query="search = $event"
                    @update:selected-field="filterField = $event"
                    @update:form-data="(val) => Object.assign(mandiriForm, val)"
                    @reset-filter="
                        search = '';
                        filterField = null;
                    "
                    @trigger-upload="triggerFileUpload"
                    @file-change="handleFileUpload"
                    @prev-step="prevStep"
                    @next-step="nextStep"
                    @submit="submitApplication"
                />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    useSiswaPengajuanApi,
    usePerusahaanMitraApi,
    useSiswaPenempatanApi,
} from "~/composables/api/use-siswa";
import { useTahunAjaranApi } from "~/composables/api/use-academic";
import type {
    PlacementData,
    ApplicationData,
    PlacementState,
    CompanyOption,
    MandiriFormData,
} from "~/components/siswa/internship/types";

definePageMeta({ layout: "siswa" });

const toast = useToast();

// API composables
const pengajuanApi = useSiswaPengajuanApi();
const perusahaanApi = usePerusahaanMitraApi();
const penempatanApi = useSiswaPenempatanApi();
const tahunAjaranApi = useTahunAjaranApi();

// Placement states: 'placed' | 'processing' | 'rejected' | 'none'
const placementState = ref<PlacementState>("none");
const placementData = ref<PlacementData | null>(null);
const applicationData = ref<ApplicationData | null>(null);

// Loading states
const pageLoading = ref(true);
const loadingCompanies = ref(true);
const submitting = ref(false);

// Form state
const step = ref(0);
const mode = ref<"mitra" | "mandiri">("mitra");

// Mitra mode state
const search = ref("");
const filterField = ref<string | null>(null);
const selectedCompanyId = ref<number | string | null>(null);
const companies = ref<CompanyOption[]>([]);

// Mandiri form state
const mandiriForm = reactive<MandiriFormData>({
    nama_perusahaan: "",
    alamat: "",
    bidang_usaha: "",
    kota: "",
    nama_pic: "",
    no_hp_pic: "",
    dokumen_pendukung: "",
});

// Active tahun ajaran
const activeTahunAjaran = ref<string | null>(null);
const activeTahunAjaranName = ref<string | null>(null);

// Refs
const fileInput = ref<HTMLInputElement | null>(null);

// Options
const fieldOptions = [
    "IT & Software",
    "Jaringan & Infrastruktur",
    "Multimedia & Desain",
    "Bisnis & Manajemen",
    "Otomotif",
    "Elektronika",
    "Perkantoran",
    "Lainnya",
];

// COMPUTED
const canProceedValue = computed(() => {
    if (step.value === 0) return !!mode.value;
    if (step.value === 1) {
        if (mode.value === "mitra") return !!selectedCompanyId.value;
        // Mandiri validation
        return (
            !!mandiriForm.nama_perusahaan?.trim() &&
            mandiriForm.alamat?.length >= 20 &&
            !!mandiriForm.bidang_usaha?.trim() &&
            !!mandiriForm.kota?.trim() &&
            !!mandiriForm.nama_pic?.trim() &&
            !!mandiriForm.no_hp_pic?.trim() &&
            !!mandiriForm.dokumen_pendukung?.trim()
        );
    }
    return true;
});

// Debug: log form changes
watch(
    mandiriForm,
    (newVal) => {
        console.log("mandiriForm changed:", newVal);
        console.log("canProceedValue:", canProceedValue.value);
    },
    { deep: true },
);

// METHODS
function selectMode(m: "mitra" | "mandiri") {
    mode.value = m;
    step.value = 1;
}

function selectCompany(id: number | string) {
    selectedCompanyId.value = id;
}

function startNewApplication() {
    placementState.value = "none";
    applicationData.value = null;
    resetForm();
}

function resetForm() {
    step.value = 0;
    mode.value = "mitra";
    selectedCompanyId.value = null;
    search.value = "";
    filterField.value = null;
    Object.assign(mandiriForm, {
        nama_perusahaan: "",
        alamat: "",
        bidang_usaha: "",
        kota: "",
        nama_pic: "",
        no_hp_pic: "",
        dokumen_pendukung: "",
    });
}

function prevStep() {
    if (step.value > 0) step.value--;
}

function nextStep() {
    if (step.value < 2) step.value++;
}

function triggerFileUpload() {
    fileInput.value?.click();
}

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.add({
            title: "Ukuran file terlalu besar",
            description: "Maksimal 5MB",
            color: "error",
        });
        return;
    }

    // Validate file type
    const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
        toast.add({
            title: "Format file tidak valid",
            description: "Hanya PDF, JPG, dan PNG",
            color: "error",
        });
        return;
    }

    mandiriForm.dokumen_pendukung = file.name;
}

async function submitApplication() {
    if (!activeTahunAjaran.value) {
        toast.add({
            title: "Tahun ajaran aktif tidak ditemukan",
            color: "error",
        });
        return;
    }

    submitting.value = true;

    try {
        let response;

        if (mode.value === "mitra" && selectedCompanyId.value) {
            // Submit mitra pengajuan
            response = await pengajuanApi.create({
                id_perusahaan: String(selectedCompanyId.value),
                id_tahun_ajaran: activeTahunAjaran.value,
            });
        } else {
            // Submit mandiri pengajuan
            response = await pengajuanApi.createMandiri({
                nama_perusahaan: mandiriForm.nama_perusahaan,
                alamat: mandiriForm.alamat,
                bidang_usaha: mandiriForm.bidang_usaha,
                kota: mandiriForm.kota,
                nama_pic: mandiriForm.nama_pic,
                no_hp_pic: mandiriForm.no_hp_pic,
                id_tahun_ajaran: activeTahunAjaran.value,
                dokumen_pendukung: mandiriForm.dokumen_pendukung,
            });
        }

        if (response?.success) {
            toast.add({
                title: "Pengajuan berhasil dikirim!",
                description:
                    "Menunggu konfirmasi dari admin. Pantau status secara berkala.",
                color: "success",
            });
            // Reset form and reload data
            resetForm();
            await loadData();
        } else {
            // Check for specific multi-period error or active placement error
            const errorMsg = response?.message || "Gagal mengirim pengajuan";
            toast.add({
                title: "Pengajuan Ditolak",
                description: errorMsg,
                color: "error",
            });
        }
    } catch (error: any) {
        console.error("Submit error:", error);
        const errorMsg = error?.response?.data?.message || error?.message || "Terjadi kesalahan. Silakan coba lagi.";
        toast.add({
            title: "Gagal mengirim pengajuan",
            description: errorMsg,
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
}

async function loadCompanies() {
    loadingCompanies.value = true;
    try {
        const response = await perusahaanApi.getAvailable({ limit: 100 });

        if (response.success && response.data) {
            companies.value = response.data.map((c: any) => ({
                id: c.id_perusahaan,
                name: c.nama_perusahaan,
                address: c.alamat,
                field: c.bidang_usaha,
                quota: c.kapasitas_siswa,
                applied: c.siswa_diterima,
                isFull: c.siswa_diterima >= c.kapasitas_siswa,
            }));
        }
    } catch (error) {
        console.error("Load companies error:", error);
    } finally {
        loadingCompanies.value = false;
    }
}

async function loadData() {
    pageLoading.value = true;

    try {
        // 1. Get active tahun ajaran
        const taRes = await tahunAjaranApi.getActive();
        if (taRes.success && taRes.data) {
            activeTahunAjaran.value = taRes.data.id_tahun_ajaran;
            activeTahunAjaranName.value = taRes.data.nama_tahun_ajaran;
        }

        // 2. Check for active placement first
        const placementRes = await penempatanApi.getMyPenempatan();

        if (placementRes.success && placementRes.data) {
            // Has active placement
            placementState.value = "placed";
            placementData.value = placementRes.data;
            applicationData.value = null;
            return;
        }

        // 3. No placement, check for existing pengajuan
        const pengajuanRes = await pengajuanApi.getMyPengajuan();

        if (pengajuanRes.success && pengajuanRes.data) {
            const data = pengajuanRes.data;
            const status = data.status_pengajuan?.toLowerCase();

            applicationData.value = data;

            if (status === "ditolak") {
                placementState.value = "rejected";
            } else {
                placementState.value = "processing";
            }
        } else {
            // No pengajuan, show application form
            placementState.value = "none";
        }

        // 4. Load companies for the form
        await loadCompanies();
    } catch (error: any) {
        console.error("Load data error:", error);

        if (error?.response?.status === 403) {
            toast.add({
                title: "Akses Ditolak",
                description:
                    "Anda tidak memiliki izin untuk mengakses halaman ini.",
                color: "error",
            });
        } else {
            toast.add({
                title: "Gagal memuat data",
                description: "Terjadi kesalahan. Silakan refresh halaman.",
                color: "error",
            });
        }
    } finally {
        pageLoading.value = false;
    }
}

// LIFECYCLE
onMounted(() => {
    loadData();
});

useHead({ title: "Status PKL | Siswa" });
</script>
