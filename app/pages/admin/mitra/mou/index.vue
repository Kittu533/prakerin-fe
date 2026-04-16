<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Mock data for MoU table
const mouData = ref([
  {
    id: 1,
    nama: 'Cassio SingaporePTE. LTD.',
    bidang: 'PENDIDIKAN',
    alamat: 'Menara Cakrawala, Jl. M.H. Thamrin No.9 lantai 14, RT.2/RW.1, Kb. Sirih, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10340',
    no_mou: '400.14.5.4/0129/2026',
    perihal: 'NOTA KESEPAHAMAN (MoU) ANTARA CASIO SINGAPORE PTE. LTD. - JAKARTA REPRESENTATIVE OFFICE DAN SMKN 7 SEMARANG',
    tags: ['TKP'],
    mulai: '30-01-2026',
    berakhir: '30-01-2029',
    status: 'AKTIF',
    pic_nama: '-',
    pic_telepon: '-',
    link_dokumen: '#'
  },
  {
    id: 2,
    nama: 'YAYASAN SAVE THE CHILDREN INDONESIA',
    bidang: 'JASA',
    alamat: 'Kantor Nasional: Jln. Bangka IX No. 40 A&B, Mampang Prapatan Jakarta Selatan, DKI Jakarta 12720',
    no_mou: '376.AGR.YSTC.XI.2024',
    perihal: 'KESEPAKATAN BERSAMA ANTARA YAYASAN SAVE THE CHILDREN INDONESIA DENGAN SMKN 7 SEMARANG TENTANG KETERLIBATAN DALAM PROGRAM KECAKAPAN KESIAPAN KERJA',
    tags: ['KPBS', 'PPLG', 'TEK', 'TKL', 'TKP', 'TME', 'TO', 'TPFL'],
    mulai: '11-11-2024',
    berakhir: '11-11-2025',
    status: 'EXPIRED',
    pic_nama: '-',
    pic_telepon: '-',
    link_dokumen: '#'
  },
  {
    id: 3,
    nama: 'Yayasan Save The Children Indonesia',
    bidang: 'JASA',
    alamat: 'Kantor Nasional: Jln. Bangka IX No. 40 A&B, Mampang Prapatan Jakarta Selatan, DKI Jakarta 12720',
    no_mou: '010.AGR.YSTC.I.',
    perihal: 'PERJANJIAN KERJASAMA ANTARA YAYASAN SAVE THE CHILDREN INDONESIA DENGAN SMKN 7 SEMARANG TENTANG KETERLIBATAN DALAM PROGRAM KESIAPAN KERJA',
    tags: ['TKL', 'PPLG', 'TPFL', 'TO', 'TKP', 'KPBS', 'TEK', 'TME'],
    mulai: '18-01-2026',
    berakhir: '28-08-2028',
    status: 'AKTIF',
    pic_nama: '-',
    pic_telepon: '-',
    link_dokumen: '#'
  }
])

const isModalOpen = ref(false)

const filters = ref({
  nama: '',
  alamat: '',
  bidang: 'Semua Bidang',
  masa_berlaku: 'Semua Masa Berlaku'
})

const form = ref({
  nama: '',
  bidang: '',
  alamat: '',
  no_mou: '',
  perihal: '',
  kompetensi: '',
  tanggal_mulai: '',
  tanggal_berakhir: '',
  pic_nama: '',
  pic_telepon: '',
  link_maps: ''
})

const stats = ref({
  total: 3,
  aktif: 2,
  expired: 1,
  bulan_ini: 0,
  tahun_ini: 0,
  bidang: [
    { label: 'JASA', count: 2 },
    { label: 'PENDIDIKAN', count: 1 }
  ]
})

const bidangOptions = ['PENDIDIKAN', 'JASA', 'INDUSTRI', 'PERDAGANGAN', 'LAINNYA']

const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }
const handleSave = () => { 
  // TODO: Implement save logic
  closeModal() 
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <AdminMitraHeader 
      title="PENDATAAN MOU DENGAN DU/DI MITRA" 
      role="WAKA HUMAS & KEMITRAAN"
      :showLogout="false"
      @add="openModal" 
    />

    <AdminMitraFilterCard title="MONITORING & FILTER DATA MOU">
      <input v-model="filters.nama" type="text" placeholder="Nama Industri..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <input v-model="filters.alamat" type="text" placeholder="Cari Alamat..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <select v-model="filters.bidang" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option>Semua Bidang</option>
        <option>PENDIDIKAN</option>
        <option>JASA</option>
        <option>INDUSTRI</option>
      </select>
      <select v-model="filters.masa_berlaku" class="w-full border-2 border-red-500 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer bg-white">
        <option>Semua Masa Berlaku</option>
        <option>Aktif</option>
        <option>Kadaluarsa</option>
        <option>Akan Kadaluarsa</option>
      </select>
    </AdminMitraFilterCard>

    <AdminMitraStatsSection title="Ringkasan Statistik & Monitoring MoU">
      <div class="bg-blue-600 rounded-xl p-6 flex flex-col items-center justify-center text-white text-center shadow-lg shadow-blue-200">
        <span class="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-90">TOTAL</span>
        <span class="text-5xl font-black">{{ stats.total }}</span>
      </div>
      
      <div class="bg-green-600 rounded-xl p-6 flex flex-col items-center justify-center text-white text-center shadow-lg shadow-green-200">
        <span class="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-90">AKTIF</span>
        <span class="text-5xl font-black">{{ stats.aktif }}</span>
      </div>
      
      <div class="bg-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-white text-center shadow-lg shadow-slate-300">
        <span class="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-90">KADALUARSA</span>
        <span class="text-5xl font-black">{{ stats.expired }}</span>
      </div>
      
      <div class="border-2 border-red-500 rounded-xl p-6 flex flex-col items-center justify-center text-red-600 text-center bg-red-50">
        <span class="text-[10px] font-bold uppercase tracking-widest mb-1">EXP. BULAN INI</span>
        <span class="text-5xl font-black">{{ stats.bulan_ini }}</span>
      </div>
      
      <div class="border-2 border-amber-500 rounded-xl p-6 flex flex-col items-center justify-center text-amber-600 text-center bg-amber-50">
        <span class="text-[10px] font-bold uppercase tracking-widest mb-1">EXP. TAHUN INI</span>
        <span class="text-5xl font-black">{{ stats.tahun_ini }}</span>
      </div>

      <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">DISTRIBUSI BIDANG</h3>
        <div class="space-y-2">
          <div v-for="b in stats.bidang" :key="b.label" class="flex items-center justify-between bg-white border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium">{{ b.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full">{{ b.count }}</span>
          </div>
        </div>
      </div>
    </AdminMitraStatsSection>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 w-12 text-center">NO</th>
              <th class="px-6 py-4">INDUSTRI & BIDANG</th>
              <th class="px-6 py-4">ALAMAT & LOKASI</th>
              <th class="px-6 py-4">NOMOR, PERIHAL & DOKUMEN</th>
              <th class="px-6 py-4">MASA BERLAKU</th>
              <th class="px-6 py-4">PIC INDUSTRI</th>
              <th class="px-6 py-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in mouData" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-6 text-center text-sm font-black text-slate-800">{{ index + 1 }}</td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="font-bold text-blue-600 text-sm tracking-tight group-hover:text-blue-700 transition-colors">{{ item.nama }}</div>
                  <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    <Icon name="lucide:briefcase" class="w-3 h-3" />
                    {{ item.bidang }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1 max-w-[250px]">
                  <div class="text-xs text-slate-500 leading-relaxed">{{ item.alamat }}</div>
                  <a :href="item.link_dokumen" class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                    <Icon name="lucide:map-pin" class="w-3 h-3" />
                    Lihat Lokasi
                  </a>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-2 max-w-[300px]">
                  <div class="text-xs">
                    <span class="font-medium text-slate-500">No:</span>
                    <span class="font-bold text-slate-900 ml-1">{{ item.no_mou }}</span>
                  </div>
                  <div class="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{{ item.perihal }}</div>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in item.tags" :key="tag" class="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase">{{ tag }}</span>
                  </div>
                  <button class="flex items-center gap-1.5 border border-red-200 rounded px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase">
                    <Icon name="lucide:file-text" class="w-3.5 h-3.5" />
                    Lihat Dokumen
                  </button>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-2">
                  <div class="text-[11px]">
                    <div class="text-slate-400">Mulai: <span class="text-slate-900 font-bold ml-1">{{ item.mulai }}</span></div>
                    <div class="text-slate-400 mt-0.5">Berakhir: <span class="text-slate-900 font-bold ml-1">{{ item.berakhir }}</span></div>
                  </div>
                  <span 
                    class="inline-block px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase"
                    :class="item.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="text-xs text-slate-400">{{ item.pic_nama || '-' }}</div>
                  <div class="flex items-center gap-1 text-[10px] text-slate-400">
                    <Icon name="lucide:phone" class="w-3 h-3" />
                    {{ item.pic_telepon || '-' }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">
                  KELOLA
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div class="text-xs text-slate-500 font-medium">Menampilkan 1 - 3 dari 3 MoU</div>
        <div class="flex gap-2">
          <button disabled class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-300">Prev</button>
          <button disabled class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-300">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal for adding MoU -->
    <UModal 
      v-model:open="isModalOpen" 
      title="Tambah Data MoU" 
      description="Formulir untuk menambahkan data Memorandum of Understanding baru"
      size="xl"
    >
      <template #body>
        <div class="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama Instansi -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:building-2" class="w-4 h-4 text-blue-600" />
                NAMA INSTANSI / PERUSAHAAN
              </label>
              <input v-model="form.nama" type="text" placeholder="Contoh: PT. Industri Maju Jaya" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" />
            </div>

            <!-- Bidang Usaha -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:briefcase" class="w-4 h-4 text-blue-600" />
                BIDANG USAHA
              </label>
              <select v-model="form.bidang" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer bg-white">
                <option value="">Pilih Bidang</option>
                <option v-for="opt in bidangOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <!-- Nomor MoU -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:file-text" class="w-4 h-4 text-blue-600" />
                NOMOR MoU
              </label>
              <input v-model="form.no_mou" type="text" placeholder="Contoh: 400.14.5.4/0129/2026" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <!-- Alamat -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
                ALAMAT LENGKAP
              </label>
              <textarea v-model="form.alamat" rows="2" placeholder="Masukkan alamat lengkap instansi..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
            </div>

            <!-- Perihal MoU -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:clipboard-list" class="w-4 h-4 text-blue-600" />
                PERIHAL / JUDUL MoU
              </label>
              <textarea v-model="form.perihal" rows="2" placeholder="Masukkan perihal atau judul MoU..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
            </div>

            <!-- Kompetensi Keahlian -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:graduation-cap" class="w-4 h-4 text-blue-600" />
                KOMPETENSI KEAHLIAN TERKAIT
              </label>
              <input v-model="form.kompetensi" type="text" placeholder="Contoh: TKR, TKJ, RPL, MM" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <!-- Tanggal Mulai & Berakhir -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:calendar" class="w-4 h-4 text-blue-600" />
                TANGGAL MULAI
              </label>
              <input v-model="form.tanggal_mulai" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:calendar-check" class="w-4 h-4 text-blue-600" />
                TANGGAL BERAKHIR
              </label>
              <input v-model="form.tanggal_berakhir" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <!-- PIC Nama -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:user" class="w-4 h-4 text-blue-600" />
                NAMA PIC INSTANSI
              </label>
              <input v-model="form.pic_nama" type="text" placeholder="Nama kontak person" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <!-- PIC Telepon -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:phone" class="w-4 h-4 text-blue-600" />
                TELEPON / WHATSAPP PIC
              </label>
              <input v-model="form.pic_telepon" type="text" placeholder="Contoh: 62812345678" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <!-- Link Google Maps -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:globe" class="w-4 h-4 text-blue-600" />
                LINK GOOGLE MAPS
              </label>
              <input v-model="form.link_maps" type="text" placeholder="https://maps.google.com/..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-center gap-3">
          <button @click="closeModal" class="px-8 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest shadow-sm">BATAL</button>
          <button @click="handleSave" class="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-200">
            <Icon name="lucide:save" class="w-4 h-4" />
            SIMPAN DATA
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
</style>