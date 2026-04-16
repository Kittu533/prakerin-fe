<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Mock data for the table
const industriData = ref([
  {
    id: 1,
    nama: 'Astra Daihatsu Solo Baru',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Surakarta',
    alamat: 'Jl. Ir. Soekarno, Madegondo, Grogol, Kab. Sukoharjo, Jawa Tengah, 57552',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 2,
    nama: 'PT. Atlas Indo Karya (Persero)',
    bidang: 'KONSTRUKSI DAN INFRASTRUKTUR',
    keterangan: ['PKL'],
    kota: 'Kota Semarang',
    alamat: 'Jl. Setiabudi No.214a Srondol Kulon, Banyumanik',
    kk: ['KJJI'],
    pic: null,
    maps: '#'
  },
  {
    id: 3,
    nama: 'PT. Duta Cemerlang Motors Salatiga',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kabupaten Salatiga',
    alamat: 'Jl. Raya Salatiga-Solo, Kaligandu, Butuh, Kec. Tengaran, Kabupaten Salatiga, Jawa Tengah 50775',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 4,
    nama: 'PT. Duta Cemerlang Motors Magelang',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kota Magelang',
    alamat: 'Jl. Soekarno Hatta, Tidar Utara, Kec. Magelang Sel., Kota Magelang, Jawa Tengah 56117',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 5,
    nama: 'PT. Duta Cemerlang Motors Tegal',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kota Tegal',
    alamat: 'Samping de javu, Jl.dr Cipto Mangunkusumo gg bawal 5 rt 01 rw05 margadana, Margadana, motor, Kota Tegal, Jawa Tengah 52143',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 6,
    nama: 'PT. Duta Cemerlang Motors Maos',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kabupaten Cilacap',
    alamat: 'Jalan Pertamina No. 1, Klapagada, Maos (Ada spanduk HINO), KAB. CILACAP, MAOS, JAWA TENGAH, ID, 53272',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 7,
    nama: 'PT. Duta Cemerlang Motors Rewulu',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kabupaten Sleman',
    alamat: 'Jalan Wates Km.7,5, Kios Pasar Balecatur Blok F No, RT.1/RW.4, Ngaran, Balecatur, Kec. Gamping, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55295',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  },
  {
    id: 8,
    nama: 'PT. Duta Cemerlang Motors Sragen',
    bidang: 'PERBENGKELAN MOBIL',
    keterangan: ['PKL'],
    kota: 'Kabupaten Sragen',
    alamat: 'Jl. Sragen - Solo No.km. 22, Dusun II, Gebang, Kec. Masaran, Kabupaten Sragen, Jawa Tengah 57282',
    kk: ['TKR'],
    pic: null,
    maps: '#'
  }
])

const isModalOpen = ref(false)
const filters = ref({
  nama: '',
  provinsi: 'Semua Provinsi',
  kota: 'Semua Kota',
  alamat: '',
  bidang: 'Semua Bidang'
})

const stats = ref({
  total: 8,
  bidang: [
    { label: 'N/A', count: 6 },
    { label: 'PERBENGKELAN MOBIL', count: 1 },
    { label: 'KONSTRUKSI DAN INFRASTRUKTUR', count: 1 }
  ],
  provinsi: [
    { label: 'JAWA TENGAH', count: 7 },
    { label: 'DAERAH ISTIMEWA YOGYAKARTA', count: 1 }
  ],
  kota: [
    { label: 'KOTA MAGELANG', count: 1 },
    { label: 'KOTA TEGAL', count: 1 },
    { label: 'KABUPATEN CILACAP', count: 1 },
    { label: 'KABUPATEN SLEMAN', count: 1 },
    { label: 'KABUPATEN SRAGEN', count: 1 }
  ]
})

const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }
const handleSave = () => { closeModal() }
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <AdminMitraHeader 
      title="PENDATAAN DU/DI MITRA" 
      role="WAKA KEMITRAAN" 
      :showLogout="false"
      @add="openModal" 
    />

    <AdminMitraFilterCard title="FILTER DATA INDUSTRI">
      <input v-model="filters.nama" type="text" placeholder="Nama Industri..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <select v-model="filters.provinsi" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option>Semua Provinsi</option>
        <option>Jawa Tengah</option>
        <option>DI Yogyakarta</option>
      </select>
      <select v-model="filters.kota" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option>Semua Kota</option>
        <option>Semarang</option>
        <option>Surakarta</option>
      </select>
      <input v-model="filters.alamat" type="text" placeholder="Cari Alamat..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <select v-model="filters.bidang" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option>Semua Bidang</option>
        <option>Perbengkelan Mobil</option>
        <option>Konstruksi</option>
      </select>
    </AdminMitraFilterCard>

    <AdminMitraStatsSection title="Ringkasan Statistik & Distribusi Data">
      <div class="bg-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-white text-center shadow-lg shadow-blue-200 lg:col-span-1 xl:col-span-1">
        <span class="text-sm font-medium opacity-90 mb-1 uppercase tracking-widest">Total Industri</span>
        <span class="text-6xl font-black">{{ stats.total }}</span>
      </div>
      
      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">BIDANG INDUSTRI</h3>
        <div class="space-y-2">
          <div v-for="b in stats.bidang" :key="b.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ b.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{{ b.count }}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">PROVINSI</h3>
        <div class="space-y-2">
          <div v-for="p in stats.provinsi" :key="p.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ p.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{{ p.count }}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">KOTA/KABUPATEN</h3>
        <div class="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          <div v-for="k in stats.kota" :key="k.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ k.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{{ k.count }}</span>
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
              <th class="px-6 py-4">KK YANG RELEVAN & CATATAN</th>
              <th class="px-6 py-4">PIC INDUSTRI</th>
              <th class="px-6 py-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in industriData" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-6 text-center text-sm font-black text-slate-800">{{ index + 1 }}</td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{{ item.nama }}</div>
                  <div class="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{{ item.bidang }}</div>
                  <div class="flex gap-1 pt-1">
                    <span v-for="ket in item.keterangan" :key="ket" class="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-bold">{{ ket }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1 max-w-[250px]">
                  <div class="flex items-start gap-1 text-red-500 font-bold text-xs">
                    <Icon name="lucide:map-pin" class="w-3.5 h-3.5 mt-0.5" />
                    {{ item.kota }}
                  </div>
                  <div class="text-xs text-slate-500 leading-relaxed">{{ item.alamat }}</div>
                  <a :href="item.maps" class="inline-block text-[10px] font-bold text-blue-600 hover:underline">Lihat Maps</a>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="kk in item.kk" :key="kk" class="bg-blue-100 text-blue-700 text-[10px] px-3 py-1 rounded font-bold">{{ kk }}</span>
                  </div>
                  <button class="flex items-center gap-1.5 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Icon name="lucide:clipboard-list" class="w-3.5 h-3.5" />
                    Catatan
                  </button>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Icon name="lucide:minus-circle" class="w-4 h-4" />
                  Kontak belum diinput
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                  KELOLA
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div class="text-xs text-slate-500 font-medium">Menampilkan 1 - 8 dari 8 Industri</div>
        <div class="flex gap-2">
          <button disabled class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-300">Prev</button>
          <button disabled class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-300">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal for adding DUDI -->
    <UModal 
      v-model:open="isModalOpen" 
      title="Tambah Mitra Industri" 
      description="Formulir untuk menambahkan data mitra industri baru"
      size="xl"
    >
      <template #body>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Form fields -->
            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:building-2" class="w-4 h-4 text-blue-600" />
                NAMA INSTANSI / PERUSAHAAN
              </label>
              <input type="text" placeholder="Contoh: PT. Industri Maju Jaya" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" />
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:settings" class="w-4 h-4 text-blue-600" />
                BIDANG USAHA (MULTIPLE)
              </label>
              <input type="text" placeholder="Ketik atau klik pilihan di bawah..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300" />
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-green-100 transition-colors">+ Konstruksi dan Infrastruktur</span>
                <span class="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer hover:bg-green-100 transition-colors">+ Perbengkelan Mobil</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:tag" class="w-4 h-4 text-blue-600" />
                KETERANGAN (MULTIPLE)
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: PKL" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:graduation-cap" class="w-4 h-4 text-blue-600" />
                KOMPETENSI KEAHLIAN
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: TKR, KJJI" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map" class="w-4 h-4 text-blue-600" />
                KOTA / KABUPATEN
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Surakarta" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:globe" class="w-4 h-4 text-blue-600" />
                PROVINSI
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Jawa Tengah" />
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
                ALAMAT LENGKAP
              </label>
              <textarea rows="3" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Masukkan alamat lengkap..."></textarea>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:phone" class="w-4 h-4 text-blue-600" />
                TELEPON KANTOR
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: 0271-123456" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
                LINK GOOGLE MAPS
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://maps.google.com/..." />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:user" class="w-4 h-4 text-blue-600" />
                NAMA PIC
              </label>
              <input type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Nama kontak person" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:message-circle" class="w-4 h-4 text-blue-600" />
                WHATSAPP PIC
              </label>
              <input type="text" placeholder="628..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
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
