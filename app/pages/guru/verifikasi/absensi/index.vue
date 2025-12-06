<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Wrapper with White Background -->
    <div class="bg-white min-h-screen">
      <!-- Content Section -->
      <div class="w-full px-6 py-6">
        <!-- Breadcrumb Section -->
        <div class="mb-6">
          <nav class="flex items-center text-sm mb-4">
            <NuxtLink to="/guru" class="text-gray-500 hover:text-gray-700">Dashboard</NuxtLink>
            <svg class="h-4 w-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-500 hover:text-gray-700">Verifikasi</span>
            <svg class="h-4 w-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-900 font-medium">Absensi</span>
          </nav>
        </div>

        <!-- Header Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Verifikasi Absensi
                </span>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                Daftar Absensi Siswa Bimbingan
              </h1>
              <p class="text-sm text-gray-600" style="font-size: 14px;">
                Tinjau dan verifikasi absensi yang diajukan siswa untuk semua penempatan yang Anda bimbing.
              </p>
            </div>

            <div class="flex gap-3">
              <UButton
                variant="outline"
                size="md"
                icon="i-lucide-download"
              >
                Export Data
              </UButton>
              <UButton
                variant="outline"
                size="md"
                icon="i-lucide-refresh-cw"
                @click="resetFilter"
              >
                Reset Filter
              </UButton>
            </div>
          </div>
        </div>

        <!-- Filter Section -->
        <div class="mb-6">
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 mb-2" style="font-size: 14px;">Perusahaan</label>
                <USelect
                  v-model="filterPerusahaan"
                  :options="[
                    { label: 'Semua Perusahaan', value: '' },
                    ...perusahaanOptions.map(p => ({ label: p, value: p }))
                  ]"
                  size="md"
                  placeholder="Pilih perusahaan"
                />
              </div>

              <div class="min-w-[180px]">
                <label class="block text-sm font-medium text-gray-700 mb-2" style="font-size: 14px;">Status Absensi</label>
                <USelect
                  v-model="filterStatusAbsensi"
                  :options="[
                    { label: 'Semua Status', value: '' },
                    { label: 'Hadir', value: 'HADIR' },
                    { label: 'Izin', value: 'IZIN' },
                    { label: 'Sakit', value: 'SAKIT' },
                    { label: 'Alpa', value: 'ALPA' }
                  ]"
                  size="md"
                  placeholder="Status absensi"
                />
              </div>

              <div class="min-w-[180px]">
                <label class="block text-sm font-medium text-gray-700 mb-2" style="font-size: 14px;">Status Verifikasi</label>
                <USelect
                  v-model="filterVerifikasiGuru"
                  :options="[
                    { label: 'Semua Verifikasi', value: '' },
                    { label: 'Menunggu', value: 'MENUNGGU' },
                    { label: 'Disetujui', value: 'DISETUJUI' },
                    { label: 'Ditolak', value: 'DITOLAK' }
                  ]"
                  size="md"
                  placeholder="Status verifikasi"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table Section -->
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Absensi Menunggu Verifikasi</h2>
                <p class="text-sm text-gray-600 mt-1" style="font-size: 14px;">{{ filteredAbsensi.length }} data absensi perlu direview</p>
              </div>
            </div>
          </div>

          <!-- Table Container -->
          <div class="w-full">
            <AppDataTable
              :items="filteredAbsensi"
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

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'

definePageMeta({
  layout: 'guru',
  title: 'Verifikasi Absensi',
})

/* ---------- TYPES & DUMMY DATA ---------- */

type StatusAbsensi = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA'
type StatusVerifikasi = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'

interface AbsensiVerifikasiRow {
  id: number
  tanggal: string
  namaSiswa: string
  kelas: string
  perusahaan: string
  jamMasuk: string
  jamKeluar: string
  statusAbsensi: StatusAbsensi
  metode: string
  statusVerifikasiMentor: StatusVerifikasi
  statusVerifikasiGuru: StatusVerifikasi
  catatanSiswa?: string
  catatanMentor?: string
  catatanGuru?: string
}

const items = ref<AbsensiVerifikasiRow[]>([
  {
    id: 1,
    tanggal: '11-01-2026',
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    jamMasuk: '08:15',
    jamKeluar: '16:00',
    statusAbsensi: 'HADIR',
    metode: 'GPS + Face Recognition',
    statusVerifikasiMentor: 'DISETUJUI',
    statusVerifikasiGuru: 'MENUNGGU',
    catatanSiswa: 'Terlambat karena kendaraan bermasalah.',
    catatanMentor: 'Masih dapat ditoleransi.',
  },
  {
    id: 2,
    tanggal: '12-01-2026',
    namaSiswa: 'Siti Aminah',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    jamMasuk: '08:00',
    jamKeluar: '16:00',
    statusAbsensi: 'SAKIT',
    metode: 'Manual',
    statusVerifikasiMentor: 'DISETUJUI',
    statusVerifikasiGuru: 'MENUNGGU',
    catatanSiswa: 'Melampirkan surat keterangan dokter.',
  },
  {
    id: 3,
    tanggal: '13-01-2026',
    namaSiswa: 'Budi Santoso',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    jamMasuk: '-',
    jamKeluar: '-',
    statusAbsensi: 'ALPA',
    metode: 'GPS',
    statusVerifikasiMentor: 'MENUNGGU',
    statusVerifikasiGuru: 'MENUNGGU',
    catatanMentor: 'Tidak hadir tanpa konfirmasi.',
  },
])

/* ---------- FILTERS ---------- */

const filterPerusahaan = ref<string>('')
const filterStatusAbsensi = ref<StatusAbsensi | ''>('')
const filterVerifikasiGuru = ref<StatusVerifikasi | ''>('MENUNGGU') // default: yang belum diverif

const perusahaanOptions = computed(() => {
  const set = new Set<string>()
  items.value.forEach((row) => set.add(row.perusahaan))
  return Array.from(set)
})

const filteredAbsensi = computed(() =>
  items.value.filter((row) => {
    if (filterPerusahaan.value && row.perusahaan !== filterPerusahaan.value)
      return false
    if (filterStatusAbsensi.value && row.statusAbsensi !== filterStatusAbsensi.value)
      return false
    if (filterVerifikasiGuru.value && row.statusVerifikasiGuru !== filterVerifikasiGuru.value)
      return false
    return true
  }),
)

const resetFilter = () => {
  filterPerusahaan.value = ''
  filterStatusAbsensi.value = ''
  filterVerifikasiGuru.value = 'MENUNGGU'
}

/* ---------- UI HELPERS ---------- */

const badgeStatusAbsensi = (status: StatusAbsensi) => {
  if (status === 'HADIR') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  }
  if (status === 'IZIN') {
    return 'bg-blue-50 text-blue-700 border border-blue-100'
  }
  if (status === 'SAKIT') {
    return 'bg-amber-50 text-amber-700 border border-amber-100'
  }
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

const badgeVerifikasi = (status: StatusVerifikasi) => {
  if (status === 'DISETUJUI') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  }
  if (status === 'DITOLAK') {
    return 'bg-rose-50 text-rose-700 border border-rose-100'
  }
  return 'bg-amber-50 text-amber-700 border border-amber-100'
}

/* ---------- ACTIONS (dummy) ---------- */

const setujuiAbsensi = (row: AbsensiVerifikasiRow) => {
  row.statusVerifikasiGuru = 'DISETUJUI'
  row.catatanGuru = row.catatanGuru || 'Disetujui oleh guru.'
  console.log('✅ Setujui absensi (dummy):', row)
}

const tolakAbsensi = (row: AbsensiVerifikasiRow) => {
  row.statusVerifikasiGuru = 'DITOLAK'
  row.catatanGuru = row.catatanGuru || 'Ditolak oleh guru (dummy).'
  console.log('❌ Tolak absensi (dummy):', row)
}

/* ---------- COLUMNS ---------- */

const columns = computed<TableColumn<AbsensiVerifikasiRow>[]>(() => [
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    cell: ({ row }) => h('div', { 
      class: 'text-gray-900 font-medium', 
      style: 'font-size: 14px;' 
    }, row.original.tanggal),
    meta: {
      class: {
        th: 'min-w-[100px] py-3.5 px-4',
        td: 'min-w-[100px] py-3 px-4',
      },
    },
  },
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) => h('div', { class: 'min-w-0' }, [
      h('div', { 
        class: 'text-gray-900 font-semibold truncate', 
        style: 'font-size: 14px;' 
      }, row.original.namaSiswa),
      h('div', { 
        class: 'text-gray-500 truncate mt-0.5', 
        style: 'font-size: 12px;' 
      }, row.original.kelas)
    ]),
    meta: {
      class: {
        th: 'min-w-[150px] py-3.5 px-4',
        td: 'min-w-[150px] py-3 px-4',
      },
    },
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan',
    cell: ({ row }) => h('div', { 
      class: 'text-gray-900 truncate', 
      style: 'font-size: 14px;',
      title: row.original.perusahaan 
    }, row.original.perusahaan),
    meta: {
      class: {
        th: 'hidden md:table-cell min-w-[180px] py-3.5 px-4',
        td: 'hidden md:table-cell min-w-[180px] py-3 px-4',
      },
    },
  },
  {
    id: 'jam',
    header: 'Waktu',
    cell: ({ row }) => h('div', { class: 'text-center' }, [
      h('div', { 
        class: 'text-gray-900 font-medium', 
        style: 'font-size: 14px;' 
      }, row.original.jamMasuk),
      h('div', { 
        class: 'text-gray-500', 
        style: 'font-size: 12px;' 
      }, row.original.jamKeluar)
    ]),
    meta: {
      class: {
        th: 'hidden lg:table-cell min-w-[80px] py-3.5 px-4 text-center',
        td: 'hidden lg:table-cell min-w-[80px] py-3 px-4 text-center',
      },
    },
  },
  {
    accessorKey: 'statusAbsensi',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold ' +
            badgeStatusAbsensi(row.original.statusAbsensi),
        },
        row.original.statusAbsensi,
      ),
    meta: {
      class: {
        th: 'min-w-[100px] py-3.5 px-4 text-center',
        td: 'min-w-[100px] py-3 px-4 text-center',
      },
    },
  },
  {
    id: 'verifikasi',
    header: 'Verifikasi',
    cell: ({ row }) =>
      h('div', { class: 'space-y-1' }, [
        h(
          'div',
          {
            class:
              'text-xs font-medium ' +
              (row.original.statusVerifikasiMentor === 'DISETUJUI'
                ? 'text-emerald-700'
                : row.original.statusVerifikasiMentor === 'DITOLAK'
                  ? 'text-rose-700'
                  : 'text-amber-700'),
          },
          `Mentor: ${row.original.statusVerifikasiMentor}`,
        ),
        h(
          'div',
          {
            class:
              'text-xs font-medium ' +
              (row.original.statusVerifikasiGuru === 'DISETUJUI'
                ? 'text-emerald-700'
                : row.original.statusVerifikasiGuru === 'DITOLAK'
                  ? 'text-rose-700'
                  : 'text-amber-700'),
          },
          `Guru: ${row.original.statusVerifikasiGuru}`,
        ),
      ]),
    meta: {
      class: {
        th: 'hidden lg:table-cell min-w-[120px] py-3.5 px-4',
        td: 'hidden lg:table-cell min-w-[120px] py-3 px-4',
      },
    },
  },
  {
    id: 'catatan',
    header: 'Catatan',
    cell: ({ row }) => {
      const catatan = row.original.catatanSiswa || row.original.catatanMentor || row.original.catatanGuru || '-'
      return h('div', { 
        class: 'text-gray-600 text-xs max-w-[150px] truncate',
        title: catatan,
        style: 'font-size: 14px;'
      }, catatan)
    },
    meta: {
      class: {
        th: 'hidden xl:table-cell min-w-[150px] py-3.5 px-4',
        td: 'hidden xl:table-cell min-w-[150px] py-3 px-4',
      },
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right min-w-[140px] py-3.5 px-4',
        td: 'text-right min-w-[140px] py-3 px-4',
      },
    },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all duration-200',
            onClick: () => setujuiAbsensi(row.original),
          },
          'Terima',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all duration-200',
            onClick: () => tolakAbsensi(row.original),
          },
          'Tolak',
        ),
      ]),
  },
])
</script>
