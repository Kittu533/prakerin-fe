<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'
import penempatanData from '~/assets/data/guru_penempatan.json'

definePageMeta({
  layout: 'guru',
  title: 'Penempatan & Siswa Bimbingan'
})

type StatusPenempatan = 'AKTIF' | 'SELESAI' | 'DIBATALKAN'

interface PenempatanRow {
  idPenempatan: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  mentor: string
  periodeMulai: string
  periodeSelesai: string
  statusPenempatan: StatusPenempatan
  persenKehadiran: number
}

const allItems = ref<PenempatanRow[]>(penempatanData.items as PenempatanRow[])

/* ------ FILTER ------ */
const filterStatus = ref<'ALL' | StatusPenempatan>('ALL')
const filterPerusahaan = ref('')
const filterSiswa = ref('')

const filteredItems = computed(() =>
  allItems.value.filter((row) => {
    const matchStatus =
      filterStatus.value === 'ALL'
        ? true
        : row.statusPenempatan === filterStatus.value

    const matchPerusahaan = filterPerusahaan.value
      ? row.perusahaan
          .toLowerCase()
          .includes(filterPerusahaan.value.toLowerCase())
      : true

    const matchSiswa = filterSiswa.value
      ? row.namaSiswa.toLowerCase().includes(filterSiswa.value.toLowerCase())
      : true

    return matchStatus && matchPerusahaan && matchSiswa
  })
)

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const badgeStatus = (status: StatusPenempatan) => {
  if (status === 'AKTIF')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'SELESAI')
    return 'bg-blue-50 text-blue-700 border border-blue-200'
  return 'bg-rose-50 text-rose-700 border border-rose-200'
}

/* ------ COLUMNS ------ */
const columns = computed<TableColumn<PenempatanRow>[]>(() => [
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) => h('div', { class: 'min-w-0 py-1' }, [
      h('div', { class: 'text-sm font-semibold text-slate-900 truncate' }, row.original.namaSiswa),
      h('div', { class: 'text-xs text-slate-500 truncate mt-0.5' }, row.original.kelas)
    ]),
    meta: {
      class: {
        th: 'min-w-[160px] py-3.5 px-4',
        td: 'min-w-[160px] py-3 px-4',
      },
    },
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan / Mentor',
    cell: ({ row }) => h('div', { class: 'min-w-0 py-1 space-y-1' }, [
      h('div', { class: 'text-sm font-semibold text-slate-900 truncate', title: row.original.perusahaan }, row.original.perusahaan),
      h('div', { class: 'text-xs text-slate-500 truncate', title: `Mentor: ${row.original.mentor}` }, `Mentor: ${row.original.mentor}`)
    ]),
    meta: {
      class: {
        th: 'min-w-[200px] py-3.5 px-4',
        td: 'min-w-[200px] py-3 px-4',
      },
    },
  },
  {
    id: 'periode',
    header: 'Periode',
    cell: ({ row }) => h('div', { class: 'text-sm text-slate-700 py-1 font-medium' }, 
      `${row.original.periodeMulai} – ${row.original.periodeSelesai}`
    ),
    meta: {
      class: {
        th: 'hidden md:table-cell min-w-[140px] py-3.5 px-4',
        td: 'hidden md:table-cell min-w-[140px] py-3 px-4',
      },
    },
  },
  {
    accessorKey: 'statusPenempatan',
    header: 'Status',
    cell: ({ row }) => h(
      'span',
      {
        class: 'inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold ' + badgeStatus(row.original.statusPenempatan)
      },
      row.original.statusPenempatan
    ),
    meta: {
      class: {
        th: 'min-w-[120px] py-3.5 px-4 text-center',
        td: 'min-w-[120px] py-3 px-4 text-center',
      },
    },
  },
  {
    accessorKey: 'persenKehadiran',
    header: 'Kehadiran',
    cell: ({ row }) => h('div', { class: 'text-center py-1' }, [
      h('div', { class: 'text-sm font-bold text-slate-900' }, `${row.original.persenKehadiran.toFixed(1)}%`),
      h('div', { 
        class: `text-xs ${
          row.original.persenKehadiran >= 90 ? 'text-emerald-600' :
          row.original.persenKehadiran >= 80 ? 'text-amber-600' :
          'text-rose-600'
        }`
      }, 
      row.original.persenKehadiran >= 90 ? 'Sangat Baik' :
      row.original.persenKehadiran >= 80 ? 'Baik' :
      'Perlu Perhatian'
      )
    ]),
    meta: {
      class: {
        th: 'hidden lg:table-cell min-w-[110px] py-3.5 px-4 text-center',
        td: 'hidden lg:table-cell min-w-[110px] py-3 px-4 text-center',
      },
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => h(
      'button',
      {
        type: 'button',
        class: 'inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg hover:text-blue-700 transition-all duration-200',
        onClick: () => navigateTo(`/guru/penempatan/${row.original.idPenempatan}`),
      },
      'Detail',
    ),
    meta: {
      class: {
        th: 'text-right min-w-[100px] py-3.5 px-4',
        td: 'text-right min-w-[100px] py-3 px-4',
      },
    },
  }
])
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Wrapper with White Background -->
    <div class="bg-white min-h-screen">
      <!-- Content Section -->
      <div class="w-full px-6 py-6">
        <!-- Simple Breadcrumb -->
        <div class="mb-6">
          <nav class="flex items-center text-sm">
            <span class="text-gray-400">Dashboard</span>
            <svg class="h-4 w-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-900 font-medium">Penempatan PKL</span>
          </nav>
        </div>
        <!-- Filter Section -->
        <div class="mb-6">
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-[200px]">
                <UInput
                  v-model="filterSiswa"
                  size="md"
                  placeholder="Cari nama siswa..."
                  icon="i-lucide-search"
                  class="w-full"
                />
              </div>

              <div class="flex-1 min-w-[180px]">
                <USelect
                  v-model="filterPerusahaan"
                  :options="[
                    { label: 'Semua Perusahaan', value: '' },
                    { label: 'PT Telkom Indonesia', value: 'PT Telkom Indonesia' },
                    { label: 'Bank BNI', value: 'Bank BNI' },
                    { label: 'PT Indosat Ooredoo', value: 'PT Indosat Ooredoo' },
                    { label: 'PT Astra International', value: 'PT Astra International' },
                  ]"
                  size="md"
                  placeholder="Pilih perusahaan"
                />
              </div>

              <div class="min-w-[150px]">
                <USelect
                  v-model="filterStatus"
                  :options="[
                    { label: 'Semua Status', value: 'ALL' },
                    { label: 'Aktif', value: 'AKTIF' },
                    { label: 'Selesai', value: 'SELESAI' },
                    { label: 'Dibatalkan', value: 'DIBATALKAN' },
                  ]"
                  size="md"
                  placeholder="Status penempatan"
                />
              </div>

              <div>
                <UButton
                  variant="outline"
                  size="md"
                  icon="i-lucide-refresh-cw"
                  @click="filterStatus = 'ALL'; filterPerusahaan = ''; filterSiswa = ''"
                >
                  Reset
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table Section -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Daftar Penempatan PKL</h2>
                <p class="text-sm text-gray-600 mt-1">{{ filteredItems.length }} dari {{ allItems.length }} siswa</p>
              </div>
              
              <UButton
                variant="outline"
                size="md"
                icon="i-lucide-download"
              >
                Export Data
              </UButton>
            </div>
          </div>

          <!-- Table Container -->
          <div class="w-full">
            <AppDataTable
              :items="filteredItems"
              :columns="columns"
              :page-size="10"
              :searchable="false"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(203 213 225) rgb(248 250 252);
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgb(248 250 252);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(203 213 225);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(148 163 184);
}

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects for cards */
.hover\:shadow-lg:hover {
  transform: translateY(-1px);
}
</style>