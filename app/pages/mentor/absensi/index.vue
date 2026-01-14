<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Verifikasi Absensi</h1>
      <p class="text-sm text-slate-500">Verifikasi kehadiran siswa PKL</p>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="['Semua', 'Pending', 'Disetujui', 'Ditolak']" class="w-full sm:w-32" />
        <UInput v-model="filterDate" type="date" class="w-full sm:w-40" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-warning-600">{{ stats.pending }}</p>
        <p class="text-sm text-slate-500">Pending</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-success-600">{{ stats.approved }}</p>
        <p class="text-sm text-slate-500">Disetujui</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-error-600">{{ stats.rejected }}</p>
        <p class="text-sm text-slate-500">Ditolak</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <span class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</span>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle" size="xs">{{ row.original.status }}</UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div v-if="row.original.status === 'Pending'" class="flex gap-1">
            <UButton size="xs" color="success" variant="ghost" @click="approve(row.original)">
              <Icon name="lucide:check" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" color="error" variant="ghost" @click="openReject(row.original)">
              <Icon name="lucide:x" class="w-4 h-4" />
            </UButton>
          </div>
          <span v-else class="text-xs text-slate-400">-</span>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Reject Modal -->
    <UModal v-model:open="rejectModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Tolak Absensi</h3></template>
          <UFormField label="Alasan Penolakan" required>
            <UTextarea v-model="rejectReason" placeholder="Masukkan alasan..." :rows="3" />
          </UFormField>
          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="rejectModal = false">Batal</UButton>
              <UButton color="error" class="flex-1" @click="reject">Tolak</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref('Semua')
const filterDate = ref('')
const rejectModal = ref(false)
const rejectReason = ref('')
const selectedItem = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = 10

const stats = reactive({ pending: 8, approved: 45, rejected: 2 })

const data = ref([
  { id: 1, siswa: 'Budi Santoso', tanggal: '16 Des 2024', checkIn: '07:45', checkOut: '16:30', status: 'Pending' },
  { id: 2, siswa: 'Ani Wijaya', tanggal: '16 Des 2024', checkIn: '07:30', checkOut: '16:00', status: 'Pending' },
  { id: 3, siswa: 'Deni Pratama', tanggal: '16 Des 2024', checkIn: '08:15', checkOut: '-', status: 'Pending' },
  { id: 4, siswa: 'Budi Santoso', tanggal: '15 Des 2024', checkIn: '07:50', checkOut: '16:15', status: 'Disetujui' },
  { id: 5, siswa: 'Ani Wijaya', tanggal: '15 Des 2024', checkIn: '07:35', checkOut: '16:00', status: 'Disetujui' },
  { id: 6, siswa: 'Siti Aminah', tanggal: '14 Des 2024', checkIn: '09:00', checkOut: '15:00', status: 'Ditolak' }
])

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'tanggal', header: 'Tanggal' },
  { accessorKey: 'checkIn', header: 'Check In' },
  { accessorKey: 'checkOut', header: 'Check Out' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase())
  const matchStatus = filterStatus.value === 'Semua' || d.status === filterStatus.value
  return matchSearch && matchStatus
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterStatus], () => { currentPage.value = 1 })

const statusColor = (s: string) => ({ Pending: 'warning', Disetujui: 'success', Ditolak: 'error' })[s] || 'neutral'

const approve = (item: any) => {
  item.status = 'Disetujui'
  stats.pending--
  stats.approved++
  toast.add({ title: 'Absensi disetujui', color: 'success' })
}

const openReject = (item: any) => {
  selectedItem.value = item
  rejectReason.value = ''
  rejectModal.value = true
}

const reject = () => {
  if (!rejectReason.value) {
    toast.add({ title: 'Masukkan alasan', color: 'error' })
    return
  }
  selectedItem.value.status = 'Ditolak'
  stats.pending--
  stats.rejected++
  rejectModal.value = false
  toast.add({ title: 'Absensi ditolak', color: 'error' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Verifikasi Absensi | Mentor' })
</script>
