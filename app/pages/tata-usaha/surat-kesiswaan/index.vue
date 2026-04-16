<template>
    <div class="space-y-6 max-w-[1600px] mx-auto pb-10 px-4">
        <!-- HEADER SECTION -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Icon name="lucide:book-open-check" class="w-8 h-8 text-blue-600" />
                    Surat Kesiswaan
                </h1>
                <p class="text-slate-500 font-medium">Buat surat tugas, dispensasi, dan keterangan kesiswaan dalam satu alur kerja.</p>
            </div>
            <div class="flex items-center gap-2">
                <UButton 
                    variant="soft" 
                    :color="isMonitoringExpanded ? 'primary' : 'neutral'" 
                    @click="isMonitoringExpanded = !isMonitoringExpanded"
                    class="font-bold rounded-xl px-5"
                >
                    <Icon :name="isMonitoringExpanded ? 'lucide:eye-off' : 'lucide:history'" class="w-4 h-4 mr-2" />
                    {{ isMonitoringExpanded ? 'Tutup Riwayat' : 'Lihat Riwayat & Monitoring' }}
                </UButton>
            </div>
        </div>

        <!-- A. WORKSPACE: INPUT SURAT TUGAS BARU -->
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-500 ring-1 ring-slate-100">
            <div 
                class="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-transparent"
                @click="isFormExpanded = !isFormExpanded"
            >
                <div class="flex items-center gap-4">
                    <div :class="[
                        'p-2.5 rounded-xl shadow-lg transition-all duration-300',
                        isEditing ? 'bg-emerald-600 shadow-emerald-100' : 'bg-blue-600 shadow-blue-100'
                    ]">
                        <Icon :name="isEditing ? 'lucide:pencil-line' : 'lucide:plus-circle'" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 class="text-base font-black text-blue-900 uppercase tracking-widest">
                            {{ isEditing ? 'Edit Data Surat' : 'A. Pembuatan Surat Baru' }}
                        </h2>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter opacity-70">
                            {{ isEditing ? 'Memperbarui data yang sudah ada' : 'Langkah 1 sampai 4' }}
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <UBadge v-if="selectedSiswa.length > 0 && !isEditing" color="primary" variant="subtle" class="font-black px-3 py-1 rounded-full">
                        {{ selectedSiswa.length }} Siswa Dipilih
                    </UBadge>
                    <Icon 
                        :name="isFormExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                        class="w-6 h-6 text-slate-400" 
                    />
                </div>
            </div>

            <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-4"
                enter-to-class="opacity-100 translate-y-0"
            >
                <div v-show="isFormExpanded" class="p-8 space-y-8">
                    <!-- SECTION 1 & 2: DOKUMEN & DASAR -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="group space-y-3">
                            <div class="flex items-center gap-2 text-blue-600 mb-1">
                                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">1</span>
                                <h3 class="text-sm font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Jenis Dokumen</h3>
                            </div>
                            <USelect
                                v-model="form.jenis_dokumen"
                                :items="jenisDokumenOptions"
                                placeholder="Pilih tipe surat yang akan dibuat"
                                size="lg"
                                class="w-full font-semibold rounded-xl"
                                icon="lucide:file-signature"
                            />
                        </div>

                        <div class="group space-y-3">
                            <div class="flex items-center gap-2 text-blue-600 mb-1">
                                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">2</span>
                                <h3 class="text-sm font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Dasar Penugasan (Referensi)</h3>
                            </div>
                            <USelect
                                v-model="form.dasar_penugasan_id"
                                :items="suratMasukOptions"
                                placeholder="Pilih referensi surat masuk (Opsional)"
                                size="lg"
                                class="w-full font-semibold rounded-xl"
                                :loading="loadingSuratMasuk"
                                icon="lucide:link"
                                @update:model-value="onDasarPenugasanChange"
                            />
                        </div>
                    </div>

                    <!-- SECTION 3: DETAIL PENUGASAN -->
                    <div class="space-y-6 p-6 border border-slate-100 rounded-2xl bg-slate-50/50 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <Icon name="lucide:clipboard-list" class="w-32 h-32" />
                        </div>
                        
                        <div class="flex items-center gap-2 text-blue-600 mb-2">
                            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">3</span>
                            <h3 class="text-sm font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Detail Informasi Penugasan</h3>
                        </div>
                        
                        <div class="space-y-5">
                            <UFormField label="Maksud / Keperluan Penugasan" help="Isi perihal tugas secara lengkap dan jelas.">
                                <UTextarea 
                                    v-model="form.keperluan" 
                                    placeholder="Contoh: Mengikuti Lomba LKS Tingkat Provinsi Bidang Web Technologies..." 
                                    :rows="3"
                                    class="w-full bg-white font-medium rounded-xl ring-1 ring-slate-200 focus:ring-blue-500"
                                />
                            </UFormField>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <UFormField label="Tempat Pelaksanaan">
                                    <UInput v-model="form.tempat" placeholder="Contoh: Hotel Horison" class="w-full bg-white font-medium rounded-xl" icon="lucide:map-pin" />
                                </UFormField>
                                <UFormField label="Alamat Lengkap">
                                    <UInput v-model="form.alamat" placeholder="Contoh: Jl. Pahlawan No. 1" class="w-full bg-white font-medium rounded-xl" icon="lucide:navigation" />
                                </UFormField>
                                <UFormField label="Waktu (Jam)">
                                    <UInput v-model="form.waktu_jam" placeholder="Contoh: 08.00 s/d Selesai" class="w-full bg-white font-medium rounded-xl" icon="lucide:clock" />
                                </UFormField>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 4: PERSONIL & WAKTU -->
                    <div class="space-y-6 p-6 border border-slate-100 rounded-2xl bg-white shadow-inner shadow-slate-100/50 group">
                        <div class="flex items-center gap-2 text-blue-600 mb-2">
                            <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">4</span>
                            <h3 class="text-sm font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">Pilih Personil & Tentukan Waktu</h3>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <!-- Left: Selection Controls -->
                            <div class="lg:col-span-5 space-y-5">
                                <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
                                    <div class="grid grid-cols-2 gap-3">
                                        <UFormField label="Filter Tingkat">
                                            <USelect v-model="filterSiswa.tingkat" :items="tingkatOptions" placeholder="Semua" icon="lucide:layers" class="rounded-xl" />
                                        </UFormField>
                                        <UFormField label="Filter Kelas">
                                            <USelect v-model="filterSiswa.id_kelas" :items="kelasOptions" placeholder="Pilih Kelas" :disabled="!filterSiswa.tingkat" icon="lucide:graduation-cap" class="rounded-xl" />
                                        </UFormField>
                                    </div>
                                    
                                    <UInput 
                                        v-model="filterSiswa.search" 
                                        placeholder="Cari nama siswa atau NIS..." 
                                        icon="lucide:search" 
                                        class="w-full rounded-xl"
                                        size="md"
                                    />
                                </div>

                                <div class="flex items-center justify-between px-1">
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Siswa ({{ filteredSiswaList.length }})</span>
                                    <UButton 
                                        variant="link" 
                                        color="primary" 
                                        size="xs" 
                                        class="font-black uppercase tracking-tighter"
                                        @click="selectAllSiswa"
                                        :disabled="filteredSiswaList.length === 0 || isEditing"
                                    >
                                        Pilih Semua di Kelas
                                    </UButton>
                                </div>

                                <div class="border border-slate-200 rounded-2xl bg-slate-50/30 overflow-hidden ring-1 ring-slate-100 shadow-sm">
                                    <div class="max-h-[320px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        <div v-if="loadingSiswa" class="p-4 space-y-3">
                                            <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-xl" />
                                        </div>
                                        <div v-else-if="filteredSiswaList.length === 0" class="p-12 text-center">
                                            <Icon name="lucide:users" class="w-10 h-10 text-slate-200 mb-2 mx-auto" />
                                            <p class="text-slate-400 text-sm italic font-medium">Data siswa tidak ditemukan</p>
                                        </div>
                                        <div v-for="siswa in filteredSiswaList" :key="siswa.id_siswa" 
                                            class="group flex items-center gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                                            @click="toggleSiswa(siswa)"
                                        >
                                            <div class="relative flex items-center justify-center">
                                                <input 
                                                    type="checkbox"
                                                    :checked="isSiswaSelected(siswa.id_siswa)"
                                                    class="w-5 h-5 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer transition-all"
                                                    :disabled="isEditing"
                                                    @click.stop
                                                    @change.stop="toggleSiswa(siswa)"
                                                />
                                            </div>
                                            <div class="flex flex-col flex-1">
                                                <span class="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-700 transition-colors">{{ siswa.nama_siswa }}</span>
                                                <div class="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                                    <span>{{ siswa.kelas?.nama_kelas }}</span>
                                                    <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>NIS: {{ siswa.nis }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right: Selected Status & Dates -->
                            <div class="lg:col-span-7 space-y-6">
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <label class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                            Daftar Nama Terpilih
                                            <span v-if="selectedSiswa.length > 0" class="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] shadow-sm">{{ selectedSiswa.length }}</span>
                                        </label>
                                        <UButton 
                                            v-if="selectedSiswa.length > 0 && !isEditing"
                                            variant="ghost" 
                                            color="error" 
                                            size="xs" 
                                            class="font-bold text-[10px] uppercase tracking-tighter hover:bg-red-50"
                                            @click="selectedSiswa = []"
                                        >
                                            Hapus Semua
                                        </UButton>
                                    </div>
                                    
                                    <div class="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-5 min-h-[180px] max-h-[220px] overflow-y-auto custom-scrollbar transition-all duration-300 hover:border-blue-200 shadow-inner ring-1 ring-blue-50">
                                        <div v-if="selectedSiswa.length === 0" class="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                                            <Icon name="lucide:user-plus" class="w-8 h-8 mb-2 opacity-20" />
                                            <p class="text-sm font-bold uppercase tracking-tighter opacity-50">Belum ada nama yang dipilih</p>
                                        </div>
                                        <div v-else class="flex flex-wrap gap-2">
                                            <div 
                                                v-for="s in selectedSiswa" 
                                                :key="s.id_siswa"
                                                class="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-white border border-blue-100 rounded-xl shadow-sm animate-in fade-in zoom-in duration-200 ring-1 ring-blue-50"
                                            >
                                                <span class="text-xs font-black text-blue-800 uppercase tracking-tight">{{ s.nama_siswa }}</span>
                                                <UButton 
                                                    v-if="!isEditing"
                                                    variant="ghost" 
                                                    color="neutral" 
                                                    size="xs" 
                                                    class="p-1 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                    @click.stop="toggleSiswa(s)"
                                                >
                                                    <Icon name="lucide:x" class="w-3.5 h-3.5" />
                                                </UButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-5 shadow-sm ring-1 ring-blue-50">
                                    <h4 class="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                        <Icon name="lucide:calendar-clock" class="w-4 h-4" />
                                        Waktu Pelaksanaan
                                    </h4>
                                    <div class="grid grid-cols-2 gap-6">
                                        <UFormField label="Tanggal Mulai">
                                            <UInput v-model="form.tgl_mulai" type="date" class="w-full bg-white font-bold rounded-xl" icon="lucide:calendar" size="lg" />
                                        </UFormField>
                                        <UFormField label="Tanggal Selesai" help="*Kosongkan jika hanya 1 hari.">
                                            <UInput v-model="form.tgl_selesai" type="date" class="w-full bg-white font-bold rounded-xl" icon="lucide:calendar-days" size="lg" />
                                        </UFormField>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                        <div class="flex flex-wrap justify-center gap-4">
                            <UButton 
                                v-if="isEditing"
                                variant="soft"
                                color="neutral"
                                size="xl"
                                class="px-10 font-black py-4 rounded-2xl active:scale-95 transition-all"
                                @click="resetForm"
                            >
                                BATALKAN EDIT
                            </UButton>
                            
                            <UButton 
                                :color="isEditing ? 'success' : 'primary'" 
                                size="xl"
                                :class="[
                                    'px-16 font-black py-4 shadow-xl transition-all rounded-2xl group active:scale-95',
                                    isEditing ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                ]" 
                                @click="handleGenerate"
                                :loading="saving"
                            >
                                <Icon :name="isEditing ? 'lucide:save' : 'lucide:printer'" class="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                                {{ isEditing ? 'UPDATE DATA SURAT' : 'GENERATE & CATAT SURAT TUGAS' }}
                            </UButton>
                        </div>
                        <p v-if="!isEditing" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Icon name="lucide:info" class="w-3 h-3" />
                            Sistem akan membuat record terpisah untuk setiap siswa terpilih
                        </p>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- B. MONITORING & RIWAYAT -->
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 ring-1 ring-slate-100">
            <div 
                class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 bg-slate-50/30"
                @click="isMonitoringExpanded = !isMonitoringExpanded"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-slate-100 rounded-lg shadow-sm border border-slate-200">
                        <Icon name="lucide:database" class="w-5 h-5 text-slate-600" />
                    </div>
                    <h2 class="text-sm font-black text-slate-700 uppercase tracking-wider">B. MONITORING & RIWAYAT SURAT</h2>
                </div>
                <Icon 
                    :name="isMonitoringExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" 
                    class="w-5 h-5 text-slate-400" 
                />
            </div>

            <div v-show="isMonitoringExpanded" class="p-6 space-y-6">
                <!-- Filters -->
                <div class="flex flex-col sm:flex-row gap-4 items-end">
                    <div class="flex-1 space-y-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pencarian Cepat</label>
                        <UInput
                            v-model="filters.search"
                            placeholder="Cari nomor surat, nama siswa, atau keperluan..."
                            icon="lucide:search"
                            class="w-full font-medium rounded-xl shadow-sm ring-1 ring-slate-100"
                            size="lg"
                            @keyup.enter="fetchData"
                        />
                    </div>
                    <UButton color="neutral" variant="soft" size="lg" class="px-8 font-bold h-[44px] rounded-xl border border-slate-200" @click="fetchData">
                        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                        Refresh
                    </UButton>
                </div>

                <!-- Table -->
                <div class="border border-slate-100 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100">
                    <div v-if="loading" class="p-8 space-y-4">
                        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
                    </div>
                    <UTable v-else :data="suratKesiswaan" :columns="columns" class="w-full">
                        <template #nomor_surat-cell="{ row }">
                            <div class="flex items-center gap-2 px-2">
                                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span class="font-black text-blue-700 tracking-tight text-[11px]">{{ row.original.nomor_surat || 'BELUM TERBIT' }}</span>
                            </div>
                        </template>
                        <template #nama-cell="{ row }">
                            <div class="flex flex-col py-1">
                                <span class="font-black text-slate-800 uppercase tracking-tight text-xs">{{ row.original.nama }}</span>
                                <div class="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                    <Icon name="lucide:graduation-cap" class="w-3 h-3" />
                                    {{ row.original.kelas || '-' }}
                                </div>
                            </div>
                        </template>
                        <template #tanggal_surat-cell="{ row }">
                            <span class="text-[11px] font-bold text-slate-600">{{ formatDate(row.original.tanggal_surat) }}</span>
                        </template>
                        <template #status-cell="{ row }">
                            <UBadge :color="getStatusColor(row.original.status)" variant="soft" size="sm" class="font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border border-current/10">
                                {{ row.original.status }}
                            </UBadge>
                        </template>
                        <template #actions-cell="{ row }">
                            <div class="flex items-center gap-1">
                                <UTooltip text="Lihat Detail">
                                    <UButton variant="ghost" color="neutral" size="xs" @click="viewDetail(row.original)" class="hover:bg-blue-50 hover:text-blue-600 rounded-lg">
                                        <Icon name="lucide:eye" class="w-4 h-4" />
                                    </UButton>
                                </UTooltip>
                                <UTooltip text="Edit Data">
                                    <UButton variant="ghost" color="neutral" size="xs" @click="editSurat(row.original)" class="hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">
                                        <Icon name="lucide:pencil" class="w-4 h-4" />
                                    </UButton>
                                </UTooltip>
                                <UTooltip text="Hapus permanen">
                                    <UButton variant="ghost" color="error" size="xs" @click="confirmDelete(row.original)" class="hover:bg-red-50 rounded-lg">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </UButton>
                                </UTooltip>
                            </div>
                        </template>
                    </UTable>
                </div>

                <!-- Pagination -->
                <div class="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner shadow-white">
                    <p class="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                        Total Database: <span class="text-slate-900">{{ pagination.total }} Record</span>
                    </p>
                    <div class="flex items-center gap-2">
                        <UButton 
                            variant="outline" 
                            color="neutral" 
                            size="sm" 
                            class="font-bold px-4 rounded-xl bg-white border-slate-200" 
                            :disabled="pagination.page === 1" 
                            @click="changePage(pagination.page - 1)"
                        >
                            <Icon name="lucide:chevron-left" class="w-4 h-4 mr-1" />
                            Prev
                        </UButton>
                        <div class="flex items-center gap-1">
                            <span class="text-xs font-black px-4 py-1.5 bg-blue-600 text-white shadow-md shadow-blue-100 rounded-xl">{{ pagination.page }}</span>
                        </div>
                        <UButton 
                            variant="outline" 
                            color="neutral" 
                            size="sm" 
                            class="font-bold px-4 rounded-xl bg-white border-slate-200" 
                            :disabled="pagination.page * pagination.limit >= pagination.total" 
                            @click="changePage(pagination.page + 1)"
                        >
                            Next
                            <Icon name="lucide:chevron-right" class="w-4 h-4 ml-1" />
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal 
            v-model:open="showDetailModal" 
            title="Informasi Detail Surat" 
            description="Detail lengkap surat kesiswaan yang dipilih"
            size="lg"
        >
            <template #body>
                <div v-if="selectedSurat" class="space-y-8">
                    <div class="flex items-start justify-between bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-inner ring-1 ring-blue-50">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black">Nomor Surat Terdaftar</p>
                            <p class="font-black text-blue-700 text-2xl tracking-tighter">{{ selectedSurat.nomor_surat || 'BELUM TERBIT' }}</p>
                        </div>
                        <UBadge :color="getStatusColor(selectedSurat.status)" variant="solid" class="font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-[10px] shadow-md">
                            {{ selectedSurat.status }}
                        </UBadge>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-1">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black">Kategori Dokumen</p>
                            <div class="flex items-center gap-2">
                                <Icon name="lucide:file-type" class="w-4 h-4 text-slate-400" />
                                <p class="font-bold text-slate-700 uppercase text-xs tracking-tight">{{ selectedSurat.jenis }}</p>
                            </div>
                        </div>
                        <div class="space-y-1 md:text-right">
                            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black">Tanggal Penerbitan</p>
                            <div class="flex items-center md:justify-end gap-2 text-slate-700">
                                <Icon name="lucide:calendar" class="w-4 h-4 text-slate-400" />
                                <p class="font-bold">{{ formatDate(selectedSurat.tanggal_surat) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black ml-1">Personil Terkait</p>
                        <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div class="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                <Icon name="lucide:user" class="w-6 h-6" />
                            </div>
                            <div>
                                <p class="font-black text-slate-800 uppercase tracking-tight">{{ selectedSurat.nama }}</p>
                                <p v-if="selectedSurat.kelas" class="text-xs font-bold text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                                    <Icon name="lucide:award" class="w-3.5 h-3.5" />
                                    {{ selectedSurat.kelas }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black ml-1">Perihal / Keperluan</p>
                        <div class="relative">
                            <div class="absolute -top-3 -left-3 text-slate-100 pointer-events-none">
                                <Icon name="lucide:quote" class="w-12 h-12 rotate-180" />
                            </div>
                            <p class="text-slate-700 font-medium leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 italic shadow-sm relative z-10 ring-1 ring-slate-50">
                                {{ selectedSurat.keperluan || '-' }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-3 px-6 pb-6">
                    <UButton variant="soft" color="neutral" class="font-bold px-8 rounded-xl h-[44px]" @click="showDetailModal = false">Tutup Jendela</UButton>
                    <UButton color="primary" class="font-bold px-10 shadow-lg shadow-blue-100 rounded-xl h-[44px]" @click="editSurat(selectedSurat!); showDetailModal = false">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit Data Ini
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useSuratKesiswaan, type SuratKesiswaan } from "~/composables/api/use-surat-kesiswaan";
import { useSuratMasuk, type SuratMasuk } from "~/composables/api/use-surat-masuk";
import { useKelasApi, useSiswaApi, type Siswa } from "~/composables/api/use-academic";
import { useSweetAlert } from "~/composables/use-sweet-alert";

definePageMeta({ layout: "tata-usaha" });

const {
    getTugas, createTugas, update, remove
} = useSuratKesiswaan();
const { getAll: getAllSuratMasuk } = useSuratMasuk();
const { getAll: getAllKelas } = useKelasApi();
const { getAll: getAllSiswa } = useSiswaApi();
const { showConfirmation, showSuccess } = useSweetAlert();

const loading = ref(false);
const loadingSiswa = ref(false);
const loadingSuratMasuk = ref(false);
const saving = ref(false);
const showDetailModal = ref(false);
const isEditing = ref(false);
const isFormExpanded = ref(true);
const isMonitoringExpanded = ref(false);
const selectedSurat = ref<SuratKesiswaan | null>(null);

const suratKesiswaan = ref<SuratKesiswaan[]>([]);
const rawSuratMasukList = ref<SuratMasuk[]>([]);
const pagination = ref({ page: 1, limit: 10, total: 0 });
const filters = ref({ search: "" });

const form = ref({
    jenis_dokumen: "Surat Tugas (Kegiatan Luar Sekolah)",
    dasar_penugasan_id: undefined as string | undefined,
    keperluan: "",
    tempat: "",
    alamat: "",
    waktu_jam: "",
    tgl_mulai: new Date().toISOString().split('T')[0],
    tgl_selesai: "",
});

const filterSiswa = ref({
    tingkat: "",
    id_kelas: "",
    search: "",
});

const siswaList = ref<Siswa[]>([]);
const selectedSiswa = ref<Siswa[]>([]);

const suratMasukOptions = ref<{ label: string, value: string }[]>([]);
const tingkatOptions = [
    { label: "Kelas X", value: "X" },
    { label: "Kelas XI", value: "XI" },
    { label: "Kelas XII", value: "XII" },
];
const kelasOptions = ref<{ label: string, value: string }[]>([]);

const jenisDokumenOptions = [
    { label: "Surat Tugas (Kegiatan Luar Sekolah)", value: "Surat Tugas (Kegiatan Luar Sekolah)" },
    { label: "Surat Keterangan Siswa Aktif", value: "Surat Keterangan Siswa Aktif" },
    { label: "Surat Izin / Dispensasi", value: "Surat Izin / Dispensasi" },
];

const columns = [
    { accessorKey: "nomor_surat", header: "No. Surat" },
    { accessorKey: "nama", header: "Nama / Personil" },
    { accessorKey: "tanggal_surat", header: "Tgl Surat" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
];

const filteredSiswaList = computed(() => {
    if (!filterSiswa.value.search) return siswaList.value;
    const search = filterSiswa.value.search.toLowerCase();
    return siswaList.value.filter(s => 
        s.nama_siswa.toLowerCase().includes(search) || 
        s.nis.includes(search)
    );
});

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

async function fetchSuratMasuk() {
    loadingSuratMasuk.value = true;
    try {
        const res = await getAllSuratMasuk({ limit: 100 });
        if (res.success && res.data) {
            rawSuratMasukList.value = res.data.data;
            suratMasukOptions.value = res.data.data.map(s => ({
                label: `${s.nomor_surat} - ${s.perkara || s.asal_surat}`,
                value: String(s.id)
            }));
        }
    } catch (err) {
        console.error(err);
    } finally {
        loadingSuratMasuk.value = false;
    }
}

function onDasarPenugasanChange(id: string) {
    if (!id) return;
    const selected = rawSuratMasukList.value.find(s => String(s.id) === id);
    if (selected && !form.value.keperluan) {
        form.value.keperluan = selected.perkara || `Menindaklanjuti surat dari ${selected.asal_surat}`;
    }
}

async function fetchKelas() {
    if (!filterSiswa.value.tingkat) return;
    try {
        const res = await getAllKelas({ limit: 100 });
        if (res.success && res.data) {
            kelasOptions.value = res.data.data
                .filter(k => k.kode_tingkat === filterSiswa.value.tingkat)
                .map(k => ({
                    label: k.nama_kelas,
                    value: k.id_kelas
                }));
        }
    } catch (err) {
        console.error(err);
    }
}

async function fetchSiswa() {
    if (!filterSiswa.value.id_kelas) return;
    loadingSiswa.value = true;
    try {
        const res = await getAllSiswa({ id_kelas: filterSiswa.value.id_kelas, limit: 100 });
        if (res.success && res.data) {
            siswaList.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loadingSiswa.value = false;
    }
}

function toggleSiswa(siswa: Siswa) {
    if (isEditing.value) return;
    const idx = selectedSiswa.value.findIndex(s => s.id_siswa === siswa.id_siswa);
    if (idx > -1) {
        selectedSiswa.value.splice(idx, 1);
    } else {
        selectedSiswa.value.push(siswa);
    }
}

function isSiswaSelected(id: string) {
    return selectedSiswa.value.some(s => s.id_siswa === id);
}

function selectAllSiswa() {
    if (isEditing.value) return;
    filteredSiswaList.value.forEach(s => {
        if (!isSiswaSelected(s.id_siswa)) {
            selectedSiswa.value.push(s);
        }
    });
}

async function fetchData() {
    loading.value = true;
    try {
        const res = await getTugas({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined
        });
        if (res.success && res.data) {
            suratKesiswaan.value = res.data.data;
            pagination.value.total = res.data.total;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

function resetForm() {
    form.value = {
        jenis_dokumen: "Surat Tugas (Kegiatan Luar Sekolah)",
        dasar_penugasan_id: undefined,
        keperluan: "",
        tempat: "",
        alamat: "",
        waktu_jam: "",
        tgl_mulai: new Date().toISOString().split('T')[0],
        tgl_selesai: "",
    };
    selectedSiswa.value = [];
    isEditing.value = false;
    selectedSurat.value = null;
}

async function handleGenerate() {
    if (selectedSiswa.value.length === 0) {
        await showConfirmation("Peringatan", "Silakan pilih setidaknya satu siswa untuk surat ini.", { showCancelButton: false });
        return;
    }

    if (!form.value.keperluan) {
        await showConfirmation("Data Tidak Lengkap", "Kolom Maksud / Keperluan harus diisi.", { showCancelButton: false });
        return;
    }

    saving.value = true;
    try {
        if (isEditing.value && selectedSurat.value) {
            const data = {
                nomor_surat: selectedSurat.value.nomor_surat,
                tanggal_surat: selectedSurat.value.tanggal_surat,
                nama: selectedSiswa.value[0].nama_siswa,
                kelas: selectedSiswa.value[0].kelas?.nama_kelas,
                keperluan: form.value.keperluan,
                waktu_mulai: new Date(form.value.tgl_mulai).toISOString(),
                waktu_selesai: form.value.tgl_selesai ? new Date(form.value.tgl_selesai).toISOString() : undefined,
                alamat: form.value.alamat,
            };
            const res = await update(selectedSurat.value.id, data);
            if (res.success) {
                await showSuccess("Berhasil", "Data surat berhasil diperbarui.");
            }
        } else {
            for (const siswa of selectedSiswa.value) {
                const payload = {
                    jenis: form.value.jenis_dokumen,
                    nama: siswa.nama_siswa,
                    kelas: siswa.kelas?.nama_kelas,
                    tanggal_surat: new Date().toISOString(),
                    keperluan: form.value.keperluan,
                    waktu_mulai: new Date(form.value.tgl_mulai).toISOString(),
                    waktu_selesai: form.value.tgl_selesai ? new Date(form.value.tgl_selesai).toISOString() : undefined,
                    alamat: form.value.alamat,
                };
                await createTugas(payload as any);
            }
            await showSuccess("Berhasil", `${selectedSiswa.value.length} Data surat berhasil dibuat dan dicatat.`);
        }
        
        resetForm();
        fetchData();
        isFormExpanded.value = false;
        isMonitoringExpanded.value = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error(err);
    } finally {
        saving.value = false;
    }
}

function viewDetail(surat: SuratKesiswaan) {
    selectedSurat.value = surat;
    showDetailModal.value = true;
}

function editSurat(surat: SuratKesiswaan) {
    selectedSurat.value = surat;
    isEditing.value = true;
    isFormExpanded.value = true;
    form.value.keperluan = surat.keperluan;
    form.value.tgl_mulai = surat.tanggal_surat.split('T')[0];
    form.value.alamat = surat.alamat || "";
    
    // We create a dummy siswa object to show in the "Selected" area
    selectedSiswa.value = [{
        id_siswa: "temp",
        nama_siswa: surat.nama,
        nis: "-",
        id_kelas: "temp",
        kelas: { id_kelas: "temp", nama_kelas: surat.kelas || "-", kode_tingkat: "" }
    }];
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function confirmDelete(surat: SuratKesiswaan) {
    const result = await showConfirmation("Hapus Data", "Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus data surat ini?");
    if (result.isConfirmed) {
        const res = await remove(surat.id);
        if (res.success) {
            await showSuccess("Terhapus", "Data surat berhasil dihapus dari database.");
            fetchData();
        }
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

watch(() => filterSiswa.value.tingkat, () => {
    filterSiswa.value.id_kelas = "";
    kelasOptions.value = [];
    siswaList.value = [];
    fetchKelas();
});

watch(() => filterSiswa.value.id_kelas, () => {
    siswaList.value = [];
    fetchSiswa();
});

onMounted(() => {
    fetchData();
    fetchSuratMasuk();
});

useHead({ title: "Surat Kesiswaan | Tata Usaha" });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* Custom shadow for cards */
.shadow-emerald-100 {
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05);
}
</style>
