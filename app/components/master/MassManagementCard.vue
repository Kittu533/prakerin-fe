<template>
    <UCard
        :ui="{
            body: { padding: 'p-0' },
            header: { padding: 'p-0' },
            rounded: 'rounded-xl',
            divide: 'divide-y divide-slate-200',
        }"
        class="overflow-hidden border-slate-200"
    >
        <template #header>
            <button
                class="w-full px-4 py-3 flex items-center justify-between bg-blue-50/50 hover:bg-blue-50 transition-colors group"
                @click="isOpen = !isOpen"
            >
                <div class="flex items-center gap-2">
                    <Icon
                        name="i-heroicons-cloud-arrow-up"
                        class="w-5 h-5 text-blue-600"
                    />
                    <span class="font-semibold text-blue-900"
                        >Menu Unggah dan Back Up Data Massal</span
                    >
                </div>
                <Icon
                    name="i-heroicons-chevron-up"
                    class="w-5 h-5 text-blue-400 transition-transform duration-200"
                    :class="{ 'rotate-180': !isOpen }"
                />
            </button>
        </template>

        <div v-show="isOpen" class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- 1. Menu Unduh -->
                <div class="space-y-4">
                    <div
                        class="flex items-center gap-2 text-slate-900 font-bold"
                    >
                        <Icon
                            name="i-heroicons-arrow-down-tray"
                            class="w-5 h-5"
                        />
                        <span>1. Menu Unduh</span>
                    </div>
                    <p class="text-sm text-slate-500">
                        Unduh template atau data eksisting untuk keperluan
                        laporan/backup.
                    </p>
                    <div class="space-y-2">
                        <UButton
                            block
                            variant="outline"
                            color="neutral"
                            class="justify-center border-blue-200 text-blue-600 hover:bg-blue-50 py-2.5"
                            @click="handleDownloadTemplate"
                        >
                            <Icon
                                name="i-heroicons-document-text"
                                class="w-4 h-4 mr-2"
                            />
                            Unduh Template Kosong
                        </UButton>
                        <UButton
                            block
                            color="success"
                            class="justify-center py-2.5 bg-emerald-600 hover:bg-emerald-700"
                            @click="$emit('export-filtered')"
                        >
                            <Icon
                                name="i-heroicons-funnel"
                                class="w-4 h-4 mr-2"
                            />
                            Unduh Data Terpilih (Hasil Filter)
                        </UButton>
                        <UButton
                            block
                            color="neutral"
                            class="justify-center py-2.5 bg-slate-800 hover:bg-slate-900 text-white"
                            @click="$emit('export-all')"
                        >
                            <Icon
                                name="i-heroicons-circle-stack"
                                class="w-4 h-4 mr-2"
                            />
                            Unduh Semua Data (Backup)
                        </UButton>
                    </div>
                </div>

                <!-- 2. Unggah Data -->
                <div class="space-y-4">
                    <div
                        class="flex items-center gap-2 text-slate-900 font-bold"
                    >
                        <Icon
                            name="i-heroicons-cloud-arrow-up"
                            class="w-5 h-5"
                        />
                        <span>2. Unggah Data</span>
                    </div>
                    <div class="flex gap-2">
                        <input
                            ref="fileInput"
                            type="file"
                            class="hidden"
                            accept=".xlsx, .xls"
                            @change="handleFileChange"
                        />
                        <div
                            class="flex-1 border border-slate-200 rounded-lg flex items-center h-11 px-3 bg-white hover:border-blue-400 transition-colors cursor-pointer group"
                            @click="fileInput?.click()"
                        >
                            <span
                                class="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 group-hover:bg-slate-200"
                                >Choose file</span
                            >
                            <span
                                class="ml-4 text-sm text-slate-400 italic truncate max-w-[200px]"
                            >
                                {{
                                    selectedFile
                                        ? selectedFile.name
                                        : "No file chosen"
                                }}
                            </span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <USelectMenu
                            v-model="uploadMode"
                            :options="uploadOptions"
                            value-attribute="value"
                            option-attribute="label"
                            class="flex-1"
                            :ui="{
                                base: 'h-11',
                                rounded: 'rounded-lg',
                            }"
                        >
                            <template #leading>
                                <Icon
                                    name="i-heroicons-plus"
                                    class="w-4 h-4 text-indigo-600"
                                />
                            </template>
                        </USelectMenu>
                        <UButton
                            color="primary"
                            class="px-6 h-11 bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-tight shadow-md shadow-blue-200"
                            :loading="loading"
                            :disabled="!selectedFile"
                            @click="handleUpload"
                        >
                            <Icon
                                v-if="!loading"
                                name="i-heroicons-cloud-arrow-up"
                                class="w-4 h-4 mr-2"
                            />
                            MULAI UNGGAH
                        </UButton>
                    </div>
                    <div
                        class="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg"
                    >
                        <p class="text-xs text-red-600 leading-relaxed">
                            <span class="font-bold">Peringatan:</span> Mode
                            "Ganti Semua" akan menghapus seluruh data
                            {{ entityName.toLowerCase() }} yang ada di Spreadsheet saat ini!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
interface Props {
    templateUrl?: string;
    entityName: string;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    templateUrl: '',
    loading: false
});

const emit = defineEmits<{
    (e: 'upload', file: File, mode: 'append' | 'replace'): void;
    (e: 'export-filtered'): void;
    (e: 'export-all'): void;
    (e: 'download-template'): void;
}>();

const isOpen = ref(true);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const uploadMode = ref<'append' | 'replace'>('append');

const uploadOptions = [
    { label: "Tambah Data (Append)", value: "append" },
    { label: "Ganti Semua Data (Replace)", value: "replace" }
];

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
    }
}

function handleUpload() {
    if (!selectedFile.value) return;
    emit('upload', selectedFile.value, uploadMode.value);
}

function handleDownloadTemplate() {
    // Check for custom listener in vnode props (CamelCase and kebab-case)
    const vnodeProps = getCurrentInstance()?.vnode.props;
    const hasDownloadListener = !!(vnodeProps?.onDownloadTemplate || vnodeProps?.['onDownload-template']);

    if (hasDownloadListener) {
        emit('download-template');
    } else if (props.templateUrl) {
        window.open(props.templateUrl, '_blank');
    } else {
        // Fallback to emit if no templateUrl provided
        emit('download-template');
    }
}

// Method to reset the file input after successful upload
function reset() {
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
}

defineExpose({ reset });
</script>
