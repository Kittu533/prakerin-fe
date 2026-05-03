<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10">
        <!-- FORM INPUT SURAT KELUAR -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <div 
                class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                @click="isFormExpanded = !isFormExpanded"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-50 rounded-lg">
                        <Icon name="lucide:pen-tool" class="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Form Input Surat Keluar</h2>
                        <p class="text-xs text-slate-500 font-medium">Input data surat dan pilih jenis dokumen resmi yang akan digenerate</p>
                    </div>
                </div>
                <Icon 
                    :name="isFormExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                    class="w-5 h-5 text-slate-400" 
                />
            </div>

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
            >
                <div v-show="isFormExpanded" class="p-6 space-y-6">
                    <section class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Icon name="lucide:file-text" class="h-5 w-5 text-blue-600" />
                            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">Data Surat</h3>
                        </div>

                        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <UFormField label="Nomor Surat" required>
                                <div class="mt-1 flex gap-2">
                                    <UInput
                                        v-model="form.nomor_surat"
                                        placeholder="Contoh: 421.5/001/PKL/SMKN2WNG/V/2026"
                                        class="flex-1"
                                        icon="lucide:hash"
                                    />
                                    <UButton
                                        v-if="!isEditing"
                                        variant="soft"
                                        color="primary"
                                        :loading="generatingNomor"
                                        @click="fillNomorSurat"
                                    >
                                        Auto
                                    </UButton>
                                </div>
                            </UFormField>

                            <UFormField label="Tanggal Surat" required>
                                <UInput
                                    v-model="form.tanggal_surat"
                                    type="date"
                                    class="mt-1 w-full"
                                    icon="lucide:calendar"
                                />
                            </UFormField>

                            <UFormField
                                label="Jenis Dokumen Surat"
                                required
                                help="Menentukan format isi dan layout dokumen yang digenerate."
                            >
                                <USelect
                                    v-model="form.template_jenis"
                                    :items="templateJenisOptions"
                                    placeholder="-- Pilih Jenis Dokumen --"
                                    class="mt-1 w-full"
                                    icon="lucide:layout-template"
                                />
                            </UFormField>

                            <UFormField label="Klasifikasi Surat" required>
                                <USelect
                                    v-model="form.klasifikasi_surat"
                                    :items="klasifikasiOptions"
                                    placeholder="-- Pilih Klasifikasi --"
                                    class="mt-1 w-full"
                                    icon="lucide:tag"
                                />
                            </UFormField>

                            <UFormField label="Sifat Surat" required>
                                <USelect
                                    v-model="form.sifat_surat"
                                    :items="sifatOptions"
                                    placeholder="-- Pilih Sifat Surat --"
                                    class="mt-1 w-full"
                                    icon="lucide:flag"
                                />
                            </UFormField>

                            <UFormField v-if="isEditing" label="Status Surat">
                                <USelect
                                    v-model="form.status"
                                    :items="statusOptions"
                                    class="mt-1 w-full"
                                    icon="lucide:activity"
                                />
                            </UFormField>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Icon name="lucide:send" class="h-5 w-5 text-blue-600" />
                            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">Tujuan Surat</h3>
                        </div>

                        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <UFormField label="Ditujukan Kepada" required>
                                <UInput
                                    v-model="form.ditujukan_kepada"
                                    placeholder="Contoh: Pimpinan CV Beta Network Nusantara"
                                    class="mt-1 w-full"
                                    icon="lucide:user"
                                />
                            </UFormField>

                            <UFormField label="Alamat Tujuan">
                                <UTextarea
                                    v-model="form.alamat_tujuan"
                                    placeholder="Contoh: Jl. A. Yani No. 77, Wonogiri"
                                    :rows="2"
                                    class="mt-1 w-full"
                                />
                            </UFormField>
                        </div>
                    </section>

                    <section class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Icon name="lucide:align-left" class="h-5 w-5 text-blue-600" />
                            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">Isi Surat</h3>
                        </div>

                        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <UFormField label="Perihal Surat" required>
                                <UTextarea
                                    v-model="form.perihal"
                                    placeholder="Contoh: Permohonan Kerja Sama Penempatan Peserta PKL"
                                    :rows="3"
                                    class="mt-1 w-full"
                                />
                            </UFormField>

                            <UFormField label="Isi / Dasar / Lampiran">
                                <UTextarea
                                    v-model="form.isi_lampiran"
                                    placeholder="Contoh: Daftar peserta PKL dan jadwal pelaksanaan terlampir."
                                    :rows="3"
                                    class="mt-1 w-full"
                                />
                            </UFormField>
                        </div>
                    </section>

                    <section
                        v-if="form.template_jenis === 'surat_tugas_murid' || form.template_jenis === 'surat_permohonan'"
                        class="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                    >
                        <div class="flex items-center gap-2">
                            <Icon name="lucide:users" class="h-5 w-5 text-blue-600" />
                            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">Data Siswa Pada Surat</h3>
                        </div>

                        <UFormField
                            v-if="form.template_jenis === 'surat_tugas_murid'"
                            label="Peserta Didik Ditugaskan"
                            required
                        >
                            <USelect
                                v-model="selectedSiswaTugasId"
                                :items="siswaOptions"
                                :loading="loadingSiswa"
                                placeholder="-- Pilih satu siswa --"
                                class="mt-1 w-full"
                                icon="lucide:user-round"
                            />
                            <p class="mt-2 text-xs text-slate-500">Nama, NIS, dan kelas akan masuk ke dokumen otomatis.</p>
                        </UFormField>

                        <UFormField
                            v-if="form.template_jenis === 'surat_permohonan'"
                            label="Daftar Siswa PKL"
                            required
                        >
                            <div class="mt-1 space-y-2">
                                <div
                                    v-for="(_, index) in form.siswa_ids"
                                    :key="`siswa-row-${index}`"
                                    class="flex items-center gap-2"
                                >
                                    <USelect
                                        v-model="form.siswa_ids[index]"
                                        :items="siswaOptions"
                                        :loading="loadingSiswa"
                                        :placeholder="`-- Pilih siswa #${index + 1} --`"
                                        class="flex-1"
                                        icon="lucide:users"
                                    />
                                    <UButton
                                        variant="soft"
                                        color="error"
                                        icon="lucide:trash-2"
                                        :disabled="form.siswa_ids.length === 1"
                                        @click="removeSiswaRow(index)"
                                    />
                                </div>
                                <div class="flex items-center justify-between pt-1">
                                    <p class="text-xs text-slate-500">Khusus surat permohonan penerimaan PKL. Untuk MoU/kerja sama, pilih jenis dokumen permohonan kerja sama.</p>
                                    <UButton
                                        variant="soft"
                                        color="primary"
                                        icon="lucide:plus"
                                        @click="addSiswaRow"
                                    >
                                        Tambah Siswa
                                    </UButton>
                                </div>
                            </div>
                        </UFormField>
                    </section>

                    <section class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Icon name="lucide:signature" class="h-5 w-5 text-blue-600" />
                            <h3 class="text-sm font-black uppercase tracking-wider text-slate-700">Penandatangan & Pengiriman</h3>
                        </div>

                        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <UFormField label="Guru Penandatangan" required>
                                <USelect
                                    v-model="form.penandatangan_guru_id"
                                    :items="guruPenandatanganOptions"
                                    :loading="loadingGuru"
                                    placeholder="-- Pilih Guru Penandatangan --"
                                    class="mt-1 w-full"
                                    icon="lucide:user-check"
                                />
                                <p class="mt-2 text-xs text-slate-500">Guru harus aktif sebagai penandatangan dan punya QR TTD digital.</p>
                            </UFormField>

                            <UFormField label="Tanggal Kirim">
                                <UInput
                                    v-model="form.tanggal_kirim"
                                    type="date"
                                    class="mt-1 w-full"
                                    icon="lucide:calendar-check"
                                />
                            </UFormField>
                        </div>
                    </section>

                    <div class="flex justify-end pt-4 border-t border-slate-100">
                        <UButton 
                            color="success" 
                            size="lg"
                            class="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold shadow-md hover:shadow-lg transition-all" 
                            @click="saveSurat"
                            :loading="saving"
                        >
                            <Icon name="lucide:send" class="w-5 h-5 mr-2" />
                            GENERATE & SIMPAN SURAT
                        </UButton>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- PANEL PENCARIAN & CETAK DATA -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
            <div 
                class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                @click="isSearchPanelExpanded = !isSearchPanelExpanded"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-50 rounded-lg">
                        <Icon name="lucide:search" class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Panel Pencarian & Cetak Data</h2>
                        <p class="text-xs text-slate-500 font-medium">Filter data surat untuk keperluan cetak atau ekspor</p>
                    </div>
                </div>
                <Icon 
                    :name="isSearchPanelExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                    class="w-5 h-5 text-slate-400" 
                />
            </div>

            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
            >
                <div v-show="isSearchPanelExpanded" class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <UFormField label="Dari Tanggal">
                            <UInput v-model="filters.start_date" type="date" class="w-full" icon="lucide:calendar" />
                        </UFormField>
                        
                        <UFormField label="Sampai Tanggal">
                            <UInput v-model="filters.end_date" type="date" class="w-full" icon="lucide:calendar" />
                        </UFormField>
                        
                        <UFormField label="Kata Kunci">
                            <UInput 
                                v-model="filters.search" 
                                placeholder="No Surat, Tujuan, Perihal..." 
                                class="w-full"
                                icon="lucide:search"
                            />
                        </UFormField>
                        
                        <div class="flex items-end h-full pb-0.5">
                            <UButton color="neutral" variant="soft" class="w-full justify-center h-[38px]" @click="resetFilters">
                                <Icon name="lucide:rotate-ccw" class="w-4 h-4 mr-2" />
                                Reset Filter
                            </UButton>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <UButton color="primary" class="bg-blue-600 hover:bg-blue-700 justify-center font-bold py-3 shadow-sm" @click="fetchData">
                            <Icon name="lucide:printer" class="w-5 h-5 mr-2" />
                            CETAK DATA TERFILTER
                        </UButton>
                        <UButton color="neutral" class="bg-slate-800 hover:bg-slate-900 text-white justify-center font-bold py-3 shadow-sm" @click="fetchData">
                            <Icon name="lucide:download" class="w-5 h-5 mr-2" />
                            EKSPOR SEMUA DATA
                        </UButton>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- TABLE SECTION -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div class="flex items-center gap-2">
                    <Icon name="lucide:list" class="w-5 h-5 text-slate-500" />
                    <h3 class="font-bold text-slate-700 text-sm uppercase">Daftar Surat Keluar</h3>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-slate-500">Tampilkan:</span>
                    <USelect
                        v-model="pagination.limit"
                        :items="[10, 25, 50, 100]"
                        size="xs"
                        class="w-20"
                        @update:modelValue="fetchData"
                    />
                </div>
            </div>

            <div v-if="loading" class="p-8 space-y-4">
                <div v-for="i in 5" :key="i" class="flex gap-4">
                    <USkeleton class="h-10 w-20" />
                    <USkeleton class="h-10 flex-1" />
                    <USkeleton class="h-10 w-32" />
                    <USkeleton class="h-10 w-24" />
                </div>
            </div>

            <div v-else-if="suratKeluar.length === 0" class="p-20 text-center">
                <div class="flex flex-col items-center gap-3">
                    <div class="p-4 bg-slate-50 rounded-full">
                        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300" />
                    </div>
                    <p class="text-slate-500 font-medium">Belum ada data surat keluar</p>
                    <UButton variant="link" color="primary" @click="isFormExpanded = true">Buat Surat Sekarang</UButton>
                </div>
            </div>

            <div v-else class="overflow-x-auto">
                <UTable :data="suratKeluar" :columns="columns" class="min-w-[1180px] w-full">
                    <template #row_number-cell="{ row }">
                        <div class="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-indigo-50 px-2 text-xs font-bold text-indigo-700">
                            {{ ((pagination.page - 1) * pagination.limit) + row.index + 1 }}
                        </div>
                    </template>

                    <template #klasifikasi_surat-cell="{ row }">
                        <span class="font-semibold uppercase text-slate-600 text-xs">
                            {{ formatKlasifikasi(row.original.klasifikasi_surat) }}
                        </span>
                    </template>

                    <template #nomor_surat-cell="{ row }">
                        <div class="flex flex-col gap-1">
                            <span class="font-bold text-blue-700">{{ row.original.nomor_surat }}</span>
                            <span class="text-xs text-slate-500 inline-flex items-center gap-1">
                                <Icon name="lucide:calendar" class="w-3.5 h-3.5" />
                                {{ formatDate(row.original.tanggal_surat) }}
                            </span>
                        </div>
                    </template>

                    <template #ditujukan_kepada-cell="{ row }">
                        <div
                            class="max-w-[220px] whitespace-normal break-words text-sm font-semibold leading-6 text-slate-800 line-clamp-2"
                            :title="row.original.ditujukan_kepada"
                        >
                            {{ row.original.ditujukan_kepada }}
                        </div>
                    </template>

                    <template #perihal-cell="{ row }">
                        <div
                            class="max-w-[320px] whitespace-normal break-words text-sm leading-6 text-slate-600 line-clamp-2"
                            :title="row.original.perihal || '-'"
                        >
                            {{ row.original.perihal || '-' }}
                        </div>
                    </template>

                    <template #isi_lampiran-cell="{ row }">
                        <div
                            class="max-w-[280px] whitespace-normal break-words text-sm italic leading-6 text-cyan-600 line-clamp-2"
                            :title="row.original.isi_lampiran || '-'"
                        >
                            {{ row.original.isi_lampiran ? `Dasar: ${row.original.isi_lampiran}` : '-' }}
                        </div>
                    </template>

                    <template #status-cell="{ row }">
                        <UBadge
                            :color="getStatusColor(row.original.status)"
                            variant="soft"
                            size="sm"
                            class="font-bold"
                        >
                            {{ formatStatusLabel(row.original.status) }}
                        </UBadge>
                    </template>

                    <template #berkas-cell="{ row }">
                        <div class="flex items-center gap-2">
                            <UTooltip text="Unduh DOCX">
                                <UButton
                                    variant="soft"
                                    color="primary"
                                    size="xs"
                                    class="h-8 w-8 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600"
                                    :disabled="!hasGeneratedFile(row.original, 'docx')"
                                    @click="downloadGeneratedFile(row.original, 'docx')"
                                >
                                    <Icon name="vscode-icons:file-type-word" class="w-4 h-4" />
                                </UButton>
                            </UTooltip>
                            <UTooltip text="Unduh PDF">
                                <UButton
                                    variant="soft"
                                    color="error"
                                    size="xs"
                                    class="h-8 w-8 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                                    :disabled="!hasGeneratedFile(row.original, 'pdf')"
                                    @click="downloadGeneratedFile(row.original, 'pdf')"
                                >
                                    <Icon name="vscode-icons:file-type-pdf2" class="w-4 h-4" />
                                </UButton>
                            </UTooltip>
                        </div>
                    </template>

                    <template #actions-cell="{ row }">
                        <div class="flex items-center justify-center gap-2">
                            <UTooltip text="Lihat Detail">
                                <UButton
                                    variant="soft"
                                    color="primary"
                                    size="xs"
                                    class="h-8 w-8 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600"
                                    @click="viewDetail(row.original)"
                                >
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </UButton>
                            </UTooltip>
                            <UTooltip text="Edit Surat">
                                <UButton
                                    variant="soft"
                                    color="warning"
                                    size="xs"
                                    class="h-8 w-8 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-600"
                                    @click="editSurat(row.original)"
                                >
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </UButton>
                            </UTooltip>
                        </div>
                    </template>
                </UTable>
            </div>

            <!-- Pagination -->
            <div class="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-slate-100 bg-slate-50/30 gap-4">
                <p class="text-sm text-slate-500 font-medium">
                    Menampilkan <span class="text-slate-900 font-bold">{{ ((pagination.page - 1) * pagination.limit) + 1 }}</span> 
                    sampai <span class="text-slate-900 font-bold">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> 
                    dari <span class="text-slate-900 font-bold">{{ pagination.total }}</span> data
                </p>
                
                <div class="flex items-center gap-2">
                    <UButton 
                        variant="outline" 
                        color="neutral" 
                        size="sm" 
                        :disabled="pagination.page === 1" 
                        @click="changePage(pagination.page - 1)"
                    >
                        <Icon name="lucide:chevron-left" class="w-4 h-4 mr-1" />
                        Sebelumnya
                    </UButton>
                    
                    <div class="flex items-center gap-1 mx-2">
                        <UButton 
                            v-for="p in Math.ceil(pagination.total / pagination.limit)" 
                            :key="p"
                            size="sm"
                            :variant="pagination.page === p ? 'solid' : 'ghost'"
                            :color="pagination.page === p ? 'primary' : 'neutral'"
                            class="w-9 h-9 justify-center rounded-lg font-bold"
                            @click="changePage(p)"
                        >
                            {{ p }}
                        </UButton>
                    </div>

                    <UButton 
                        variant="outline" 
                        color="neutral" 
                        size="sm" 
                        :disabled="pagination.page * pagination.limit >= pagination.total" 
                        @click="changePage(pagination.page + 1)"
                    >
                        Berikutnya
                        <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal 
            :open="showDetailModal"
            @update:open="showDetailModal = $event"
            title="Detail Surat Keluar" 
            description="Informasi lengkap surat keluar yang dipilih"
            size="lg"
        >
            <template #body>
                <div v-if="selectedSurat" class="space-y-6">
                    <div class="grid grid-cols-1 gap-6 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nomor Surat</p>
                            <p class="font-bold text-blue-700 text-lg">{{ selectedSurat.nomor_surat }}</p>
                        </div>
                        <div class="space-y-1 sm:text-right lg:text-left">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tanggal Surat</p>
                            <p class="font-bold text-slate-700">{{ formatDate(selectedSurat.tanggal_surat) }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Status</p>
                            <UBadge :color="getStatusColor(selectedSurat.status)" variant="soft" class="font-bold">
                                {{ formatStatusLabel(selectedSurat.status) }}
                            </UBadge>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Diperbarui</p>
                            <p class="font-medium text-slate-700">{{ formatTimestamp(selectedSurat.updated_at) }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ditujukan Kepada</p>
                            <p class="font-semibold text-slate-800">{{ selectedSurat.ditujukan_kepada }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Alamat Tujuan</p>
                            <p class="font-medium text-slate-700 leading-relaxed">{{ selectedSurat.alamat_tujuan || "-" }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Klasifikasi</p>
                            <UBadge color="primary" variant="soft" class="font-bold uppercase">{{ selectedSurat.klasifikasi_surat }}</UBadge>
                        </div>
                        <div class="space-y-1 text-sm">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sifat Surat</p>
                            <p class="font-medium text-slate-700 capitalize">{{ selectedSurat.sifat_surat }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Penandatangan</p>
                            <p class="font-medium text-slate-700">{{ selectedSurat.penandatangan_guru?.nama_guru || selectedSurat.penandatangan }}</p>
                            <p class="text-xs text-slate-500">NIP. {{ selectedSurat.penandatangan_guru?.nip || "-" }}</p>
                        </div>
                        <div class="space-y-1 text-sm">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Dibuat</p>
                            <p class="font-medium text-slate-700">{{ formatTimestamp(selectedSurat.created_at) }}</p>
                        </div>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Perihal</p>
                        <p class="text-slate-700 leading-relaxed">{{ selectedSurat.perihal || '-' }}</p>
                    </div>

                    <div
                        v-if="selectedLampiranMeta"
                        class="space-y-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-5"
                    >
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-widest text-cyan-700">Metadata Tugas Jurnal Guru</p>
                                <p class="text-sm text-cyan-900">Data teknis surat tugas yang tersimpan di lampiran metadata.</p>
                            </div>
                            <UBadge color="info" variant="soft" class="font-bold">
                                {{ formatTaskTypeLabel(selectedLampiranMeta.task_type) }}
                            </UBadge>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="space-y-1">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guru Pelaksana</p>
                                <p class="font-semibold text-slate-800">{{ selectedLampiranMeta.guru_pelaksana_nama || "-" }}</p>
                                <p class="text-xs text-slate-500">NIP. {{ selectedLampiranMeta.guru_pelaksana_nip || "-" }}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Perusahaan</p>
                                <p class="font-semibold text-slate-800">{{ selectedLampiranMeta.perusahaan_nama || "-" }}</p>
                                <p class="text-xs leading-relaxed text-slate-500">{{ selectedLampiranMeta.perusahaan_alamat || "-" }}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Periode Tugas</p>
                                <p class="font-medium text-slate-700">
                                    {{ formatDateRange(selectedLampiranMeta.tanggal_mulai, selectedLampiranMeta.tanggal_selesai) }}
                                </p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jumlah Penempatan</p>
                                <p class="font-medium text-slate-700">{{ selectedLampiranMeta.penempatan_ids?.length || 0 }} data</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Lampiran / Keterangan</p>
                        <p class="whitespace-pre-line text-slate-700 leading-relaxed italic">
                            {{ selectedLampiranText || 'Tidak ada lampiran' }}
                        </p>
                    </div>

                    <div class="space-y-3 pt-4 border-t border-slate-100">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Berkas Surat</p>
                        <div class="flex flex-wrap items-center gap-2">
                            <UButton
                                variant="soft"
                                color="primary"
                                :disabled="!hasGeneratedFile(selectedSurat, 'docx')"
                                @click="downloadGeneratedFile(selectedSurat, 'docx')"
                            >
                                <Icon name="vscode-icons:file-type-word" class="w-4 h-4 mr-2" />
                                Unduh DOCX
                            </UButton>
                            <UButton
                                variant="soft"
                                color="error"
                                :disabled="!hasGeneratedFile(selectedSurat, 'pdf')"
                                @click="downloadGeneratedFile(selectedSurat, 'pdf')"
                            >
                                <Icon name="vscode-icons:file-type-pdf2" class="w-4 h-4 mr-2" />
                                Unduh PDF
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton variant="soft" color="neutral" @click="showDetailModal = false">Tutup</UButton>
                    <UButton color="primary" @click="selectedSurat && editSurat(selectedSurat); showDetailModal = false">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit Data
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- MODAL UNGGAH & KONVERSI TEMPLATE -->
        <UModal 
            :open="showTemplateModal"
            @update:open="showTemplateModal = $event"
            title="Unggah & Konversi Template" 
            description="Upload template surat dalam format Word (.docx) untuk dikonversi otomatis"
            size="md"
        >
            <template #body>
                <div class="space-y-6">
                    <!-- Info/Warning Box -->
                    <div class="bg-[#FFF9E6] border border-[#FFE082] rounded-xl p-5 space-y-4">
                        <div class="flex items-center gap-2">
                            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-[#B8860B]" />
                            <h4 class="text-xs font-black text-[#856404] uppercase tracking-wider">Wajib Ada Tag Berikut:</h4>
                        </div>
                        
                        <ul class="text-[13px] space-y-1.5 text-[#856404] font-medium ml-1">
                            <li>1. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;NO_SURAT&gt;&gt;</span> (Nomor Lengkap)</li>
                            <li>2. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;TGL_SURAT&gt;&gt;</span> (Tanggal Hari Ini)</li>
                            <li>3. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;TUJUAN&gt;&gt;</span> (Penerima Surat)</li>
                            <li>4. <span class="text-[#D32F2F] font-bold tracking-tighter">&lt;&lt;PERIHAL&gt;&gt;</span> (Isi Ringkas Surat)</li>
                        </ul>

                        <p class="text-[11px] text-[#D32F2F] font-semibold leading-snug pt-1">
                            *File akan otomatis dikonversi ke format Google Docs agar bisa diproses sistem.
                        </p>
                    </div>

                    <!-- Form Fields -->
                    <div class="space-y-5">
                        <UFormField label="Nama Template:">
                            <UInput 
                                v-model="templateForm.nama" 
                                placeholder="Contoh: Surat Tugas Guru" 
                                class="w-full font-medium"
                            />
                        </UFormField>

                        <UFormField label="Pilih File Word (.docx):">
                            <div class="flex items-center w-full border border-slate-200 rounded-lg overflow-hidden group hover:border-blue-400 transition-colors">
                                <label class="bg-slate-50 px-4 py-2 border-r border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 shrink-0">
                                    Choose file
                                    <input type="file" class="hidden" accept=".docx" @change="handleFileChange" />
                                </label>
                                <span class="px-4 py-2 text-sm text-slate-400 truncate flex-1 bg-white">
                                    {{ templateForm.file?.name || 'No file chosen' }}
                                </span>
                            </div>
                        </UFormField>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-center gap-3 w-full pb-2">
                    <UButton 
                        color="success" 
                        class="bg-[#388E3C] hover:bg-[#2E7D32] px-8 font-bold py-2.5 h-auto text-sm"
                        :loading="uploadingTemplate"
                        @click="handleUploadTemplate"
                    >
                        <Icon name="lucide:upload" class="w-5 h-5 mr-2" />
                        Unggah & Konversi
                    </UButton>
                    <UButton 
                        variant="solid" 
                        color="neutral" 
                        class="bg-[#607D8B] hover:bg-[#546E7A] px-10 font-bold py-2.5 h-auto text-sm text-white"
                        @click="showTemplateModal = false"
                    >
                        Cancel
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useSuratKeluar, type SuratKeluar, type SuratKeluarTemplateJenis } from "~/composables/api/use-surat-keluar";
import { useGuruApi } from "~/composables/api/use-guru";
import { useSiswaApi, type Siswa } from "~/composables/api/use-academic";
import { useSweetAlert } from "~/composables/use-sweet-alert";
import { buildStoredFileUrl, normalizeStoredFileRef, resolveStoredFileUrl } from "~/utils/stored-file";

definePageMeta({ layout: "tata-usaha" });

const { getAll, create, update, remove, generateNomor } = useSuratKeluar();
const { getAllGuru } = useGuruApi();
const { getAll: getAllSiswa } = useSiswaApi();
const { showConfirmation, showSuccess, showWarning, showError } = useSweetAlert();

const loading = ref(false);
const loadingGuru = ref(false);
const loadingSiswa = ref(false);
const saving = ref(false);
const generatingNomor = ref(false);
const showDetailModal = ref(false);
const showTemplateModal = ref(false);
const isEditing = ref(false);
const uploadingTemplate = ref(false);
const selectedSurat = ref<SuratKeluar | null>(null);

const isFormExpanded = ref(true);
const isSearchPanelExpanded = ref(false);
const formMetode = ref('manual');

const templateForm = ref({
    nama: "",
    file: null as File | null
});

const suratKeluar = ref<SuratKeluar[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });

const filters = ref({
    search: "",
    start_date: "",
    end_date: "",
});

const guruPenandatanganOptions = ref<{ label: string; value: string }[]>([]);
const siswaList = ref<Siswa[]>([]);
const siswaOptions = ref<{ label: string; value: string }[]>([]);
const selectedSiswaTugasId = ref("");

const form = ref({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split('T')[0],
    ditujukan_kepada: "",
    alamat_tujuan: "",
    perihal: "",
    template_jenis: "surat_undangan" as SuratKeluarTemplateJenis,
    klasifikasi_surat: undefined,
    sifat_surat: "biasa",
    isi_lampiran: "",
    penandatangan_guru_id: "",
    penandatangan: "",
    tanggal_kirim: "",
    bukti_pengiriman: "",
    status: "draft",
    template_id: undefined,
    siswa_ids: [""] as string[],
});

const columns = [
    {
        accessorKey: "row_number",
        header: "No",
        meta: { class: { th: "w-16", td: "w-16 align-top" } },
    },
    {
        accessorKey: "klasifikasi_surat",
        header: "Klasifikasi",
        meta: { class: { th: "w-40", td: "w-40 align-top" } },
    },
    {
        accessorKey: "nomor_surat",
        header: "Nomor Surat & Tanggal",
        meta: { class: { th: "w-56", td: "w-56 align-top" } },
    },
    {
        accessorKey: "ditujukan_kepada",
        header: "Ditujukan",
        meta: { class: { th: "w-56", td: "w-56 align-top" } },
    },
    {
        accessorKey: "perihal",
        header: "Perihal",
        meta: { class: { th: "w-80", td: "w-80 align-top" } },
    },
    {
        accessorKey: "isi_lampiran",
        header: "Dasar",
        meta: { class: { th: "w-72", td: "w-72 align-top" } },
    },
    {
        accessorKey: "status",
        header: "Status",
        meta: { class: { th: "w-28", td: "w-28 align-top" } },
    },
    {
        accessorKey: "berkas",
        header: "Berkas",
        meta: { class: { th: "w-28", td: "w-28 align-top" } },
    },
    {
        accessorKey: "actions",
        header: "Aksi",
        meta: { class: { th: "w-24", td: "w-24 align-top" } },
    },
];

const JURNAL_GURU_META_PREFIX = "__JURNAL_GURU_META__";

type SuratGuruTaskType = "penerjunan" | "monitoring" | "penarikan";

interface SuratLampiranMeta {
    task_type: SuratGuruTaskType;
    guru_pelaksana_id?: string;
    guru_pelaksana_nama?: string;
    guru_pelaksana_nip?: string;
    perusahaan_id?: string;
    perusahaan_nama?: string;
    perusahaan_alamat?: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    penempatan_ids?: string[];
    batch_label?: string;
}

type TemplateOption = { label: string; value: string };

const templateOptions = ref<TemplateOption[]>([]);

const templateJenisOptions = [
    { label: "Surat Permohonan Kerja Sama/MoU", value: "surat_permohonan_kerjasama" },
    { label: "Surat Permohonan PKL (Dengan Siswa)", value: "surat_permohonan" },
    { label: "Surat Undangan", value: "surat_undangan" },
    { label: "Surat Tugas Siswa", value: "surat_tugas_murid" },
    { label: "Surat Perintah Tugas", value: "surat_perintah" },
];

const klasifikasiOptions = [
    { label: 'Undangan', value: 'undangan' },
    { label: 'Edaran', value: 'edaran' },
    { label: 'Permohonan', value: 'permohonan' },
    { label: 'Pemberitahuan', value: 'pemberitahuan' },
    { label: 'Laporan', value: 'laporan' },
    { label: 'Lainnya', value: 'lainnya' },
];

const sifatOptions = [
    { value: "biasa", label: "Biasa" },
    { value: "penting", label: "Penting" },
    { value: "rahasia", label: "Rahasia" },
    { value: "segera", label: "Segera" },
];

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "dikirim", label: "Dikirim" },
    { value: "diterima", label: "Diterima" },
];

const TEMPLATE_STORAGE_KEY = "tu_surat_keluar_templates";

function loadTemplateOptions() {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as TemplateOption[];
        if (Array.isArray(parsed)) {
            templateOptions.value = parsed.filter((item) => item?.label && item?.value);
        }
    } catch (error) {
        console.error("[SuratKeluar] Gagal membaca template tersimpan:", error);
    }
}

function persistTemplateOptions() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templateOptions.value));
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimestamp(dateStr?: string): string {
    if (!dateStr) return "-";
    const value = new Date(dateStr);
    if (Number.isNaN(value.getTime())) return "-";
    return value.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatKlasifikasi(value?: string): string {
    if (!value) return "-";
    return value.replace(/_/g, " ").toUpperCase();
}

function formatStatusLabel(status?: string): string {
    switch (status) {
        case "draft":
            return "Draft";
        case "dikirim":
            return "Dikirim";
        case "diterima":
            return "Diterima";
        default:
            return String(status || "-")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
    }
}

function formatTaskTypeLabel(taskType?: SuratGuruTaskType): string {
    switch (taskType) {
        case "penerjunan":
            return "Penerjunan";
        case "monitoring":
            return "Monitoring";
        case "penarikan":
            return "Penarikan";
        default:
            return "-";
    }
}

function parseLampiranMetadata(rawText?: string | null): SuratLampiranMeta | null {
    const source = String(rawText || "").trim();
    if (!source) return null;

    const firstLine = source.split(/\r?\n/)[0]?.trim() || "";
    if (!firstLine.startsWith(JURNAL_GURU_META_PREFIX)) return null;

    try {
        return JSON.parse(firstLine.slice(JURNAL_GURU_META_PREFIX.length).trim()) as SuratLampiranMeta;
    } catch {
        return null;
    }
}

function stripLampiranMetadata(rawText?: string | null): string {
    const source = String(rawText || "").trim();
    if (!source) return "";
    const lines = source.split(/\r?\n/);
    const firstLine = lines[0]?.trim() || "";
    if (!firstLine.startsWith(JURNAL_GURU_META_PREFIX)) {
        return source;
    }
    return lines.slice(1).join("\n").trim();
}

function formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return "-";
    return `${formatDate(start || "")} - ${formatDate(end || "")}`;
}

function inferTemplateJenisFromSurat(surat: SuratKeluar): SuratKeluarTemplateJenis {
    if (surat.template_jenis) return surat.template_jenis;
    const perihal = String(surat.perihal || "").toLowerCase();
    if (perihal.includes("mou") || perihal.includes("kerja sama") || perihal.includes("kerjasama")) return "surat_permohonan_kerjasama";
    if (surat.klasifikasi_surat === "permohonan") return "surat_permohonan";
    if (surat.klasifikasi_surat === "undangan") return "surat_undangan";
    if (perihal.includes("perintah")) return "surat_perintah";
    if (perihal.includes("tugas")) return "surat_tugas_murid";
    return "surat_undangan";
}

function resolveKlasifikasiByTemplate(
    templateJenis: SuratKeluarTemplateJenis,
    fallback?: string,
): "undangan" | "edaran" | "permohonan" | "pemberitahuan" | "laporan" | "lainnya" {
    const allowed = ["undangan", "edaran", "permohonan", "pemberitahuan", "laporan", "lainnya"] as const;
    if (allowed.includes(fallback as any)) {
        return fallback as any;
    }
    if (templateJenis === "surat_permohonan" || templateJenis === "surat_permohonan_kerjasama") return "permohonan";
    if (templateJenis === "surat_undangan") return "undangan";
    return "lainnya";
}

function sanitizeFileName(value: string): string {
    return value.replace(/[^a-zA-Z0-9-_]+/g, "_");
}

function resolveVariantPath(sourcePath: string, extension: "docx" | "pdf"): string {
    if (/\.(pdf|docx)$/i.test(sourcePath)) {
        return sourcePath.replace(/\.(pdf|docx)$/i, `.${extension}`);
    }
    return `${sourcePath}.${extension}`;
}

function pickFirstFilePath(record: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string") {
            const normalized = normalizeStoredFileRef(value) || null;
            if (normalized) {
                return normalized;
            }
        }
    }
    return null;
}

function getGeneratedFilePath(surat: SuratKeluar, extension: "docx" | "pdf"): string | null {
    const dynamicRecord = surat as unknown as Record<string, unknown>;
    const explicitPath = extension === "docx"
        ? pickFirstFilePath(dynamicRecord, [
            "file_surat_docx",
        ])
        : pickFirstFilePath(dynamicRecord, [
            "file_surat_pdf",
            "file_surat",
        ]);

    if (explicitPath) {
        return explicitPath;
    }

    const fallbackPath = normalizeStoredFileRef(surat.file_surat) || null;
    if (!fallbackPath) {
        return null;
    }

    return resolveVariantPath(fallbackPath, extension);
}

function hasGeneratedFile(surat: SuratKeluar, extension: "docx" | "pdf"): boolean {
    return Boolean(getGeneratedFilePath(surat, extension));
}

async function isFileAccessible(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch {
        return false;
    }
}

async function downloadGeneratedFile(surat: SuratKeluar, extension: "docx" | "pdf") {
    const path = getGeneratedFilePath(surat, extension);
    if (!path) {
        await showWarning("Berkas belum tersedia", `File ${extension.toUpperCase()} untuk surat ini belum tersedia.`);
        return;
    }

    const downloadField = extension === "docx" ? "file_surat_docx_download_url" : "file_surat_pdf_download_url";
    const downloadUrl =
        resolveStoredFileUrl(surat as unknown as Record<string, unknown>, `file_surat_${extension}`, downloadField) ||
        buildStoredFileUrl(path);
    const available = await isFileAccessible(downloadUrl);
    if (!available) {
        await showWarning("Berkas tidak ditemukan", `File ${extension.toUpperCase()} belum tersedia di server.`);
        return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.download = `${sanitizeFileName(surat.nomor_surat)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getStatusColor(status: string): string {
    switch (status) {
        case "diterima": return "success";
        case "dikirim": return "info";
        case "draft": return "warning";
        default: return "neutral";
    }
}

const selectedLampiranMeta = computed(() =>
    parseLampiranMetadata(selectedSurat.value?.isi_lampiran),
);

const selectedLampiranText = computed(() =>
    stripLampiranMetadata(selectedSurat.value?.isi_lampiran),
);

function resetForm() {
    form.value = {
        nomor_surat: "",
        tanggal_surat: new Date().toISOString().split('T')[0],
        ditujukan_kepada: "",
        alamat_tujuan: "",
        perihal: "",
        template_jenis: "surat_undangan",
        klasifikasi_surat: undefined,
        sifat_surat: "biasa",
        isi_lampiran: "",
        penandatangan_guru_id: "",
        penandatangan: "",
        tanggal_kirim: "",
        bukti_pengiriman: "",
        status: "draft",
        template_id: undefined,
        siswa_ids: [""],
    };
    selectedSiswaTugasId.value = "";
    isEditing.value = false;
    selectedSurat.value = null;
}

function resetFilters() {
    filters.value = {
        search: "",
        start_date: "",
        end_date: "",
    };
    fetchData();
}

async function fetchData() {
    loading.value = true;
    try {
        const result = await getAll({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined,
            start_date: filters.value.start_date || undefined,
            end_date: filters.value.end_date || undefined,
        });

        if (result.success && result.data) {
            suratKeluar.value = result.data.data || [];
            pagination.value.total = result.data.total || 0;
        }
    } catch (err) {
        console.error("[SuratKeluar] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

async function fetchGuruPenandatangan() {
    loadingGuru.value = true;
    try {
        const result = await getAllGuru({ page: 1, limit: 100, penandatangan: true });
        if (result.success && result.data) {
            guruPenandatanganOptions.value = (result.data.data || [])
                .filter((guru: any) => guru.status_aktif !== false)
                .map((guru: any) => ({
                    label: `${guru.nama_guru} (${guru.nip}) - ${guru.id_guru}`,
                    value: guru.id_guru,
                }));
        }
    } catch (err) {
        console.error("[SuratKeluar] Error fetching guru:", err);
    } finally {
        loadingGuru.value = false;
    }
}

function getSiswaKelasLabel(siswa: Siswa): string {
    const kelas = siswa.kelas;
    if (!kelas) return "-";
    const jurusan = kelas.jurusan?.nama_jurusan ? ` ${kelas.jurusan.nama_jurusan}` : "";
    return `${kelas.nama_kelas}${jurusan}`;
}

function getSelectedSiswa(id?: string) {
    if (!id) return null;
    return siswaList.value.find((siswa) => siswa.id_siswa === id) || null;
}

function mapSiswaPayload(ids: string[]) {
    return ids
        .map((id) => getSelectedSiswa(id))
        .filter(Boolean)
        .map((siswa) => ({
            id_siswa: siswa!.id_siswa,
            nama: siswa!.nama_siswa,
            nis: siswa!.nis,
            kelas: getSiswaKelasLabel(siswa!),
        }));
}

async function fetchSiswaOptions() {
    loadingSiswa.value = true;
    try {
        const result = await getAllSiswa({ page: 1, limit: 300 });
        if (result.success && result.data) {
            siswaList.value = result.data || [];
            siswaOptions.value = siswaList.value
                .filter((siswa) => siswa.status_siswa !== "lulus" && siswa.status_siswa !== "dikeluarkan")
                .map((siswa) => ({
                    label: `${siswa.nama_siswa} (${siswa.nis}) - ${getSiswaKelasLabel(siswa)}`,
                    value: siswa.id_siswa,
                }));
        }
    } catch (err) {
        console.error("[SuratKeluar] Error fetching siswa:", err);
    } finally {
        loadingSiswa.value = false;
    }
}

function addSiswaRow() {
    form.value.siswa_ids.push("");
}

function removeSiswaRow(index: number) {
    if (form.value.siswa_ids.length <= 1) return;
    form.value.siswa_ids.splice(index, 1);
}

async function fillNomorSurat() {
    generatingNomor.value = true;
    try {
        const nomorResult = await generateNomor("surat_keluar");
        if (!nomorResult.success || !nomorResult.data?.nomor_surat) {
            await showError("Gagal generate nomor", nomorResult.message || "Nomor surat tidak berhasil dibuat.");
            return;
        }
        form.value.nomor_surat = nomorResult.data.nomor_surat;
    } catch (err) {
        console.error("[SuratKeluar] Error generating nomor:", err);
        await showError("Gagal generate nomor", "Terjadi kesalahan saat mengambil nomor surat.");
    } finally {
        generatingNomor.value = false;
    }
}

function viewDetail(surat: SuratKeluar) {
    selectedSurat.value = surat;
    showDetailModal.value = true;
}

function editSurat(surat: SuratKeluar) {
    selectedSurat.value = surat;
    isEditing.value = true;
    isFormExpanded.value = true;
    form.value = {
        nomor_surat: surat.nomor_surat,
        tanggal_surat: surat.tanggal_surat.split("T")[0],
        ditujukan_kepada: surat.ditujukan_kepada,
        alamat_tujuan: surat.alamat_tujuan || "",
        perihal: surat.perihal || "",
        template_jenis: inferTemplateJenisFromSurat(surat),
        klasifikasi_surat: surat.klasifikasi_surat as any,
        sifat_surat: surat.sifat_surat,
        isi_lampiran: surat.isi_lampiran || "",
        penandatangan_guru_id: surat.penandatangan_guru_id || "",
        penandatangan: surat.penandatangan,
        tanggal_kirim: surat.tanggal_kirim?.split("T")[0] || "",
        bukti_pengiriman: surat.bukti_pengiriman || "",
        status: surat.status || "draft",
        template_id: undefined,
        siswa_ids: [""],
    };
    selectedSiswaTugasId.value = "";
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveSurat() {
    if (!form.value.nomor_surat || !form.value.tanggal_surat || !form.value.ditujukan_kepada || !form.value.perihal || !form.value.template_jenis || !form.value.klasifikasi_surat || !form.value.sifat_surat || !form.value.penandatangan_guru_id) {
        await showWarning("Data belum lengkap", "Nomor, tanggal, tujuan, perihal, jenis, klasifikasi, sifat, dan penandatangan wajib diisi.");
        return;
    }

    let templatePayload: { siswa?: Array<{ id_siswa?: string; nama: string; nis: string; kelas: string }> } | undefined;
    if (form.value.template_jenis === "surat_tugas_murid") {
        const siswa = getSelectedSiswa(selectedSiswaTugasId.value);
        if (!siswa) {
            await showWarning("Siswa belum dipilih", "Pilih satu peserta didik untuk surat tugas murid.");
            return;
        }
        templatePayload = {
            siswa: mapSiswaPayload([siswa.id_siswa]),
        };
    }

    if (form.value.template_jenis === "surat_permohonan") {
        const siswaPayload = mapSiswaPayload(form.value.siswa_ids.filter(Boolean));
        if (siswaPayload.length === 0) {
            await showWarning("Daftar siswa belum lengkap", "Pilih minimal satu siswa untuk surat permohonan.");
            return;
        }
        templatePayload = {
            siswa: siswaPayload,
        };
    }

    if (isEditing.value && form.value.status !== "draft" && !form.value.tanggal_kirim) {
        await showWarning("Tanggal kirim belum diisi", "Isi tanggal kirim sebelum mengubah status surat.");
        return;
    }

    saving.value = true;
    try {
        if (!isEditing.value && !form.value.nomor_surat) {
            const nomorResult = await generateNomor("surat_keluar");
            if (!nomorResult.success || !nomorResult.data?.nomor_surat) {
                await showError("Gagal generate nomor", nomorResult.message || "Nomor surat tidak berhasil dibuat.");
                return;
            }
            form.value.nomor_surat = nomorResult.data.nomor_surat;
        }

        const data = {
            nomor_surat: form.value.nomor_surat,
            tanggal_surat: new Date(form.value.tanggal_surat).toISOString(),
            ditujukan_kepada: form.value.ditujukan_kepada,
            alamat_tujuan: form.value.alamat_tujuan || undefined,
            perihal: form.value.perihal,
            template_jenis: form.value.template_jenis,
            klasifikasi_surat: resolveKlasifikasiByTemplate(
                form.value.template_jenis,
                form.value.klasifikasi_surat,
            ),
            sifat_surat: form.value.sifat_surat,
            isi_lampiran: form.value.isi_lampiran || undefined,
            template_payload: templatePayload,
            penandatangan_guru_id: form.value.penandatangan_guru_id,
            tanggal_kirim: form.value.tanggal_kirim ? new Date(form.value.tanggal_kirim).toISOString() : undefined,
            bukti_pengiriman: form.value.bukti_pengiriman || undefined,
            ...(isEditing.value ? { status: form.value.status } : {}),
        };

        let result;
        if (isEditing.value && selectedSurat.value) {
            result = await update(selectedSurat.value.id, data);
        } else {
            result = await create(data as any);
        }

        if (result.success) {
            await showSuccess("Berhasil", `Surat keluar berhasil ${isEditing.value ? "diperbarui" : "disimpan"}`);
            resetForm();
            fetchData();
        } else {
            await showError("Gagal menyimpan", result.message || "Terjadi kesalahan validasi data.");
        }
    } catch (err) {
        console.error("[SuratKeluar] Error saving:", err);
        await showError("Gagal menyimpan", "Terjadi kesalahan saat menyimpan surat keluar.");
    } finally {
        saving.value = false;
    }
}

async function confirmDelete(surat: SuratKeluar) {
    const result = await showConfirmation(
        "Konfirmasi Hapus",
        `Apakah Anda yakin ingin menghapus surat ${surat.nomor_surat}? Data yang dihapus tidak dapat dikembalikan.`
    );

    if (result.isConfirmed) {
        const deleteResult = await remove(surat.id);
        if (deleteResult.success) {
            await showSuccess("Berhasil", "Surat keluar berhasil dihapus");
            fetchData();
        }
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        templateForm.value.file = file;
    }
}

async function handleUploadTemplate() {
    if (!templateForm.value.nama || !templateForm.value.file) {
        await showWarning("Data template belum lengkap", "Nama template dan file .docx wajib diisi.");
        return;
    }

    uploadingTemplate.value = true;
    try {
        // Simulating upload process
        await new Promise(resolve => setTimeout(resolve, 1500));

        const optionValue = `tpl_${Date.now()}`;
        templateOptions.value = [
            ...templateOptions.value,
            {
                label: templateForm.value.nama,
                value: optionValue,
            },
        ];
        persistTemplateOptions();
        form.value.template_id = optionValue;

        await showSuccess("Berhasil", "Template berhasil diunggah dan dikonversi");
        showTemplateModal.value = false;
        templateForm.value = { nama: "", file: null };
    } catch (err) {
        console.error("Upload error:", err);
        await showError("Gagal upload template", "Terjadi kesalahan saat mengunggah template.");
    } finally {
        uploadingTemplate.value = false;
    }
}

onMounted(() => {
    loadTemplateOptions();
    fetchData();
    fetchGuruPenandatangan();
    fetchSiswaOptions();
});

useHead({ title: "Surat Keluar | Tata Usaha" });
</script>
