<!-- pages/guru/index.vue -->
<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- HERO / HEADER -->
    <div
      class="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white shadow-lg sm:rounded-3xl sm:p-8"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-blue-100">
            Dashboard Guru Pembimbing PKL
          </p>
          <h1 class="mt-1 text-2xl font-bold sm:text-3xl md:text-4xl">
            Selamat datang, {{ guru.nama }}
          </h1>
          <p class="mt-2 max-w-xl text-xs text-blue-100 sm:text-sm md:text-base">
            Pantau progres PKL siswa bimbingan Anda: kehadiran, logbook, penilaian,
            hingga laporan akhir dalam satu tampilan.
          </p>
        </div>

        <div
          class="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-xs backdrop-blur-sm sm:text-sm"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-semibold"
          >
            {{ guru.inisial }}
          </div>
          <div>
            <p class="font-semibold">
              {{ guru.nama }}
            </p>
            <p class="text-blue-100">
              {{ guru.role }}
            </p>
          </div>
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="mt-4 flex items-center gap-2 text-xs text-blue-100 sm:text-sm">
        <span class="font-semibold text-white">Dashboard</span>
      </nav>
    </div>

    <!-- KPI CARDS -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Siswa bimbingan aktif -->
      <div
        class="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
      >
        <p class="text-xs font-medium uppercase text-slate-500">
          Siswa bimbingan aktif
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ summary.jumlahSiswaAktif }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Dari total {{ summary.jumlahPenempatan }} penempatan.
        </p>
      </div>

      <!-- Rata-rata kehadiran -->
      <div
        class="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
      >
        <p class="text-xs font-medium uppercase text-slate-500">
          Rata-rata kehadiran
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ summary.rataRataKehadiran }}%
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Dihitung dari seluruh penempatan aktif.
        </p>
      </div>

      <!-- Logbook pending verifikasi -->
      <div
        class="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
      >
        <p class="text-xs font-medium uppercase text-slate-500">
          Logbook menunggu ACC
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ summary.logbookPending }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Perlu verifikasi dari Anda.
        </p>
      </div>

      <!-- Absensi pending / bermasalah -->
      <div
        class="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
      >
        <p class="text-xs font-medium uppercase text-slate-500">
          Absensi perlu dicek
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ summary.absensiPending }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Pending verifikasi / bermasalah.
        </p>
      </div>
    </div>

    <!-- 2 PANEL LIST -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Logbook terbaru menunggu ACC -->
      <div
        class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-slate-900 sm:text-base">
              Logbook terbaru menunggu ACC
            </h2>
            <p class="mt-1 text-xs text-slate-500 sm:text-sm">
              {{ logbookPendingItems.length }} logbook menunggu verifikasi Anda.
            </p>
          </div>
          <button
            type="button"
            class="text-xs font-medium text-blue-600 hover:text-blue-700"
            @click="goVerifikasiLogbook"
          >
            Lihat semua
          </button>
        </div>

        <div class="mt-4">
          <AppDataTable
            :items="logbookPendingItems"
            :columns="logbookColumns"
            :page-size="5"
            :searchable="false"
          />
        </div>
      </div>

      <!-- Absensi bermasalah / pending -->
      <div
        class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-slate-900 sm:text-base">
              Absensi bermasalah / pending
            </h2>
            <p class="mt-1 text-xs text-slate-500 sm:text-sm">
              {{ absensiIssueItems.length }} absensi perlu ditinjau.
            </p>
          </div>
          <button
            type="button"
            class="text-xs font-medium text-blue-600 hover:text-blue-700"
            @click="goVerifikasiAbsensi"
          >
            Lihat semua
          </button>
        </div>

        <div class="mt-4">
          <AppDataTable
            :items="absensiIssueItems"
            :columns="absensiColumns"
            :page-size="5"
            :searchable="false"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'

definePageMeta({
  layout: 'guru',
  title: 'Dashboard Guru',
})

/* ---------- DUMMY DATA GURU & SUMMARY ---------- */

const guru = {
  nama: 'Bapak Agus Supriyanto, S.Pd.',
  inisial: 'AS',
  role: 'Guru Pembimbing PKL',
}

const summary = {
  jumlahSiswaAktif: 12,
  jumlahPenempatan: 15,
  rataRataKehadiran: 92.3,
  logbookPending: 7,
  absensiPending: 4,
}

/* ---------- LOGBOOK PENDING ---------- */

type StatusPersetujuan = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'

interface LogbookDashboardRow {
  idLogbook: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  tanggal: string
  judul: string
  status: StatusPersetujuan
}

const logbookPendingItems: LogbookDashboardRow[] = [
  {
    idLogbook: 201,
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    tanggal: '18-03-2026',
    judul: 'Pendampingan servis berkala motor matic',
    status: 'MENUNGGU',
  },
  {
    idLogbook: 202,
    namaSiswa: 'Siti Aminah',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    tanggal: '17-03-2026',
    judul: 'Pemeriksaan sistem rem & oli',
    status: 'MENUNGGU',
  },
  {
    idLogbook: 203,
    namaSiswa: 'Budi Santoso',
    kelas: 'XII TM A',
    perusahaan: 'PT Nusantara Motor',
    tanggal: '17-03-2026',
    judul: 'Briefing keselamatan kerja & housekeeping',
    status: 'MENUNGGU',
  },
  {
    idLogbook: 204,
    namaSiswa: 'Rina Kartika',
    kelas: 'XII TM C',
    perusahaan: 'CV Prima Motor',
    tanggal: '16-03-2026',
    judul: 'Pencatatan sparepart masuk',
    status: 'MENUNGGU',
  },
  {
    idLogbook: 205,
    namaSiswa: 'Doni Saputra',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    tanggal: '16-03-2026',
    judul: 'Pengecekan motor sebelum serah terima ke pelanggan',
    status: 'MENUNGGU',
  },
]

const badgeStatusLogbook = (status: StatusPersetujuan) => {
  if (status === 'DISETUJUI') return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (status === 'MENUNGGU') return 'bg-amber-50 text-amber-700 border border-amber-100'
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

const goVerifikasiLogbook = () => {
  navigateTo('/guru/verifikasi/logbook')
}

const goDetailLogbook = (row: LogbookDashboardRow) => {
  // nanti bisa diarahkan ke /guru/penempatan/[id]?tab=logbook atau halaman khusus
  navigateTo('/guru/verifikasi/logbook')
}

/* ---------- ABSENSI ISSUE ---------- */

type StatusAbsensi = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA'
type StatusVerifikasi = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'

interface AbsensiDashboardRow {
  idAbsensi: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  tanggal: string
  jamMasuk: string
  jamKeluar: string
  statusAbsensi: StatusAbsensi
  statusGuru: StatusVerifikasi
  isBermasalah: boolean
}

const absensiIssueItems: AbsensiDashboardRow[] = [
  {
    idAbsensi: 501,
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    tanggal: '18-03-2026',
    jamMasuk: '08:35',
    jamKeluar: '16:00',
    statusAbsensi: 'HADIR',
    statusGuru: 'MENUNGGU',
    isBermasalah: true,
  },
  {
    idAbsensi: 502,
    namaSiswa: 'Budi Santoso',
    kelas: 'XII TM A',
    perusahaan: 'PT Nusantara Motor',
    tanggal: '17-03-2026',
    jamMasuk: '08:05',
    jamKeluar: '-',
    statusAbsensi: 'HADIR',
    statusGuru: 'MENUNGGU',
    isBermasalah: true,
  },
  {
    idAbsensi: 503,
    namaSiswa: 'Rina Kartika',
    kelas: 'XII TM C',
    perusahaan: 'CV Prima Motor',
    tanggal: '17-03-2026',
    jamMasuk: '-',
    jamKeluar: '-',
    statusAbsensi: 'IZIN',
    statusGuru: 'MENUNGGU',
    isBermasalah: false,
  },
]

const badgeStatusAbsensi = (status: StatusAbsensi) => {
  if (status === 'HADIR') return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (status === 'IZIN') return 'bg-blue-50 text-blue-700 border border-blue-100'
  if (status === 'SAKIT') return 'bg-amber-50 text-amber-700 border border-amber-100'
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

const goVerifikasiAbsensi = () => {
  navigateTo('/guru/verifikasi/absensi')
}

const goDetailAbsensi = (row: AbsensiDashboardRow) => {
  navigateTo('/guru/verifikasi/absensi')
}

/* ---------- COLUMNS UNTUK AppDataTable ---------- */

const logbookColumns = computed<TableColumn<LogbookDashboardRow>[]>(() => [
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
    accessorKey: 'tanggal',
    header: 'Tanggal',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
            badgeStatusLogbook(row.original.status),
        },
        row.original.status,
      ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right w-24',
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h(
        'button',
        {
          type: 'button',
          class:
            'text-[11px] font-medium text-blue-600 hover:text-blue-700',
          onClick: () => goDetailLogbook(row.original),
        },
        'Detail',
      ),
  },
])

const absensiColumns = computed<TableColumn<AbsensiDashboardRow>[]>(() => [
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
    accessorKey: 'tanggal',
    header: 'Tanggal',
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
    id: 'aksi',
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right w-24',
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h(
        'button',
        {
          type: 'button',
          class:
            'text-[11px] font-medium text-blue-600 hover:text-blue-700',
          onClick: () => goDetailAbsensi(row.original),
        },
        'Review',
      ),
  },
])
</script>
