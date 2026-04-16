<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Filter states
const selectedPembimbing = ref('')
const selectedSiswa = ref('')
const searchQuery = ref('')

// Pembimbing options (mock data)
const pembimbingOptions = [
  { value: 'budi', label: 'Budi Santoso, M.Com' },
  { value: 'sri', label: 'Sri Wahyuni, S.Pd' },
  { value: 'ahmad', label: 'Ahmad Fauzi, S.T' }
]

// Siswa options (mock data)
const siswaOptions = computed(() => {
  if (!selectedPembimbing.value) return []
  return [
    { value: 'jap', label: 'JAP, Yhoswa Tihriyadin - Hotel Chanti' },
    { value: 'ana', label: 'ANA, Putri Rahayu - Hotel Chanti' },
    { value: 'rina', label: 'RINA, Safitri - CV Mitra Jaya' }
  ]
})

// Summary states
const stats = ref({
  totalHari: 8,
  belumFeedback: 2,
  sudahFeedback: 6
})

const feedbackInput = ref('')

// Table Data
const jurnalData = ref([
  {
    id: 1,
    tanggal: '15 Jan 2026',
    judul: 'Persiapan dan Orientasi Tempat PKL',
    materi: 'Mengenal lingkungan kerja, aturan perusahaan, dan tugas-tugas dasar yang harus dilakukan',
    halBaru: 'Sistem kerja shift hotel',
    kendala: 'Belum terbiasa dengan jam kerja',
    solusi: 'Mengatur pola tidur dan istirahat',
    rtl: 'Meningkatkan adaptasi kerja',
    evaluasiOrtu: 'Anak semangat belajar',
    evaluasiGuru: 'Perlu lebih aktif',
    foto: null,
    hasFeedback: true
  },
  {
    id: 2,
    tanggal: '16 Jan 2026',
    judul: 'Mempelajari Tugas Front Office',
    materi: 'Menerima tamu, menjawab telepon, dan melayani check-in check-out',
    halBaru: 'Sistem reservasi hotel',
    kendala: 'Masih bingung dengan kode kamar',
    solusi: 'Membuat catatan singkat',
    rtl: 'Menghafal kode kamar',
    evaluasiOrtu: 'Baik',
    evaluasiGuru: 'Perlu meningkatkan kecepatan',
    foto: null,
    hasFeedback: true
  },
  {
    id: 3,
    tanggal: '17 Jan 2026',
    judul: 'Praktik Melayani Tamu',
    materi: 'Langsung melayani tamu dengan bimbingan senior',
    halBaru: 'Teknik komunikasi dengan tamu',
    kendala: 'Belum percaya diri',
    solusi: 'Latihan di rumah',
    rtl: 'Meningkatkan kepercayaan diri',
    evaluasiOrtu: null,
    evaluasiGuru: null,
    foto: null,
    hasFeedback: false
  }
])

const selectedRows = ref<number[]>([])

const toggleSelectAll = () => {
  if (selectedRows.value.length === jurnalData.value.length) {
    selectedRows.value = []
  } else {
    selectedRows.value = jurnalData.value.map(j => j.id)
  }
}

const toggleRow = (id: number) => {
  const index = selectedRows.value.indexOf(id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(id)
  }
}

const handleSimpanFeedback = () => {
  if (!feedbackInput.value.trim()) return
  // TODO: Implement save feedback logic
  console.log('Feedback saved:', feedbackInput.value)
  feedbackInput.value = ''
}

// Table columns
const columns = [
  { key: 'tanggal', header: 'TANGGAL', sortable: true },
  { key: 'kegiatan', header: 'KEGIATAN PKL' },
  { key: 'halBaru', header: 'HAL BARU' },
  { key: 'kendala', header: 'KENDALA' },
  { key: 'solusi', header: 'SOLUSI' },
  { key: 'rtl', header: 'RTL' },
  { key: 'evaluasi', header: 'EVALUASI' },
  { key: 'foto', header: 'FOTO' },
  { key: 'aksi', header: 'PILIH' }
]
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon name="lucide:book-open" class="w-7 h-7 text-white" />
          </div>
          <div class="text-white">
            <h1 class="text-2xl font-black tracking-tight uppercase">Monitoring Jurnal PKL</h1>
            <p class="text-blue-100 text-sm font-medium">Kelola dan pantau jurnal harian siswa PKL</p>
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-bold">
          SMK GITA LARAS
        </div>
      </div>

      <!-- Alert Info -->
      <div class="p-4 bg-amber-50 border-t border-amber-100">
        <div class="flex items-start gap-3">
          <Icon name="lucide:alert-circle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="text-amber-800 font-medium">
              Baris dengan latar belakang <span class="font-bold bg-amber-200/50 px-1.5 py-0.5 rounded">kuning</span> adalah jurnal yang belum diberi feedback.
              Silakan berikan tanggapan untuk membantu siswa meningkatkan kualitas jurnalnya.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center gap-2 mb-4">
        <Icon name="lucide:filter" class="w-5 h-5 text-blue-600" />
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-widest">Filter Data</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">PEMBIMBING</label>
          <select 
            v-model="selectedPembimbing" 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-slate-300"
          >
            <option value="">Pilih Pembimbing...</option>
            <option v-for="opt in pembimbingOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">SISWA PKL</label>
          <select 
            v-model="selectedSiswa" 
            class="w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all text-blue-800 font-medium"
            :disabled="!selectedPembimbing"
          >
            <option value="">Pilih Siswa...</option>
            <option v-for="opt in siswaOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">CARI</label>
          <div class="relative">
            <Icon name="lucide:search" class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari judul, materi..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Data Content (Shown only when filtered) -->
    <template v-if="selectedPembimbing && selectedSiswa">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
        <div class="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:calendar-check" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Hari</p>
            <p class="text-2xl font-black text-blue-700">{{ stats.totalHari }}</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sudah Feedback</p>
            <p class="text-2xl font-black text-green-700">{{ stats.sudahFeedback }}</p>
          </div>
        </div>
        
        <div class="bg-white rounded-xl border border-amber-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="lucide:message-circle" class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Belum Feedback</p>
            <p class="text-2xl font-black text-amber-700">{{ stats.belumFeedback }}</p>
          </div>
        </div>
      </div>

      <!-- Feedback Input Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="lucide:message-square-plus" class="w-5 h-5 text-blue-600" />
          <h2 class="text-sm font-bold text-slate-700 uppercase tracking-widest">Tulis Feedback</h2>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4">
          <textarea 
            v-model="feedbackInput"
            placeholder="Tulis instruksi atau feedback untuk siswa di sini..."
            class="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none transition-all"
            rows="3"
          ></textarea>
          <div class="flex md:flex-col gap-2">
            <button 
              @click="handleSimpanFeedback"
              :disabled="!feedbackInput.trim()"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
            >
              <Icon name="lucide:send" class="w-4 h-4" />
              Simpan
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="lucide:table" class="w-5 h-5 text-blue-600" />
            <h2 class="text-sm font-bold text-slate-700 uppercase tracking-widest">Data Jurnal Harian</h2>
          </div>
          <div class="text-xs text-slate-500">
            Menampilkan <span class="font-bold text-slate-700">{{ jurnalData.length }}</span> data
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr class="bg-blue-800 text-white text-[10px] font-black uppercase tracking-widest">
                <th class="px-4 py-4 text-center w-12 border-r border-blue-700">
                  <input 
                    type="checkbox" 
                    :checked="selectedRows.length === jurnalData.length"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded border-white/30 bg-transparent text-blue-300 focus:ring-blue-400"
                  />
                </th>
                <th class="px-4 py-4 w-24 border-r border-blue-700">Tanggal</th>
                <th class="px-6 py-4 border-r border-blue-700 w-[200px]">Kegiatan PKL</th>
                <th class="px-4 py-4 border-r border-blue-700">Hal Baru</th>
                <th class="px-4 py-4 border-r border-blue-700">Kendala</th>
                <th class="px-4 py-4 border-r border-blue-700">Solusi</th>
                <th class="px-4 py-4 border-r border-blue-700">RTL</th>
                <th class="px-6 py-4 border-r border-blue-700 w-[180px]">Evaluasi</th>
                <th class="px-4 py-4 text-center w-16 border-r border-blue-700">Foto</th>
                <th class="px-4 py-4 w-12">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="(item, index) in jurnalData" 
                :key="item.id" 
                class="text-xs hover:bg-slate-50/50 transition-colors"
                :class="{ 'bg-amber-50 border-l-2 border-l-amber-400': !item.hasFeedback }"
              >
                <td class="px-4 py-5 text-center border-r border-slate-100">
                  <input 
                    type="checkbox" 
                    :checked="selectedRows.includes(item.id)"
                    @change="toggleRow(item.id)"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-5 border-r border-slate-100">
                  <div class="font-bold text-slate-800">{{ item.tanggal }}</div>
                  <div class="text-[10px] text-slate-400">Hari ke-{{ index + 1 }}</div>
                </td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="space-y-1">
                    <div class="font-bold text-blue-700">{{ item.judul }}</div>
                    <div class="text-slate-500 leading-relaxed text-[11px] line-clamp-2">{{ item.materi }}</div>
                  </div>
                </td>
                <td class="px-4 py-5 border-r border-slate-100">
                  <div class="text-slate-600 max-w-[120px] truncate" :title="item.halBaru">{{ item.halBaru }}</div>
                </td>
                <td class="px-4 py-5 border-r border-slate-100">
                  <div class="text-slate-600 max-w-[120px] truncate" :title="item.kendala">{{ item.kendala }}</div>
                </td>
                <td class="px-4 py-5 border-r border-slate-100">
                  <div class="text-slate-600 max-w-[120px] truncate" :title="item.solusi">{{ item.solusi }}</div>
                </td>
                <td class="px-4 py-5 border-r border-slate-100">
                  <div class="text-slate-600 max-w-[100px] truncate" :title="item.rtl">{{ item.rtl }}</div>
                </td>
                <td class="px-6 py-5 border-r border-slate-100">
                  <div class="space-y-2">
                    <div class="flex items-start gap-1.5">
                      <Icon name="lucide:users" class="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span class="text-red-600 font-bold">Ortu:</span>
                        <span class="text-slate-500" :class="{ 'italic text-slate-400': !item.evaluasiOrtu }">
                          {{ item.evaluasiOrtu || 'Belum ada' }}
                        </span>
                      </div>
                    </div>
                    <div class="border-t border-slate-100 pt-2 flex items-start gap-1.5">
                      <Icon name="lucide:user" class="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span class="text-blue-600 font-bold">Guru:</span>
                        <span class="text-slate-500" :class="{ 'italic text-slate-400': !item.evaluasiGuru }">
                          {{ item.evaluasiGuru || 'Belum ada' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-5 text-center border-r border-slate-100">
                  <button v-if="item.foto" class="text-blue-600 hover:text-blue-700">
                    <Icon name="lucide:image" class="w-5 h-5" />
                  </button>
                  <span v-else class="text-slate-300 text-[10px]">-</span>
                </td>
                <td class="px-4 py-5">
                  <div class="flex justify-center">
                    <button 
                      class="p-2 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                      title="Lihat Detail"
                    >
                      <Icon name="lucide:eye" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="text-xs text-slate-500">
            Total <span class="font-bold text-slate-700">{{ jurnalData.length }}</span> jurnal
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>
              <Icon name="lucide:chevron-left" class="w-3 h-3" />
            </button>
            <span class="px-3 py-1.5 text-[10px] font-bold bg-blue-600 text-white rounded">1</span>
            <button class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>
              <Icon name="lucide:chevron-right" class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
        <Icon name="lucide:search-x" class="w-10 h-10 text-slate-300" />
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-700">Data Belum Difilter</h3>
        <p class="text-sm text-slate-400 max-w-xs">Pilih Nama Pembimbing dan Siswa PKL terlebih dahulu untuk menampilkan data jurnal harian.</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM PKL &copy; 2026 | SMK GITA LARAS</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>