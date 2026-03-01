<template>
    <div class="space-y-4">
        <!-- Info Banner -->
        <div
            class="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-200"
        >
            <div class="flex items-start gap-4">
                <div
                    class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                >
                    <Icon name="lucide:briefcase" class="w-7 h-7 text-white" />
                </div>
                <div class="flex-1">
                    <h2 class="text-xl font-bold mb-1">Ajukan Tempat PKL</h2>
                    <p class="text-sky-100 text-sm">
                        Pilih perusahaan mitra sekolah atau ajukan perusahaan
                        pilihanmu sendiri untuk tempat PKL.
                    </p>
                </div>
            </div>
        </div>

        <!-- Stepper -->
        <div
            class="flex items-center justify-center gap-2 bg-white rounded-xl border border-slate-200 p-4 overflow-x-auto"
        >
            <template
                v-for="(s, i) in [
                    'Pilih Jalur',
                    'Pilih Perusahaan',
                    'Konfirmasi',
                ]"
                :key="i"
            >
                <div class="flex items-center gap-2 shrink-0">
                    <div
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                        :class="
                            step > i
                                ? 'bg-emerald-500 text-white'
                                : step === i
                                  ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                                  : 'bg-slate-200 text-slate-500'
                        "
                    >
                        <Icon
                            v-if="step > i"
                            name="lucide:check"
                            class="w-4 h-4"
                        />
                        <span v-else>{{ i + 1 }}</span>
                    </div>
                    <span
                        class="text-xs sm:text-sm font-medium hidden sm:inline"
                        :class="step >= i ? 'text-slate-900' : 'text-slate-400'"
                        >{{ s }}</span
                    >
                </div>
                <div
                    v-if="i < 2"
                    class="w-6 sm:w-10 h-0.5 shrink-0 transition-all"
                    :class="step > i ? 'bg-emerald-500' : 'bg-slate-200'"
                />
            </template>
        </div>

        <!-- Step 0: Pilih Jalur -->
        <div v-if="step === 0" class="grid sm:grid-cols-2 gap-4">
            <div
                class="group bg-white rounded-2xl border-2 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                :class="
                    mode === 'mitra'
                        ? 'border-sky-500 bg-sky-50/50 shadow-md'
                        : 'border-slate-200 hover:border-sky-300'
                "
                @click="$emit('select-mode', 'mitra')"
            >
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                >
                    <Icon
                        name="lucide:building-2"
                        class="w-7 h-7 text-sky-600"
                    />
                </div>
                <h3 class="font-semibold text-slate-900 text-lg mb-1">
                    Mitra Sekolah
                </h3>
                <p class="text-sm text-slate-500">
                    Pilih dari daftar perusahaan yang sudah bekerja sama dengan
                    sekolah
                </p>
                <div
                    class="mt-4 flex items-center gap-2 text-xs text-sky-600 font-medium"
                >
                    <Icon name="lucide:check-circle" class="w-4 h-4" />
                    <span>Terverifikasi & Terpercaya</span>
                </div>
            </div>
            <div
                class="group bg-white rounded-2xl border-2 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                :class="
                    mode === 'mandiri'
                        ? 'border-amber-500 bg-amber-50/50 shadow-md'
                        : 'border-slate-200 hover:border-amber-300'
                "
                @click="$emit('select-mode', 'mandiri')"
            >
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                >
                    <Icon name="lucide:user" class="w-7 h-7 text-amber-600" />
                </div>
                <h3 class="font-semibold text-slate-900 text-lg mb-1">
                    Mandiri
                </h3>
                <p class="text-sm text-slate-500">
                    Ajukan perusahaan pilihanmu sendiri untuk tempat PKL
                </p>
                <div
                    class="mt-4 flex items-center gap-2 text-xs text-amber-600 font-medium"
                >
                    <Icon name="lucide:edit" class="w-4 h-4" />
                    <span>Lebih Fleksibel</span>
                </div>
            </div>
        </div>

        <!-- Step 1: Pilih Perusahaan (Mitra) -->
        <div v-else-if="step === 1 && mode === 'mitra'" class="space-y-4">
            <!-- Search & Filter -->
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="flex flex-col sm:flex-row gap-3">
                    <UInput
                        :model-value="searchQuery"
                        @update:model-value="
                            $emit('update:searchQuery', $event)
                        "
                        placeholder="Cari nama perusahaan..."
                        class="flex-1"
                    >
                        <template #leading
                            ><Icon
                                name="lucide:search"
                                class="w-4 h-4 text-slate-400"
                        /></template>
                    </UInput>
                    <USelectMenu
                        :model-value="selectedField"
                        @update:model-value="
                            $emit('update:selectedField', $event)
                        "
                        :items="fieldOptions"
                        placeholder="Semua Bidang"
                        class="w-full sm:w-40"
                    />
                </div>
            </div>

            <!-- Company List -->
            <div
                v-if="loading"
                class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
                <USkeleton v-for="i in 6" :key="i" class="h-44 rounded-xl" />
            </div>
            <div
                v-else-if="filteredCompanies.length"
                class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
                <div
                    v-for="c in filteredCompanies"
                    :key="c.id"
                    class="group bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md"
                    :class="
                        selectedCompanyId === c.id
                            ? 'border-sky-500 bg-sky-50/50 shadow-md'
                            : c.isFull
                              ? 'border-slate-200 opacity-60'
                              : 'border-slate-200 hover:border-sky-300'
                    "
                    @click="!c.isFull && $emit('select-company', c.id)"
                >
                    <div class="flex items-start justify-between mb-2">
                        <div
                            class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"
                        >
                            <Icon
                                name="lucide:building"
                                class="w-5 h-5 text-slate-600"
                            />
                        </div>
                        <UBadge
                            v-if="c.isFull"
                            color="error"
                            variant="subtle"
                            size="xs"
                            >Kuota Penuh</UBadge
                        >
                        <div
                            v-else-if="selectedCompanyId === c.id"
                            class="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center"
                        >
                            <Icon
                                name="lucide:check"
                                class="w-3 h-3 text-white"
                            />
                        </div>
                    </div>
                    <h4
                        class="font-semibold text-slate-900 text-sm mb-1 line-clamp-1"
                    >
                        {{ c.name }}
                    </h4>
                    <p class="text-xs text-slate-500 mb-2 line-clamp-1">
                        {{ c.address }}
                    </p>
                    <div class="flex items-center gap-1 mb-2">
                        <UBadge color="neutral" variant="soft" size="xs">{{
                            c.field
                        }}</UBadge>
                    </div>
                    <div class="flex justify-between text-xs mb-1">
                        <span class="text-slate-500">Kuota</span>
                        <span
                            :class="
                                c.isFull
                                    ? 'text-red-600 font-medium'
                                    : 'text-emerald-600 font-medium'
                            "
                        >
                            {{ c.applied }}/{{ c.quota }}
                        </span>
                    </div>
                    <div
                        class="h-1.5 bg-slate-100 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full rounded-full transition-all"
                            :class="c.isFull ? 'bg-red-500' : 'bg-emerald-500'"
                            :style="{
                                width: `${Math.min((c.applied / c.quota) * 100, 100)}%`,
                            }"
                        />
                    </div>
                </div>
            </div>
            <div
                v-else
                class="bg-white rounded-xl border border-slate-200 py-12 text-center"
            >
                <Icon
                    name="lucide:search-x"
                    class="w-12 h-12 text-slate-300 mx-auto mb-3"
                />
                <p class="text-slate-500">
                    Tidak ada perusahaan yang ditemukan
                </p>
                <UButton
                    variant="ghost"
                    color="neutral"
                    class="mt-3"
                    @click="$emit('reset-filter')"
                >
                    <Icon name="lucide:rotate-ccw" class="w-4 h-4 mr-2" />
                    Reset Filter
                </UButton>
            </div>
        </div>

        <!-- Step 1: Form Perusahaan Mandiri -->
        <div
            v-else-if="step === 1 && mode === 'mandiri'"
            class="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
            <div class="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900">Data Perusahaan</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                    Isi data lengkap perusahaan tempat Anda akan PKL
                </p>
            </div>
            <div class="p-5">
                <div class="grid gap-4">
                    <UFormField label="Nama Perusahaan" required>
                        <UInput
                            :model-value="formData.nama_perusahaan"
                            @update:model-value="
                                $emit('update:formData', {
                                    ...formData,
                                    nama_perusahaan: $event,
                                })
                            "
                            placeholder="PT. Contoh Indonesia"
                            size="lg"
                        />
                    </UFormField>
                    <UFormField label="Alamat Lengkap" required>
                        <UTextarea
                            :model-value="formData.alamat"
                            @update:model-value="
                                $emit('update:formData', {
                                    ...formData,
                                    alamat: $event,
                                })
                            "
                            placeholder="Jl. Contoh No. 123, Kota..."
                            :rows="2"
                        />
                    </UFormField>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <UFormField label="Bidang Usaha" required>
                            <USelectMenu
                                :model-value="formData.bidang_usaha"
                                @update:model-value="
                                    $emit('update:formData', {
                                        ...formData,
                                        bidang_usaha: $event,
                                    })
                                "
                                :items="fieldOptions"
                                placeholder="Pilih bidang"
                            />
                        </UFormField>
                        <UFormField label="Kota/Kabupaten" required>
                            <UInput
                                :model-value="formData.kota"
                                @update:model-value="
                                    $emit('update:formData', {
                                        ...formData,
                                        kota: $event,
                                    })
                                "
                                placeholder="Contoh: Jakarta Selatan"
                            />
                        </UFormField>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <UFormField label="Nama Contact Person" required>
                            <UInput
                                :model-value="formData.nama_pic"
                                @update:model-value="
                                    $emit('update:formData', {
                                        ...formData,
                                        nama_pic: $event,
                                    })
                                "
                                placeholder="Nama HRD/PIC"
                            />
                        </UFormField>
                        <UFormField label="No. HP/WA" required>
                            <UInput
                                :model-value="formData.no_hp_pic"
                                @update:model-value="
                                    $emit('update:formData', {
                                        ...formData,
                                        no_hp_pic: $event,
                                    })
                                "
                                type="tel"
                                placeholder="08xxxxxxxxxx"
                            />
                        </UFormField>
                    </div>
                    <UFormField
                        label="Upload Dokumen Pendukung (Surat Balasan)"
                        required
                    >
                        <div
                            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                            :class="
                                formData.dokumen_pendukung
                                    ? 'border-emerald-300 bg-emerald-50'
                                    : 'border-slate-200 hover:border-sky-400 hover:bg-sky-50'
                            "
                            @click="$emit('trigger-upload')"
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                class="hidden"
                                accept=".pdf,image/*"
                                @change="$emit('file-change', $event)"
                            />
                            <Icon
                                :name="
                                    formData.dokumen_pendukung
                                        ? 'lucide:file-check'
                                        : 'lucide:upload-cloud'
                                "
                                class="w-10 h-10 mx-auto mb-2"
                                :class="
                                    formData.dokumen_pendukung
                                        ? 'text-emerald-500'
                                        : 'text-slate-400'
                                "
                            />
                            <p
                                class="text-sm font-medium"
                                :class="
                                    formData.dokumen_pendukung
                                        ? 'text-emerald-700'
                                        : 'text-slate-700'
                                "
                            >
                                {{
                                    formData.dokumen_pendukung ||
                                    "Klik untuk upload dokumen"
                                }}
                            </p>
                            <p class="text-xs text-slate-500 mt-1">
                                PDF, JPG, PNG (max 5MB)
                            </p>
                        </div>
                    </UFormField>
                </div>
            </div>
        </div>

        <!-- Step 2: Konfirmasi -->
        <div
            v-else-if="step === 2"
            class="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
            <div class="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 class="font-semibold text-slate-900">
                    Konfirmasi Pengajuan
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                    Pastikan data yang Anda masukkan sudah benar
                </p>
            </div>
            <div class="p-5 space-y-3">
                <!-- Mitra Mode Summary -->
                <template v-if="mode === 'mitra' && selectedCompanyData">
                    <div class="grid sm:grid-cols-2 gap-3">
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Perusahaan
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ selectedCompanyData.name }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">Alamat</p>
                            <p
                                class="font-medium text-slate-900 text-sm truncate"
                            >
                                {{ selectedCompanyData.address }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Bidang Usaha
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ selectedCompanyData.field }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Jalur Pengajuan
                            </p>
                            <p class="font-medium text-slate-900">
                                Mitra Sekolah
                            </p>
                        </div>
                    </div>
                </template>
                <!-- Mandiri Mode Summary -->
                <template v-else>
                    <div class="grid sm:grid-cols-2 gap-3">
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Nama Perusahaan
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ formData.nama_perusahaan }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">Alamat</p>
                            <p
                                class="font-medium text-slate-900 text-sm truncate"
                            >
                                {{ formData.alamat }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Bidang Usaha
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ formData.bidang_usaha }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Kota/Kabupaten
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ formData.kota }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">
                                Contact Person
                            </p>
                            <p class="font-medium text-slate-900">
                                {{ formData.nama_pic }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl">
                            <p class="text-xs text-slate-500 mb-1">No. HP/WA</p>
                            <p class="font-medium text-slate-900">
                                {{ formData.no_hp_pic }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl sm:col-span-2">
                            <p class="text-xs text-slate-500 mb-1">
                                Jalur Pengajuan
                            </p>
                            <p class="font-medium text-slate-900">
                                Mandiri (Perusahaan Sendiri)
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="formData.dokumen_pendukung"
                        class="p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                    >
                        <div class="flex items-center gap-2">
                            <Icon
                                name="lucide:file-check"
                                class="w-5 h-5 text-emerald-600"
                            />
                            <div>
                                <p class="text-xs text-emerald-600">
                                    Dokumen Pendukung
                                </p>
                                <p class="text-sm font-medium text-emerald-900">
                                    {{ formData.dokumen_pendukung }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Warning Box -->
                <div
                    class="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3"
                >
                    <Icon
                        name="lucide:alert-triangle"
                        class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                        <p class="text-sm font-medium text-amber-900">
                            Perhatian
                        </p>
                        <p class="text-sm text-amber-700 mt-1">
                            Pastikan data yang Anda masukkan sudah benar.
                            Setelah dikirim, pengajuan akan melalui proses
                            verifikasi oleh admin.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center">
            <UButton
                v-if="step > 0"
                variant="outline"
                color="neutral"
                size="lg"
                @click="$emit('prev-step')"
            >
                <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
                Kembali
            </UButton>
            <div v-else class="w-32" />

            <UButton
                v-if="step < 2"
                color="primary"
                size="lg"
                :disabled="!canProceed"
                @click="$emit('next-step')"
            >
                Lanjutkan
                <Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
            <UButton
                v-else
                color="primary"
                size="lg"
                :loading="submitting"
                @click="$emit('submit')"
            >
                <Icon name="lucide:send" class="w-4 h-4 mr-2" />
                Kirim Pengajuan
            </UButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CompanyOption, MandiriFormData } from "./types";

interface Props {
    step: number;
    mode: "mitra" | "mandiri";
    searchQuery: string;
    selectedField: string | null;
    selectedCompanyId: number | string | null;
    loading: boolean;
    submitting: boolean;
    companies: CompanyOption[];
    formData: MandiriFormData;
    fieldOptions: string[];
    canProceed: boolean;
}

const props = defineProps<Props>();

defineEmits<{
    "select-mode": [mode: "mitra" | "mandiri"];
    "select-company": [id: number | string];
    "update:searchQuery": [value: string];
    "update:selectedField": [value: string | null];
    "update:formData": [value: MandiriFormData];
    "reset-filter": [];
    "trigger-upload": [];
    "file-change": [event: any];
    "prev-step": [];
    "next-step": [];
    submit: [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const filteredCompanies = computed(() => {
    return props.companies.filter((c) => {
        const matchSearch =
            !props.searchQuery ||
            c.name.toLowerCase().includes(props.searchQuery.toLowerCase());
        const matchField =
            !props.selectedField || c.field === props.selectedField;
        return matchSearch && matchField;
    });
});

const selectedCompanyData = computed(() => {
    return props.companies.find((c) => c.id === props.selectedCompanyId);
});
</script>
