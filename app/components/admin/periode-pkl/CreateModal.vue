<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";
import {
    useTahunAjaranApi,
    type TahunAjaran,
} from "~/composables/api/use-academic";

const emit = defineEmits<{
    close: [];
    saved: [];
}>();

const api = usePeriodePKLApi();
const tahunAjaranApi = useTahunAjaranApi();
const toast = useToast();

const loading = ref(false);
const submitting = ref(false);
const showQuickAddTAModal = ref(false);
const quickAddSubmitting = ref(false);

const quickAddTAForm = ref({
    nama_tahun_ajaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status_aktif: false,
});
const quickAddTAErrors = ref<Record<string, string>>({});

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
const tahunAjaranList = ref<TahunAjaran[]>([]);

const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Aktif", value: "aktif" },
];
const today = computed(() => getLocalDateKey());

const toApiDate = (dateKey: string) => dateKey;

const getSelectValue = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
        const candidate = value as Record<string, unknown>;
        if (typeof candidate.value === "string") return candidate.value;
        if (typeof candidate.id_tahun_ajaran === "string") {
            return candidate.id_tahun_ajaran;
        }
    }
    return "";
};

const getApiErrorMessage = (error: any, fallback: string) => {
    const data = error?.response?.data || error?.data || error;
    if (!data?.errors) return data?.message || error?.message || fallback;

    const firstMessage = Object.values(data.errors)
        .flat()
        .find((message) => typeof message === "string");

    return typeof firstMessage === "string"
        ? firstMessage
        : data.message || fallback;
};

const applyApiErrors = (error: any) => {
    const apiErrors = error?.response?.data?.errors || error?.errors;
    if (!apiErrors || typeof apiErrors !== "object") return;

    Object.entries(apiErrors).forEach(([field, messages]) => {
        const message = Array.isArray(messages) ? messages[0] : messages;
        if (typeof message === "string") {
            errors.value[field] = message;
        }
    });
};

// Validation errors
const errors = ref<Record<string, string>>({});

const validateQuickAddTAForm = () => {
    quickAddTAErrors.value = {};

    if (!quickAddTAForm.value.nama_tahun_ajaran.trim()) {
        quickAddTAErrors.value.nama_tahun_ajaran =
            "Nama tahun ajaran wajib diisi";
    }

    if (!quickAddTAForm.value.tanggal_mulai) {
        quickAddTAErrors.value.tanggal_mulai = "Tanggal mulai wajib diisi";
    }

    if (!quickAddTAForm.value.tanggal_selesai) {
        quickAddTAErrors.value.tanggal_selesai = "Tanggal selesai wajib diisi";
    }

    if (
        quickAddTAForm.value.tanggal_mulai &&
        quickAddTAForm.value.tanggal_selesai
    ) {
        const start = new Date(quickAddTAForm.value.tanggal_mulai);
        const end = new Date(quickAddTAForm.value.tanggal_selesai);
        if (end <= start) {
            quickAddTAErrors.value.tanggal_selesai =
                "Tanggal selesai harus setelah tanggal mulai";
        }
    }

    return Object.keys(quickAddTAErrors.value).length === 0;
};

const resetQuickAddTAForm = () => {
    quickAddTAForm.value = {
        nama_tahun_ajaran: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status_aktif: false,
    };
    quickAddTAErrors.value = {};
};

const fillQuickAddTAByName = () => {
    const match = quickAddTAForm.value.nama_tahun_ajaran
        .trim()
        .match(/(\d{4})\s*\/\s*(\d{4})/);

    if (!match) return;

    quickAddTAForm.value.tanggal_mulai = `${match[1]}-07-01`;
    quickAddTAForm.value.tanggal_selesai = `${match[2]}-06-30`;
};

const fillQuickAddTANextAvailableRange = () => {
    const list = [...tahunAjaranList.value]
        .filter((item) => Boolean(item.tanggal_mulai) && Boolean(item.tanggal_selesai))
        .sort((a, b) =>
            new Date(a.tanggal_selesai || "1970-01-01").getTime() -
            new Date(b.tanggal_selesai || "1970-01-01").getTime(),
        );

    const latest = list[list.length - 1];
    if (!latest?.tanggal_selesai) return;

    const end = new Date(latest.tanggal_selesai);
    if (Number.isNaN(end.getTime())) return;

    const nextStart = new Date(end);
    nextStart.setDate(nextStart.getDate() + 1);

    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    nextEnd.setDate(nextEnd.getDate() - 1);

    const pad = (value: number) => String(value).padStart(2, "0");
    const toDateInput = (value: Date) =>
        `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

    quickAddTAForm.value.tanggal_mulai = toDateInput(nextStart);
    quickAddTAForm.value.tanggal_selesai = toDateInput(nextEnd);

    if (!quickAddTAForm.value.nama_tahun_ajaran.trim()) {
        quickAddTAForm.value.nama_tahun_ajaran = `${nextStart.getFullYear()}/${nextEnd.getFullYear()}`;
    }
};

const openQuickAddTAModal = () => {
    resetQuickAddTAForm();
    showQuickAddTAModal.value = true;
};

const submitQuickAddTA = async () => {
    if (!validateQuickAddTAForm()) return;

    quickAddSubmitting.value = true;
    try {
        const response = await tahunAjaranApi.create({
            nama_tahun_ajaran: quickAddTAForm.value.nama_tahun_ajaran.trim(),
            tanggal_mulai: new Date(
                quickAddTAForm.value.tanggal_mulai,
            ).toISOString(),
            tanggal_selesai: new Date(
                quickAddTAForm.value.tanggal_selesai,
            ).toISOString(),
            status_aktif: quickAddTAForm.value.status_aktif,
        });

        if (!response.success || !response.data) {
            throw new Error(response.message || "Gagal menambahkan tahun ajaran");
        }

        await fetchTahunAjaran();
        formData.value.id_tahun_ajaran = response.data.id_tahun_ajaran;
        showQuickAddTAModal.value = false;

        toast.add({
            title: "Tahun ajaran berhasil ditambahkan",
            description: "Data tahun ajaran baru sudah otomatis dipilih",
            color: "success",
        });
    } catch (error: any) {
        const message = error?.message || "Terjadi kesalahan saat menyimpan";
        const isOverlap = String(message).toLowerCase().includes("beririsan");

        if (isOverlap) {
            fillQuickAddTANextAvailableRange();
        }

        toast.add({
            title: "Gagal menambahkan tahun ajaran",
            description: isOverlap
                ? "Rentang tanggal beririsan. Sistem sudah mengisi saran rentang tanggal berikutnya."
                : message,
            color: "error",
        });
    } finally {
        quickAddSubmitting.value = false;
    }
};

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

    const tahunAjaranId = getSelectValue(formData.value.id_tahun_ajaran);

    if (!tahunAjaranId) {
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

        if (formData.value.tanggal_mulai < today.value) {
            errors.value.tanggal_mulai =
                "Tanggal mulai tidak boleh sebelum hari ini";
        }

        if (formData.value.tanggal_selesai < today.value) {
            errors.value.tanggal_selesai =
                "Tanggal selesai tidak boleh sebelum hari ini";
        }

        if (end <= start) {
            errors.value.tanggal_selesai =
                "Tanggal selesai harus setelah tanggal mulai";
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
            tahunAjaranList.value = response.data || [];
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
        const tahunAjaranId = getSelectValue(formData.value.id_tahun_ajaran);
        const status = getSelectValue(formData.value.status) || "draft";

        const payload = {
            nama_periode: formData.value.nama_periode.trim(),
            id_tahun_ajaran: tahunAjaranId,
            tanggal_mulai: toApiDate(formData.value.tanggal_mulai),
            tanggal_selesai: toApiDate(formData.value.tanggal_selesai),
            status,
            deskripsi: formData.value.deskripsi.trim() || undefined,
        };

        const response = await api.create(payload);

        if (!response.success) {
            applyApiErrors(response);
            throw response;
        }

        if (response.success) {
            toast.add({
                title: "Periode PKL berhasil dibuat",
                color: "success",
            });
            emit("saved");
        }
    } catch (error: any) {
        console.error("Failed to create periode:", error);
        applyApiErrors(error);
        toast.add({
            title: "Gagal membuat periode",
            description: getApiErrorMessage(
                error,
                "Periksa kembali data periode PKL",
            ),
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
    const selectedId = getSelectValue(formData.value.id_tahun_ajaran);

    const selectedTA = tahunAjaranOptions.value.find(
        (ta) => ta.value === selectedId,
    );
    if (selectedTA) {
        // Extract years from nama_tahun_ajaran (e.g., "2024/2025")
        const match = selectedTA.label.match(/(\d{4})\/(\d{4})/);
        if (match) {
            // Set start to July of first year, end to June of second year
            const suggestedStart = `${match[1]}-07-01`;
            formData.value.tanggal_mulai =
                suggestedStart < today.value ? today.value : suggestedStart;
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

// Fetch options on client after auth token is available.
onMounted(() => {
    fetchTahunAjaran();
});
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
                                value-key="value"
                            />
                            <UButton
                                type="button"
                                variant="outline"
                                color="primary"
                                size="lg"
                                :disabled="submitting"
                                @click="openQuickAddTAModal"
                                title="Tambah tahun ajaran cepat"
                            >
                                <Icon name="lucide:plus" class="w-4 h-4" />
                            </UButton>
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
                                :min="today"
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
                                :min="formData.tanggal_mulai || today"
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
                        class="bg-linear-to-r from-sky-50 to-blue-50 rounded-lg p-3 border border-sky-100"
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
                            value-key="value"
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
                            :rows="2"
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
                                    Periode PKL dapat disesuaikan dengan jadwal sekolah.
                                    Tanggal selesai harus setelah tanggal mulai.
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

        <UModal
            :open="showQuickAddTAModal"
            @update:open="showQuickAddTAModal = $event"
            title="Quick Add Tahun Ajaran"
            description="Tambahkan tahun ajaran baru tanpa keluar dari form periode"
        >
            <template #body>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">
                            Nama Tahun Ajaran <span class="text-red-500">*</span>
                        </label>
                        <UInput
                            v-model="quickAddTAForm.nama_tahun_ajaran"
                            placeholder="Contoh: 2026/2027"
                            :disabled="quickAddSubmitting"
                            class="w-full"
                        />
                        <div class="mt-2 flex gap-2">
                            <UButton
                                type="button"
                                size="xs"
                                variant="outline"
                                color="neutral"
                                :disabled="quickAddSubmitting"
                                @click="fillQuickAddTAByName"
                            >
                                Isi Tanggal dari Nama
                            </UButton>
                            <UButton
                                type="button"
                                size="xs"
                                variant="outline"
                                color="primary"
                                :disabled="quickAddSubmitting"
                                @click="fillQuickAddTANextAvailableRange"
                            >
                                Saran Rentang Aman
                            </UButton>
                        </div>
                        <p v-if="quickAddTAErrors.nama_tahun_ajaran" class="text-xs text-red-500 mt-1">
                            {{ quickAddTAErrors.nama_tahun_ajaran }}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Tanggal Mulai <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="quickAddTAForm.tanggal_mulai"
                                type="date"
                                :disabled="quickAddSubmitting"
                                class="w-full"
                            />
                            <p v-if="quickAddTAErrors.tanggal_mulai" class="text-xs text-red-500 mt-1">
                                {{ quickAddTAErrors.tanggal_mulai }}
                            </p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Tanggal Selesai <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="quickAddTAForm.tanggal_selesai"
                                type="date"
                                :disabled="quickAddSubmitting"
                                class="w-full"
                            />
                            <p v-if="quickAddTAErrors.tanggal_selesai" class="text-xs text-red-500 mt-1">
                                {{ quickAddTAErrors.tanggal_selesai }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <input
                            id="quickAddTaActive"
                            v-model="quickAddTAForm.status_aktif"
                            type="checkbox"
                            class="w-4 h-4 rounded border-slate-300"
                            :disabled="quickAddSubmitting"
                        />
                        <label for="quickAddTaActive" class="text-sm text-slate-700">
                            Jadikan tahun ajaran aktif
                        </label>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton
                        variant="outline"
                        color="neutral"
                        :disabled="quickAddSubmitting"
                        @click="showQuickAddTAModal = false"
                    >
                        Batal
                    </UButton>
                    <UButton
                        color="primary"
                        :loading="quickAddSubmitting"
                        @click="submitQuickAddTA"
                    >
                        Simpan Tahun Ajaran
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
