<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
    >
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-blue-600">
            Verifikasi Absensi
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Daftar Absensi Siswa Bimbingan
          </h1>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            Tinjau dan verifikasi absensi yang diajukan siswa untuk semua
            penempatan yang Anda bimbing.
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru" class="hover:text-blue-600">Dashboard</NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Verifikasi Absensi</span>
        </nav>
      </div>
    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredAbsensi"
      :columns="columns"
      title="Absensi menunggu verifikasi"
      description="Filter berdasarkan status absensi, verifikasi, dan perusahaan."
      :page-size="10"
      :search-keys="['namaSiswa', 'kelas', 'perusahaan', 'tanggal', 'statusAbsensi', 'catatanSiswa', 'catatanMentor', 'catatanGuru']"
    >
      <template #toolbar-right>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Filter perusahaan -->
          <select
            v-model="filterPerusahaan"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua perusahaan</option>
            <option
              v-for="p in perusahaanOptions"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>

          <!-- Filter status absensi -->
          <select
            v-model="filterStatusAbsensi"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua status</option>
            <option value="HADIR">Hadir</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
            <option value="ALPA">Alpa</option>
          </select>

          <!-- Filter status verifikasi guru -->
          <select
            v-model="filterVerifikasiGuru"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua verifikasi</option>
            <option value="MENUNGGU">Belum diverifikasi</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>

          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:border-blue-500 hover:text-blue-600"
            @click="resetFilter"
          >
            Reset filter
          </button>
        </div>
      </template>
    </AppDataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue'
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

const UButton = resolveComponent('UButton')

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
  },
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) =>
      `${row.original.namaSiswa} • ${row.original.kelas}`,
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan',
  },
  {
    id: 'jam',
    header: 'Jam',
    cell: ({ row }) =>
      `${row.original.jamMasuk} - ${row.original.jamKeluar}`,
  },
  {
    accessorKey: 'statusAbsensi',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
            badgeStatusAbsensi(row.original.statusAbsensi),
        },
        row.original.statusAbsensi,
      ),
  },
  {
    id: 'verifikasi',
    header: 'Verifikasi',
    cell: ({ row }) =>
      h('div', { class: 'space-y-0.5 text-[11px]' }, [
        h(
          'p',
          {
            class:
              'font-medium ' +
              (row.original.statusVerifikasiMentor === 'DISETUJUI'
                ? 'text-emerald-700'
                : row.original.statusVerifikasiMentor === 'DITOLAK'
                  ? 'text-rose-700'
                  : 'text-amber-700'),
          },
          `Mentor: ${row.original.statusVerifikasiMentor}`,
        ),
        h(
          'p',
          {
            class:
              'font-medium ' +
              (row.original.statusVerifikasiGuru === 'DISETUJUI'
                ? 'text-emerald-700'
                : row.original.statusVerifikasiGuru === 'DITOLAK'
                  ? 'text-rose-700'
                  : 'text-amber-700'),
          },
          `Guru: ${row.original.statusVerifikasiGuru}`,
        ),
      ]),
  },
  {
    accessorKey: 'metode',
    header: 'Metode',
  },
  {
    accessorKey: 'catatanSiswa',
    header: 'Catatan',
    cell: ({ row }) =>
      row.original.catatanSiswa ||
      row.original.catatanMentor ||
      row.original.catatanGuru ||
      '-',
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right w-32',
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          UButton,
          {
            size: 'xs',
            color: 'primary',
            variant: 'soft',
            onClick: () => setujuiAbsensi(row.original),
          },
          { default: () => 'Terima' },
        ),
        h(
          UButton,
          {
            size: 'xs',
            color: 'error',
            variant: 'soft',
            onClick: () => tolakAbsensi(row.original),
          },
          { default: () => 'Tolak' },
        ),
      ]),
  },
])
</script>
