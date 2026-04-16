<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-slate-900">Disposisi</h2>
                <p class="text-sm text-slate-500">Kelola disposisi surat</p>
            </div>
            <UButton color="primary" @click="openCreateModal">
                <Icon name="lucide:plus" class="w-4 h-4 mr-1" />
                Tambah Disposisi
            </UButton>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <UInput
                    v-model="filters.search"
                    placeholder="Cari disposisi..."
                    icon="lucide:search"
                    @keyup.enter="fetchData"
                />
                <USelect
                    v-model="filters.status"
                    label="Status"
                    :items="statusOptions"
                    placeholder="Semua status"
                />
                <USelect
                    v-model="filters.prioritas"
                    label="Prioritas"
                    :items="prioritasOptions"
                    placeholder="Semua prioritas"
                />
                <UButton color="neutral" @click="fetchData">
                    <Icon name="lucide:filter" class="w-4 h-4 mr-1" />
                    Filter
                </UButton>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div v-if="loading" class="p-4 space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <UTable v-else :data="disposisiList" :columns="columns">
                <template #surat_masuk-cell="{ row }">
                    <div>
                        <p class="font-medium text-slate-900">{{ row.original.surat_masuk?.nomor_surat || '-' }}</p>
                        <p class="text-xs text-slate-500">{{ row.original.surat_masuk?.perihal || '-' }}</p>
                    </div>
                </template>
                <template #tanggal_disposisi-cell="{ row }">
                    {{ formatDate(row.original.tanggal_disposisi) }}
                </template>
                <template #batas_waktu-cell="{ row }">
                    {{ row.original.batas_waktu ? formatDate(row.original.batas_waktu) : '-' }}
                </template>
                <template #prioritas-cell="{ row }">
                    <UBadge :color="getPrioritasColor(row.original.prioritas)" variant="subtle" size="sm">
                        {{ row.original.prioritas }}
                    </UBadge>
                </template>
                <template #status-cell="{ row }">
                    <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="sm">
                        {{ row.original.status }}
                    </UBadge>
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex items-center gap-1">
                        <UButton variant="ghost" color="neutral" size="xs" @click="viewDetail(row.original)">
                            <Icon name="lucide:eye" class="w-4 h-4" />
                        </UButton>
                        <UButton variant="ghost" color="neutral" size="xs" @click="editDisposisi(row.original)">
                            <Icon name="lucide:pencil" class="w-4 h-4" />
                        </UButton>
                        <UButton variant="ghost" color="error" size="xs" @click="confirmDelete(row.original)">
                            <Icon name="lucide:trash-2" class="w-4 h-4" />
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t border-slate-100">
                <p class="text-sm text-slate-500">
                    Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
                </p>
                <div class="flex items-center gap-2">
                    <UButton variant="neutral" size="xs" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">
                        Previous
                    </UButton>
                    <UButton variant="neutral" size="xs" :disabled="pagination.page * pagination.limit >= pagination.total" @click="changePage(pagination.page + 1)">
                        Next
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <UModal v-model:open="showCreateModal" title="Disposisi" size="lg">
            <div class="p-4 space-y-4">
                <USelect
                    v-model="form.surat_masuk_id"
                    label="Surat Masuk"
                    :items="suratMasukOptions"
                    placeholder="Pilih surat masuk"
                    required
                />
                <UInput v-model="form.tanggal_disposisi" type="date" label="Tanggal Disposisi" required />
                <UInput v-model="form.penerima_disposisi" label="Penerima Disposisi" placeholder="Nama penerima" required />
                <UTextarea v-model="form.instruksi" label="Instruksi" placeholder="Instruksi disposisi" rows="3" required />
                <UTextarea v-model="form.instruksi_tambahan" label="Instruksi Tambahan" placeholder="Instruksi tambahan (opsional)" rows="2" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UInput v-model="form.batas_waktu" type="date" label="Batas Waktu" />
                    <USelect
                        v-model="form.prioritas"
                        label="Prioritas"
                        :items="prioritasOptions"
                        placeholder="Pilih prioritas"
                        required
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton variant="neutral" @click="showCreateModal = false">Batal</UButton>
                    <UButton color="primary" :loading="saving" @click="saveDisposisi">
                        {{ isEditing ? 'Update' : 'Simpan' }}
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- Detail Modal -->
        <UModal v-model:open="showDetailModal" title="Detail Disposisi" size="lg">
            <div v-if="selectedDisposisi" class="p-4 space-y-3">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-slate-500">Surat</p>
                        <p class="font-medium">{{ selectedDisposisi.surat_masuk?.nomor_surat || '-' }}</p>
                    </div>
                    <div>
                        <p class="text-slate-500">Tanggal Disposisi</p>
                        <p class="font-medium">{{ formatDate(selectedDisposisi.tanggal_disposisi) }}</p>
                    </div>
                    <div>
                        <p class="text-slate-500">Penerima</p>
                        <p class="font-medium">{{ selectedDisposisi.penerima_disposisi }}</p>
                    </div>
                    <div>
                        <p class="text-slate-500">Prioritas</p>
                        <UBadge :color="getPrioritasColor(selectedDisposisi.prioritas)" variant="subtle" size="sm">
                            {{ selectedDisposisi.prioritas }}
                        </UBadge>
                    </div>
                    <div>
                        <p class="text-slate-500">Batas Waktu</p>
                        <p class="font-medium">{{ selectedDisposisi.batas_waktu ? formatDate(selectedDisposisi.batas_waktu) : '-' }}</p>
                    </div>
                    <div>
                        <p class="text-slate-500">Status</p>
                        <UBadge :color="getStatusColor(selectedDisposisi.status)" variant="subtle" size="sm">
                            {{ selectedDisposisi.status }}
                        </UBadge>
                    </div>
                </div>
                <div>
                    <p class="text-slate-500 text-sm">Instruksi</p>
                    <p>{{ selectedDisposisi.instruksi }}</p>
                </div>
                <div v-if="selectedDisposisi.instruksi_tambahan">
                    <p class="text-slate-500 text-sm">Instruksi Tambahan</p>
                    <p>{{ selectedDisposisi.instruksi_tambahan }}</p>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end">
                    <UButton variant="neutral" @click="showDetailModal = false">Tutup</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useDisposisi, type Disposisi } from "~/composables/api/use-disposisi";
import { useSuratMasuk } from "~/composables/api/use-surat-masuk";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const { getAll, create, update, remove } = useDisposisi();
const { getAll: getSuratMasuk } = useSuratMasuk();
const { showConfirmation, showSuccess } = useSweetAlert();

const loading = ref(false);
const saving = ref(false);
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const isEditing = ref(false);
const selectedDisposisi = ref<Disposisi | null>(null);

const disposisiList = ref<Disposisi[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });
const suratMasukOptions = ref<{ value: number; label: string }[]>([]);

const filters = ref({
    search: "",
    status: "",
    prioritas: "",
});

const form = ref({
    surat_masuk_id: 0,
    tanggal_disposisi: "",
    penerima_disposisi: "",
    instruksi: "",
    instruksi_tambahan: "",
    batas_waktu: "",
    prioritas: "",
});

const columns = [
    { accessorKey: "surat_masuk", header: "Surat" },
    { accessorKey: "tanggal_disposisi", header: "Tanggal" },
    { accessorKey: "penerima_disposisi", header: "Penerima" },
    { accessorKey: "batas_waktu", header: "Batas Waktu" },
    { accessorKey: "prioritas", header: "Prioritas" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
];

const statusOptions = [
    { value: "baru", label: "Baru" },
    { value: "sedang_diproses", label: "Sedang Diproses" },
    { value: "selesai", label: "Selesai" },
    { value: "ditolak", label: "Ditolak" },
];

const prioritasOptions = [
    { value: "rendah", label: "Rendah" },
    { value: "sedang", label: "Sedang" },
    { value: "tinggi", label: "Tinggi" },
    { value: "urgent", label: "Urgent" },
];

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "selesai": return "success";
        case "sedang_diproses": return "warning";
        case "ditolak": return "error";
        default: return "neutral";
    }
}

function getPrioritasColor(prioritas: string): string {
    switch (prioritas) {
        case "urgent": return "error";
        case "tinggi": return "warning";
        case "sedang": return "info";
        default: return "neutral";
    }
}

function resetForm() {
    form.value = {
        surat_masuk_id: 0,
        tanggal_disposisi: "",
        penerima_disposisi: "",
        instruksi: "",
        instruksi_tambahan: "",
        batas_waktu: "",
        prioritas: "",
    };
}

function openCreateModal() {
    resetForm();
    isEditing.value = false;
    showCreateModal.value = true;
}

async function fetchSuratMasukOptions() {
    try {
        const result = await getSuratMasuk({ limit: 100 });
        if (result.success && result.data?.data) {
            suratMasukOptions.value = result.data.data.map((s: any) => ({
                value: s.id,
                label: `${s.nomor_surat} - ${s.asal_surat}`,
            }));
        }
    } catch (err) {
        console.error("[Disposisi] Error fetching surat masuk:", err);
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const result = await getAll({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined,
            status: filters.value.status || undefined,
            prioritas: filters.value.prioritas || undefined,
        });

        if (result.success && result.data) {
            disposisiList.value = result.data.data || [];
            pagination.value.total = result.data.total || 0;
        }
    } catch (err) {
        console.error("[Disposisi] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

function viewDetail(disposisi: Disposisi) {
    selectedDisposisi.value = disposisi;
    showDetailModal.value = true;
}

function editDisposisi(disposisi: Disposisi) {
    selectedDisposisi.value = disposisi;
    isEditing.value = true;
    form.value = {
        surat_masuk_id: disposisi.surat_masuk_id,
        tanggal_disposisi: disposisi.tanggal_disposisi.split("T")[0],
        penerima_disposisi: disposisi.penerima_disposisi,
        instruksi: disposisi.instruksi,
        instruksi_tambahan: disposisi.instruksi_tambahan || "",
        batas_waktu: disposisi.batas_waktu?.split("T")[0] || "",
        prioritas: disposisi.prioritas,
    };
    showCreateModal.value = true;
}

async function saveDisposisi() {
    saving.value = true;
    try {
        const data = {
            ...form.value,
            tanggal_disposisi: new Date(form.value.tanggal_disposisi).toISOString(),
            batas_waktu: form.value.batas_waktu ? new Date(form.value.batas_waktu).toISOString() : undefined,
        };

        let result;
        if (isEditing.value && selectedDisposisi.value) {
            result = await update(selectedDisposisi.value.id, data);
        } else {
            result = await create(data as any);
        }

        if (result.success) {
            await showSuccess("Berhasil", `Disposisi berhasil ${isEditing.value ? "diupdate" : "dibuat"}`);
            showCreateModal.value = false;
            resetForm();
            isEditing.value = false;
            fetchData();
        }
    } catch (err) {
        console.error("[Disposisi] Error saving:", err);
    } finally {
        saving.value = false;
    }
}

async function confirmDelete(disposisi: Disposisi) {
    const result = await showConfirmation(
        "Konfirmasi Hapus",
        `Apakah Anda yakin ingin menghapus disposisi ini?`
    );

    if (result.isConfirmed) {
        const deleteResult = await remove(disposisi.id);
        if (deleteResult.success) {
            await showSuccess("Berhasil", "Disposisi berhasil dihapus");
            fetchData();
        }
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

onMounted(() => {
    fetchData();
    fetchSuratMasukOptions();
});

useHead({ title: "Disposisi | Tata Usaha" });
</script>
