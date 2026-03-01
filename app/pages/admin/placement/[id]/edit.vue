<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
    usePenempatanApi,
    type Penempatan,
} from "~/composables/api/use-internship";
import { useSiswaApi, useGuruApi } from "~/composables/api/use-academic";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import type { FormField } from "~/components/base/BaseFormPage.vue";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const penempatanApi = usePenempatanApi();
const siswaApi = useSiswaApi();
const guruApi = useGuruApi();
const perusahaanApi = usePerusahaanApi();

// Get ID from route
const id = computed(() => route.params.id as string);

// State
const loading = ref(true);
const submitting = ref(false);
const penempatan = ref<Penempatan | null>(null);

// Options for selects
const siswaOptions = ref<{ label: string; value: string }[]>([]);
const perusahaanOptions = ref<{ label: string; value: string }[]>([]);
const guruOptions = ref<{ label: string; value: string }[]>([]);

// Form data
const formData = ref<Record<string, any>>({
    id_penempatan: undefined,
    siswa_id: undefined,
    perusahaan_id: undefined,
    guru_pembimbing_id: undefined,
    tanggal_mulai: "",
    tanggal_selesai: "",
    status_penempatan: "aktif",
});

// Form fields definition (edit mode - different from create)
const formFields = computed<FormField[]>(() => [
    {
        key: "siswa_id",
        label: "Siswa",
        type: "readonly",
        description: "Siswa tidak dapat diubah setelah penempatan dibuat",
    },
    {
        key: "perusahaan_id",
        label: "Perusahaan",
        type: "readonly",
        description: "Perusahaan tidak dapat diubah",
    },
    {
        key: "guru_pembimbing_id",
        label: "Guru Pembimbing",
        type: "select",
        options: guruOptions.value,
        required: true,
        description: "Dapat diubah jika diperlukan",
    },
    {
        key: "tanggal_mulai",
        label: "Tanggal Mulai",
        type: "date",
        required: true,
        description: "Tanggal dimulainya PKL",
    },
    {
        key: "tanggal_selesai",
        label: "Tanggal Selesai",
        type: "date",
        required: true,
        description: "Tanggal selesainya PKL",
    },
    {
        key: "status_penempatan",
        label: "Status Penempatan",
        type: "select",
        options: [
            { label: "Aktif", value: "aktif" },
            { label: "Selesai", value: "selesai" },
            { label: "Dibatalkan", value: "dibatalkan" },
        ],
        description: "Ubah status jika PKL telah selesai atau dibatalkan",
        span: 2,
    },
]);

// Fetch penempatan data
const fetchPenempatan = async () => {
    loading.value = true;
    try {
        const response = await penempatanApi.getById(id.value);
        if (response.success && response.data) {
            penempatan.value = response.data;

            // Populate form data
            formData.value = {
                id_penempatan: response.data.id_penempatan,
                siswa_id: response.data.siswa_id,
                perusahaan_id: response.data.perusahaan_id,
                guru_pembimbing_id: response.data.guru_pembimbing_id,
                tanggal_mulai: response.data.tanggal_mulai?.split("T")[0] || "",
                tanggal_selesai:
                    response.data.tanggal_selesai?.split("T")[0] || "",
                status_penempatan: response.data.status_penempatan,
            };

            // Update readonly field display
            siswaOptions.value = [
                {
                    label: `${response.data.siswa?.nama_siswa || "-"} (${response.data.siswa?.kelas || "-"})`,
                    value: response.data.siswa_id,
                },
            ];
            perusahaanOptions.value = [
                {
                    label: response.data.perusahaan?.nama_perusahaan || "-",
                    value: response.data.perusahaan_id,
                },
            ];
        } else {
            toast.add({
                title: "Data tidak ditemukan",
                description: "Penempatan tidak ditemukan",
                color: "error",
            });
            router.push("/admin/placement");
        }
    } catch (error) {
        console.error("Failed to fetch penempatan:", error);
        toast.add({
            title: "Gagal memuat data",
            color: "error",
        });
        router.push("/admin/placement");
    } finally {
        loading.value = false;
    }
};

// Fetch options (guru only for edit)
const fetchOptions = async () => {
    try {
        const guruRes = await guruApi.getAll({ limit: 100 });
        if (guruRes.success) {
            guruOptions.value = (guruRes.data || []).map((g) => ({
                label: g.nama_guru,
                value: g.id_guru,
            }));
        }
    } catch (error) {
        console.error("Failed to fetch guru options:", error);
    }
};

// Handle form submission
const handleSubmit = async (data: Record<string, any>) => {
    // Validate
    if (!data.guru_pembimbing_id) {
        toast.add({ title: "Guru pembimbing harus dipilih", color: "error" });
        return;
    }

    if (!data.tanggal_mulai || !data.tanggal_selesai) {
        toast.add({ title: "Tanggal harus diisi", color: "error" });
        return;
    }

    // Validate dates
    const startDate = new Date(data.tanggal_mulai);
    const endDate = new Date(data.tanggal_selesai);

    if (endDate <= startDate) {
        toast.add({
            title: "Tanggal selesai harus lebih besar dari tanggal mulai",
            color: "error",
        });
        return;
    }

    submitting.value = true;
    try {
        const response = await penempatanApi.update(data.id_penempatan, {
            guru_pembimbing_id: data.guru_pembimbing_id,
            tanggal_mulai: data.tanggal_mulai,
            tanggal_selesai: data.tanggal_selesai,
            status_penempatan: data.status_penempatan,
        });

        if (response.success) {
            toast.add({
                title: "Penempatan berhasil diperbarui",
                color: "success",
            });
            router.push("/admin/placement");
        } else {
            toast.add({
                title: "Gagal memperbarui penempatan",
                description: response.message || "Terjadi kesalahan",
                color: "error",
            });
        }
    } catch (error) {
        console.error("Error updating penempatan:", error);
        toast.add({
            title: "Terjadi kesalahan",
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
};

// Handle cancel
const handleCancel = () => {
    router.push("/admin/placement");
};

onMounted(async () => {
    await fetchOptions();
    await fetchPenempatan();
});

useHead({ title: "Edit Penempatan | Admin" });
</script>

<template>
    <BaseFormPage
        title="Edit Penempatan PKL"
        subtitle="Perbarui data penempatan siswa"
        :fields="formFields"
        :data="formData"
        :loading="loading"
        :submit-loading="submitting"
        submit-text="Simpan Perubahan"
        cancel-text="Batal"
        size="lg"
        @cancel="handleCancel"
        @submit="handleSubmit"
    >
        <template #info>
            <div class="flex items-start gap-3">
                <Icon
                    name="lucide:alert-triangle"
                    class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                />
                <div class="text-sm text-amber-900">
                    <p class="font-medium mb-1">Perhatian:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>
                            Siswa dan perusahaan tidak dapat diubah setelah
                            penempatan dibuat
                        </li>
                        <li>
                            Ubah status menjadi "Selesai" setelah siswa
                            menyelesaikan PKL
                        </li>
                        <li>
                            Perubahan tanggal akan mempengaruhi perhitungan
                            kehadiran
                        </li>
                    </ul>
                </div>
            </div>
        </template>
    </BaseFormPage>
</template>
