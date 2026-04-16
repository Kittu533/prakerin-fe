<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Mock Data for mapping
const mappingData = ref([
  {
    id: 1,
    nama: 'AHMAD ULINNUHA',
    nis: '232519156',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periodeMulai: '31 Oktober 2025',
    periodeSelesai: '30 Maret 2026',
    durasi: '6 Bulan',
    pembimbing: 'Made Mangku, M.Pd',
    selected: false
  },
  {
    id: 2,
    nama: 'ALDINO ALIF SUBARJA',
    nis: '232519157',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periodeMulai: '1 November 2025',
    periodeSelesai: '31 Maret 2026',
    durasi: '5 Bulan',
    pembimbing: 'Made Mangku, M.Pd',
    selected: false
  },
  {
    id: 3,
    nama: 'EVANIA CALISTA DANISWARA',
    nis: '232519169',
    kelas: 'XII TME 3',
    industri: 'PT. UNGARAN SARI GARMENT',
    alamat: 'Jl. Diponegoro No.235, Genuk Timur, Ungaran, Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50512',
    periodeMulai: '1 November 2025',
    periodeSelesai: '31 Maret 2026',
    durasi: '5 Bulan',
    pembimbing: 'Made Mangku, M.Pd',
    selected: false
  },
  {
    id: 4,
    nama: 'FADIL SURYA MAULANA',
    nis: '232519170',
    kelas: 'XII TME 3',
    industri: 'PT. Madukoro Engineering',
    alamat: 'Kawasan Industri Candi Blok B 2-9 B2073 Ngaliyan Semarang',
    periodeMulai: '1 November 2025',
    periodeSelesai: '31 Maret 2026',
    durasi: '5 Bulan',
    pembimbing: 'Komariyanto, S.Pd',
    selected: false
  }
])

const selectAll = ref(false)
const toggleSelectAll = () => {
  mappingData.value.forEach(item => item.selected = selectAll.value)
}

// Edit Modal State
const isEditModalOpen = ref(false)
const editingStudent = ref<any>(null)

const handleEdit = (row: any) => {
  editingStudent.value = { ...row }
  isEditModalOpen.value = true
}

const handleUpdate = () => {
  // Logic to update data
  isEditModalOpen.value = false
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
          <h1 class="text-3xl font-black text-blue-600 tracking-tight uppercase">REKAP DAN MAPPING DATA PKL</h1>
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
          <span class="text-red-600 uppercase">Penting:</span> Pastikan saat melakukan editing data sudah benar pilihannya.
        </p>
      </div>
    </div>

    <!-- Filter & Mapping Section -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cari Nama/NIS</label>
          <input type="text" placeholder="Ketik..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kelas</label>
          <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer">
            <option>Semua Kelas</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Industri</label>
          <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer">
            <option>Semua</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plot Pembimbing</label>
          <div class="flex gap-2">
            <select class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer">
              <option>-- Plot Pembimbing --</option>
            </select>
            <button class="bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all">
              <Icon name="lucide:users" class="w-4 h-4" />
              Plot
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end border-t border-slate-100 pt-4">
        <button class="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all">
          <Icon name="lucide:layout-grid" class="w-4 h-4" />
          Plot Industri Massal
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Table Nav -->
      <div class="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            Tampilkan: 
            <select class="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none">
              <option>10</option>
            </select>
          </div>
          <span class="text-xs text-slate-400">Menampilkan 10 dari 95 Murid</span>
        </div>
        
        <!-- Pagination -->
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
            <tr class="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
              <th class="px-8 py-5 w-12"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-slate-300 text-blue-600" /></th>
              <th class="px-4 py-5 w-16 text-center">No</th>
              <th class="px-4 py-5">NIS & Nama</th>
              <th class="px-4 py-5 text-center">Kelas</th>
              <th class="px-6 py-5">Industri & Alamat</th>
              <th class="px-6 py-5">Periode</th>
              <th class="px-6 py-5">Pembimbing</th>
              <th class="px-6 py-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(row, index) in mappingData" :key="row.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-8 py-6"><input type="checkbox" v-model="row.selected" class="w-4 h-4 rounded border-slate-300 text-blue-600" /></td>
              <td class="px-4 py-6 text-center font-bold text-slate-400 text-sm">{{ index + 1 }}</td>
              <td class="px-4 py-6">
                <div class="space-y-1">
                  <div class="font-black text-slate-800 text-sm tracking-tight">{{ row.nama }}</div>
                  <div class="text-[10px] font-bold text-slate-400">{{ row.nis }}</div>
                </div>
              </td>
              <td class="px-4 py-6 text-center">
                <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase border border-slate-200">{{ row.kelas }}</span>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1.5 max-w-[300px]">
                  <div class="font-bold text-slate-800 text-sm tracking-tight">{{ row.industri }}</div>
                  <div class="flex items-start gap-1 text-[9px] text-red-500 font-bold leading-relaxed italic">
                    <Icon name="lucide:map-pin" class="w-3 h-3 shrink-0 mt-0.5" />
                    {{ row.alamat }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="font-bold text-blue-600 text-[11px] leading-tight">
                    {{ row.periodeMulai }}<br>
                    <span class="text-slate-400 text-[9px]">s/d</span> {{ row.periodeSelesai }}
                  </div>
                  <span class="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{{ row.durasi }}</span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="font-black text-slate-800 text-xs tracking-tight">{{ row.pembimbing }}</div>
              </td>
              <td class="px-6 py-6 text-center">
                <button 
                  @click="handleEdit(row)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Placement Modal -->
    <UModal 
      v-model:open="isEditModalOpen" 
      title="Edit Penempatan Murid" 
      description="Ubah data penempatan siswa PKL"
      size="lg"
    >
      <template #body>
        <div class="space-y-5" v-if="editingStudent">
          <div class="space-y-1.5">
            <label class="text-sm font-bold text-slate-700">Nama Murid</label>
            <input 
              v-model="editingStudent.nama"
              type="text" 
              class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-bold text-slate-700">Industri (IDUKA)</label>
            <input 
              v-model="editingStudent.industri"
              type="text" 
              class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-bold text-slate-700">Alamat Industri</label>
            <textarea 
              v-model="editingStudent.alamat"
              rows="3"
              class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-slate-700">Tgl Mulai</label>
              <input 
                type="date" 
                class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-bold text-slate-700">Tgl Selesai</label>
              <input 
                type="date" 
                class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-bold text-slate-700">Pembimbing (Kolom P)</label>
            <div class="relative">
              <select 
                v-model="editingStudent.pembimbing"
                class="w-full appearance-none border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer bg-white"
              >
                <option>Made Mangku, M.Pd</option>
                <option>Komariyanto, S.Pd</option>
              </select>
              <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button 
            @click="isEditModalOpen = false"
            class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
          >
            Batal
          </button>
          <button 
            @click="handleUpdate"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
          >
            Update Data
          </button>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMKN 7 SEMARANG</p>
    </div>
  </div>
</template>

<style scoped>
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
