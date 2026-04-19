<script setup lang="ts">
import { useMasterCompanyCreatePage } from "../../../../composables/pages/admin/use-master-company-create-page";

definePageMeta({ layout: "admin" });

const {
    submitting,
    isMapInitialized,
    isFetchingAddress,
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    searchInputRef,
    mapContainer,
    form,
    fullAddress,
    selectSearchResult,
    clearSearch,
    getCurrentLocation,
    handleSubmit,
    handleCancel,
} = useMasterCompanyCreatePage();
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="lucide:arrow-left"
                class="shrink-0"
                @click="handleCancel"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Tambah Perusahaan
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Tambah data perusahaan mitra baru
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Informasi Perusahaan -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Informasi Perusahaan
                        </h3>
                    </div>

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <!-- Nama Perusahaan -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Nama Perusahaan
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="form.nama_perusahaan"
                                placeholder="PT. Contoh Indonesia"
                                size="lg"
                                class="w-full"
                                required
                            />
                        </div>

                        <!-- Email & No HP -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email
                                </label>
                                <UInput
                                    v-model="form.email"
                                    type="email"
                                    placeholder="info@company.com"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    No. HP
                                </label>
                                <UInput
                                    v-model="form.no_hp"
                                    type="tel"
                                    placeholder="08xxx"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Bidang Usaha & Kapasitas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Bidang Usaha
                                </label>
                                <UInput
                                    v-model="form.bidang_usaha"
                                    placeholder="IT & Software"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kapasitas Siswa
                                </label>
                                <UInput
                                    v-model.number="form.kapasitas_siswa"
                                    type="number"
                                    min="1"
                                    placeholder="10"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Alamat Lengkap -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Alamat Lengkap
                        </h3>
                        <UBadge
                            v-if="isFetchingAddress"
                            color="neutral"
                            variant="subtle"
                            size="sm"
                        >
                            <Icon
                                name="lucide:loader-2"
                                class="w-3 h-3 mr-1 animate-spin"
                            />
                            Mengambil alamat...
                        </UBadge>
                    </div>

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <!-- Provinsi & Kabupaten/Kota -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Provinsi
                                </label>
                                <UInput
                                    v-model="form.provinsi"
                                    placeholder="Jawa Barat"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kabupaten/Kota
                                </label>
                                <UInput
                                    v-model="form.kabupaten_kota"
                                    placeholder="Bandung"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Kecamatan & Kelurahan -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kecamatan
                                </label>
                                <UInput
                                    v-model="form.kecamatan"
                                    placeholder="Coblong"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kelurahan/Desa
                                </label>
                                <UInput
                                    v-model="form.kelurahan"
                                    placeholder="Dago"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Jalan & Kode Pos -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-2">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Nama Jalan
                                </label>
                                <UInput
                                    v-model="form.jalan"
                                    placeholder="Jl. Ir. H. Juanda No. 123"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kode Pos
                                </label>
                                <UInput
                                    v-model="form.kode_pos"
                                    placeholder="40135"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Preview Alamat Lengkap -->
                        <div
                            v-if="fullAddress"
                            class="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                            <p class="text-xs text-slate-500 mb-1">
                                Preview Alamat Lengkap
                            </p>
                            <p class="text-sm font-medium text-slate-900">
                                {{ fullAddress }}
                            </p>
                        </div>
                    </form>
                </div>

                <!-- Lokasi Peta -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Lokasi di Peta
                        </h3>
                        <UButton
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="getCurrentLocation"
                        >
                            <Icon
                                name="lucide:crosshair"
                                class="w-3 h-3 mr-1"
                            />
                            Lokasi Saya
                        </UButton>
                    </div>

                    <div class="p-5 space-y-4">
                        <p class="text-sm text-slate-500">
                            Klik pada peta untuk menentukan lokasi dan mengisi
                            alamat otomatis, atau cari lokasi by name
                        </p>

                        <!-- Search Input -->
                        <div class="relative" ref="searchInputRef">
                            <div class="relative">
                                <UInput
                                    v-model="searchQuery"
                                    placeholder="Cari lokasi (contoh: UTY, Universitas Teknologi Yogyakarta)"
                                    size="lg"
                                    class="w-full pr-10"
                                >
                                    <template #trailing>
                                        <button
                                            v-if="searchQuery"
                                            @click="clearSearch"
                                            class="p-1 hover:bg-slate-100 rounded"
                                        >
                                            <Icon
                                                name="lucide:x"
                                                class="w-4 h-4 text-slate-400"
                                            />
                                        </button>
                                        <Icon
                                            v-else
                                            name="lucide:search"
                                            class="w-4 h-4 text-slate-400"
                                        />
                                    </template>
                                </UInput>
                                <div
                                    v-if="isSearching"
                                    class="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <Icon
                                        name="lucide:loader-2"
                                        class="w-4 h-4 text-slate-400 animate-spin"
                                    />
                                </div>
                            </div>

                            <!-- Search Results Dropdown -->
                            <div
                                v-if="
                                    showSearchResults &&
                                    searchResults.length > 0
                                "
                                class="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg max-h-64 overflow-y-auto"
                            >
                                <div
                                    v-for="result in searchResults"
                                    :key="result.place_id"
                                    @click="selectSearchResult(result)"
                                    class="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 truncate"
                                    >
                                        {{ result.display_name.split(",")[0] }}
                                    </p>
                                    <p
                                        class="text-xs text-slate-500 truncate mt-0.5"
                                    >
                                        {{ result.display_name }}
                                    </p>
                                </div>
                            </div>

                            <!-- No Results -->
                            <div
                                v-if="
                                    showSearchResults &&
                                    searchResults.length === 0 &&
                                    !isSearching
                                "
                                class="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg p-3"
                            >
                                <p class="text-sm text-slate-500 text-center">
                                    Tidak ada hasil ditemukan
                                </p>
                            </div>
                        </div>

                        <div class="relative">
                            <!-- Map container - always in DOM -->
                            <div
                                ref="mapContainer"
                                class="h-64 w-full rounded-lg overflow-hidden border border-slate-200 z-0"
                            ></div>
                            <!-- Loading overlay -->
                            <div
                                v-if="!isMapInitialized"
                                class="absolute inset-0 h-64 w-full rounded-lg bg-slate-100 flex items-center justify-center"
                            >
                                <div class="text-center text-slate-400">
                                    <Icon
                                        name="lucide:map"
                                        class="w-8 h-8 mx-auto mb-2"
                                    />
                                    <p class="text-sm">Memuat peta...</p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg"
                        >
                            <div>
                                <p class="text-xs text-slate-500 mb-1">
                                    Latitude
                                </p>
                                <p
                                    class="text-sm font-mono font-medium text-slate-900"
                                >
                                    {{ form.latitude || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 mb-1">
                                    Longitude
                                </p>
                                <p
                                    class="text-sm font-mono font-medium text-slate-900"
                                >
                                    {{ form.longitude || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-1">
                <div
                    class="bg-blue-50 border border-blue-200 rounded-xl p-4 sticky top-6"
                >
                    <div class="flex gap-3">
                        <Icon
                            name="lucide:info"
                            class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        />
                        <div class="text-sm text-blue-900">
                            <p class="font-semibold mb-2">Informasi:</p>
                            <ul class="space-y-1.5">
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:search"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Cari lokasi dengan mengetik nama tempat
                                        (contoh: UTY, Malioboro)</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:map-pin"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Klik pada peta untuk menentukan lokasi
                                        dan mengisi alamat otomatis</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:crosshair"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Gunakan tombol "Lokasi Saya" untuk
                                        mendeteksi lokasi otomatis</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:edit"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Data alamat dapat diedit secara
                                        manual</span
                                    >
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div
            class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200"
        >
            <UButton
                variant="outline"
                color="neutral"
                size="lg"
                @click="handleCancel"
            >
                Batal
            </UButton>
            <UButton
                color="primary"
                size="lg"
                :loading="submitting"
                @click="handleSubmit"
            >
                <Icon name="lucide:check" class="w-4 h-4" />
                Simpan Perusahaan
            </UButton>
        </div>
    </div>
</template>

<style>
/* Fix z-index for Leaflet */
.leaflet-pane {
    z-index: 10 !important;
}
.leaflet-top {
    z-index: 20 !important;
}
</style>
