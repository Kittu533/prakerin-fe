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
                    'Detail Perusahaan',
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
            <!-- Mitra Sekolah Card -->
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
                <p class="text-sm text-slate-500 mb-4">
                    Pilih dari daftar perusahaan yang sudah bekerja sama dengan
                    sekolah
                </p>
                <div class="space-y-2">
                    <div
                        class="flex items-center gap-2 text-xs text-sky-600 font-medium"
                    >
                        <Icon name="lucide:check-circle" class="w-4 h-4" />
                        <span>Terverifikasi & Terpercaya</span>
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs text-sky-600 font-medium"
                    >
                        <Icon name="lucide:shield-check" class="w-4 h-4" />
                        <span>Proses Lebih Cepat</span>
                    </div>
                </div>
            </div>

            <!-- Mandiri Card -->
            <div
                class="group bg-white rounded-2xl border-2 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
                :class="
                    mode === 'mandiri'
                        ? 'border-amber-500 bg-amber-50/50 shadow-md'
                        : 'border-slate-200 hover:border-amber-300'
                "
                @click="$emit('select-mode', 'mandiri')"
            >
                <!-- Badge -->
                <div
                    class="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full"
                >
                    Popular
                </div>
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                >
                    <Icon name="lucide:user" class="w-7 h-7 text-amber-600" />
                </div>
                <h3 class="font-semibold text-slate-900 text-lg mb-1">
                    Mandiri
                </h3>
                <p class="text-sm text-slate-500 mb-4">
                    Ajukan perusahaan pilihanmu sendiri untuk tempat PKL
                </p>
                <div class="space-y-2">
                    <div
                        class="flex items-center gap-2 text-xs text-amber-600 font-medium"
                    >
                        <Icon name="lucide:edit" class="w-4 h-4" />
                        <span>Lebih Fleksibel</span>
                    </div>
                    <div
                        class="flex items-center gap-2 text-xs text-amber-600 font-medium"
                    >
                        <Icon name="lucide:map-pin" class="w-4 h-4" />
                        <span>Lokasi Sesuai Keinginan</span>
                    </div>
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
            class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
        >
            <!-- Form Header -->
            <div
                class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:building-2"
                            class="w-6 h-6 text-white"
                        />
                    </div>
                    <div class="text-white">
                        <h3 class="font-semibold text-lg">Data Perusahaan</h3>
                        <p class="text-amber-100 text-sm">
                            Isi data lengkap perusahaan tempat Anda akan PKL
                        </p>
                    </div>
                </div>
            </div>

            <!-- Progress Indicator -->
            <div class="px-6 py-4 border-b border-slate-100">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">
                        Kelengkapan Data
                    </span>
                    <span class="text-sm font-bold" :class="getProgressColor()">
                        {{ formProgress }}%
                    </span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="getProgressColor().replace('text-', 'bg-')"
                        :style="{ width: `${formProgress}%` }"
                    />
                </div>
            </div>

            <!-- Form Fields -->
            <div class="p-6 space-y-5">
                <!-- Nama Perusahaan -->
                <div class="space-y-2">
                    <label
                        class="flex items-center gap-2 text-sm font-medium text-slate-700"
                    >
                        <span
                            class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold"
                            >1</span
                        >
                        Nama Perusahaan
                        <span class="text-red-500">*</span>
                    </label>
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
                        class="w-full"
                        :color="
                            formData.nama_perusahaan ? 'primary' : undefined
                        "
                    />
                    <p class="text-xs text-slate-500">
                        Gunakan nama lengkap dengan PT/CV/F aktor (jika ada)
                    </p>
                </div>

                <!-- Alamat Lengkap -->
                <div class="space-y-2">
                    <label
                        class="flex items-center gap-2 text-sm font-medium text-slate-700"
                    >
                        <span
                            class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold"
                            >2</span
                        >
                        Alamat Lengkap
                        <span class="text-red-500">*</span>
                    </label>
                    <UTextarea
                        :model-value="formData.alamat"
                        @update:model-value="
                            $emit('update:formData', {
                                ...formData,
                                alamat: $event,
                            })
                        "
                        placeholder="Jl. Contoh No. 123, Kecamatan, Kota/Kabupaten, Provinsi"
                        :rows="3"
                        size="lg"
                        class="w-full"
                        :color="
                            formData.alamat?.length >= 20
                                ? 'primary'
                                : undefined
                        "
                    />
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-500">
                            Minimal 20 karakter
                        </p>
                        <UBadge
                            :color="
                                formData.alamat?.length >= 20
                                    ? 'success'
                                    : 'neutral'
                            "
                            variant="subtle"
                            size="xs"
                        >
                            {{ formData.alamat?.length || 0 }}/20
                        </UBadge>
                    </div>
                </div>

                <!-- Bidang Usaha & Kota -->
                <div class="grid sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                            <span
                                class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold"
                                >3</span
                            >
                            Bidang Usaha
                            <span class="text-red-500">*</span>
                        </label>
                        <USelectMenu
                            :model-value="formData.bidang_usaha"
                            @update:model-value="
                                $emit('update:formData', {
                                    ...formData,
                                    bidang_usaha: $event,
                                })
                            "
                            :items="fieldOptions"
                            placeholder="Pilih bidang usaha"
                            size="lg"
                            class="w-full"
                            :color="
                                formData.bidang_usaha ? 'primary' : undefined
                            "
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                            <span
                                class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold"
                                >4</span
                            >
                            Kota/Kabupaten
                            <span class="text-red-500">*</span>
                        </label>
                        <UInput
                            :model-value="formData.kota"
                            @update:model-value="
                                $emit('update:formData', {
                                    ...formData,
                                    kota: $event,
                                })
                            "
                            placeholder="Contoh: Jakarta Selatan"
                            size="lg"
                            class="w-full"
                            :color="formData.kota ? 'primary' : undefined"
                        />
                    </div>
                </div>

                <!-- Contact Person Section -->
                <div class="bg-slate-50 rounded-xl p-4 space-y-4">
                    <div class="flex items-center gap-2 mb-2">
                        <Icon
                            name="lucide:users"
                            class="w-4 h-4 text-slate-600"
                        />
                        <span class="text-sm font-semibold text-slate-700">
                            Contact Person di Perusahaan
                        </span>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-slate-700">
                                Nama PIC / HRD
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                :model-value="formData.nama_pic"
                                @update:model-value="
                                    $emit('update:formData', {
                                        ...formData,
                                        nama_pic: $event,
                                    })
                                "
                                placeholder="Nama lengkap PIC"
                                size="lg"
                                class="w-full"
                                :color="
                                    formData.nama_pic ? 'primary' : undefined
                                "
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-slate-700">
                                No. HP / WhatsApp
                                <span class="text-red-500">*</span>
                            </label>
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
                                size="lg"
                                class="w-full"
                                :color="
                                    formData.no_hp_pic ? 'primary' : undefined
                                "
                            />
                        </div>
                    </div>
                </div>

                <!-- Upload Dokumen -->
                <div class="space-y-2">
                    <label
                        class="flex items-center gap-2 text-sm font-medium text-slate-700"
                    >
                        <span
                            class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold"
                            >5</span
                        >
                        Dokumen Pendukung
                        <span class="text-xs text-slate-500 font-normal">
                            (Surat Balasan/Surat Terima)
                        </span>
                        <span class="text-red-500">*</span>
                    </label>
                    <div
                        class="border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200"
                        :class="
                            formData.dokumen_pendukung
                                ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                                : 'border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50'
                        "
                        @click="$emit('trigger-upload')"
                    >
                        <div class="text-center">
                            <div
                                class="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-colors"
                                :class="
                                    formData.dokumen_pendukung
                                        ? 'bg-emerald-100'
                                        : 'bg-slate-100'
                                "
                            >
                                <Icon
                                    :name="
                                        formData.dokumen_pendukung
                                            ? 'lucide:file-check'
                                            : 'lucide:upload-cloud'
                                    "
                                    class="w-8 h-8"
                                    :class="
                                        formData.dokumen_pendukung
                                            ? 'text-emerald-600'
                                            : 'text-slate-400'
                                    "
                                />
                            </div>
                            <p
                                class="text-sm font-medium mb-1"
                                :class="
                                    formData.dokumen_pendukung
                                        ? 'text-emerald-700'
                                        : 'text-slate-700'
                                "
                            >
                                {{
                                    formData.dokumen_pendukung ||
                                    "Klik untuk upload atau drag & drop"
                                }}
                            </p>
                            <p class="text-xs text-slate-500">
                                PDF, JPG, PNG (maksimal 5MB)
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="formData.dokumen_pendukung"
                        class="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200"
                    >
                        <div class="flex items-center gap-2">
                            <Icon
                                name="lucide:file-text"
                                class="w-4 h-4 text-emerald-600"
                            />
                            <span
                                class="text-sm text-emerald-700 truncate max-w-xs"
                            >
                                {{ formData.dokumen_pendukung }}
                            </span>
                        </div>
                        <UButton
                            variant="ghost"
                            color="error"
                            size="xs"
                            @click="
                                $emit('update:formData', {
                                    ...formData,
                                    dokumen_pendukung: '',
                                })
                            "
                        >
                            <Icon name="lucide:x" class="w-3 h-3" />
                        </UButton>
                    </div>
                </div>

                <!-- Tips Section -->
                <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div class="flex items-start gap-3">
                        <Icon
                            name="lucide:lightbulb"
                            class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        />
                        <div>
                            <p class="text-sm font-medium text-blue-900 mb-1">
                                Tips Pengajuan Mandiri
                            </p>
                            <ul class="text-xs text-blue-700 space-y-1">
                                <li class="flex items-start gap-2">
                                    <span class="text-blue-500">•</span>
                                    <span
                                        >Pastikan alamat perusahaan lengkap
                                        dengan RT/RW</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-blue-500">•</span>
                                    <span
                                        >Surat balasan perusahaan mempercepat
                                        proses verifikasi</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-blue-500">•</span>
                                    <span
                                        >Gunakan nomor HP/WA yang bisa dihubungi
                                        PIC</span
                                    >
                                </li>
                            </ul>
                        </div>
                    </div>
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
                    <div
                        class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 mb-4"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <div
                                class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
                            >
                                <Icon
                                    name="lucide:building-2"
                                    class="w-5 h-5 text-white"
                                />
                            </div>
                            <div>
                                <p class="text-xs text-amber-600 font-medium">
                                    Perusahaan Tujuan
                                </p>
                                <p class="text-lg font-bold text-amber-900">
                                    {{ formData.nama_perusahaan }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-3">
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
                        <div class="p-4 bg-slate-50 rounded-xl sm:col-span-2">
                            <p class="text-xs text-slate-500 mb-1">No. HP/WA</p>
                            <p class="font-medium text-slate-900">
                                {{ formData.no_hp_pic }}
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-xl sm:col-span-2">
                            <p class="text-xs text-slate-500 mb-1">
                                Jalur Pengajuan
                            </p>
                            <UBadge color="amber" variant="soft" size="md">
                                <Icon name="lucide:user" class="w-3 h-3 mr-1" />
                                Mandiri (Perusahaan Sendiri)
                            </UBadge>
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

// Form progress calculation
const formProgress = computed(() => {
    const fields = [
        props.formData.nama_perusahaan,
        props.formData.alamat,
        props.formData.bidang_usaha,
        props.formData.kota,
        props.formData.nama_pic,
        props.formData.no_hp_pic,
        props.formData.dokumen_pendukung,
    ];
    const filled = fields.filter((f) => f && f.toString().length > 0).length;
    return Math.round((filled / fields.length) * 100);
});

const getProgressColor = () => {
    if (formProgress.value === 100) return "text-emerald-600";
    if (formProgress.value >= 50) return "text-amber-600";
    return "text-slate-400";
};
</script>
