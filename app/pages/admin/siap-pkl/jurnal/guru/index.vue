<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Sections state
const isSubmissionOpen = ref(true)
const isMonitoringOpen = ref(true)

// Modal state
const isModalOpen = ref(false)
const modalTitle = ref('')
const selectedTargetIndustri = ref('')

// Dropdown items for BUAT button
const actionItems = [
  [
    {
      label: 'Penerjunan',
      icon: 'lucide:plane-takeoff',
      click: () => openConfigModal('Penerjunan')
    },
    {
      label: 'Monitoring',
      icon: 'lucide:activity',
      click: () => openConfigModal('Monitoring')
    },
    {
      label: 'Penarikan',
      icon: 'lucide:plane-landing',
      click: () => openConfigModal('Penarikan')
    }
  ]
]

const openConfigModal = (type: string) => {
  modalTitle.value = `KONFIGURASI PENUGASAN (${type.toUpperCase()})`
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Mock Data Submission
const submissionData = ref([
  {
    id: 1,
    periode: '25/03/2026 - 25/07/2026',
    industri: 'PT. PP (Persero) Tbk. (Proyek Jalan Tol Semarang-Demak I B)',
    siswaCount: 2,
    status: 'Ditarik'
  }
])

// Mock Data Monitoring
const monitoringData = ref([
  {
    id: 1,
    industri: 'BNN Provinsi Jawa Tengah',
    alamat: 'Jl. Madukoro Blok BB Semarang, Tawangmas, Kec. Semarang Barat, Kota Semarang, Jawa Tengah',
    terjunan: [],
    monitoring: [
      { nama: 'Khoirun Nisa Nurul Fitri, S.Pd.', tanggal: '02/03/2026' },
      { nama: 'Purwanto, M.Kom.', tanggal: '27/02/2026' }
    ],
    tarikan: []
  }
])
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl shadow-sm p-8 border-b-4 border-blue-600 flex flex-col items-center justify-center text-center space-y-2">
      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden mb-2">
        <img src="/assets/img/logo-skanda.png" alt="Logo" class="w-12 h-12 object-contain" />
      </div>
      <h1 class="text-3xl font-black text-blue-700 tracking-tight uppercase">SISTEM ADMINISTRASI PKL</h1>
      <span class="bg-blue-600 text-white text-[10px] px-4 py-1 rounded font-black uppercase tracking-widest">SMK GITA LARAS</span>
    </div>

    <!-- 1. Data Pengajuan -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isSubmissionOpen = !isSubmissionOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-blue-50/30 text-blue-800 font-bold text-sm hover:bg-blue-50 transition-all border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:file-plus" class="w-5 h-5 text-blue-600" />
          1. DATA PENGAJUAN (URUTAN TERBARU)
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isSubmissionOpen }" />
      </button>

      <div v-show="isSubmissionOpen" class="p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Filter Industri</label>
            <input type="text" placeholder="Cari IDUKA..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Status</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
              <option>-- Semua Status --</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Limit Data</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
              <option>Semua</option>
            </select>
          </div>
          <button class="w-full border border-red-200 text-red-500 hover:bg-red-50 font-bold py-2.5 rounded-lg transition-all text-xs uppercase tracking-widest">RESET</button>
        </div>

        <!-- Table Submission -->
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th class="px-4 py-4 w-12 text-center">NO</th>
                <th class="px-4 py-4 w-40">PERIODE</th>
                <th class="px-6 py-4">INDUSTRI / IDUKA</th>
                <th class="px-4 py-4 text-center">SISWA</th>
                <th class="px-4 py-4 text-center">STATUS TERAKHIR</th>
                <th class="px-4 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in submissionData" :key="idx" class="text-xs hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-6 text-center font-bold text-slate-400 border-r border-slate-50">{{ idx + 1 }}</td>
                <td class="px-4 py-6 border-r border-slate-50">
                  <div class="font-black text-slate-800 leading-relaxed">{{ row.periode.split(' - ')[0] }}<br>{{ row.periode.split(' - ')[1] }}</div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="font-bold text-blue-600 hover:underline cursor-pointer">{{ row.industri }}</div>
                </td>
                <td class="px-4 py-6 text-center border-r border-slate-50">
                  <span class="bg-slate-800 text-white text-[9px] px-2.5 py-1 rounded font-black inline-flex items-center gap-1.5">
                    {{ row.siswaCount }} Siswa <Icon name="lucide:info" class="w-3 h-3" />
                  </span>
                </td>
                <td class="px-4 py-6 text-center border-r border-slate-50">
                  <span class="bg-green-600 text-white text-[9px] px-3 py-1 rounded font-black uppercase tracking-widest">{{ row.status }}</span>
                </td>
                <td class="px-4 py-6 text-center">
                  <UDropdownMenu :items="actionItems">
                    <UButton color="primary" variant="outline" size="xs" class="font-bold">
                      BUAT <Icon name="lucide:chevron-down" class="w-3.5 h-3.5" />
                    </UButton>
                  </UDropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-[10px] text-slate-400 font-bold">Menampilkan 1 dari 1 data</div>
      </div>
    </div>

    <!-- 2. Monitoring Progres -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isMonitoringOpen = !isMonitoringOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-blue-50/30 text-blue-800 font-bold text-sm hover:bg-blue-50 transition-all border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:map-pin" class="w-5 h-5 text-blue-600" />
          2. MONITORING PROGRES (URUTAN TERBARU)
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isMonitoringOpen }" />
      </button>

      <div v-show="isMonitoringOpen" class="p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="md:col-span-1 space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cari Industri</label>
            <input type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none" />
          </div>
          <div class="md:col-span-1 space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cari Guru Pelaksana</label>
            <input type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Limit</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none">
              <option>5 Data</option>
            </select>
          </div>
          <button class="w-full border border-red-200 text-red-500 hover:bg-red-50 font-bold py-2.5 rounded-lg transition-all text-xs uppercase tracking-widest">RESET</button>
        </div>

        <!-- Table Monitoring -->
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th class="px-4 py-4 w-12 text-center">NO</th>
                <th class="px-6 py-4 w-64">INDUSTRI</th>
                <th class="px-6 py-4 text-center">1. TERJUNAN</th>
                <th class="px-6 py-4 text-center">2. MONITOR</th>
                <th class="px-6 py-4 text-center">3. TARIKAN</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in monitoringData" :key="idx" class="text-xs hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-10 text-center font-bold text-slate-400 border-r border-slate-50">{{ idx + 1 }}</td>
                <td class="px-6 py-10 border-r border-slate-50">
                  <div class="space-y-1.5">
                    <div class="font-bold text-blue-600 leading-tight">{{ row.industri }}</div>
                    <div class="text-[10px] text-slate-400 leading-relaxed">{{ row.alamat }}</div>
                  </div>
                </td>
                <td class="px-6 py-10 border-r border-slate-50 text-center text-slate-300">--</td>
                <td class="px-6 py-10 border-r border-slate-50">
                  <div class="space-y-3">
                    <div v-for="(m, mIdx) in row.monitoring" :key="mIdx" class="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:border-blue-200 transition-all text-left">
                      <div class="font-black text-blue-800 text-[11px] mb-1">{{ m.nama }}</div>
                      <div class="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Icon name="lucide:calendar" class="w-3 h-3" /> {{ m.tanggal }}
                      </div>
                      <div class="flex gap-2 mt-2">
                        <button class="text-red-500 font-black text-[9px] uppercase tracking-tighter hover:underline">PDF</button>
                        <button class="text-blue-500 font-black text-[9px] uppercase tracking-tighter hover:underline">DOC</button>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-10 text-center text-slate-300">--</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-[10px] text-slate-400 font-bold">Menampilkan 1 dari 1 data</div>
      </div>
    </div>

    <!-- Modal Konfigurasi Penugasan -->
    <UModal 
      v-model:open="isModalOpen" 
      title="Konfigurasi Penugasan" 
      description="Atur penugasan guru untuk monitoring PKL"
      size="md"
    >
      <template #body>
        <div class="space-y-6">
          <!-- Target Industri Info -->
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-2">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Industri:</p>
            <h3 class="text-lg font-black text-blue-600 leading-tight">{{ selectedTargetIndustri || '-' }}</h3>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-800 uppercase tracking-wide">Ketik Nama Guru Pelaksana</label>
              <input type="text" placeholder="Cari nama guru..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-black text-blue-600 uppercase tracking-wide">Mulai Tugas</label>
                <input type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-blue-600 uppercase tracking-wide">Selesai Tugas</label>
                <input type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-center">
          <button @click="closeModal" class="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs active:scale-95">
            <Icon name="lucide:printer" class="w-5 h-5" />
            CETAK SURAT TUGAS
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
