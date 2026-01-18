<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Siswa Bimbingan</h1>
        <p class="text-sm text-slate-500 mt-1">Kelola dan pantau siswa PKL bimbingan Anda</p>
      </div>
      <UButton color="primary" disabled>
        <Icon name="lucide:download" class="w-4 h-4 mr-2" />
        Export Data
      </UButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterKelas" :options="kelasOptions" placeholder="Filter Kelas" class="w-full sm:w-40" />
        <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status"
          class="w-full sm:w-40" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="w-10 h-10 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-24" />
          </div>
          <USkeleton class="h-4 w-24 hidden sm:block" />
          <USkeleton class="h-4 w-32 hidden md:block" />
          <USkeleton class="h-6 w-16 rounded-full" />
          <USkeleton class="w-8 h-8 rounded-lg" />
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-0 bg-slate-50 z-10 min-w-[180px]">
                Siswa</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Kelas
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Industri
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Kehadiran
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Status
              </th>
              <th class="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="siswa in paginatedStudents" :key="siswa.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-4 sticky left-0 bg-white z-10">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {{ siswa.inisial }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-slate-900 truncate">{{ siswa.nama }}</p>
                    <p class="text-xs text-slate-500">{{ siswa.nis }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{{ siswa.kelas }}</td>
              <td class="px-4 py-4 text-sm text-slate-600 whitespace-nowrap max-w-[200px] truncate">{{ siswa.industri }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="siswa.kehadiran >= 80 ? 'bg-green-500' : 'bg-red-500'"
                      :style="{ width: `${siswa.kehadiran}%` }" />
                  </div>
                  <span class="text-sm font-medium whitespace-nowrap"
                    :class="siswa.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">{{ siswa.kehadiran }}%</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <UBadge :color="getStatusColor(siswa.status)" variant="subtle" size="xs">{{ siswa.status }}</UBadge>
              </td>
              <td class="px-4 py-4">
                <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="xs"
                  @click="navigateTo(`/guru/siswa-bimbingan/${siswa.id}`)" />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!paginatedStudents.length" class="py-12 text-center">
          <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada data siswa</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const loading = ref(true)
const search = ref('')
const filterKelas = ref(null)
const filterStatus = ref(null)
const currentPage = ref(1)
const itemsPerPage = 10

const kelasOptions = ['XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII MM 1']
const statusOptions = ['Aktif', 'Selesai', 'Dibatalkan']

const students = ref([])

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchSearch = !search.value || s.nama.toLowerCase().includes(search.value.toLowerCase())
    const matchKelas = !filterKelas.value || s.kelas === filterKelas.value
    const matchStatus = !filterStatus.value || s.status === filterStatus.value
    return matchSearch && matchKelas && matchStatus
  })
})

const totalItems = computed(() => filteredStudents.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredStudents.value.slice(start, start + itemsPerPage)
})

watch([search, filterKelas, filterStatus], () => { currentPage.value = 1 })

const getStatusColor = (status) => {
  const colors = { Aktif: 'success', Selesai: 'primary', Dibatalkan: 'error' }
  return colors[status] || 'neutral'
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  students.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', nis: '2023010563', kelas: 'XII RPL 1', industri: 'PT. Telkom Indonesia', kehadiran: 95, status: 'Aktif' },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', nis: '2023010564', kelas: 'XII RPL 2', industri: 'PT. Gojek Indonesia', kehadiran: 88, status: 'Aktif' },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', nis: '2023010565', kelas: 'XII TKJ 1', industri: 'CV. Digital Nusantara', kehadiran: 72, status: 'Aktif' },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', nis: '2023010566', kelas: 'XII MM 1', industri: 'PT. Media Kreasi', kehadiran: 100, status: 'Selesai' },
    { id: 5, nama: 'Budi Prasetyo', inisial: 'BP', nis: '2023010567', kelas: 'XII RPL 1', industri: 'PT. Tokopedia', kehadiran: 90, status: 'Aktif' }
  ]
  loading.value = false
})

useHead({ title: 'Siswa Bimbingan | Guru PKL' })
</script>
