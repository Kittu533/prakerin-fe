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
            Verifikasi Logbook
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Logbook Menunggu Persetujuan
          </h1>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            Review isi logbook siswa sebelum menyetujui atau menolak.
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru" class="hover:text-blue-600">Dashboard</NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Verifikasi Logbook</span>
        </nav>
      </div>
    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredLogbook"
      :columns="columns"
      title="Logbook siswa"
      description="Filter berdasarkan status persetujuan dan perusahaan."
      :page-size="10"
      :search-keys="['namaSiswa', 'kelas', 'perusahaan', 'tanggal', 'judul', 'statusPersetujuan']"
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

          <!-- Filter status -->
          <select
            v-model="filterStatus"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Semua status</option>
            <option value="MENUNGGU">Menunggu</option>
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

    <!-- Modal detail (dummy) -->
    <UModal v-model:open="isDetailOpen" title="Detail Logbook">
      <template #body>
        <div v-if="selectedLogbook" class="space-y-3 text-sm text-slate-700">
          <p class="text-xs font-medium uppercase text-slate-500">
            {{ selectedLogbook.tanggal }} •
            {{ selectedLogbook.namaSiswa }} ({{ selectedLogbook.kelas }})
          </p>
          <h3 class="text-base font-semibold text-slate-900">
            {{ selectedLogbook.judul }}
          </h3>
          <p class="text-xs text-slate-500">
            Perusahaan: {{ selectedLogbook.perusahaan }}
          </p>
          <hr class="my-2 border-slate-100" />
          <p class="text-[13px] leading-relaxed">
            (Dummy) Isi lengkap logbook akan ditampilkan di sini nanti setelah
            tersambung ke API.
          </p>
        </div>
      </template>
      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <UButton size="sm" color="neutral" variant="outline" @click="close">
            Tutup
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'

definePageMeta({
  layout: 'guru',
  title: 'Verifikasi Logbook',
})

/* ---------- TYPES & DUMMY DATA ---------- */

type StatusPersetujuan = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'

interface LogbookVerifikasiRow {
  id: number
  idPenempatan: number
  tanggal: string
  namaSiswa: string
  kelas: string
  perusahaan: string
  judul: string
  statusPersetujuan: StatusPersetujuan
  ratingMentor?: number | null
  ratingGuru?: number | null
}

const items = ref<LogbookVerifikasiRow[]>([
  {
    id: 1,
    idPenempatan: 101,
    tanggal: '11-01-2026',
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    judul: 'Pengenalan SOP bengkel & briefing keselamatan kerja',
    statusPersetujuan: 'DISETUJUI',
    ratingMentor: 4,
    ratingGuru: 4,
  },
  {
    id: 2,
    idPenempatan: 101,
    tanggal: '12-01-2026',
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    judul: 'Pendampingan servis berkala motor matic',
    statusPersetujuan: 'MENUNGGU',
    ratingMentor: 5,
    ratingGuru: null,
  },
  {
    id: 3,
    idPenempatan: 202,
    tanggal: '12-01-2026',
    namaSiswa: 'Siti Aminah',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    judul: 'Pencatatan stok sparepart harian',
    statusPersetujuan: 'MENUNGGU',
    ratingMentor: 4,
    ratingGuru: null,
  },
  {
    id: 4,
    idPenempatan: 202,
    tanggal: '13-01-2026',
    namaSiswa: 'Siti Aminah',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    judul: 'Membersihkan area kerja & checking peralatan',
    statusPersetujuan: 'DITOLAK',
    ratingMentor: 3,
    ratingGuru: 3,
  },
])

/* ---------- FILTERS ---------- */

const filterPerusahaan = ref<string>('')
const filterStatus = ref<StatusPersetujuan | ''>('MENUNGGU') // default: yang menunggu

const perusahaanOptions = computed(() => {
  const set = new Set<string>()
  items.value.forEach((row) => set.add(row.perusahaan))
  return Array.from(set)
})

const filteredLogbook = computed(() =>
  items.value.filter((row) => {
    if (filterPerusahaan.value && row.perusahaan !== filterPerusahaan.value)
      return false
    if (filterStatus.value && row.statusPersetujuan !== filterStatus.value)
      return false
    return true
  }),
)

const resetFilter = () => {
  filterPerusahaan.value = ''
  filterStatus.value = 'MENUNGGU'
}

/* ---------- UI HELPERS ---------- */

const UButton = resolveComponent('UButton')

const badgeStatus = (status: StatusPersetujuan) => {
  if (status === 'DISETUJUI') {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  }
  if (status === 'MENUNGGU') {
    return 'bg-amber-50 text-amber-700 border border-amber-100'
  }
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

/* ---------- MODAL DETAIL ---------- */

const isDetailOpen = ref(false)
const selectedLogbook = ref<LogbookVerifikasiRow | null>(null)

const openDetail = (row: LogbookVerifikasiRow) => {
  selectedLogbook.value = row
  isDetailOpen.value = true
}

/* ---------- ACTIONS (dummy) ---------- */

const setujuiLogbook = (row: LogbookVerifikasiRow) => {
  row.statusPersetujuan = 'DISETUJUI'
  console.log('✅ Setujui logbook (dummy):', row)
}

const tolakLogbook = (row: LogbookVerifikasiRow) => {
  row.statusPersetujuan = 'DITOLAK'
  console.log('❌ Tolak logbook (dummy):', row)
}

/* ---------- COLUMNS ---------- */

const columns = computed<TableColumn<LogbookVerifikasiRow>[]>(() => [
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
    accessorKey: 'judul',
    header: 'Judul kegiatan',
  },
  {
    accessorKey: 'statusPersetujuan',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
            badgeStatus(row.original.statusPersetujuan),
        },
        row.original.statusPersetujuan,
      ),
  },
  {
    id: 'rating',
    header: 'Rating',
    cell: ({ row }) =>
      h('div', { class: 'text-[11px] text-slate-700' }, [
        h(
          'p',
          null,
          `Mentor: ${row.original.ratingMentor ?? '-'} / 5`,
        ),
        h(
          'p',
          null,
          `Guru: ${row.original.ratingGuru ?? '-'} / 5`,
        ),
      ]),
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right w-40',
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          UButton,
          {
            size: 'xs',
            variant: 'outline',
            color: 'neutral',
            onClick: () => openDetail(row.original),
          },
          { default: () => 'Detail' },
        ),
        h(
          UButton,
          {
            size: 'xs',
            color: 'primary',
            variant: 'soft',
            onClick: () => setujuiLogbook(row.original),
          },
          { default: () => 'Terima' },
        ),
        h(
          UButton,
          {
            size: 'xs',
            color: 'error',
            variant: 'soft',
            onClick: () => tolakLogbook(row.original),
          },
          { default: () => 'Tolak' },
        ),
      ]),
  },
])
</script>
