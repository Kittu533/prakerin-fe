<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
    usePenempatanApi,
    type Penempatan,
} from "~/composables/api/use-internship";
import { useSiswaApi } from "~/composables/api/use-academic";
import { formatDate } from "~/utils/format-date";
import { getStatusColor, getStatusLabel } from "~/utils/status-helpers";
import type { DetailSection } from "~/components/base/BaseDetailPage.vue";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const penempatanApi = usePenempatanApi();
const siswaApi = useSiswaApi();

// Get ID from route
const id = computed(() => route.params.id as string);

// State
const loading = ref(true);
const penempatan = ref<Penempatan | null>(null);
const siswaData = ref<any>(null);

// Action buttons
const actions = computed(() => [
    {
        label: "Logbook",
        icon: "lucide:book-open",
        color: "primary" as const,
        action: () => router.push(`/admin/logbook?penempatan_id=${id.value}`),
    },
    {
        label: "Absensi",
        icon: "lucide:calendar",
        color: "success" as const,
        action: () => router.push(`/admin/absensi?penempatan_id=${id.value}`),
    },
]);

// Detail sections
const detailSections = computed<DetailSection[]>(() => {
    if (!penempatan.value) return [];

    return [
        {
            title: "Informasi Siswa",
            columns: 2,
            fields: [
                {
                    key: "nama_siswa",
                    label: "Nama Siswa",
                    type: "text",
                    span: 2,
                },
                {
                    key: "kelas",
                    label: "Kelas",
                    type: "text",
                },
                {
                    key: "nis",
                    label: "NIS",
                    type: "text",
                },
            ],
        },
        {
            title: "Informasi Penempatan",
            columns: 2,
            fields: [
                {
                    key: "perusahaan",
                    label: "Perusahaan",
                    type: "text",
                    span: 2,
                    format: () =>
                        penempatan.value?.perusahaan?.nama_perusahaan || "-",
                },
                {
                    key: "alamat_perusahaan",
                    label: "Alamat Perusahaan",
                    type: "text",
                    span: 2,
                    format: () => penempatan.value?.perusahaan?.alamat || "-",
                },
                {
                    key: "tanggal_mulai",
                    label: "Tanggal Mulai",
                    type: "date",
                },
                {
                    key: "tanggal_selesai",
                    label: "Tanggal Selesai",
                    type: "date",
                },
                {
                    key: "status_penempatan",
                    label: "Status",
                    type: "status",
                    options: [
                        { label: "Aktif", value: "aktif", color: "success" },
                        {
                            label: "Selesai",
                            value: "selesai",
                            color: "neutral",
                        },
                        {
                            label: "Dibatalkan",
                            value: "dibatalkan",
                            color: "error",
                        },
                    ],
                },
                {
                    key: "durasi",
                    label: "Durasi",
                    type: "text",
                    format: () => {
                        if (
                            !penempatan.value?.tanggal_mulai ||
                            !penempatan.value?.tanggal_selesai
                        )
                            return "-";
                        const start = new Date(penempatan.value.tanggal_mulai);
                        const end = new Date(penempatan.value.tanggal_selesai);
                        const months = Math.round(
                            (end.getTime() - start.getTime()) /
                                (1000 * 60 * 60 * 24 * 30),
                        );
                        return `${months} bulan`;
                    },
                },
            ],
        },
        {
            title: "Pembimbing",
            columns: 2,
            fields: [
                {
                    key: "guru_pembimbing",
                    label: "Guru Pembimbing Sekolah",
                    type: "text",
                    span: 2,
                    format: () => penempatan.value?.guru?.nama_guru || "-",
                },
                {
                    key: "email_guru",
                    label: "Email Guru",
                    type: "text",
                    format: () => penempatan.value?.guru?.email || "-",
                },
                {
                    key: "hp_guru",
                    label: "No. HP Guru",
                    type: "text",
                    format: () => penempatan.value?.guru?.no_hp || "-",
                },
                {
                    key: "mentor",
                    label: "Mentor Perusahaan",
                    type: "text",
                    span: 2,
                    format: () => penempatan.value?.mentor?.nama_mentor || "-",
                },
            ],
        },
    ];
});

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await penempatanApi.getById(id.value);
        if (response.success && response.data) {
            penempatan.value = response.data;

            // Fetch siswa details
            if (response.data.siswa_id) {
                const siswaRes = await siswaApi.getById(response.data.siswa_id);
                if (siswaRes.success) {
                    siswaData.value = siswaRes.data;
                }
            }
        } else {
            toast.add({
                title: "Data tidak ditemukan",
                color: "error",
            });
            router.push("/admin/placement");
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.add({
            title: "Gagal memuat data",
            color: "error",
        });
        router.push("/admin/placement");
    } finally {
        loading.value = false;
    }
};

// Handle actions
const handleEdit = () => {
    router.push(`/admin/placement/${id.value}/edit`);
};

const handleBack = () => {
    router.push("/admin/placement");
};

onMounted(() => {
    fetchData();
});

// Computed for subtitle
const subtitle = computed(() => {
    if (!penempatan.value) return "";
    return siswaData.value?.nama_siswa || penempatan.value.siswa_id
        ? `Penempatan: ${siswaData.value?.nama_siswa || "Siswa #" + penempatan.value.siswa_id}`
        : "";
});

useHead({ title: "Detail Penempatan | Admin" });
</script>

<template>
    <div class="w-full">
        <BaseDetailPage
            title="Detail Penempatan PKL"
            :subtitle="subtitle"
            :sections="detailSections"
            :data="{
                ...penempatan,
                ...siswaData,
                nama_siswa: siswaData?.nama_siswa,
                kelas: siswaData?.kelas?.nama_kelas,
                nis: siswaData?.nis,
                perusahaan: penempatan?.perusahaan?.nama_perusahaan,
                alamat_perusahaan: penempatan?.perusahaan?.alamat,
                guru_pembimbing: penempatan?.guru?.nama_guru,
                email_guru: penempatan?.guru?.email,
                hp_guru: penempatan?.guru?.no_hp,
                mentor: penempatan?.mentor?.nama_mentor,
            }"
            :loading="loading"
            :actions="actions"
            show-edit
            show-delete
            @edit="handleEdit"
            @back="handleBack"
        >
            <template #sections>
                <!-- Statistik PKL -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3 class="font-semibold text-slate-900">
                            Statistik PKL
                        </h3>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div
                                class="text-center p-4 bg-slate-50 rounded-lg border border-slate-100"
                            >
                                <p class="text-2xl font-bold text-slate-900">
                                    -
                                </p>
                                <p class="text-sm text-slate-500 mt-1">
                                    Total Logbook
                                </p>
                            </div>
                            <div
                                class="text-center p-4 bg-green-50 rounded-lg border border-green-100"
                            >
                                <p class="text-2xl font-bold text-green-600">
                                    -
                                </p>
                                <p class="text-sm text-green-600/70 mt-1">
                                    Disetujui
                                </p>
                            </div>
                            <div
                                class="text-center p-4 bg-sky-50 rounded-lg border border-sky-100"
                            >
                                <p class="text-2xl font-bold text-sky-600">-</p>
                                <p class="text-sm text-sky-600/70 mt-1">
                                    Hadir
                                </p>
                            </div>
                            <div
                                class="text-center p-4 bg-amber-50 rounded-lg border border-amber-100"
                            >
                                <p class="text-2xl font-bold text-amber-600">
                                    -
                                </p>
                                <p class="text-sm text-amber-600/70 mt-1">
                                    Hari PKL
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </BaseDetailPage>
    </div>
</template>
