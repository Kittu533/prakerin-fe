<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Validasi Absensi</h1>
        <p class="text-sm text-slate-500 mt-1">Verifikasi kehadiran siswa PKL</p>
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
            <span class="text-sm">Ditolak</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.rejected }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:calendar" class="w-4 h-4" />
            <span class="text-sm">Total Hari Ini</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.today }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status" class="w-full sm:w-40" />
        <UInput v-model="filterDate" type="date" class="w-full sm:w-44" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="w-10 h-10 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-24" />
          </div>
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-6 w-16 rounded-full" />
          <USkeleton class="h-8 w-20 rounded-lg" />
        </div>
      </div>

      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Siswa</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase hidden sm:table-cell">Tanggal</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Jam</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in filteredData" :key="item.id" class="hover:bg-slate-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                  {{ item.inisial }}
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ item.nama }}</p>
                  <p class="text-xs text-slate-500">{{ item.kelas }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{{ item.tanggal }}</td>
            <td class="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{{ item.jam }}</td>
            <td class="px-6 py-4">
              <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
            </td>
            <td class="px-6 py-4">
              <div v-if="item.status === 'Pending'" class="flex gap-2">
                <UButton size="xs" color="success" variant="soft" @click="approve(item.id)">
                  <Icon name="lucide:check" class="w-4 h-4" />
                </UButton>
                <UButton size="xs" color="error" variant="soft" @click="reject(item.id)">
                  <Icon name="lucide:x" class="w-4 h-4" />
                </UButton>
              </div>
              <span v-else class="text-sm text-slate-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && !filteredData.length" class="py-12 text-center">
        <Icon name="lucide:calendar-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data absensi</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref(null)
const filterDate = ref('')

const statusOptions = ['Pending', 'Disetujui', 'Ditolak']
const stats = reactive({ pending: 0, approved: 0, rejected: 0, today: 0 })
const data = ref([])

const filteredData = computed(() => {
  return data.value.filter(item => {
    const matchSearch = !search.value || item.nama.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const getStatusColor = (status) => {
  const colors = { Pending: 'warning', Disetujui: 'success', Ditolak: 'error' }
  return colors[status] || 'neutral'
}

const approve = (id) => {
  const item = data.value.find(d => d.id === id)
  if (item) {
    item.status = 'Disetujui'
    stats.pending--
    stats.approved++
    toast.add({ title: 'Absensi disetujui', color: 'success' })
  }
}

const reject = (id) => {
  const item = data.value.find(d => d.id === id)
  if (item) {
    item.status = 'Ditolak'
    stats.pending--
    stats.rejected++
    toast.add({ title: 'Absensi ditolak', color: 'error' })
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { pending: 5, approved: 42, rejected: 3, today: 12 })
  data.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', tanggal: '15 Des 2024', jam: '07:45', status: 'Pending' },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', tanggal: '15 Des 2024', jam: '07:30', status: 'Disetujui' },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', tanggal: '15 Des 2024', jam: '08:15', status: 'Pending' },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', tanggal: '15 Des 2024', jam: '07:50', status: 'Disetujui' },
    { id: 5, nama: 'Budi Prasetyo', inisial: 'BP', kelas: 'XII RPL 1', tanggal: '15 Des 2024', jam: '09:00', status: 'Pending' }
  ]
  loading.value = false
})

useHead({ title: 'Validasi Absensi | Guru PKL' })
</script>
