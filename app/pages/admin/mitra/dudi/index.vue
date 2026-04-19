<script setup lang="ts">
import { useMitraDudiPage } from '../../../../composables/pages/admin/use-mitra-dudi-page'

definePageMeta({
  layout: 'admin'
})

const {
  loading,
  saving,
  deletingId,
  isModalOpen,
  filters,
  form,
  formErrors,
  industriData,
  stats,
  pagination,
  provinceOptions,
  kotaOptions,
  bidangOptions,
  modalTitle,
  modalDescription,
  submitButtonLabel,
  openModal,
  openArchivePage,
  closeModal,
  handleManage,
  handleDeactivate,
  handleSave,
  changePage,
} = useMitraDudiPage()
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <AdminMitraHeader 
      title="PENDATAAN DU/DI MITRA" 
      role="WAKA KEMITRAAN" 
      :showLogout="false"
      @add="openModal" 
    />

    <div class="flex justify-end">
      <button
        @click="openArchivePage"
        class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
      >
        LIHAT ARSIP DUDI
      </button>
    </div>

    <AdminMitraFilterCard title="FILTER DATA INDUSTRI">
      <input v-model="filters.nama" type="text" placeholder="Nama Industri..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <select v-model="filters.provinsi" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option v-for="item in provinceOptions" :key="item">{{ item }}</option>
      </select>
      <select v-model="filters.kota" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option v-for="item in kotaOptions" :key="item">{{ item }}</option>
      </select>
      <input v-model="filters.alamat" type="text" placeholder="Cari Alamat..." class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
      <select v-model="filters.bidang" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
        <option v-for="item in bidangOptions" :key="item">{{ item }}</option>
      </select>
    </AdminMitraFilterCard>

    <AdminMitraStatsSection title="Ringkasan Statistik & Distribusi Data">
      <div class="bg-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-white text-center shadow-lg shadow-blue-200 lg:col-span-1 xl:col-span-1">
        <span class="text-sm font-medium opacity-90 mb-1 uppercase tracking-widest">Total Industri</span>
        <span class="text-6xl font-black">{{ stats.totalMitra }}</span>
      </div>
      
      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">BIDANG INDUSTRI</h3>
        <div class="space-y-2">
          <div v-for="b in stats.bidang" :key="b.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ b.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">{{ b.count }}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">PROVINSI</h3>
        <div class="space-y-2">
          <div v-for="p in stats.provinsi" :key="p.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ p.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">{{ p.count }}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 xl:col-span-1">
        <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">KOTA/KABUPATEN</h3>
        <div class="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
          <div v-for="k in stats.kota" :key="k.label" class="flex items-center justify-between bg-slate-50 border border-slate-200/50 rounded-lg px-3 py-2 text-xs">
            <span class="text-slate-700 font-medium truncate mr-2">{{ k.label }}</span>
            <span class="bg-blue-100 text-blue-700 font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">{{ k.count }}</span>
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
              <td class="px-6 py-6 text-center text-sm font-black text-slate-800">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{{ item.nama }}</div>
                  <div class="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{{ item.bidang }}</div>
                  <span class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    Status Aktif
                  </span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1 max-w-[250px]">
                  <div class="flex items-start gap-1 text-red-500 font-bold text-xs">
                    <Icon name="lucide:map-pin" class="w-3.5 h-3.5 mt-0.5" />
                    {{ item.kota }}
                  </div>
                  <div class="text-xs text-slate-500 leading-relaxed">{{ item.alamat }}</div>
                  <a v-if="item.maps" :href="item.maps" target="_blank" class="inline-block text-[10px] font-bold text-blue-600 hover:underline">Lihat Maps</a>
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
                <div v-if="item.noHp" class="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                  <Icon name="lucide:phone" class="w-4 h-4 text-blue-500" />
                  {{ item.noHp }}
                </div>
                <div v-else class="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Icon name="lucide:minus-circle" class="w-4 h-4" />
                  Kontak belum diinput
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="handleManage(item.id)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                    KELOLA
                  </button>
                  <button
                    :disabled="deletingId === item.id"
                    @click="handleDeactivate(item.id, item.nama)"
                    class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {{ deletingId === item.id ? 'PROSES...' : 'NONAKTIF' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && industriData.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm font-semibold text-slate-400">Belum ada data DUDI yang sesuai filter.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div class="text-xs text-slate-500 font-medium">
          Menampilkan
          {{ pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1 }}
          -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          dari {{ pagination.total }} Industri
        </div>
        <div class="flex gap-2">
          <button :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)" class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded disabled:text-slate-300 disabled:cursor-not-allowed">Prev</button>
          <button :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)" class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded disabled:text-slate-300 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal for adding DUDI -->
    <UModal 
      v-model="isModalOpen" 
      :title="modalTitle" 
      :description="modalDescription"
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
              <input v-model="form.nama_perusahaan" type="text" placeholder="Contoh: PT. Industri Maju Jaya" :class="['w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300', formErrors.nama_perusahaan ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200']" />
              <p v-if="formErrors.nama_perusahaan" class="text-xs font-semibold text-rose-600">{{ formErrors.nama_perusahaan }}</p>
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:settings" class="w-4 h-4 text-blue-600" />
                BIDANG USAHA (MULTIPLE)
              </label>
              <input v-model="form.bidang_usaha" type="text" placeholder="Contoh: Perbengkelan Mobil, Konstruksi" :class="['w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300', formErrors.bidang_usaha ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200']" />
              <p v-if="formErrors.bidang_usaha" class="text-xs font-semibold text-rose-600">{{ formErrors.bidang_usaha }}</p>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:tag" class="w-4 h-4 text-blue-600" />
                KETERANGAN (MULTIPLE)
              </label>
              <input v-model="form.keterangan" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: PKL" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:graduation-cap" class="w-4 h-4 text-blue-600" />
                KOMPETENSI KEAHLIAN
              </label>
              <input v-model="form.kompetensi_keahlian" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: TKR, KJJI" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map" class="w-4 h-4 text-blue-600" />
                KOTA / KABUPATEN
              </label>
              <input v-model="form.kabupaten_kota" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Surakarta" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:globe" class="w-4 h-4 text-blue-600" />
                PROVINSI
              </label>
              <input v-model="form.provinsi" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Jawa Tengah" />
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
                ALAMAT LENGKAP
              </label>
              <textarea v-model="form.alamat" rows="3" :class="['w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none', formErrors.alamat ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200']" placeholder="Masukkan alamat lengkap..."></textarea>
              <p v-if="formErrors.alamat" class="text-xs font-semibold text-rose-600">{{ formErrors.alamat }}</p>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:phone" class="w-4 h-4 text-blue-600" />
                TELEPON KANTOR
              </label>
              <input v-model="form.no_hp" type="text" :class="['w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all', formErrors.no_hp ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200']" placeholder="Contoh: 0271-123456" />
              <p v-if="formErrors.no_hp" class="text-xs font-semibold text-rose-600">{{ formErrors.no_hp }}</p>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:map-pin" class="w-4 h-4 text-blue-600" />
                LINK GOOGLE MAPS
              </label>
              <input v-model="form.maps" type="text" :class="['w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all', formErrors.maps ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200']" placeholder="https://maps.google.com/..." />
              <p v-if="formErrors.maps" class="text-xs font-semibold text-rose-600">{{ formErrors.maps }}</p>
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:user" class="w-4 h-4 text-blue-600" />
                NAMA PIC
              </label>
              <input v-model="form.pic_nama" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Nama kontak person" />
            </div>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <Icon name="lucide:message-circle" class="w-4 h-4 text-blue-600" />
                WHATSAPP PIC
              </label>
              <input v-model="form.pic_wa" type="text" placeholder="628..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-center gap-3">
          <button @click="closeModal" class="px-8 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest shadow-sm">BATAL</button>
          <button :disabled="saving" @click="handleSave" class="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed">
            <Icon name="lucide:save" class="w-4 h-4" />
            {{ submitButtonLabel }}
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
