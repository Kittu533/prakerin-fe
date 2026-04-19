<script setup lang="ts">
import { useMitraDudiArchivePage } from '../../../../composables/pages/admin/use-mitra-dudi-archive-page'

definePageMeta({
  layout: "admin",
});

const {
  loading,
  restoringId,
  filters,
  data,
  stats,
  pagination,
  provinceOptions,
  kotaOptions,
  bidangOptions,
  handleRestore,
  goToActivePage,
  changePage,
} = useMitraDudiArchivePage();
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <div class="flex flex-wrap gap-3 items-start justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900">ARSIP DU/DI MITRA</h1>
        <p class="text-sm text-slate-500 mt-1">Data mitra nonaktif yang tersimpan melalui soft delete</p>
      </div>
      <button
        @click="goToActivePage"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
      >
        KEMBALI KE DATA AKTIF
      </button>
    </div>

    <AdminMitraFilterCard title="FILTER DATA ARSIP INDUSTRI">
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

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p class="text-sm text-slate-500">Total data arsip</p>
      <p class="text-4xl font-black text-slate-900 mt-1">{{ stats.totalMitra }}</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 w-12 text-center">NO</th>
              <th class="px-6 py-4">INDUSTRI & BIDANG</th>
              <th class="px-6 py-4">ALAMAT</th>
              <th class="px-6 py-4">KONTAK</th>
              <th class="px-6 py-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in data" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-6 text-center text-sm font-black text-slate-800">{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
              <td class="px-6 py-6">
                <div class="space-y-1">
                  <div class="font-bold text-slate-900">{{ item.nama }}</div>
                  <div class="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{{ item.bidang }}</div>
                  <span class="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    Nonaktif (Arsip)
                  </span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="space-y-1 max-w-[260px]">
                  <div class="text-xs font-bold text-red-500">{{ item.kota }}, {{ item.provinsi }}</div>
                  <div class="text-xs text-slate-500 leading-relaxed">{{ item.alamat }}</div>
                </div>
              </td>
              <td class="px-6 py-6">
                <div v-if="item.noHp" class="text-xs font-semibold text-slate-700">{{ item.noHp }}</div>
                <div v-else class="text-xs italic text-slate-400">Kontak belum diinput</div>
              </td>
              <td class="px-6 py-6 text-center">
                <button
                  :disabled="restoringId === item.id"
                  @click="handleRestore(item.id, item.nama)"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ restoringId === item.id ? 'PROSES...' : 'AKTIFKAN KEMBALI' }}
                </button>
              </td>
            </tr>
            <tr v-if="!loading && data.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-sm font-semibold text-slate-400">Belum ada data arsip DUDI.</td>
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
          dari {{ pagination.total }} arsip
        </div>
        <div class="flex gap-2">
          <button :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)" class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded disabled:text-slate-300 disabled:cursor-not-allowed">Prev</button>
          <button :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)" class="px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded disabled:text-slate-300 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
