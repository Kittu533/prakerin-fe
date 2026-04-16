<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton v-if="selectedSiswa" variant="ghost" color="neutral" size="sm" @click="backToList">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </UButton>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          {{ selectedSiswa ? `Logbook ${selectedSiswa.nama}` : 'Verifikasi Logbook' }}
        </h1>
        <p class="text-sm text-slate-500">
          {{ selectedSiswa ? `${selectedSiswa.kelas} • ${selectedSiswa.industri}` : 'Pilih siswa untuk melihat logbook'
          }}
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-20 mb-2" />
          <USkeleton class="h-6 w-12" />
        </div>
      </template>
      <template v-else>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm">Pending</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Disetujui</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:x-circle" class="w-4 h-4" />
            <span class="text-sm">Revisi</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.revision }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:file-text" class="w-4 h-4" />
            <span class="text-sm">Total</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
      </template>
    </div>

    <!-- Student List View -->
    <template v-if="!selectedSiswa">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <UInput v-model="searchSiswa" placeholder="Cari nama siswa..." class="w-full">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
      </div>

      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Siswa Bimbingan</h2>
          <p class="text-xs text-slate-500">Klik untuk melihat logbook siswa</p>
        </div>

        <div v-if="loading" class="divide-y divide-slate-100">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-4">
            <USkeleton class="w-12 h-12 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="siswa in filteredSiswa" :key="siswa.id"
            class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="selectSiswa(siswa)">
            <div
              class="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold shrink-0">
              {{ siswa.inisial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.industri }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="siswa.pending > 0" class="flex items-center gap-1">
                <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <span class="text-sm font-medium text-amber-600">{{ siswa.pending }} pending</span>
              </div>
              <Icon name="lucide:chevron-right" class="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div v-if="!filteredSiswa.length" class="py-12 text-center">
            <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada siswa</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Logbook List View -->
    <template v-else>
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row gap-3">
            <UInput v-model="search" placeholder="Cari kegiatan..." class="flex-1">
              <template #leading>
                <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
              </template>
            </UInput>
            <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status"
              class="w-full sm:w-40" />
            <USelectMenu v-model="itemsPerPage" :options="perPageOptions" class="w-full sm:w-28" />
          </div>
          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="flex-1">
              <label class="text-xs font-medium text-slate-600 mb-1 block">Rentang Tanggal Export</label>
              <div class="flex gap-2 items-center">
                <UInput v-model="filterDateStart" type="date" class="flex-1" />
                <span class="text-slate-400">-</span>
                <UInput v-model="filterDateEnd" type="date" class="flex-1" />
              </div>
            </div>
            <UButton color="primary" variant="outline" icon="lucide:download" :loading="exporting" :disabled="!selectedSiswa || logbooks.length === 0"
              @click="exportToExcel">
              Export Excel
            </UButton>
          </div>
        </div>
      </div>

      <!-- Data Table (Desktop) -->
      <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div v-if="loadingLogbook" class="p-4 space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kegiatan</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jam</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in paginatedLogbooks" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-600">{{ startIndex + index + 1 }}</td>
                <td class="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{{ item.tanggal }}</td>
                <td class="px-4 py-3">
                  <div class="max-w-[300px]">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ item.kegiatan }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ item.deskripsi }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{{ item.jamMulai }} - {{ item.jamSelesai
                  }}
                </td>
                <td class="px-4 py-3">
                  <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
                </td>
                <td class="px-4 py-3">
                  <div v-if="item.status === 'Pending'" class="flex justify-center gap-1">
                    <UButton size="xs" color="success" variant="soft" @click="approve(item.id)">
                      <Icon name="lucide:check" class="w-4 h-4" />
                    </UButton>
                    <UButton size="xs" color="warning" variant="soft" @click="openRevision(item)">
                      <Icon name="lucide:edit" class="w-4 h-4" />
                    </UButton>
                  </div>
                  <span v-else class="text-xs text-slate-400 flex justify-center">-</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!paginatedLogbooks.length" class="py-12 text-center">
            <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada logbook</p>
          </div>
        </div>
      </div>

      <!-- Card List (Mobile) -->
      <div class="lg:hidden space-y-3">
        <template v-if="loadingLogbook">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
            <USkeleton class="h-4 w-3/4 mb-2" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </template>
        <template v-else>
          <div v-for="item in paginatedLogbooks" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg" :class="getStatusBg(item.status)">
                  <Icon name="lucide:book-open" class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-medium text-slate-900 text-sm">{{ item.kegiatan }}</p>
                  <p class="text-xs text-slate-500">{{ item.tanggal }} • {{ item.jamMulai }} - {{ item.jamSelesai }}</p>
                </div>
              </div>
              <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
            </div>

            <p class="text-sm text-slate-600 mb-3 line-clamp-2">{{ item.deskripsi }}</p>

            <div v-if="item.status === 'Pending'" class="flex gap-2">
              <UButton size="xs" color="success" class="flex-1" @click="approve(item.id)">
                <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                Setujui
              </UButton>
              <UButton size="xs" color="warning" variant="soft" class="flex-1" @click="openRevision(item)">
                <Icon name="lucide:edit" class="w-3 h-3 mr-1" />
                Revisi
              </UButton>
            </div>
          </div>

          <div v-if="!paginatedLogbooks.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada logbook</p>
          </div>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-sm text-slate-500">
          Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ totalItems }} data
        </p>
        <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" size="sm" />
      </div>
    </template>

    <!-- Revision Modal -->
    <UModal v-model:open="revisionModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Minta Revisi</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="revisionModal = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <UFormField label="Catatan Revisi" required>
            <UTextarea v-model="revisionNote" placeholder="Tulis catatan revisi..." :rows="3" class="w-full" />
          </UFormField>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="revisionModal = false">Batal</UButton>
              <UButton color="warning" class="flex-1" @click="submitRevision">Kirim</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { useLogbookApi } from '~/composables/api/use-internship'
import * as XLSX from 'xlsx-js-style'

definePageMeta({ layout: 'guru' })

const guruApi = useGuruApi()
const { getAll: getLogbooks, approve: approveLogbook, requestRevision } = useLogbookApi()

const toast = useToast()
const loading = ref(true)
const loadingLogbook = ref(false)
const search = ref('')
const searchSiswa = ref('')
const filterStatus = ref<string | null>(null)
const revisionModal = ref(false)
const revisionNote = ref('')
const selectedItem = ref<any>(null)
const selectedSiswa = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const exporting = ref(false)
const filterDateStart = ref('')
const filterDateEnd = ref('')

const statusOptions = ['Pending', 'Disetujui', 'Revisi']
const perPageOptions = [5, 10, 25, 50]
const stats = reactive({ pending: 0, approved: 0, revision: 0, total: 0 })

// Siswa data
const siswaList = ref<any[]>([])
const logbooks = ref<any[]>([])

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const filteredSiswa = computed(() => {
  if (!searchSiswa.value) return siswaList.value
  return siswaList.value.filter(s =>
    s.nama.toLowerCase().includes(searchSiswa.value.toLowerCase())
  )
})

const filteredLogbooks = computed(() => {
  return logbooks.value.filter(item => {
    const matchSearch = !search.value ||
      item.kegiatan.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    const matchDateStart = !filterDateStart.value || item.rawDate >= filterDateStart.value
    const matchDateEnd = !filterDateEnd.value || item.rawDate <= filterDateEnd.value
    return matchSearch && matchStatus && matchDateStart && matchDateEnd
  })
})

// Pagination computed
const totalItems = computed(() => filteredLogbooks.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedLogbooks = computed(() => filteredLogbooks.value.slice(startIndex.value, endIndex.value))

watch([search, filterStatus, itemsPerPage], () => { currentPage.value = 1 })

function mapStatus(raw: string): string {
  const map: Record<string, string> = { menunggu: 'Pending', disetujui: 'Disetujui', ditolak: 'Revisi' }
  return map[raw] || raw
}

const selectSiswa = async (siswa: any) => {
  selectedSiswa.value = siswa
  loadingLogbook.value = true
  currentPage.value = 1

  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  filterDateStart.value = oneMonthAgo.toISOString().split('T')[0]
  filterDateEnd.value = today.toISOString().split('T')[0]

  try {
    const res = await getLogbooks({ id_penempatan: siswa.id_penempatan, limit: 100 })
    if (res?.data) {
      logbooks.value = res.data.map((l: any) => ({
        id: l.id_logbook,
        kegiatan: l.judul_kegiatan || '-',
        deskripsi: l.isi_kegiatan || '-',
        tanggal: new Date(l.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        rawDate: new Date(l.tanggal).toISOString().split('T')[0],
        jamMulai: l.jam_mulai || '-',
        jamSelesai: l.jam_selesai || '-',
        status: mapStatus(l.status_persetujuan),
        catatan: l.catatan_pembimbing || ''
      }))

      // Update stats for selected student
      const counts = { pending: 0, approved: 0, revision: 0 }
      for (const l of logbooks.value) {
        if (l.status === 'Pending') counts.pending++
        else if (l.status === 'Disetujui') counts.approved++
        else if (l.status === 'Revisi') counts.revision++
      }
      stats.pending = counts.pending
      stats.approved = counts.approved
      stats.revision = counts.revision
      stats.total = logbooks.value.length
    }
  } catch (e) {
    console.warn('Failed to fetch logbooks:', e)
    logbooks.value = []
  } finally {
    loadingLogbook.value = false
  }
}

const backToList = () => {
  selectedSiswa.value = null
  logbooks.value = []
  search.value = ''
  filterStatus.value = null
  filterDateStart.value = ''
  filterDateEnd.value = ''
  currentPage.value = 1
  recalcOverallStats()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { Pending: 'warning', Disetujui: 'success', Revisi: 'error' }
  return colors[status] || 'neutral'
}

const getStatusBg = (status: string) => {
  const bgs: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-600',
    Disetujui: 'bg-green-100 text-green-600',
    Revisi: 'bg-red-100 text-red-600'
  }
  return bgs[status] || 'bg-slate-100 text-slate-600'
}

const approve = async (id: string) => {
  try {
    await approveLogbook(id)
    const item = logbooks.value.find(d => d.id === id)
    if (item) {
      item.status = 'Disetujui'
      stats.pending--
      stats.approved++
      if (selectedSiswa.value) {
        selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
      }
    }
    toast.add({ title: 'Logbook disetujui', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Gagal menyetujui logbook', color: 'error' })
  }
}

const openRevision = (item: any) => {
  selectedItem.value = item
  revisionNote.value = ''
  revisionModal.value = true
}

const submitRevision = async () => {
  if (selectedItem.value && revisionNote.value) {
    try {
      await requestRevision(selectedItem.value.id, revisionNote.value)
      selectedItem.value.status = 'Revisi'
      stats.pending--
      stats.revision++
      if (selectedSiswa.value) {
        selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
      }
      revisionModal.value = false
      toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
    } catch (e) {
      toast.add({ title: 'Gagal mengirim permintaan revisi', color: 'error' })
    }
  }
}

function recalcOverallStats() {
  let p = 0, a = 0, r = 0
  for (const siswa of siswaList.value) {
    p += siswa.countPending
    a += siswa.countApproved
    r += siswa.countRevision
  }
  stats.pending = p
  stats.approved = a
  stats.revision = r
  stats.total = p + a + r
}

async function exportToExcel() {
  const filteredData = filteredLogbooks.value
  if (!selectedSiswa.value || filteredData.length === 0) {
    toast.add({ title: 'Tidak ada data untuk diekspor', color: 'error' })
    return
  }

  exporting.value = true

  try {
    const wb = XLSX.utils.book_new()

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    const dateRangeText = filterDateStart.value && filterDateEnd.value
      ? `${formatDate(filterDateStart.value)} - ${formatDate(filterDateEnd.value)}`
      : 'Semua Periode'

    const filteredStats = {
      total: filteredData.length,
      approved: filteredData.filter(i => i.status === 'Disetujui').length,
      pending: filteredData.filter(i => i.status === 'Pending').length,
      revision: filteredData.filter(i => i.status === 'Revisi').length
    }

    const headerData = [
      ['LAPORAN VERIFIKASI LOGBOOK PKL'],
      [''],
      ['Nama Siswa', selectedSiswa.value.nama],
      ['Kelas', selectedSiswa.value.kelas],
      ['Perusahaan', selectedSiswa.value.industri],
      ['Periode', dateRangeText],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
      [''],
      ['RINGKASAN'],
      ['Total Logbook', filteredStats.total.toString()],
      ['Disetujui', filteredStats.approved.toString()],
      ['Pending', filteredStats.pending.toString()],
      ['Revisi', filteredStats.revision.toString()],
      [''],
    ]

    const tableHeader = ['No', 'Tanggal', 'Judul Kegiatan', 'Deskripsi', 'Jam Mulai', 'Jam Selesai', 'Status', 'Catatan Pembimbing']
    const tableData = filteredData.map((item, index) => [
      index + 1,
      item.tanggal,
      item.kegiatan,
      item.deskripsi,
      item.jamMulai,
      item.jamSelesai,
      item.status,
      item.catatan || '-'
    ])

    const wsData = [...headerData, tableHeader, ...tableData]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    ws['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 35 },
      { wch: 50 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 30 }
    ]

    const thinBorder = {
      style: 'thin',
      color: { rgb: '000000' }
    }
    const borderAll = {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder
    }

    const titleCell = ws['A1']
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 16, name: 'Arial' },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]

    const labelRows = [3, 4, 5, 6, 7, 9, 10, 11, 12, 13]
    labelRows.forEach(row => {
      const labelCell = ws[XLSX.utils.encode_cell({ r: row - 1, c: 0 })]
      if (labelCell) {
        labelCell.s = {
          font: { bold: true, name: 'Arial', sz: 11 },
          alignment: { vertical: 'center' }
        }
      }
    })

    const headerRowIndex = headerData.length
    const dataStartRow = headerRowIndex + 1
    const dataEndRow = headerRowIndex + tableData.length
    const lastCol = 7

    for (let col = 0; col <= lastCol; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col })
      if (!ws[cellAddress]) ws[cellAddress] = { v: tableHeader[col] }
      ws[cellAddress].s = {
        font: { bold: true, name: 'Arial', sz: 11, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        border: borderAll,
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      }
    }

    for (let row = dataStartRow; row <= dataEndRow; row++) {
      for (let col = 0; col <= lastCol; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cellAddress]) ws[cellAddress] = { v: '' }
        ws[cellAddress].s = {
          font: { name: 'Arial', sz: 10 },
          border: borderAll,
          alignment: { vertical: 'center', wrapText: true }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Logbook')

    const fileName = `Logbook_${selectedSiswa.value.nama.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast.add({ title: 'Data berhasil diekspor', color: 'success' })
  } catch (e) {
    console.error('Export error:', e)
    toast.add({ title: 'Gagal mengekspor data', color: 'error' })
  } finally {
    exporting.value = false
  }
}

async function fetchData() {
  try {
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    if (res?.data) {
      siswaList.value = res.data
        .filter((p: any) => p.status_penempatan === 'aktif')
        .map((p: any) => {
          const logbookArr = p.logbook || []
          const countPending = logbookArr.filter((l: any) => l.status_persetujuan === 'menunggu').length
          const countApproved = logbookArr.filter((l: any) => l.status_persetujuan === 'disetujui').length
          const countRevision = logbookArr.filter((l: any) => l.status_persetujuan === 'ditolak').length

          return {
            id: p.siswa?.id_siswa || p.id_penempatan,
            id_penempatan: p.id_penempatan,
            nama: p.siswa?.nama_siswa || '-',
            inisial: getInitials(p.siswa?.nama_siswa || 'XX'),
            kelas: p.siswa?.kelas?.nama_kelas || '-',
            industri: p.perusahaan?.nama_perusahaan || '-',
            pending: countPending,
            countPending,
            countApproved,
            countRevision,
            totalLogbook: logbookArr.length
          }
        })

      recalcOverallStats()
    }
  } catch (e) {
    console.warn('Failed to fetch data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Verifikasi Logbook | Guru PKL' })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
