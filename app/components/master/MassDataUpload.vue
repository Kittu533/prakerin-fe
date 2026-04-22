<template>
    <UCard
        :ui="{
            body: { padding: 'p-0' },
            header: { padding: 'p-0' },
            rounded: 'rounded-xl',
            divide: 'divide-y divide-slate-200'
        }"
        class="overflow-hidden border-slate-200"
    >
        <template #header>
            <button
                class="w-full px-4 py-3 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors group"
                @click="showMenu = !showMenu"
            >
                <div class="flex items-center gap-2">
                    <Icon name="lucide:cloud-upload" class="w-5 h-5 text-blue-600" />
                    <span class="font-semibold text-blue-900">Menu Unggah dan Back Up Data Massal</span>
                </div>
                <Icon
                    name="lucide:chevron-up"
                    class="w-5 h-5 text-blue-400 transition-transform duration-200"
                    :class="{ 'rotate-180': !showMenu }"
                />
            </button>
        </template>

        <div v-show="showMenu" class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- 1. Menu Unduh -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 text-slate-900 font-bold">
                        <Icon name="lucide:download" class="w-5 h-5" />
                        <span>1. Menu Unduh</span>
                    </div>
                    <p class="text-sm text-slate-500">
                        Unduh template atau data eksisting untuk keperluan laporan/backup.
                    </p>
                    <div class="space-y-2">
                        <UButton
                            block
                            variant="outline"
                            color="neutral"
                            class="justify-center border-blue-200 text-blue-600 hover:bg-blue-50 py-2.5"
                            @click="downloadTemplate"
                        >
                            <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                            Unduh Template Kosong
                        </UButton>
                        <UButton
                            block
                            color="success"
                            class="justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700"
                            :disabled="selectedCount === 0"
                            @click="$emit('export-selected')"
                        >
                            <Icon name="lucide:filter" class="w-4 h-4 mr-2" />
                            Unduh Data Terpilih ({{ selectedCount }} dipilih)
                        </UButton>
                        <UButton
                            block
                            color="neutral"
                            class="justify-center py-2.5 bg-slate-800 hover:bg-slate-900 text-white"
                            @click="$emit('export-all')"
                        >
                            <Icon name="lucide:database" class="w-4 h-4 mr-2" />
                            Unduh Semua Data (Backup)
                        </UButton>
                    </div>
                </div>

                <!-- 2. Unggah Data -->
                <div class="space-y-4">
                    <div class="flex items-center gap-2 text-slate-900 font-bold">
                        <Icon name="lucide:upload-cloud" class="w-5 h-5" />
                        <span>2. Unggah Data</span>
                    </div>
                    <div class="flex gap-2">
                        <input
                            ref="fileInput"
                            type="file"
                            class="hidden"
                            accept=".xlsx,.xls,.csv"
                            @change="handleFileChange"
                        />
                        <div
                            class="flex-1 border border-slate-200 rounded-lg flex items-center h-11 px-3 bg-white hover:border-blue-400 transition-colors cursor-pointer group"
                            @click="triggerFileInput"
                        >
                            <span class="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 group-hover:bg-slate-200">Choose file</span>
                            <span class="ml-4 text-sm text-slate-400 italic truncate max-w-[200px]">
                                {{ fileName || 'No file chosen' }}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <USelectMenu
                            v-model="uploadMode"
                            :items="uploadOptions"
                            value-attribute="value"
                            option-attribute="label"
                            class="flex-1"
                            :ui="{
                                base: 'h-11',
                                rounded: 'rounded-lg'
                            }"
                        >
                            <template #leading>
                                <Icon name="lucide:plus" class="w-4 h-4 text-indigo-600" />
                            </template>
                        </USelectMenu>
                        <UButton
                            color="primary"
                            class="px-6 h-11 bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-tight shadow-md shadow-blue-200"
                            :loading="uploading"
                            :disabled="!file"
                            @click="handleUpload"
                        >
                            <Icon v-if="!uploading" name="lucide:upload-cloud" class="w-4 h-4 mr-2" />
                            MULAI UNGGAH
                        </UButton>
                    </div>
                    <div v-if="warningMessage" class="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                        <p class="text-xs text-red-600 leading-relaxed">
                            <span class="font-bold">Peringatan:</span> {{ warningMessage }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </UCard>

    <!-- Import Result Modal -->
    <UModal
        v-model:open="showResultModal"
        :title="resultTitle"
        description="Ringkasan hasil proses import data massal, termasuk jumlah data berhasil dan gagal."
        size="lg"
    >
        <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <p class="text-2xl font-bold text-green-600">{{ result?.success || 0 }}</p>
                    <p class="text-sm text-green-700">Berhasil</p>
                </div>
                <div class="bg-red-50 rounded-lg p-4 text-center">
                    <p class="text-2xl font-bold text-red-600">{{ result?.failed || 0 }}</p>
                    <p class="text-sm text-red-700">Gagal</p>
                </div>
            </div>

            <div v-if="result?.imported?.length > 0" class="space-y-2">
                <h4 class="text-sm font-medium text-slate-900">Data Berhasil Diimport:</h4>
                <div class="max-h-32 overflow-y-auto bg-slate-50 rounded-lg p-2 text-xs">
                    <div v-for="(item, idx) in result.imported" :key="idx" class="py-1">
                        {{ item.identifier }} - {{ item.name }}
                        <span v-if="item.defaultPassword" class="text-slate-500">(Password: {{ item.defaultPassword }})</span>
                    </div>
                </div>
            </div>

            <div v-if="result?.errors?.length > 0" class="space-y-2">
                <h4 class="text-sm font-medium text-red-600">Error:</h4>
                <div class="max-h-32 overflow-y-auto bg-red-50 rounded-lg p-2 text-xs">
                    <div v-for="(err, idx) in result.errors" :key="idx" class="py-1 text-red-700">
                        {{ err }}
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end">
                <UButton color="primary" @click="showResultModal = false">Tutup</UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
    imported?: Array<{
        identifier: string;
        name: string;
        defaultPassword?: string;
    }>;
}

interface Props {
    entityName: string;
    selectedCount?: number;
    warningMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    selectedCount: 0,
    warningMessage: '',
});

const emit = defineEmits<{
    (e: 'import', data: any[]): Promise<ImportResult>;
    (e: 'export-all'): void;
    (e: 'export-selected'): void;
    (e: 'download-template'): void;
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const fileName = ref('');
const uploading = ref(false);
const showMenu = ref(true);
const showResultModal = ref(false);
const result = ref<ImportResult | null>(null);
const resultTitle = computed(() => `Hasil Import ${props.entityName}`);

const uploadMode = ref('append');
const uploadOptions = [
    { label: 'Tambah Data (Append)', value: 'append' },
    { label: 'Ganti Semua Data (Replace)', value: 'replace' }
];

function triggerFileInput() {
    fileInput.value?.click();
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        fileName.value = target.files[0].name;
    }
}

async function handleUpload() {
    if (!file.value) return;

    uploading.value = true;

    try {
        // Parse Excel file
        const data = await parseExcelFile(file.value);

        if (data.length === 0) {
            toast.add({
                title: 'Data Kosong',
                description: 'Tidak ada data valid dalam file',
                color: 'error'
            });
            return;
        }

        // Emit import event with parsed data
        const importResult = await emit('import', data);

        result.value = importResult;
        showResultModal.value = true;

        if (importResult.success > 0) {
            toast.add({
                title: 'Berhasil',
                description: `${importResult.success} ${props.entityName.toLowerCase()} berhasil diimport`,
                color: 'success'
            });
            
            // Reset file
            file.value = null;
            fileName.value = '';
            if (fileInput.value) fileInput.value.value = '';
        }
    } catch (err: any) {
        console.error('[MassUpload] Error:', err);
        toast.add({
            title: 'Error',
            description: err.message || 'Terjadi kesalahan saat import',
            color: 'error'
        });
    } finally {
        uploading.value = false;
    }
}

async function parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);
                resolve(rows);
            } catch (err) {
                reject(new Error('Gagal membaca file. Pastikan format file benar.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
        };

        reader.readAsArrayBuffer(file);
    });
}

function downloadTemplate() {
    emit('download-template');
}
</script>
