<!-- pages/guru/dokumen/index.vue -->
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
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">
            Dokumen PKL Siswa
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Kelola dokumen PKL bimbingan
          </h1>
          <p class="mt-1 max-w-xl text-xs text-slate-500 sm:text-sm">
            Lihat dan cek kelengkapan berkas seperti surat pengantar, surat balasan,
            sertifikat, dokumentasi, dan laporan akhir untuk setiap siswa bimbingan.
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru" class="hover:text-blue-600">Dashboard</NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">
            Dokumen PKL
          </span>
        </nav>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div class="space-y-2">
          <h2 class="text-sm font-semibold text-slate-900 sm:text-base">
            Filter dokumen
          </h2>
          <p class="text-xs text-slate-500 sm:text-sm">
            Saring berdasarkan siswa, perusahaan, atau jenis dokumen tertentu.
          </p>
        </div>

        <div
          class="grid w-full gap-2 sm:grid-cols-3 md:w-auto md:grid-cols-3 md:gap-3"
        >
          <!-- Filter siswa -->
          <UFormGroup label="Siswa" class="text-xs sm:text-sm">
            <UInput
              v-model="filters.siswa"
              size="sm"
              placeholder="Cari nama siswa..."
            />
          </UFormGroup>

          <!-- Filter perusahaan -->
          <UFormGroup label="Perusahaan" class="text-xs sm:text-sm">
            <UInput
              v-model="filters.perusahaan"
              size="sm"
              placeholder="Cari perusahaan..."
            />
          </UFormGroup>

          <!-- Filter jenis dokumen -->
          <UFormGroup label="Jenis dokumen" class="text-xs sm:text-sm">
            <USelect
              v-model="filters.jenis"
              :options="jenisOptions"
              size="sm"
            />
          </UFormGroup>
        </div>
      </div>
    </div>

    <!-- TABEL DOKUMEN -->
    <AppDataTable
      :items="filteredItems"
      :columns="dokumenColumns"
      title="Daftar dokumen PKL"
      description="Seluruh dokumen yang diunggah terkait pelaksanaan PKL siswa bimbingan Anda."
      :page-size="10"
      :searchable="true"
      search-placeholder="Cari nama file / keterangan..."
      :search-keys="['namaFile','keterangan','namaSiswa','perusahaan']"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, h, reactive } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'

definePageMeta({
  layout: 'guru',
  title: 'Dokumen PKL Siswa',
})

/* ---------- TIPE & DUMMY DATA ---------- */

type JenisFile =
  | 'SURAT_PERMOHONAN'
  | 'SURAT_BALASAN'
  | 'SURAT_PENGANTAR'
  | 'LAPORAN_AKHIR'
  | 'DOKUMENTASI'
  | 'SERTIFIKAT'
  | 'LAINNYA'

interface DokumenGuruRow {
  idFile: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  jenis: JenisFile
  namaFile: string
  tanggalUpload: string
  keterangan?: string
}

const allItems: DokumenGuruRow[] = [
  {
    idFile: 1,
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    jenis: 'SURAT_PENGANTAR',
    namaFile: 'surat_pengantar_pkl_ahmad_fajar.pdf',
    tanggalUpload: '01-12-2025',
    keterangan: 'Surat pengantar dari sekolah',
  },
  {
    idFile: 2,
    namaSiswa: 'Ahmad Fajar',
    kelas: 'XII TM A',
    perusahaan: 'PT Maju Jaya Teknik',
    jenis: 'SURAT_BALASAN',
    namaFile: 'surat_balasan_pt_maju_jaya.pdf',
    tanggalUpload: '10-12-2025',
    keterangan: 'Balasan penerimaan siswa PKL',
  },
  {
    idFile: 3,
    namaSiswa: 'Siti Aminah',
    kelas: 'XII TM B',
    perusahaan: 'Bengkel Sejahtera Motor',
    jenis: 'DOKUMENTASI',
    namaFile: 'foto_kegiatan_servis_17032026.jpg',
    tanggalUpload: '17-03-2026',
    keterangan: 'Dokumentasi kegiatan servis',
  },
  {
    idFile: 4,
    namaSiswa: 'Budi Santoso',
    kelas: 'XII TM A',
    perusahaan: 'PT Nusantara Motor',
    jenis: 'SERTIFIKAT',
    namaFile: 'sertifikat_pkl_budi_santoso.pdf',
    tanggalUpload: '25-04-2026',
    keterangan: 'Sertifikat PKL (final)',
  },
  {
    idFile: 5,
    namaSiswa: 'Rina Kartika',
    kelas: 'XII TM C',
    perusahaan: 'CV Prima Motor',
    jenis: 'LAPORAN_AKHIR',
    namaFile: 'laporan_akhir_pkl_rina_kartika_draft.pdf',
    tanggalUpload: '20-04-2026',
    keterangan: 'Draft laporan akhir (belum final)',
  },
]

/* ---------- FILTER STATE ---------- */

const filters = reactive({
  siswa: '',
  perusahaan: '',
  jenis: 'ALL' as 'ALL' | JenisFile,
})

const jenisOptions = [
  { label: 'Semua jenis', value: 'ALL' },
  { label: 'Surat Permohonan', value: 'SURAT_PERMOHONAN' },
  { label: 'Surat Pengantar', value: 'SURAT_PENGANTAR' },
  { label: 'Surat Balasan', value: 'SURAT_BALASAN' },
  { label: 'Laporan Akhir', value: 'LAPORAN_AKHIR' },
  { label: 'Dokumentasi', value: 'DOKUMENTASI' },
  { label: 'Sertifikat', value: 'SERTIFIKAT' },
  { label: 'Lainnya', value: 'LAINNYA' },
]

const filteredItems = computed(() => {
  return allItems.filter((row) => {
    const matchSiswa = filters.siswa
      ? row.namaSiswa.toLowerCase().includes(filters.siswa.toLowerCase())
      : true

    const matchPerusahaan = filters.perusahaan
      ? row.perusahaan.toLowerCase().includes(filters.perusahaan.toLowerCase())
      : true

    const matchJenis =
      filters.jenis === 'ALL' ? true : row.jenis === filters.jenis

    return matchSiswa && matchPerusahaan && matchJenis
  })
})

/* ---------- HELPER LABEL JENIS FILE ---------- */

const labelJenisFile = (jenis: JenisFile): string => {
  switch (jenis) {
    case 'SURAT_PERMOHONAN':
      return 'Surat Permohonan'
    case 'SURAT_PENGANTAR':
      return 'Surat Pengantar'
    case 'SURAT_BALASAN':
      return 'Surat Balasan'
    case 'LAPORAN_AKHIR':
      return 'Laporan Akhir'
    case 'DOKUMENTASI':
      return 'Dokumentasi'
    case 'SERTIFIKAT':
      return 'Sertifikat'
    default:
      return 'Lainnya'
  }
}

/* ---------- ACTIONS ---------- */

const downloadFile = (row: DokumenGuruRow) => {
  console.log('📄 Download file (dummy):', row)
  alert(`Simulasi download: ${row.namaFile}`)
}

/* ---------- COLUMNS UNTUK AppDataTable ---------- */

const dokumenColumns = computed<TableColumn<DokumenGuruRow>[]>(() => [
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
    accessorKey: 'jenis',
    header: 'Jenis dokumen',
    cell: ({ row }) => labelJenisFile(row.original.jenis),
  },
  {
    accessorKey: 'namaFile',
    header: 'Nama file',
  },
  {
    accessorKey: 'tanggalUpload',
    header: 'Tanggal upload',
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => row.original.keterangan || '-',
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
          onClick: () => downloadFile(row.original),
        },
        'Download',
      ),
  },
])
</script>
