<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Sections state
const isFormOpen = ref(true)
const isDataOpen = ref(true)
const isDashboardOpen = ref(true)

// Form State
const form = ref({
  namaIndustri: '',
  alamatIndustri: '',
  filterKelas: '',
  tahunPelajaran: '2025/2026',
  periodeMulai: '',
  periodeSelesai: ''
})

// Table Data
const tableData = ref([
  {
    id: 1,
    nomorSurat: {
      prm: '400.14.5 / 0007 / 2026',
      png: '400.14.5 / 0009 / 2026',
      trk: '400.14.5 / 0009 / 2026'
    },
    tanggal: {
      prm: '22 Maret 2026',
      png: '28 Maret 2026',
      trk: '30 Maret 2026'
    },
    periode: '25 Maret 2026 - 25 Juli 2026',
    durasi: '5 Bln',
    industri: 'PT. PP (Persero) Tbk. (Proyek Jalan Tol Semarang-Demak I B)',
    alamat: 'Jl. Karangjati, Kec. Bergas',
    siswaCount: 2,
    kelas: 'XII TEK 2',
    status: 'Ditarik'
  },
  {
    id: 2,
    nomorSurat: {
      prm: '400.14.5 / 0006 / 2026',
      png: '-',
      trk: '-'
    },
    tanggal: {
      prm: '22 Maret 2026',
      png: '',
      trk: ''
    },
    periode: '23 Maret 2026 - 22 Juni 2026',
    durasi: '4 Bln',
    industri: 'PT. Wijaya Karya (Persero) Tbk.',
    alamat: 'Jl. Tambakrejo, Kec. Gay...',
    siswaCount: 2,
    kelas: 'XII TKR 1',
    status: 'Diajukan'
  }
])

// Charts Placeholder Data (using plain div/svg for now as per image)
const stats = ref({
  industriAktif: 4,
  totalSiswa: 8,
  berkasSurat: 4
})

const activeTab = ref('Diajukan')
const tabs = [
  { label: 'Diajukan', count: 3 },
  { label: 'Disetujui', count: 0 },
  { label: 'Diterjunkan', count: 0 },
  { label: 'Ditarik', count: 1 }
]
</script>

<template>
  <div class="p-6 space-y-8 bg-slate-50 min-h-screen font-sans">
    <!-- Main Header -->
    <div class="bg-white rounded-3xl shadow-sm p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-100 shadow-inner">
          <img src="/assets/img/logo-skanda.png" alt="Logo" class="w-14 h-14 object-contain" />
        </div>
        <div class="text-center md:text-left">
          <h1 class="text-4xl font-black text-blue-600 tracking-tighter uppercase">SIAP - PKL</h1>
          <p class="text-slate-500 font-bold text-sm tracking-wide">Sistem Administrasi & Persuratan PKL</p>
          <div class="mt-2">
            <span class="bg-blue-600 text-white text-[10px] px-4 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">SMK GITA LARAS</span>
          </div>
        </div>
      </div>

      <!-- System Status Card -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 p-4 min-w-[280px]">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
            <Icon name="lucide:cpu" class="w-4 h-4" />
            System Health
          </div>
          <span class="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-black">0.00%</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-bold">
          <span class="text-slate-400">Runtime Terpakai:</span>
          <span class="text-slate-700">0.00 / 360 Menit</span>
        </div>
        <div class="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 w-[5%]"></div>
        </div>
      </div>
    </div>

    <!-- 1. Form Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isFormOpen = !isFormOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-blue-50/50 text-blue-700 font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:file-plus-2" class="w-5 h-5" />
          BUAT SURAT PERMOHONAN
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isFormOpen }" />
      </button>

      <div v-show="isFormOpen" class="p-8 space-y-8 animate-in fade-in slide-in-from-top-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">NAMA INDUSTRI (IDUKA)</label>
            <input type="text" v-model="form.namaIndustri" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">ALAMAT INDUSTRI</label>
            <input type="text" v-model="form.alamatIndustri" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2 text-blue-700 font-black text-[10px] uppercase tracking-widest">
            <Icon name="lucide:users" class="w-4 h-4" />
            PEMILIHAN SISWA
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <select v-model="form.filterKelas" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm">
                <option value="">-- Pilih Filter Kelas --</option>
              </select>
              <div class="border border-slate-200 rounded-2xl h-[250px] bg-slate-50/50 flex items-center justify-center text-slate-300">
                <!-- List available students -->
              </div>
            </div>
            <div class="space-y-2 relative">
              <div class="flex items-center justify-between mb-2">
                <label class="text-[10px] font-black text-slate-700 uppercase tracking-widest">Siswa Terpilih</label>
                <span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-black">0</span>
              </div>
              <div class="border-2 border-red-100 rounded-2xl h-[250px] bg-white flex items-center justify-center text-slate-300">
                <!-- List selected students -->
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">TAHUN PELAJARAN</label>
            <select v-model="form.tahunPelajaran" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">
              <option>2025/2026</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">PERIODE PKL</label>
            <div class="flex items-center gap-3">
              <input type="date" class="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              <span class="text-slate-400">s/d</span>
              <input type="date" class="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
            </div>
          </div>
        </div>

        <button class="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-sm active:scale-[0.99]">
          <Icon name="lucide:file-text" class="w-5 h-5" />
          GENERATE PERMOHONAN
        </button>
      </div>
    </div>

    <!-- 2. Data Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isDataOpen = !isDataOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-blue-50/50 text-blue-700 font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:table" class="w-5 h-5" />
          LIHAT DATA DETAIL & OLAH DATA
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isDataOpen }" />
      </button>

      <div v-show="isDataOpen" class="p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
        <!-- Inner Collapsibles -->
        <div class="space-y-2">
          <div class="border border-slate-100 rounded-xl overflow-hidden">
            <button class="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
              <div class="flex items-center gap-2">
                <Icon name="lucide:filter" class="w-4 h-4" />
                FILTER DATA
              </div>
              <Icon name="lucide:chevron-down" class="w-4 h-4" />
            </button>
          </div>
          <div class="border border-slate-100 rounded-xl overflow-hidden">
            <button class="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
              <div class="flex items-center gap-2">
                <Icon name="lucide:printer" class="w-4 h-4" />
                AKSI & CETAK MASSAL
              </div>
              <Icon name="lucide:chevron-down" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center border-b border-slate-100 gap-8 px-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.label"
            @click="activeTab = tab.label"
            class="pb-3 text-xs font-bold transition-all relative"
            :class="activeTab === tab.label ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'"
          >
            {{ tab.label }}: <span class="ml-1" :class="activeTab === tab.label ? 'text-blue-700' : 'text-red-500'">{{ tab.count }}</span>
            <div v-if="activeTab === tab.label" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                <th class="px-4 py-4 w-12 text-center border-r border-slate-700"><input type="checkbox" /></th>
                <th class="px-6 py-4 border-r border-slate-700">NOMOR SURAT (PRM/PNG/TRK)</th>
                <th class="px-6 py-4 border-r border-slate-700">PERIODE PKL</th>
                <th class="px-6 py-4 border-r border-slate-700">INDUSTRI (IDUKA)</th>
                <th class="px-6 py-4 border-r border-slate-700">SISWA & KELAS</th>
                <th class="px-6 py-4 border-r border-slate-700">DOKUMEN</th>
                <th class="px-6 py-4 border-r border-slate-700">STATUS</th>
                <th class="px-6 py-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in tableData" :key="item.id" class="text-xs hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-6 text-center border-r border-slate-50"><input type="checkbox" /></td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="space-y-2">
                    <div class="text-[10px] text-slate-400">1. PRM ({{ item.tanggal.prm }}):</div>
                    <div class="font-bold text-slate-700">{{ item.nomorSurat.prm }}</div>
                    <div v-if="item.nomorSurat.png !== '-'" class="mt-2">
                      <div class="text-[10px] text-slate-400">2. PNG ({{ item.tanggal.png }}):</div>
                      <div class="font-bold text-blue-600 underline">{{ item.nomorSurat.png }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="space-y-1">
                    <div class="font-black text-slate-900">{{ item.periode.split(' - ')[0] }}</div>
                    <div class="font-black text-slate-900">{{ item.periode.split(' - ')[1] }}</div>
                    <div class="inline-block border border-slate-200 rounded px-2 py-0.5 text-[9px] font-bold text-slate-500 mt-2">{{ item.durasi }}</div>
                  </div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="font-black text-slate-800 leading-snug">{{ item.industri }}</div>
                  <div class="text-[10px] text-slate-400 mt-1 italic">{{ item.alamat }}</div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="flex flex-col items-center gap-1">
                    <span class="bg-black text-white text-[9px] px-2 py-0.5 rounded font-bold">{{ item.siswaCount }} Siswa</span>
                    <span class="text-blue-600 font-bold text-[10px]">{{ item.kelas }}</span>
                  </div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] text-slate-400 w-8">Prm:</span>
                      <Icon name="lucide:file-text" class="w-4 h-4 text-blue-600" />
                      <Icon name="lucide:file-text" class="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                </td>
                <td class="px-6 py-6 border-r border-slate-50">
                  <span 
                    class="px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase"
                    :class="item.status === 'Ditarik' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-6">
                  <div class="flex items-center justify-center gap-1">
                    <button v-if="item.status === 'Diajukan'" class="p-1.5 border border-green-200 rounded text-green-600 hover:bg-green-50 transition-all"><Icon name="lucide:check" class="w-4 h-4" /></button>
                    <button class="p-1.5 border border-amber-200 rounded text-amber-500 hover:bg-amber-50 transition-all"><Icon name="lucide:pencil" class="w-4 h-4" /></button>
                    <button class="p-1.5 border border-blue-200 rounded text-blue-600 hover:bg-blue-50 transition-all"><Icon name="lucide:upload-cloud" class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan 4 data (Total: 4)</span>
          <div class="flex gap-1">
            <button class="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50"><Icon name="lucide:chevron-left" class="w-4 h-4" /></button>
            <button class="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</button>
            <button class="w-8 h-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50"><Icon name="lucide:chevron-right" class="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Dashboard Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button 
        @click="isDashboardOpen = !isDashboardOpen"
        class="w-full px-6 py-4 flex items-center justify-between bg-blue-50/50 text-blue-700 font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all border-b border-slate-100"
      >
        <div class="flex items-center gap-3">
          <Icon name="lucide:line-chart" class="w-5 h-5" />
          DASHBOARD STATISTIK & MONITORING
        </div>
        <Icon name="lucide:chevron-down" class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isDashboardOpen }" />
      </button>

      <div v-show="isDashboardOpen" class="p-8 space-y-12 animate-in fade-in slide-in-from-top-2">
        <!-- Top Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="border-2 border-blue-600 rounded-xl p-6 text-center">
            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">INDUSTRI AKTIF</div>
            <div class="text-4xl font-black text-blue-600">{{ stats.industriAktif }}</div>
          </div>
          <div class="border-2 border-green-600 rounded-xl p-6 text-center">
            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL SISWA</div>
            <div class="text-4xl font-black text-green-600">{{ stats.totalSiswa }}</div>
          </div>
          <div class="border-2 border-sky-400 rounded-xl p-6 text-center">
            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BERKAS SURAT</div>
            <div class="text-4xl font-black text-sky-500">{{ stats.berkasSurat }}</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Pie Charts -->
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-[10px] font-black text-slate-700 uppercase mb-4">Distribusi Industri</div>
              <div class="w-32 h-32 mx-auto rounded-full border-[15px] border-blue-400 border-t-amber-400 flex items-center justify-center">
                <!-- SVG Circle representation -->
              </div>
              <div class="mt-4 flex flex-col gap-1 items-center">
                <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500"><div class="w-2 h-2 bg-amber-400 rounded-full"></div> Ditarik: 1 Iduka</div>
                <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500"><div class="w-2 h-2 bg-blue-400 rounded-full"></div> Diajukan: 3 Iduka</div>
              </div>
            </div>
            <div class="text-center">
              <div class="text-[10px] font-black text-slate-700 uppercase mb-4">Distribusi Siswa</div>
              <div class="w-32 h-32 mx-auto rounded-full border-[15px] border-sky-400 border-t-amber-400 flex items-center justify-center"></div>
              <div class="mt-4 flex flex-col gap-1 items-center">
                <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500"><div class="w-2 h-2 bg-amber-400 rounded-full"></div> Ditarik: 2 Siswa</div>
                <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500"><div class="w-2 h-2 bg-sky-400 rounded-full"></div> Diajukan: 6 Siswa</div>
              </div>
            </div>
          </div>

          <!-- Activities Table/Grid representation -->
          <div class="space-y-4">
            <div class="text-[10px] font-black text-slate-700 uppercase">GRAFIK AKTIVITAS (MULAI VS SELESAI)</div>
            <div class="h-[250px] flex items-end justify-between gap-4 border-b border-l border-slate-200 p-4">
              <!-- Placeholder bars -->
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-blue-600 h-[100%] rounded-t"></div>
                <span class="text-[8px] text-slate-400 rotate-45 mt-2">Maret 2026</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-blue-600 h-[100%] rounded-t"></div>
                <span class="text-[8px] text-slate-400 rotate-45 mt-2">Mei 2026</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-red-500 h-[60%] rounded-t"></div>
                <span class="text-[8px] text-slate-400 rotate-45 mt-2">Juni 2026</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-red-500 h-[60%] rounded-t"></div>
                <span class="text-[8px] text-slate-400 rotate-45 mt-2">Juli 2026</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-red-500 h-[100%] rounded-t"></div>
                <span class="text-[8px] text-slate-400 rotate-45 mt-2">Februari 2027</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Data Table -->
        <div class="space-y-4">
          <div class="text-[10px] font-black text-slate-700 uppercase tracking-widest">DETAIL DATA ANGKA BULANAN</div>
          <div class="overflow-x-auto rounded-xl border border-slate-100">
            <table class="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr class="bg-slate-50 font-black uppercase">
                  <th class="px-6 py-4 border-r border-slate-200">Parameter</th>
                  <th class="px-6 py-4 border-r border-slate-200 text-center">Maret 2026</th>
                  <th class="px-6 py-4 border-r border-slate-200 text-center">Mei 2026</th>
                  <th class="px-6 py-4 border-r border-slate-200 text-center">Juni 2026</th>
                  <th class="px-6 py-4 border-r border-slate-200 text-center">Juli 2026</th>
                  <th class="px-6 py-4 text-center">Februari 2027</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-bold">
                <tr>
                  <td class="px-6 py-4 border-r border-slate-200 font-black">Siswa Berangkat</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">4</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">4</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">0</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">0</td>
                  <td class="px-6 py-4 text-center">0</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 border-r border-slate-200 font-black text-red-500">Siswa Kembali</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">0</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">0</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">2</td>
                  <td class="px-6 py-4 border-r border-slate-200 text-center">2</td>
                  <td class="px-6 py-4 text-center">4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Duration Distribution -->
        <div class="border border-slate-100 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 bg-slate-50/50 flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase border-b border-slate-100">
            <Icon name="lucide:clock" class="w-4 h-4" />
            Distribusi Durasi PKL Industri
          </div>
          <div class="grid grid-cols-3 divide-x divide-slate-100 p-8">
            <div class="text-center space-y-4">
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">4 Bln</div>
              <div class="text-3xl font-black text-blue-600">1</div>
              <div class="text-[9px] text-slate-400 font-bold uppercase">Industri</div>
            </div>
            <div class="text-center space-y-4">
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">5 Bln</div>
              <div class="text-3xl font-black text-blue-600">1</div>
              <div class="text-[9px] text-slate-400 font-bold uppercase">Industri</div>
            </div>
            <div class="text-center space-y-4">
              <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">10 Bln</div>
              <div class="text-3xl font-black text-blue-600">2</div>
              <div class="text-[9px] text-slate-400 font-bold uppercase">Industri</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMKN 7 SEMARANG</p>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
