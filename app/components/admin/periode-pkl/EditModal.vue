<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
    usePeriodePKLApi,
    type PeriodePKL,
} from "~/composables/api/use-periode-pkl";
import { useTahunAjaranApi } from "~/composables/api/use-academic";

const props = defineProps<{
    periode: PeriodePKL | null;
}>();

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
    { label: "Selesai", value: "selesai" },
    { label: "Arsip", value: "arsip" },
];

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

// Status config
const statusConfig: Record<
    string,
    { label: string; color: string; description: string }
> = {
    draft: {
        label: "Draft",
        color: "yellow",
        description: "Periode sedang disiapkan, belum aktif",
    },
    aktif: {
        label: "Aktif",
        color: "green",
        description: "Periode sedang berjalan, siswa dapat melakukan PKL",
    },
    selesai: {
        label: "Selesai",
        color: "blue",
        description: "Periode sudah selesai, tidak dapat diedit",
    },
    arsip: {
        label: "Arsip",
        color: "slate",
        description: "Periode diarsipkan untuk referensi",
    },
};

// Validation errors
const errors = ref<Record<string, string>>({});

// Can edit based on status
const canEdit = computed(() => {
    return (
        props.periode?.status === "draft" || props.periode?.status === "aktif"
    );
});

// Current status config
const currentStatusConfig = computed(() => {
    return statusConfig[getSelectValue(formData.value.status)] || statusConfig.draft;
});
const today = computed(() => getLocalDateKey());

// Validate form
const validateForm = (): boolean => {
    errors.value = {};

    if (!formData.value.nama_periode.trim()) {
        errors.value.nama_periode = "Nama periode wajib diisi";
    }

    if (!getSelectValue(formData.value.id_tahun_ajaran)) {
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

// Load periode data into form
const loadPeriodeData = async () => {
    if (!props.periode) return;

    loading.value = true;
    try {
        const response = await api.getById(props.periode.id_periode_pkl);
        if (response.success && response.data) {
            const data = response.data;
            formData.value = {
                nama_periode: data.nama_periode,
                id_tahun_ajaran: data.id_tahun_ajaran,
                tanggal_mulai: data.tanggal_mulai.split("T")[0],
                tanggal_selesai: data.tanggal_selesai.split("T")[0],
                status: data.status,
                deskripsi: data.deskripsi || "",
            };
        }
    } catch (error) {
        console.error("Failed to load periode data:", error);
    } finally {
        loading.value = false;
    }
};

// Fetch tahun ajaran options
const fetchTahunAjaran = async () => {
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
    }
};

// Submit form
const submit = async () => {
    if (!validateForm()) return;

    submitting.value = true;
    try {
        const payload = {
            nama_periode: formData.value.nama_periode.trim(),
            id_tahun_ajaran: getSelectValue(formData.value.id_tahun_ajaran),
            tanggal_mulai: toApiDate(formData.value.tanggal_mulai),
            tanggal_selesai: toApiDate(formData.value.tanggal_selesai),
            status: getSelectValue(formData.value.status) || "draft",
            deskripsi: formData.value.deskripsi.trim() || undefined,
        };

        const response = await api.update(
            props.periode!.id_periode_pkl,
            payload,
        );

        if (!response.success) {
            applyApiErrors(response);
            throw response;
        }

        if (response.success) {
            toast.add({
                title: "Periode PKL berhasil diupdate",
                color: "success",
            });
            emit("saved");
        }
    } catch (error: any) {
        console.error("Failed to update periode:", error);
        applyApiErrors(error);
        toast.add({
            title: "Gagal mengupdate periode",
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

// Watch for periode changes
watch(
    () => props.periode,
    (newPeriode) => {
        if (newPeriode) {
            loadPeriodeData();
        }
    },
    { immediate: true },
);

// Fetch options on client after auth token is available.
onMounted(() => {
    fetchTahunAjaran();
});
</script>

<template>
    <div
        v-if="periode"
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
                        Edit Periode PKL
                    </h2>
                    <p class="text-xs text-slate-500">
                        {{ currentStatusConfig.description }}
                    </p>
                </div>
                <button
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    @click="close"
                >
                    <Icon name="lucide:x" class="w-5 h-5" />
                </button>
            </div>

            <!-- Warning for non-editable status -->
            <div
                v-if="!canEdit"
                class="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3"
            >
                <div class="flex items-start gap-2">
                    <Icon
                        name="lucide:lock"
                        class="w-4 h-4 text-amber-600 mt-0.5"
                    />
                    <div class="text-sm text-amber-800">
                        <p class="font-medium">
                            Periode {{ periode.status }} tidak dapat diedit
                        </p>
                        <p class="text-amber-600 mt-1">
                            Hanya data tanggal yang dapat diubah. Untuk mengubah
                            status, gunakan tombol aksi.
                        </p>
                    </div>
                </div>
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
                            placeholder="Contoh: PKL 2024/2025"
                            :disabled="submitting || !canEdit"
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
                        <USelectMenu
                            v-model="formData.id_tahun_ajaran"
                            :items="tahunAjaranOptions"
                            placeholder="Pilih tahun ajaran"
                            :disabled="submitting || !canEdit"
                            size="lg"
                            value-key="value"
                            class="w-full"
                        />
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

                    <!-- Status with Quick Actions -->
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Status
                        </label>
                        <div class="flex items-center gap-2">
                            <USelectMenu
                                v-model="formData.status"
                                :items="statusOptions"
                                value-key="value"
                                :disabled="submitting"
                                size="lg"
                                class="flex-1"
                            />
                        </div>
                        <p class="text-xs text-slate-500 mt-1">
                            {{ currentStatusConfig.description }}
                        </p>

                        <!-- Quick Status Actions -->
                        <div
                            v-if="canEdit"
                            class="mt-3 p-3 bg-slate-50 rounded-lg"
                        >
                            <p class="text-xs font-medium text-slate-700 mb-2">
                                Ubah Status Cepat:
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    v-if="formData.status === 'draft'"
                                    @click="formData.status = 'aktif'"
                                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1"
                                >
                                    <Icon
                                        name="lucide:rocket"
                                        class="w-3 h-3"
                                    />
                                    Aktifkan
                                </button>
                                <button
                                    type="button"
                                    v-if="formData.status === 'aktif'"
                                    @click="formData.status = 'selesai'"
                                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
                                >
                                    <Icon name="lucide:check" class="w-3 h-3" />
                                    Selesaikan
                                </button>
                                <button
                                    type="button"
                                    v-if="formData.status === 'selesai'"
                                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1"
                                >
                                    <Icon
                                        name="lucide:archive"
                                        class="w-3 h-3"
                                    />
                                    Arsipkan (via Detail)
                                </button>
                            </div>
                        </div>
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
                            :rows="3"
                            :disabled="submitting || !canEdit"
                            class="w-full"
                        />
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div
                class="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50"
            >
                <div class="text-xs text-slate-500">
                    <span
                        v-if="periode.status === 'draft'"
                        class="flex items-center gap-1"
                    >
                        <Icon name="lucide:info" class="w-3 h-3" />
                        Draft dapat dihapus jika belum ada penempatan
                    </span>
                    <span
                        v-else-if="periode.status === 'aktif'"
                        class="flex items-center gap-1"
                    >
                        <Icon name="lucide:rocket" class="w-3 h-3" />
                        Periode aktif tidak dapat dihapus
                    </span>
                    <span v-else class="flex items-center gap-1">
                        <Icon name="lucide:lock" class="w-3 h-3" />
                        Periode {{ periode.status }} tidak dapat diedit
                    </span>
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
                        :disabled="submitting || !canEdit"
                        @click="submit"
                    >
                        Simpan Perubahan
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
