<template>
    <div class="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header / Toggle -->
        <button 
            @click="isOpen = !isOpen" 
            class="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
        >
            <span class="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <Icon name="lucide:filter" class="w-4 h-4 text-slate-500" />
                Filter Data Laporan
            </span>
            <Icon 
                :name="isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                class="w-5 h-5 text-slate-400 transition-transform" 
            />
        </button>

        <!-- Body -->
        <div v-show="isOpen" class="p-5 border-t border-slate-200">
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Tahun Ajaran Filter -->
                <div v-if="showFilter('tahun_ajaran')">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Tahun Ajaran
                    </label>
                    <USelectMenu
                        :model-value="filters.tahun_ajaran_id"
                        @update:model-value="updateFilter('tahun_ajaran_id', $event)"
                        :options="tahunAjaranOptions"
                        placeholder="Pilih Tahun Ajaran"
                        size="md"
                    />
                </div>

                <!-- Periode PKL Filter -->
                <div v-if="showFilter('periode')">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Periode PKL
                    </label>
                    <USelectMenu
                        :model-value="filters.id_periode_pkl"
                        @update:model-value="updateFilter('id_periode_pkl', $event)"
                        :options="periodeOptions"
                        placeholder="Pilih Periode"
                        size="md"
                    />
                </div>

                <!-- Jurusan Filter -->
                <div v-if="showFilter('jurusan')">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Jurusan
                    </label>
                    <USelectMenu
                        :model-value="filters.id_jurusan"
                        @update:model-value="updateFilter('id_jurusan', $event)"
                        :options="jurusanOptions"
                        placeholder="Pilih Jurusan"
                        size="md"
                    />
                </div>

                <!-- Perusahaan Filter -->
                <div v-if="showFilter('perusahaan')">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Perusahaan
                    </label>
                    <USelectMenu
                        :model-value="filters.id_perusahaan"
                        @update:model-value="updateFilter('id_perusahaan', $event)"
                        :options="perusahaanOptions"
                        placeholder="Pilih Perusahaan"
                        size="md"
                    />
                </div>

                <!-- Status Filter -->
                <div v-if="showFilter('status')">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Status
                    </label>
                    <USelectMenu
                        :model-value="filters.status"
                        @update:model-value="updateFilter('status', $event)"
                        :options="statusOptions"
                        placeholder="Pilih Status"
                        size="md"
                    />
                </div>

                <!-- Date Range Filter -->
                <div v-if="showFilter('date_range')" class="sm:col-span-2">
                    <label class="text-sm font-medium text-slate-700 mb-1.5 block">
                        Rentang Tanggal
                    </label>
                    <div class="grid grid-cols-2 gap-3">
                        <input
                            :value="filters.tanggal_mulai"
                            @input="
                                updateFilter(
                                    'tanggal_mulai',
                                    ($event.target as HTMLInputElement).value,
                                )
                            "
                            type="date"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                        />
                        <input
                            :value="filters.tanggal_selesai"
                            @input="
                                updateFilter(
                                    'tanggal_selesai',
                                    ($event.target as HTMLInputElement).value,
                                )
                            "
                            type="date"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                        />
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <UButton
                    color="primary"
                    variant="solid"
                    size="sm"
                    @click="$emit('apply')"
                    :loading="loading"
                >
                    <Icon name="lucide:check" class="w-4 h-4 mr-1" />
                    Terapkan Filter
                </UButton>
                <UButton
                    color="neutral"
                    variant="outline"
                    class="bg-white"
                    size="sm"
                    @click="$emit('reset')"
                >
                    <Icon name="lucide:rotate-ccw" class="w-4 h-4 mr-1 text-slate-500" />
                    Reset Filter
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface FilterValues {
    tahun_ajaran_id: string | null;
    id_periode_pkl: string | null;
    id_jurusan: string | null;
    id_perusahaan: string | null;
    status: string | null;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
}

interface Props {
    filters: FilterValues;
    reportType: string;
    loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:filters": [filters: FilterValues];
    apply: [];
    reset: [];
}>();

const isOpen = ref(true);

// Filter options (should be fetched from API)
const tahunAjaranOptions = ref([
    { label: "2024/2025", value: "1" },
    { label: "2023/2024", value: "2" },
]);

const periodeOptions = ref([
    { label: "Periode 1 (Jan-Jun)", value: "1" },
    { label: "Periode 2 (Jul-Des)", value: "2" },
]);

const jurusanOptions = ref([
    { label: "RPL", value: "1" },
    { label: "TKJ", value: "2" },
    { label: "MM", value: "3" },
    { label: "AKL", value: "4" },
]);

const perusahaanOptions = ref([
    { label: "PT Telkom", value: "1" },
    { label: "PT Biznet", value: "2" },
    { label: "PT Astra", value: "3" },
]);

const statusOptions = computed(() => {
    if (props.reportType === "placement") {
        return [
            { label: "Aktif", value: "aktif" },
            { label: "Selesai", value: "selesai" },
            { label: "Dibatalkan", value: "dibatalkan" },
        ];
    } else if (props.reportType === "logbook") {
        return [
            { label: "Menunggu", value: "menunggu" },
            { label: "Disetujui", value: "disetujui" },
            { label: "Ditolak", value: "ditolak" },
        ];
    } else if (props.reportType === "application") {
        return [
            { label: "Menunggu", value: "menunggu" },
            { label: "Disetujui", value: "disetujui" },
            { label: "Ditolak", value: "ditolak" },
        ];
    }
    return [];
});

// Filter visibility based on report type
function showFilter(filterName: string): boolean {
    const filterMap: Record<string, string[]> = {
        placement: ["tahun_ajaran", "periode", "jurusan", "perusahaan", "status"],
        attendance: ["date_range", "perusahaan"],
        logbook: ["date_range", "status"],
        monitoring: ["date_range", "perusahaan"],
        application: ["tahun_ajaran", "status", "perusahaan"],
        company: [],
        teacher: ["tahun_ajaran"],
    };

    return filterMap[props.reportType]?.includes(filterName) || false;
}

function updateFilter(key: keyof FilterValues, value: any) {
    emit("update:filters", {
        ...props.filters,
        [key]: value,
    });
}
</script>
