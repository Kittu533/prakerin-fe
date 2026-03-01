<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";
import { useTahunAjaranApi } from "~/composables/api/use-academic";

const emit = defineEmits<{
    close: [];
    saved: [];
}>();

const api = usePeriodePKLApi();
const tahunAjaranApi = useTahunAjaranApi();
const toast = useToast();

const loading = ref(false);
const submitting = ref(false);

// Form state
const formData = ref({
    nama_periode: "",
    id_tahun_ajaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "draft",
    deskripsi: "",
});

// Options
const tahunAjaranOptions = ref<{ label: string; value: string }[]>([]);

const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Aktif", value: "aktif" },
];

// Validation errors
const errors = ref<Record<string, string>>({});

// Calculate duration
const duration = computed(() => {
    if (!formData.value.tanggal_mulai || !formData.value.tanggal_selesai)
        return null;
    const start = new Date(formData.value.tanggal_mulai);
    const end = new Date(formData.value.tanggal_selesai);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 30);
});

// Validate form
const validateForm = (): boolean => {
    errors.value = {};

    if (!formData.value.nama_periode.trim()) {
        errors.value.nama_periode = "Nama periode wajib diisi";
    }

    if (!formData.value.id_tahun_ajaran) {
        errors.value.id_tahun_ajaran = "Tahun ajaran wajib dipilih";
    }

    if (!formData.value.tanggal_mulai) {
        errors.value.tanggal_mulai = "Tanggal mulai wajib diisi";
    }

    if (!formData.value.tanggal_selesai) {
        errors.value.tanggal_selesai = "Tanggal selesai wajib diisi";
    }

    if (formData.value.tanggal_mulai && formData.value.tanggal_selesai) {
        const start = new Date(formData.value.tanggal_mulai);
        const end = new Date(formData.value.tanggal_selesai);

        if (end <= start) {
            errors.value.tanggal_selesai =
                "Tanggal selesai harus setelah tanggal mulai";
        }

        // Check duration (6-12 months)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.round(diffDays / 30);

        if (diffMonths < 6) {
            errors.value.tanggal_selesai = "Durasi minimal 6 bulan";
        }
        if (diffMonths > 12) {
            errors.value.tanggal_selesai = "Durasi maksimal 12 bulan";
        }
    }

    return Object.keys(errors.value).length === 0;
};

// Fetch tahun ajaran options
const fetchTahunAjaran = async () => {
    loading.value = true;
    try {
        const response = await tahunAjaranApi.getAll({ limit: 100 });
        if (response.success) {
            tahunAjaranOptions.value = (response.data || []).map((ta) => ({
                label: ta.nama_tahun_ajaran,
                value: ta.id_tahun_ajaran,
            }));
        }
    } catch (error) {
        console.error("Failed to fetch tahun ajaran:", error);
    } finally {
        loading.value = false;
    }
};

// Submit form
const submit = async () => {
    if (!validateForm()) return;

    submitting.value = true;
    try {
        const payload = {
            nama_periode: formData.value.nama_periode,
            id_tahun_ajaran: formData.value.id_tahun_ajaran,
            tanggal_mulai: new Date(formData.value.tanggal_mulai).toISOString(),
            tanggal_selesai: new Date(
                formData.value.tanggal_selesai,
            ).toISOString(),
            status: formData.value.status,
            deskripsi: formData.value.deskripsi || undefined,
        };

        const response = await api.create(payload);

        if (response.success) {
            toast.add({
                title: "Periode PKL berhasil dibuat",
                color: "success",
            });
            emit("saved");
        }
    } catch (error: any) {
        console.error("Failed to create periode:", error);
        toast.add({
            title: "Gagal membuat periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
};

// Reset form
const resetForm = () => {
    formData.value = {
        nama_periode: "",
        id_tahun_ajaran: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status: "draft",
        deskripsi: "",
    };
    errors.value = {};
};

// Auto-suggest dates based on tahun ajaran
const autoFillDates = () => {
    const selectedTA = tahunAjaranOptions.value.find(
        (ta) => ta.value === formData.value.id_tahun_ajaran,
    );
    if (selectedTA) {
        // Extract years from nama_tahun_ajaran (e.g., "2024/2025")
        const match = selectedTA.label.match(/(\d{4})\/(\d{4})/);
        if (match) {
            // Set start to July of first year, end to June of second year
            formData.value.tanggal_mulai = `${match[1]}-07-01`;
            formData.value.tanggal_selesai = `${match[2]}-06-30`;
        }
    }
};

// Close modal
const close = () => {
    emit("close");
};

// Handle backdrop click
const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
        close();
    }
};

// Fetch options on mount
fetchTahunAjaran();
</script>

<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="handleBackdropClick"
    >
        <div
            class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between p-4 border-b border-slate-200"
            >
                <div>
                    <h2 class="text-lg font-semibold text-slate-900">
                        Tambah Periode PKL
                    </h2>
                    <p class="text-xs text-slate-500">
                        Buat periode baru untuk Program Kerja Lapangan Kerja
                    </p>
                </div>
                <button
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    @click="close"
                >
                    <Icon name="lucide:x" class="w-5 h-5" />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4">
                <div
                    v-if="loading"
                    class="flex items-center justify-center py-8"
                >
                    <Icon
                        name="lucide:loader-2"
                        class="w-6 h-6 animate-spin text-slate-400"
                    />
                </div>

                <form v-else @submit.prevent="submit" class="space-y-4">
                    <!-- Nama Periode -->
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Nama Periode <span class="text-red-500">*</span>
                        </label>
                        <UInput
                            v-model="formData.nama_periode"
                            placeholder="Contoh: PKL Ganjil 2024/2025"
                            :disabled="submitting"
                            size="lg"
                            class="w-full"
                        />
                        <p
                            v-if="errors.nama_periode"
                            class="text-xs text-red-500 mt-1"
                        >
                            {{ errors.nama_periode }}
                        </p>
                    </div>

                    <!-- Tahun Ajaran -->
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Tahun Ajaran <span class="text-red-500">*</span>
                        </label>
                        <div class="flex gap-2 w-full">
                            <USelectMenu
                                v-model="formData.id_tahun_ajaran"
                                :items="tahunAjaranOptions"
                                placeholder="Pilih tahun ajaran"
                                :disabled="submitting"
                                class="flex-1"
                                size="lg"
                            />
                            <UButton
                                type="button"
                                variant="outline"
                                color="neutral"
                                size="lg"
                                :disabled="
                                    !formData.id_tahun_ajaran || submitting
                                "
                                @click="autoFillDates"
                                title="Isi tanggal otomatis berdasarkan tahun ajaran"
                            >
                                <Icon name="lucide:calendar" class="w-4 h-4" />
                            </UButton>
                        </div>
                        <p
                            v-if="errors.id_tahun_ajaran"
                            class="text-xs text-red-500 mt-1"
                        >
                            {{ errors.id_tahun_ajaran }}
                        </p>
                    </div>

                    <!-- Tanggal -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Tanggal Mulai
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="formData.tanggal_mulai"
                                type="date"
                                :disabled="submitting"
                                size="lg"
                                class="w-full"
                            />
                            <p
                                v-if="errors.tanggal_mulai"
                                class="text-xs text-red-500 mt-1"
                            >
                                {{ errors.tanggal_mulai }}
                            </p>
                        </div>
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Tanggal Selesai
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="formData.tanggal_selesai"
                                type="date"
                                :disabled="submitting"
                                size="lg"
                                class="w-full"
                            />
                            <p
                                v-if="errors.tanggal_selesai"
                                class="text-xs text-red-500 mt-1"
                            >
                                {{ errors.tanggal_selesai }}
                            </p>
                        </div>
                    </div>

                    <!-- Duration indicator -->
                    <div
                        v-if="duration"
                        class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-3 border border-sky-100"
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-slate-600">
                                    Durasi Periode
                                </p>
                                <p class="text-lg font-semibold text-sky-600">
                                    {{ duration }} Bulan
                                </p>
                            </div>
                            <div
                                class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center"
                            >
                                <Icon
                                    name="lucide:calendar-clock"
                                    class="w-5 h-5 text-sky-600"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Status -->
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Status Awal
                        </label>
                        <USelectMenu
                            v-model="formData.status"
                            :items="statusOptions"
                            option-attribute="value"
                            value-attribute="value"
                            :disabled="submitting"
                            size="lg"
                            class="w-full"
                        />
                        <p class="text-xs text-slate-500 mt-1">
                            Pilih <strong>Draft</strong> untuk menyimpan dulu,
                            atau <strong>Aktif</strong> untuk langsung
                            mengaktifkan.
                        </p>
                    </div>

                    <!-- Deskripsi -->
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Deskripsi
                        </label>
                        <UTextarea
                            v-model="formData.deskripsi"
                            placeholder="Deskripsi periode PKL..."
                            rows="2"
                            :disabled="submitting"
                            class="w-full"
                        />
                    </div>

                    <!-- Info Note -->
                    <div
                        class="bg-blue-50 rounded-lg p-3 border border-blue-100"
                    >
                        <div class="flex gap-2">
                            <Icon
                                name="lucide:info"
                                class="w-4 h-4 text-blue-500 mt-0.5 shrink-0"
                            />
                            <div class="text-sm text-blue-700">
                                <p class="font-medium">Informasi</p>
                                <p class="text-xs text-blue-600 mt-1">
                                    Durasi periode PKL adalah 6-12 bulan. Hanya
                                    siswa kelas 12 yang dapat mengikuti PKL.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div
                class="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50"
            >
                <div class="text-xs text-slate-500">
                    <span v-if="formData.status === 'draft'"
                        >Draft dapat diedit atau dihapus</span
                    >
                    <span v-else>Periode aktif tidak dapat dihapus</span>
                </div>
                <div class="flex items-center gap-2">
                    <UButton
                        variant="outline"
                        color="neutral"
                        :disabled="submitting"
                        @click="close"
                    >
                        Batal
                    </UButton>
                    <UButton
                        color="primary"
                        :loading="submitting"
                        :disabled="submitting"
                        @click="submit"
                    >
                        Buat Periode
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
