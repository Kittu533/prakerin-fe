<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { usePeriodePKLApi, type PeriodePKL } from "~/composables/api/use-periode-pkl";
import { useTahunAjaranApi } from "~/composables/api/use-academic";

const props = defineProps<{
    sourcePeriode: PeriodePKL | null;
}>();

const emit = defineEmits<{
    close: [];
    saved: [];
}>();

const api = usePeriodePKLApi();
const tahunAjaranApi = useTahunAjaranApi();
const toast = useToast();

const submitting = ref(false);

// Form state
const formData = ref({
    nama_periode: "",
    id_tahun_ajaran: 0,
    tanggal_mulai: "",
    tanggal_selesai: "",
});

// Options
const tahunAjaranOptions = ref<{ label: string; value: number }[]>([]);

// Validation errors
const errors = ref<Record<string, string>>({});

// Suggested name based on source
const suggestedName = computed(() => {
    if (!props.sourcePeriode) return "";
    // Extract year from source name and increment
    const match = props.sourcePeriode.nama_periode.match(/(\d{4})\/(\d{4})/);
    if (match) {
        const year1 = parseInt(match[1]);
        const year2 = parseInt(match[2]);
        return props.sourcePeriode.nama_periode.replace(
            `${match[1]}/${match[2]}`,
            `${year1 + 1}/${year2 + 1}`
        );
    }
    return props.sourcePeriode.nama_periode + " (Copy)";
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
            errors.value.tanggal_selesai = "Tanggal selesai harus setelah tanggal mulai";
        }
    }

    return Object.keys(errors.value).length === 0;
};

// Initialize form with source data + 1 year
const initForm = () => {
    if (!props.sourcePeriode) return;

    const sourceStart = new Date(props.sourcePeriode.tanggal_mulai);
    const sourceEnd = new Date(props.sourcePeriode.tanggal_selesai);

    // Add 1 year
    const newStart = new Date(sourceStart);
    newStart.setFullYear(newStart.getFullYear() + 1);
    const newEnd = new Date(sourceEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    formData.value = {
        nama_periode: suggestedName.value,
        id_tahun_ajaran: 0, // User needs to select
        tanggal_mulai: newStart.toISOString().split("T")[0],
        tanggal_selesai: newEnd.toISOString().split("T")[0],
    };
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
    if (!props.sourcePeriode) return;
    if (!validateForm()) return;

    submitting.value = true;
    try {
        const payload = {
            nama_periode: formData.value.nama_periode,
            id_tahun_ajaran: formData.value.id_tahun_ajaran,
            tanggal_mulai: new Date(formData.value.tanggal_mulai).toISOString(),
            tanggal_selesai: new Date(formData.value.tanggal_selesai).toISOString(),
        };

        const response = await api.clone(props.sourcePeriode.id_periode_pkl, payload);

        if (response.success) {
            toast.add({ title: "Periode PKL berhasil digandakan", color: "success" });
            emit("saved");
        }
    } catch (error: any) {
        console.error("Failed to clone periode:", error);
        toast.add({
            title: "Gagal menggandakan periode",
            description: error.response?.data?.message || error.message,
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

// Watch for source periode changes
watch(() => props.sourcePeriode, (newPeriode) => {
    if (newPeriode) {
        initForm();
    }
}, { immediate: true });

// Fetch options on mount
fetchTahunAjaran();
</script>

<template>
    <div
        v-if="sourcePeriode"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="handleBackdropClick"
    >
        <div
            class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-slate-200">
                <div>
                    <h2 class="text-lg font-semibold text-slate-900">
                        Clone Periode PKL
                    </h2>
                    <p class="text-sm text-slate-500">
                        Buat periode baru berdasarkan "{{ sourcePeriode.nama_periode }}"
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
                <!-- Source Info -->
                <div class="bg-slate-50 rounded-lg p-3 mb-4">
                    <p class="text-xs text-slate-500 mb-1">Periode Sumber</p>
                    <p class="text-sm font-medium text-slate-900">
                        {{ sourcePeriode.nama_periode }}
                    </p>
                    <p class="text-xs text-slate-600">
                        {{ new Date(sourcePeriode.tanggal_mulai).toLocaleDateString("id-ID") }} -
                        {{ new Date(sourcePeriode.tanggal_selesai).toLocaleDateString("id-ID") }}
                    </p>
                </div>

                <form @submit.prevent="submit" class="space-y-4">
                    <!-- Nama Periode -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">
                            Nama Periode Baru <span class="text-red-500">*</span>
                        </label>
                        <UInput
                            v-model="formData.nama_periode"
                            placeholder="Contoh: PKL 2025/2026"
                            :disabled="submitting"
                            size="lg"
                            class="w-full"
                        />
                        <p v-if="errors.nama_periode" class="text-xs text-red-500 mt-1">
                            {{ errors.nama_periode }}
                        </p>
                    </div>

                    <!-- Tahun Ajaran -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">
                            Tahun Ajaran <span class="text-red-500">*</span>
                        </label>
                        <USelectMenu
                            v-model="formData.id_tahun_ajaran"
                            :items="tahunAjaranOptions"
                            placeholder="Pilih tahun ajaran"
                            :disabled="submitting"
                            size="lg"
                            class="w-full"
                        />
                        <p v-if="errors.id_tahun_ajaran" class="text-xs text-red-500 mt-1">
                            {{ errors.id_tahun_ajaran }}
                        </p>
                    </div>

                    <!-- Tanggal -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Tanggal Mulai <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="formData.tanggal_mulai"
                                type="date"
                                :disabled="submitting"
                                size="lg"
                                class="w-full"
                            />
                            <p v-if="errors.tanggal_mulai" class="text-xs text-red-500 mt-1">
                                {{ errors.tanggal_mulai }}
                            </p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">
                                Tanggal Selesai <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="formData.tanggal_selesai"
                                type="date"
                                :disabled="submitting"
                                size="lg"
                                class="w-full"
                            />
                            <p v-if="errors.tanggal_selesai" class="text-xs text-red-500 mt-1">
                                {{ errors.tanggal_selesai }}
                            </p>
                        </div>
                    </div>

                    <!-- Info Note -->
                    <div class="bg-blue-50 rounded-lg p-3">
                        <div class="flex gap-2">
                            <Icon name="lucide:info" class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <p class="text-xs text-blue-700">
                                Periode baru akan dibuat dengan status <strong>draft</strong>.
                                Penempatan dari periode sumber tidak akan disalin.
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 p-4 border-t border-slate-200">
                <UButton
                    variant="outline"
                    color="neutral"
                    :disabled="submitting"
                    @click="close"
                >
                    Batal
                </UButton>
                <UButton
                    icon="lucide:copy"
                    color="primary"
                    :loading="submitting"
                    :disabled="submitting"
                    @click="submit"
                >
                    Clone Periode
                </UButton>
            </div>
        </div>
    </div>
</template>
