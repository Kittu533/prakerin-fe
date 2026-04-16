<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Section States
const isFormOpen = ref(true)
const isDataOpen = ref(true)

// Modal State
const isEditModalOpen = ref(false)
const editingData = ref<any>(null)

// Form State
const form = ref({
  konsentrasi: 'Konstruksi Gedung dan Sanitasi',
  namaIndustri: '',
  alamatIndustri: '',
  tahunPelajaran: '2025/2026',
  mulai: '',
  selesai: ''
})

// Table Data
const ukkData = ref([
  {
    id: 1,
    nomor: '400.14.5 / 0237 / 2026',
    tanggal: '2 Maret 2026',
    industri: 'PT. GRAHA SERVICE INDONESIA (PT GSI)',
    alamat: 'Jl. Ahmad Yani No.178, Karangkidul, Semarang',
    mulai: '30 Maret 2026',
    selesai: '2 April 2026'
  },
  {
    id: 2,
    nomor: '400.14.5 / 0236 / 2026',
    tanggal: '2 Maret 2026',
    industri: 'KONSUIL JATENG AREA SEMARANG',
    alamat: 'Jl. Jatingaleh II No.2, Ngesrep, Banyumanik, Semarang',
    mulai: '30 Maret 2026',
    selesai: '16 April 2026'
  }
])

// Stats
const stats = ref({
  total: 2,
  aktif: 2,
  selesai: 0
})

const konsentrasiOptions = [
  'Konstruksi Gedung dan Sanitasi',
  'Teknik Elektronika',
  'Teknik Mekanik Otomotif'
]

const openEditModal = (item: any) => {
  editingData.value = { ...item }
  isEditModalOpen.value = true
}

const closeModal = () => {
  isEditModalOpen.value = false
}

const handleSaveEdit = () => {
  // TODO: Implement save logic
  closeModal()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon name="lucide:award" class="w-7 h-7 text-white" />
          </div>
          <div class="text-white">
            <h1 class="text-2xl font-black tracking-tight uppercase">SIAP - UKK</h1>
            <p class="text-blue-100 text-sm font-medium">Sistem Administrasi UKK & Asesor</p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-bold">
          SMK GITA LARAS
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:file-text" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Surat</p>
            <p class="text-2xl font-black text-blue-700">{{ stats.total }}</p>
          </div>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktif</p>
            <p class="text-2xl font-black text-green-700">{{ stats.aktif }}</p>
          </div>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:clock" class="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selesai</p>
            <p class="text-2xl font-black text-slate-700">{{ stats.selesai }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isFormOpen = !isFormOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white text-blue-700 font-bold uppercase tracking-widest text-sm hover:from-blue-100 transition-all"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:file-plus" class="w-5 h-5" />
          Buat Surat Permohonan
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isFormOpen }" />
      </button>

      <div v-show="isFormOpen" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Konsentrasi Keahlian -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon name="lucide:graduation-cap" class="w-4 h-4 text-blue-600" />
              Konsentrasi Keahlian
            </label>
            <select v-model="form.konsentrasi" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none">
              <option v-for="opt in konsentrasiOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Tahun Pelajaran -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon name="lucide:calendar" class="w-4 h-4 text-blue-600" />
              Tahun Pelajaran
            </label>
            <select v-model="form.tahunPelajaran" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none">
              <option>2024/2025</option>
              <option>2025/2026</option>
              <option>2026/2027</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nama Industri -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon name="lucide:building-2" class="w-4 h-4 text-blue-600" />
              Nama Industri (IDUKA)
            </label>
            <input 
              type="text" 
              v-model="form.namaIndustri" 
              placeholder="Contoh: PT. PP (Persero) Tbk"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <!-- Alamat Industri -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
              Alamat Industri
            </label>
            <input 
              type="text" 
              v-model="form.alamatIndustri" 
              placeholder="Contoh: Jl. Karangjati, Kec. Bergas"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <!-- Waktu Pelaksanaan -->
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:clock" class="w-4 h-4 text-blue-600" />
            Waktu Pelaksanaan UKK
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Mulai</span>
              <input 
                type="date" 
                v-model="form.mulai"
                class="w-full border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Selesai</span>
              <input 
                type="date" 
                v-model="form.selesai"
                class="w-full border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-sm active:scale-[0.99]">
          <Icon name="lucide:file-text" class="w-5 h-5" />
          Generate Surat Permohonan
        </button>
      </div>
    </div>

    <!-- Data Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isDataOpen = !isDataOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white text-slate-700 font-bold uppercase tracking-widest text-sm hover:from-slate-100 transition-all"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:table-2" class="w-5 h-5" />
          Data & Olah Permohonan
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isDataOpen }" />
      </button>

      <div v-show="isDataOpen" class="p-6">
        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <Icon name="lucide:search" class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari nomor surat atau industri..."
                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <select class="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Selesai</option>
          </select>
          <button class="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
            <Icon name="lucide:refresh-cw" class="w-5 h-5" />
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                <th class="px-4 py-4 w-14 text-center border-r border-slate-700">NO</th>
                <th class="px-6 py-4 border-r border-slate-700">Nomor & Tanggal</th>
                <th class="px-6 py-4 border-r border-slate-700">Industri (IDUKA)</th>
                <th class="px-6 py-4 border-r border-slate-700 text-center">Pelaksanaan</th>
                <th class="px-6 py-4 border-r border-slate-700 text-center">Dokumen</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, idx) in ukkData" :key="item.id" class="text-xs hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-5 text-center border-r border-slate-100 font-black text-slate-400">{{ idx + 1 }}</td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="font-bold text-blue-600 hover:underline cursor-pointer">{{ item.nomor }}</div>
                  <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Icon name="lucide:calendar" class="w-3.5 h-3.5" />
                    {{ item.tanggal }}
                  </div>
                </td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="font-black text-slate-800">{{ item.industri }}</div>
                  <div class="text-[10px] text-slate-400 mt-1 flex items-start gap-1">
                    <Icon name="lucide:map-pin" class="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span class="line-clamp-1">{{ item.alamat }}</span>
                  </div>
                </td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="space-y-2 text-center">
                    <div class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[9px] font-black inline-block">
                      {{ item.mulai }}
                    </div>
                    <div class="text-slate-400 text-[9px]">s/d</div>
                    <div class="bg-red-50 text-red-700 px-3 py-1 rounded-full text-[9px] font-black inline-block">
                      {{ item.selesai }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="flex items-center justify-center gap-2">
                    <button class="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all" title="Download DOC">
                      <Icon name="lucide:file-text" class="w-4 h-4" />
                    </button>
                    <button class="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all" title="Download PDF">
                      <Icon name="lucide:file-text" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <button 
                    @click="openEditModal(item)"
                    class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-all"
                  >
                    <Icon name="lucide:edit" class="w-4 h-4" />
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <span class="font-bold text-slate-700">{{ ukkData.length }}</span> dari <span class="font-bold text-slate-700">{{ ukkData.length }}</span> data</span>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button class="px-3 py-1.5 bg-blue-600 text-white rounded font-bold">1</button>
            <button class="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal 
      v-model:open="isEditModalOpen" 
      title="Edit Data Industri" 
      description="Perbarui informasi industri dan pelaksanaan UKK"
      size="lg"
    >
      <template #body>
        <div class="space-y-5" v-if="editingData">
          <!-- Nomor Surat Info -->
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="lucide:file-text" class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nomor Surat</p>
                <p class="font-bold text-blue-700">{{ editingData.nomor }}</p>
              </div>
            </div>
          </div>

          <!-- Nama Industri -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Icon name="lucide:building-2" class="w-4 h-4 text-blue-600" />
              Nama Industri (IDUKA)
            </label>
            <input 
              v-model="editingData.industri" 
              type="text" 
              placeholder="Nama industri tempat UKK"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <!-- Alamat -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
              Alamat Lengkap
            </label>
            <textarea 
              v-model="editingData.alamat" 
              rows="3" 
              placeholder="Alamat lengkap industri"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Tanggal -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Icon name="lucide:calendar" class="w-4 h-4 text-green-600" />
                Tanggal Mulai
              </label>
              <input 
                type="date" 
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Icon name="lucide:calendar-check" class="w-4 h-4 text-red-600" />
                Tanggal Selesai
              </label>
              <input 
                type="date" 
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button 
            @click="closeModal"
            class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button 
            @click="handleSaveEdit"
            class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Icon name="lucide:save" class="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMK GITA LARAS</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>