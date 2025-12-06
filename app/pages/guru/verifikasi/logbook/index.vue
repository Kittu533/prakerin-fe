<template>
  <div class="bg-white min-h-screen">
    <section class="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <!-- HEADER -->
      <div
        class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      >
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="space-y-3">
          <nav class="flex items-center gap-2 text-base text-slate-500 mb-6">
            <NuxtLink to="/guru" class="hover:text-blue-600 transition-colors">
              Dashboard
            </NuxtLink>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
            <span class="text-blue-600 font-medium">Verifikasi</span>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
            <span class="text-slate-900 font-medium">Logbook</span>
          </nav>
          
          <UBadge color="blue" variant="subtle" size="lg" class="mb-4">
            Verifikasi Logbook
          </UBadge>
          <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">
            Logbook Menunggu Persetujuan
          </h1>
          <p class="text-base text-slate-600">
            Review isi logbook siswa sebelum menyetujui atau menolak.
          </p>
        </div>
      </div>
    </div>

    <!-- FILTER SECTION -->
    <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <!-- Filter Controls Row -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Calendar Icon -->
        <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
          <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-green-600" />
        </div>
        
        <!-- Filter Icon -->
        <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
          <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-green-600" />
        </div>
        
        <!-- Search Input -->
        <div class="flex-1 min-w-[300px]">
          <UInput 
            v-model="searchQuery"
            placeholder="Search here"
            icon="i-heroicons-magnifying-glass"
            size="lg"
            class="w-full"
            :ui="{ rounded: 'rounded-xl', icon: { leading: { pointer: '' } } }"
          />
        </div>
        
        <!-- Search Button -->
        <UButton 
          color="green" 
          size="lg"
          @click="performSearch"
          class="px-6"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
        </UButton>
      </div>
      
      <!-- Filter Headers Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <USelectMenu
            v-model="filterStatus"
            :options="statusFilterOptions"
            placeholder="Pilih Status"
            size="lg"
            class="w-full"
            :ui="{ rounded: 'rounded-xl' }"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-3">
                <UIcon :name="option.icon" :class="`w-4 h-4 text-${option.color}-500`" />
                <span class="text-sm font-medium">{{ option.label }}</span>
              </div>
            </template>
            <template #label>
              <div v-if="filterStatus" class="flex items-center gap-2">
                <UIcon :name="getStatusIcon(filterStatus)" :class="`w-4 h-4 text-${getStatusColor(filterStatus)}-500`" />
                <span class="text-sm">{{ getStatusLabel(filterStatus) }}</span>
              </div>
              <span v-else class="text-slate-500 text-sm">Pilih Status</span>
            </template>
          </USelectMenu>
        </div>
        
        <!-- Company Filter -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Perusahaan
          </label>
          <USelectMenu
            v-model="filterPerusahaan"
            :options="uniqueCompanies"
            placeholder="Pilih Perusahaan"
            searchable
            size="lg"
            class="w-full"
            :ui="{ rounded: 'rounded-xl' }"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-3">
                <UIcon :name="option.icon" class="w-4 h-4 text-blue-500" />
                <span class="text-sm font-medium">{{ option.label }}</span>
              </div>
            </template>
            <template #label>
              <div v-if="filterPerusahaan" class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-blue-500" />
                <span class="text-sm">{{ filterPerusahaan }}</span>
              </div>
              <span v-else class="text-slate-500 text-sm">Pilih Perusahaan</span>
            </template>
          </USelectMenu>
        </div>
        
        <!-- Reset Button -->
        <div class="flex items-end">
          <UButton 
            color="gray" 
            variant="outline" 
            size="lg"
            @click="resetAllFilters"
            :disabled="!hasActiveFilters"
            class="w-full transition-all duration-200"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
            Reset Filters
          </UButton>
        </div>
      </div>

    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredLogbook"
      :columns="columns"
      :page-size="15"
      :search-keys="['namaSiswa', 'kelas', 'perusahaan', 'tanggal', 'judul', 'statusPersetujuan']"
      class="text-base"
    >
  </AppDataTable>

    <!-- Modal detail with slug -->
    <UModal 
      v-model:open="isDetailOpen" 
      :title="`Detail Logbook #${selectedLogbook?.id || ''}`"
      :ui="{ width: 'max-w-4xl' }"
    >
      <template #body>
        <div v-if="selectedLogbook" class="space-y-6 text-base text-slate-700">
          <!-- Header Info -->
          <div class="bg-slate-50 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-3">
              <UBadge color="blue" variant="subtle" size="lg">
                LOG-{{ String(selectedLogbook.id).padStart(3, '0') }}
              </UBadge>
              <UBadge 
                :color="statusBadgeColor(selectedLogbook.statusPersetujuan)" 
                variant="soft"
                size="lg"
              >
                {{ selectedLogbook.statusPersetujuan }}
              </UBadge>
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-2">
              {{ selectedLogbook.judul }}
            </h3>
            <p class="text-base text-slate-600 mb-1">
              {{ selectedLogbook.tanggal }} • {{ selectedLogbook.namaSiswa }} ({{ selectedLogbook.kelas }})
            </p>
            <p class="text-base text-slate-500">
              Perusahaan: {{ selectedLogbook.perusahaan }}
            </p>
          </div>
          
          <!-- Rating Section -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-blue-50 rounded-xl p-4">
              <p class="text-sm font-medium text-blue-600 mb-2">Rating Mentor</p>
              <p class="text-2xl font-bold text-blue-700">
                {{ selectedLogbook.ratingMentor || '-' }}/5
              </p>
            </div>
            <div class="bg-green-50 rounded-xl p-4">
              <p class="text-sm font-medium text-green-600 mb-2">Rating Guru</p>
              <p class="text-2xl font-bold text-green-700">
                {{ selectedLogbook.ratingGuru || '-' }}/5
              </p>
            </div>
          </div>
          
          <!-- Content Placeholder -->
          <div class="border border-slate-200 rounded-xl p-6">
            <p class="text-base text-slate-600 italic">
              Konten lengkap logbook akan ditampilkan di sini setelah integrasi dengan API.
            </p>
          </div>
        </div>
      </template>
      <template #footer="{ close }">
        <div class="flex w-full justify-between">
          <div class="flex gap-3">
            <UButton 
              v-if="selectedLogbook?.statusPersetujuan === 'MENUNGGU'" 
              size="lg" 
              color="green" 
              @click="approveLogbook(selectedLogbook)"
            >
              <UIcon name="i-heroicons-check" class="w-5 h-5 mr-2" />
              Setujui
            </UButton>
            <UButton 
              v-if="selectedLogbook?.statusPersetujuan === 'MENUNGGU'" 
              size="lg" 
              color="red" 
              @click="rejectLogbook(selectedLogbook)"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 mr-2" />
              Tolak
            </UButton>
          </div>
          <UButton size="lg" color="gray" variant="outline" @click="close">
            Tutup
          </UButton>
        </div>
      </template>
    </UModal>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, resolveComponent, watch } from 'vue'
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
const searchQuery = ref<string>('')

// Debounced search
const debouncedSearchQuery = ref<string>('')

// Debounce utility function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Debounced search function
const updateDebouncedSearch = debounce(() => {
  debouncedSearchQuery.value = searchQuery.value
}, 300)

// Watch for search changes
watch(searchQuery, () => {
  updateDebouncedSearch()
})

// Search action
const performSearch = () => {
  debouncedSearchQuery.value = searchQuery.value
}

// Computed properties for enhanced dropdowns
const uniqueCompanies = computed(() => {
  const companies = new Set<string>()
  items.value.forEach((row) => companies.add(row.perusahaan))
  return Array.from(companies).map(company => ({
    value: company,
    label: company,
    icon: 'i-heroicons-building-office'
  }))
})

const statusFilterOptions = computed(() => [
  { value: '', label: 'Semua Status', color: 'gray', icon: 'i-heroicons-list-bullet' },
  { value: 'MENUNGGU', label: 'Menunggu', color: 'yellow', icon: 'i-heroicons-clock' },
  { value: 'DISETUJUI', label: 'Disetujui', color: 'green', icon: 'i-heroicons-check-circle' },
  { value: 'DITOLAK', label: 'Ditolak', color: 'red', icon: 'i-heroicons-x-circle' }
])

const statusOptions = computed(() => [
  { value: 'MENUNGGU', label: 'Menunggu', color: 'yellow', icon: 'i-heroicons-clock' },
  { value: 'DISETUJUI', label: 'Disetujui', color: 'green', icon: 'i-heroicons-check-circle' },
  { value: 'DITOLAK', label: 'Ditolak', color: 'red', icon: 'i-heroicons-x-circle' }
])

// Quick filter functions
const setQuickFilter = (type: string) => {
  if (type === 'menunggu') {
    filterStatus.value = 'MENUNGGU'
    filterPerusahaan.value = ''
  } else if (type === 'disetujui') {
    filterStatus.value = 'DISETUJUI'
    filterPerusahaan.value = ''
  } else if (type === 'ditolak') {
    filterStatus.value = 'DITOLAK'
    filterPerusahaan.value = ''
  } else if (type === 'reset') {
    resetAllFilters()
  }
}

// Reset all filters
const resetAllFilters = () => {
  filterStatus.value = ''
  filterPerusahaan.value = ''
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    filterStatus.value ||
    filterPerusahaan.value ||
    searchQuery.value
  )
})

const perusahaanOptions = computed(() => {
  const set = new Set<string>()
  items.value.forEach((row) => set.add(row.perusahaan))
  return Array.from(set)
})

const filteredLogbook = computed(() =>
  items.value.filter((row) => {
    // Filter by company
    if (filterPerusahaan.value && row.perusahaan !== filterPerusahaan.value)
      return false
    // Filter by status
    if (filterStatus.value && row.statusPersetujuan !== filterStatus.value)
      return false
    // Debounced search functionality
    if (debouncedSearchQuery.value.trim()) {
      const search = debouncedSearchQuery.value.toLowerCase()
      const matchesSearch = 
        row.namaSiswa.toLowerCase().includes(search) ||
        row.kelas.toLowerCase().includes(search) ||
        row.perusahaan.toLowerCase().includes(search) ||
        row.judul.toLowerCase().includes(search) ||
        row.tanggal.includes(search)
      if (!matchesSearch) return false
    }
    return true
  }),
)

const resetFilter = () => {
  resetAllFilters()
}

/* ---------- UI HELPERS ---------- */

const UButton = resolveComponent('UButton')

// Status badge color helper
const statusBadgeColor = (status: StatusPersetujuan) => {
  switch (status) {
    case 'DISETUJUI': return 'green'
    case 'MENUNGGU': return 'yellow'
    case 'DITOLAK': return 'red'
    default: return 'gray'
  }
}

// Helper functions for status display
const getStatusIcon = (status: StatusPersetujuan) => {
  switch (status) {
    case 'MENUNGGU': return 'i-heroicons-clock'
    case 'DISETUJUI': return 'i-heroicons-check-circle'
    case 'DITOLAK': return 'i-heroicons-x-circle'
    default: return 'i-heroicons-question-mark-circle'
  }
}

const getStatusColor = (status: StatusPersetujuan) => {
  switch (status) {
    case 'MENUNGGU': return 'yellow'
    case 'DISETUJUI': return 'green'
    case 'DITOLAK': return 'red'
    default: return 'gray'
  }
}

const getStatusLabel = (status: StatusPersetujuan) => {
  switch (status) {
    case 'MENUNGGU': return 'Menunggu'
    case 'DISETUJUI': return 'Disetujui'
    case 'DITOLAK': return 'Ditolak'
    default: return status
  }
}

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

const approveLogbook = (row: LogbookVerifikasiRow) => {
  row.statusPersetujuan = 'DISETUJUI'
  console.log('✅ Setujui logbook (dummy):', row)
  isDetailOpen.value = false
}

const rejectLogbook = (row: LogbookVerifikasiRow) => {
  row.statusPersetujuan = 'DITOLAK'
  console.log('❌ Tolak logbook (dummy):', row)
  isDetailOpen.value = false
}

const setujuiLogbook = (row: LogbookVerifikasiRow) => {
  approveLogbook(row)
}

const tolakLogbook = (row: LogbookVerifikasiRow) => {
  rejectLogbook(row)
}

/* ---------- COLUMNS ---------- */

const columns = computed<TableColumn<LogbookVerifikasiRow>[]>(() => [
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    meta: {
      class: 'text-base font-medium',
    },
  },
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) =>
      `${row.original.namaSiswa} • ${row.original.kelas}`,
    meta: {
      class: 'text-base',
    },
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan',
    meta: {
      class: 'text-base',
    },
  },
  {
    accessorKey: 'judul',
    header: 'Judul kegiatan',
    meta: {
      class: 'text-base',
    },
  },
  {
    accessorKey: 'statusPersetujuan',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ' +
            badgeStatus(row.original.statusPersetujuan),
        },
        row.original.statusPersetujuan,
      ),
  },
  {
    id: 'rating',
    header: 'Rating',
    cell: ({ row }) =>
      h('div', { class: 'text-sm text-slate-700' }, [
        h(
          'p',
          { class: 'mb-1' },
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
        th: 'text-right w-48',
        td: 'text-right',
      },
    },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          UButton,
          {
            size: 'sm',
            variant: 'outline',
            color: 'neutral',
            onClick: () => openDetail(row.original),
          },
          { default: () => 'Detail' },
        ),
        h(
          UButton,
          {
            size: 'sm',
            color: 'primary',
            variant: 'soft',
            onClick: () => setujuiLogbook(row.original),
          },
          { default: () => 'Terima' },
        ),
        h(
          UButton,
          {
            size: 'sm',
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
