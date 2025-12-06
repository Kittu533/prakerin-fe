<!-- pages/guru/dokumen/index.vue -->
<template>
  <div class="bg-white min-h-screen">
    <section class="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <!-- HEADER WITH BREADCRUMB -->
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-base text-slate-500 mb-6">
          <NuxtLink to="/guru" class="hover:text-blue-600 transition-colors">
            Dashboard
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
          <span class="text-slate-900 font-medium">Dokumen PKL</span>
        </nav>

        <!-- Header Content -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="space-y-4">
            <UBadge color="primary" variant="subtle" size="lg" class="mb-4">
              Manajemen Dokumen
            </UBadge>
            
            <div>
              <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
                Dokumen PKL Siswa
              </h1>
              <p class="text-lg text-slate-600 mt-2 max-w-2xl">
                Kelola dan verifikasi kelengkapan berkas PKL siswa bimbingan Anda
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-base text-slate-600">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
                <span>{{ allItems.length }} Total Dokumen</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
                <span>{{ uniqueStudents.length }} Siswa</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-office" class="w-5 h-5" />
                <span>{{ uniqueCompanies.length }} Perusahaan</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              color="success"
              variant="outline"
              size="lg"
              @click="exportDocuments"
              :loading="exportLoading"
            >
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 mr-2" />
              {{ exportLoading ? 'Mengekspor...' : 'Export Data' }}
            </UButton>
            
            <UButton
              color="primary"
              size="lg"
              @click="refreshData"
              :loading="refreshLoading"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
              {{ refreshLoading ? 'Memuat...' : 'Refresh Data' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- FILTER SECTION -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <!-- Filter Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-slate-900">
              Filter & Pencarian
            </h2>
            <p class="text-base text-slate-600 mt-1">
              Saring dokumen berdasarkan kriteria tertentu
            </p>
          </div>
          
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            @click="resetFilters"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
            Reset Filter
          </UButton>
        </div>

        <!-- Filter Controls -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Search Siswa -->
          <UFormGroup label="Cari Siswa" class="text-base">
            <UInput
              v-model="filters.siswa"
              size="lg"
              placeholder="Masukkan nama siswa..."
              :ui="{ base: 'text-base' }"
            >
              <template #leading>
                <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-gray-400" />
              </template>
            </UInput>
          </UFormGroup>

          <!-- Search Perusahaan -->
          <UFormGroup label="Cari Perusahaan" class="text-base">
            <UInput
              v-model="filters.perusahaan"
              size="lg"
              placeholder="Masukkan nama perusahaan..."
              :ui="{ base: 'text-base' }"
            >
              <template #leading>
                <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-gray-400" />
              </template>
            </UInput>
          </UFormGroup>

          <!-- Filter Jenis Dokumen -->
          <UFormGroup label="Jenis Dokumen" class="text-base">
            <USelectMenu
              v-model="filters.jenis"
              :options="jenisOptions"
              size="lg"
              placeholder="Pilih jenis dokumen"
            >
              <template #item="{ item }">
                <div v-if="item" class="flex items-center gap-3">
                  <UIcon v-if="(item as JenisFileOption).icon" :name="(item as JenisFileOption).icon" class="w-4 h-4" />
                  <span class="text-base">{{ (item as JenisFileOption).label }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>

          <!-- Filter Status Verifikasi -->
          <UFormGroup label="Status Verifikasi" class="text-base">
            <USelectMenu
              v-model="filters.statusVerifikasi"
              :options="statusOptions"
              size="lg"
              placeholder="Pilih status"
            >
              <template #item="{ item }">
                <div v-if="item" class="flex items-center gap-3">
                  <UIcon :name="(item as StatusVerifikasiOption).icon" :class="`w-4 h-4 text-${(item as StatusVerifikasiOption).color}-500`" />
                  <span class="text-base">{{ (item as StatusVerifikasiOption).label }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>

        <!-- Filter Results Summary -->
        <div class="mt-6 p-4 bg-slate-50 rounded-xl">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4 text-base text-slate-600">
              <span>Menampilkan <strong class="text-slate-900">{{ filteredItems.length }}</strong> dari <strong class="text-slate-900">{{ allItems.length }}</strong> dokumen</span>
            </div>
            
            <div v-if="hasActiveFilters" class="flex items-center gap-2">
              <UBadge color="primary" variant="soft">{{ activeFilterCount }} Filter Aktif</UBadge>
            </div>
          </div>
        </div>
      </div>

      <!-- TABEL DOKUMEN -->
      <div class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 class="text-xl font-bold text-slate-900">
                Daftar Dokumen PKL
              </h3>
              <p class="text-base text-slate-600 mt-1">
                Kelola semua dokumen yang diunggah oleh siswa bimbingan
              </p>
            </div>
          </div>

          <AppDataTable
            :items="filteredItems"
            :columns="dokumenColumns"
            :page-size="12"
            :searchable="true"
            search-placeholder="Cari berdasarkan nama file, keterangan, siswa, atau perusahaan..."
            :search-keys="['namaFile','keterangan','namaSiswa','perusahaan']"
            :loading="tableLoading"
            class="text-base"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'
import type { 
  JenisFile, 
  DokumenGuruRow, 
  DokumenFilterState,
  JenisFileOption,
  StatusVerifikasiOption
} from '~/types/dokumen'

definePageMeta({
  layout: 'guru',
  title: 'Dokumen PKL Siswa',
})

/* ---------- LOADING STATES ---------- */
const tableLoading = ref(false)
const exportLoading = ref(false)
const refreshLoading = ref(false)

/* ---------- DUMMY DATA WITH ENHANCED FIELDS ---------- */
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
    ukuranFile: '2.3 MB',
    statusVerifikasi: 'APPROVED',
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
    ukuranFile: '1.8 MB',
    statusVerifikasi: 'APPROVED',
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
    ukuranFile: '5.2 MB',
    statusVerifikasi: 'PENDING',
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
    ukuranFile: '3.1 MB',
    statusVerifikasi: 'APPROVED',
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
    ukuranFile: '8.7 MB',
    statusVerifikasi: 'PENDING',
  },
  {
    idFile: 6,
    namaSiswa: 'Muhammad Rizky',
    kelas: 'XII TM A',
    perusahaan: 'PT Garuda Otomotif',
    jenis: 'SURAT_PERMOHONAN',
    namaFile: 'surat_permohonan_pkl_rizky.pdf',
    tanggalUpload: '15-11-2025',
    keterangan: 'Surat permohonan PKL ke perusahaan',
    ukuranFile: '1.5 MB',
    statusVerifikasi: 'REJECTED',
  },
]

/* ---------- FILTER STATE ---------- */
const filters = reactive<DokumenFilterState>({
  siswa: '',
  perusahaan: '',
  jenis: 'ALL',
  statusVerifikasi: 'ALL',
})

/* ---------- FILTER OPTIONS ---------- */
const jenisOptions: JenisFileOption[] = [
  { label: 'Semua Jenis', value: 'ALL', icon: 'i-heroicons-document-text' },
  { label: 'Surat Permohonan', value: 'SURAT_PERMOHONAN', icon: 'i-heroicons-envelope' },
  { label: 'Surat Pengantar', value: 'SURAT_PENGANTAR', icon: 'i-heroicons-paper-airplane' },
  { label: 'Surat Balasan', value: 'SURAT_BALASAN', icon: 'i-heroicons-envelope-open' },
  { label: 'Laporan Akhir', value: 'LAPORAN_AKHIR', icon: 'i-heroicons-document-chart-bar' },
  { label: 'Dokumentasi', value: 'DOKUMENTASI', icon: 'i-heroicons-camera' },
  { label: 'Sertifikat', value: 'SERTIFIKAT', icon: 'i-heroicons-academic-cap' },
  { label: 'Lainnya', value: 'LAINNYA', icon: 'i-heroicons-ellipsis-horizontal' },
]

const statusOptions: StatusVerifikasiOption[] = [
  { label: 'Semua Status', value: 'ALL', color: 'gray', icon: 'i-heroicons-list-bullet' },
  { label: 'Menunggu Verifikasi', value: 'PENDING', color: 'yellow', icon: 'i-heroicons-clock' },
  { label: 'Disetujui', value: 'APPROVED', color: 'green', icon: 'i-heroicons-check-circle' },
  { label: 'Ditolak', value: 'REJECTED', color: 'red', icon: 'i-heroicons-x-circle' },
]

/* ---------- COMPUTED PROPERTIES ---------- */
const filteredItems = computed(() => {
  return allItems.filter((row) => {
    const matchSiswa = filters.siswa
      ? row.namaSiswa.toLowerCase().includes(filters.siswa.toLowerCase())
      : true

    const matchPerusahaan = filters.perusahaan
      ? row.perusahaan.toLowerCase().includes(filters.perusahaan.toLowerCase())
      : true

    const matchJenis = filters.jenis === 'ALL' ? true : row.jenis === filters.jenis
    
    const matchStatus = filters.statusVerifikasi === 'ALL' ? true : row.statusVerifikasi === filters.statusVerifikasi

    return matchSiswa && matchPerusahaan && matchJenis && matchStatus
  })
})

const uniqueStudents = computed(() => {
  const students = [...new Set(allItems.map(item => item.namaSiswa))]
  return students
})

const uniqueCompanies = computed(() => {
  const companies = [...new Set(allItems.map(item => item.perusahaan))]
  return companies
})

const hasActiveFilters = computed(() => {
  return filters.siswa !== '' || 
         filters.perusahaan !== '' || 
         filters.jenis !== 'ALL' || 
         filters.statusVerifikasi !== 'ALL'
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.siswa !== '') count++
  if (filters.perusahaan !== '') count++
  if (filters.jenis !== 'ALL') count++
  if (filters.statusVerifikasi !== 'ALL') count++
  return count
})

/* ---------- HELPER FUNCTIONS ---------- */
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

const getStatusBadge = (status: DokumenGuruRow['statusVerifikasi']) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-50 text-green-700 border border-green-100'
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-100'
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border border-red-100'
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100'
  }
}

const getStatusLabel = (status: DokumenGuruRow['statusVerifikasi']) => {
  switch (status) {
    case 'APPROVED': return 'Disetujui'
    case 'PENDING': return 'Menunggu'
    case 'REJECTED': return 'Ditolak'
    default: return 'Unknown'
  }
}

/* ---------- ACTION FUNCTIONS ---------- */
const downloadFile = async (row: DokumenGuruRow) => {
  try {
    console.log('📄 Download file:', row)
    // Simulate download process
    const fileName = row.namaFile
    alert(`Mengunduh file: ${fileName}`)
    
    // TODO: Implement actual download logic
    // const response = await $fetch(`/api/dokumen/${row.idFile}/download`)
  } catch (error) {
    console.error('Download failed:', error)
    alert('Gagal mengunduh file. Silakan coba lagi.')
  }
}

const viewFile = (row: DokumenGuruRow) => {
  console.log('👁️ View file:', row)
  // TODO: Implement file preview/view logic
  alert(`Melihat file: ${row.namaFile}`)
}

const verifyDocument = async (row: DokumenGuruRow, status: 'APPROVED' | 'REJECTED') => {
  try {
    console.log(`✅ ${status} document:`, row)
    
    // Find and update the document status
    const item = allItems.find(item => item.idFile === row.idFile)
    if (item) {
      item.statusVerifikasi = status
    }
    
    alert(`Dokumen ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`)
  } catch (error) {
    console.error('Verification failed:', error)
    alert('Gagal memverifikasi dokumen. Silakan coba lagi.')
  }
}

const exportDocuments = async () => {
  exportLoading.value = true
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('📊 Export documents')
    alert('Data dokumen berhasil diekspor!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Gagal mengekspor data. Silakan coba lagi.')
  } finally {
    exportLoading.value = false
  }
}

const refreshData = async () => {
  refreshLoading.value = true
  tableLoading.value = true
  
  try {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('🔄 Refresh data')
    // TODO: Implement actual data fetching
    // await fetchDocuments()
  } catch (error) {
    console.error('Refresh failed:', error)
    alert('Gagal memuat ulang data. Silakan coba lagi.')
  } finally {
    refreshLoading.value = false
    tableLoading.value = false
  }
}

const resetFilters = () => {
  filters.siswa = ''
  filters.perusahaan = ''
  filters.jenis = 'ALL'
  filters.statusVerifikasi = 'ALL'
}

/* ---------- TABLE COLUMNS ---------- */
const dokumenColumns = computed<TableColumn<DokumenGuruRow>[]>(() => {
  const UButton = resolveComponent('UButton')
  
  return [
    {
      accessorKey: 'namaSiswa',
      header: 'Siswa',
      cell: ({ row }) => `${row.original.namaSiswa} • ${row.original.kelas}`,
      meta: {
        class: { td: 'text-base font-medium' },
      },
    },
    {
      accessorKey: 'perusahaan',
      header: 'Perusahaan',
      meta: {
        class: { td: 'text-base' },
      },
    },
    {
      accessorKey: 'jenis',
      header: 'Jenis Dokumen',
      cell: ({ row }) => labelJenisFile(row.original.jenis),
      meta: {
        class: { td: 'text-base' },
      },
    },
    {
      accessorKey: 'namaFile',
      header: 'Nama File',
      cell: ({ row }) => h('div', { class: 'space-y-1' }, [
        h('div', { class: 'text-base font-medium text-slate-900' }, row.original.namaFile),
        h('div', { class: 'text-sm text-slate-500' }, row.original.ukuranFile || ''),
      ]),
    },
    {
      accessorKey: 'tanggalUpload',
      header: 'Tanggal Upload',
      meta: {
        class: { td: 'text-base' },
      },
    },
    {
      accessorKey: 'statusVerifikasi',
      header: 'Status',
      cell: ({ row }) =>
        h(
          'span',
          {
            class: 'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ' +
              getStatusBadge(row.original.statusVerifikasi),
          },
          getStatusLabel(row.original.statusVerifikasi)
        ),
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
      cell: ({ row }) => h('div', {
        class: 'text-base text-slate-600 max-w-xs truncate',
        title: row.original.keterangan || ''
      }, row.original.keterangan || '-'),
    },
    {
      id: 'actions',
      header: 'Aksi',
      meta: {
        class: { th: 'text-right w-56', td: 'text-right' },
      },
      cell: ({ row }) =>
        h('div', { class: 'flex justify-end gap-2' }, [
          h(
            UButton,
            {
              size: 'sm',
              color: 'primary',
              variant: 'outline',
              onClick: () => viewFile(row.original),
            },
            { default: () => 'Lihat' }
          ),
          h(
            UButton,
            {
              size: 'sm',
              color: 'neutral',
              variant: 'outline',
              onClick: () => downloadFile(row.original),
            },
            { default: () => 'Download' }
          ),
          ...(row.original.statusVerifikasi === 'PENDING' ? [
            h(
              UButton,
              {
                size: 'sm',
                color: 'success',
                variant: 'soft',
                onClick: () => verifyDocument(row.original, 'APPROVED'),
              },
              { default: () => 'Setujui' }
            ),
            h(
              UButton,
              {
                size: 'sm',
                color: 'error',
                variant: 'soft',
                onClick: () => verifyDocument(row.original, 'REJECTED'),
              },
              { default: () => 'Tolak' }
            ),
          ] : []),
        ]),
    },
  ]
})

/* ---------- LIFECYCLE ---------- */
onMounted(async () => {
  // Simulate initial data loading
  tableLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  tableLoading.value = false
})
</script>
