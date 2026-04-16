<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Mock Data for students
const studentData = ref([
  {
    id: 1,
    nama: 'AHMAD ULINNUHA',
    nis: '232519156',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periode: '31 Okt 2025 s.d 30 Mar 2026',
    durasi: '6 Bulan',
    isTerbit: true,
    selected: false
  },
  {
    id: 2,
    nama: 'ALDINO ALIF SUBARJA',
    nis: '232519157',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periode: '1 Nov 2025 s.d 31 Mar 2026',
    durasi: '5 Bulan',
    isTerbit: false,
    selected: false
  },
  {
    id: 3,
    nama: 'EVANIA CALISTA DANISWARA',
    nis: '232519169',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periode: '1 Nov 2025 s.d 31 Mar 2026',
    durasi: '5 Bulan',
    isTerbit: false,
    selected: false
  },
  {
    id: 4,
    nama: 'FADIL SURYA MAULANA',
    nis: '232519170',
    kelas: 'XII TME 3',
    industri: 'PT. Madukoro Engineering',
    alamat: 'Kawasan Industri Candi Blok B 2-9 B2073 Ngaliyan Semarang',
    periode: '1 Nov 2025 s.d 31 Mar 2026',
    durasi: '5 Bulan',
    isTerbit: false,
    selected: false
  },
  {
    id: 5,
    nama: 'GRISELDA ZASY MAULIDA ALAMSYAH',
    nis: '232519171',
    kelas: 'XII TME 3',
    industri: 'PT. Madukoro Engineering',
    alamat: 'Kawasan Industri Candi Blok B 2-9 B2073 Ngaliyan Semarang',
    periode: '1 Nov 2025 s.d 31 Mar 2026',
    durasi: '5 Bulan',
    isTerbit: false,
    selected: false
  }
])

const selectAll = ref(false)
const toggleSelectAll = () => {
  studentData.value.forEach(item => item.selected = selectAll.value)
}
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-3xl shadow-sm p-8 border border-slate-100 space-y-6">
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-100 shadow-inner">
          <img src="/assets/img/logo-skanda.png" alt="Logo" class="w-14 h-14 object-contain" />
        </div>
        <div class="space-y-1">
          <h1 class="text-3xl font-black text-blue-600 tracking-tight uppercase">MANAJEMEN SURAT TUGAS PKL : MURID</h1>
          <div class="flex items-center gap-3">
            <span class="bg-blue-600 text-white text-[10px] px-4 py-1 rounded font-black uppercase tracking-widest">SMK Gita Laras</span>
            <div class="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              Tahun Ajaran 2025/2026
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Info -->
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 flex items-start gap-3 rounded-r-xl">
        <Icon name="lucide:alert-circle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p class="text-xs text-amber-800 leading-relaxed font-bold">
          <span class="text-red-600 uppercase">Penting:</span> Silahkan pilih/ aktifkan Check List Murid yang akan dibuat Surat Tugas PKL-nya.
        </p>
      </div>
    </div>

    <!-- Toolbar Section -->
    <div class="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 flex flex-wrap items-center gap-3">
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95">
        <Icon name="lucide:zap" class="w-4 h-4" />
        GENERATE TERPILIH
      </button>
      
      <button class="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all">
        <Icon name="lucide:refresh-cw" class="w-5 h-5" />
      </button>

      <div class="relative">
        <select class="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option>SEMUA PLOTTING</option>
        </select>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div class="relative">
        <select class="appearance-none bg-white border border-blue-200 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option>SEMUA DOKUMEN</option>
        </select>
        <Icon name="lucide:chevron-down" class="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <div class="flex-1 min-w-[200px] relative">
        <input 
          type="text" 
          placeholder="Cari nama atau industri..." 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Table Header Info -->
      <div class="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            Tampilkan: 
            <select class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none">
              <option>10</option>
            </select>
          </div>
          <span class="text-xs text-slate-400">Menampilkan 1 - 10 dari 95 data</span>
        </div>
        
        <!-- Pagination Top -->
        <div class="flex items-center gap-1">
          <button class="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>Prev</button>
          <button class="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md">1</button>
          <button class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold">2</button>
          <span class="px-2 text-slate-300">...</span>
          <button class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold">10</button>
          <button class="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">Next</button>
        </div>
      </div>

      <!-- Main Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <th class="px-8 py-5 w-12"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-slate-300 text-blue-600" /></th>
              <th class="px-4 py-5">IDENTITAS SISWA</th>
              <th class="px-6 py-5">INDUSTRI & ALAMAT</th>
              <th class="px-6 py-5">PERIODE & DURASI</th>
              <th class="px-6 py-5">DOKUMEN</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="student in studentData" :key="student.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-8 py-6"><input type="checkbox" v-model="student.selected" class="w-4 h-4 rounded border-slate-300 text-blue-600" /></td>
              <td class="px-4 py-6">
                <div class="space-y-1">
                  <div class="font-black text-slate-800 text-sm tracking-tight">{{ student.nama }}</div>
                  <div class="text-[10px] font-bold text-slate-400">NIS: {{ student.nis }} | {{ student.kelas }}</div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1.5 max-w-[350px]">
                  <div class="font-bold text-blue-600 text-sm hover:underline cursor-pointer tracking-tight">{{ student.industri }}</div>
                  <div class="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed italic">
                    <Icon name="lucide:map-pin" class="w-3 h-3 shrink-0 mt-0.5" />
                    {{ student.alamat }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-2">
                  <div class="font-bold text-slate-700 text-xs">{{ student.periode }}</div>
                  <div class="flex items-center gap-1.5 text-green-600 font-black text-[9px] uppercase tracking-wider">
                    <Icon name="lucide:clock" class="w-3.5 h-3.5" />
                    Durasi: {{ student.durasi }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div v-if="student.isTerbit" class="flex items-center gap-2">
                  <button class="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase hover:bg-blue-100 transition-all">DOC</button>
                  <button class="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-black uppercase hover:bg-red-100 transition-all">PDF</button>
                </div>
                <div v-else>
                  <span class="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Belum Terbit</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMKN 7 SEMARANG</p>
    </div>
  </div>
</template>

<style scoped>
/* Table stylings */
table thead th {
  background-color: #f8fafc;
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
