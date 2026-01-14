<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Monitoring PKL</h1>
      <p class="text-sm text-slate-500">Pantau progress siswa PKL</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterYear" :items="['2024/2025', '2023/2024']" placeholder="Tahun Ajaran" class="w-full sm:w-36" />
        <USelectMenu v-model="filterJurusan" :items="['Semua', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-28" />
        <USelectMenu v-model="filterKelas" :items="['Semua', 'XII RPL 1', 'XII RPL 2', 'XII TKJ 1']" class="w-full sm:w-32" />
      </div>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" />
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ stats.total }}</p>
        <p class="text-sm text-slate-500">Total Siswa</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ stats.good }}</p>
        <p class="text-sm text-slate-500">Absensi Baik</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-amber-600">{{ stats.warning }}</p>
        <p class="text-sm text-slate-500">Perlu Perhatian</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ stats.critical }}</p>
        <p class="text-sm text-slate-500">Kritis (&lt;80%)</p>
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
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('') }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</p>
              <p class="text-xs text-slate-500">{{ row.original.kelas }}</p>
            </div>
          </div>
        </template>
        <template #absensi-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-16 h-2 bg-slate-100 rounded-full">
              <div class="h-full rounded-full" :class="row.original.absensi >= 80 ? 'bg-green-500' : row.original.absensi >= 70 ? 'bg-amber-500' : 'bg-red-500'" :style="{ width: `${row.original.absensi}%` }" />
            </div>
            <span class="text-sm" :class="row.original.absensi >= 80 ? 'text-green-600' : row.original.absensi >= 70 ? 'text-amber-600' : 'text-red-600'">{{ row.original.absensi }}%</span>
          </div>
        </template>
        <template #nilai-cell="{ row }">
          <span v-if="row.original.nilai" class="text-sm font-medium">{{ row.original.nilai }}</span>
          <span v-else class="text-sm text-slate-400">-</span>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" variant="ghost" @click="viewDetail(row.original)">
            <Icon name="lucide:eye" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const search = ref('')
const filterYear = ref('2024/2025')
const filterJurusan = ref('Semua')
const filterKelas = ref('Semua')
const currentPage = ref(1)
const itemsPerPage = 10

const stats = reactive({ total: 0, good: 0, warning: 0, critical: 0 })

const data = ref([
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII RPL 1', perusahaan: 'PT Telkom', absensi: 95, logbook: 45, nilai: 87 },
  { id: 2, siswa: 'Ani Wijaya', kelas: 'XII TKJ 2', perusahaan: 'PT Biznet', absensi: 88, logbook: 42, nilai: 82 },
  { id: 3, siswa: 'Deni Pratama', kelas: 'XII MM 1', perusahaan: 'CV Digital', absensi: 75, logbook: 38, nilai: null },
  { id: 4, siswa: 'Siti Aminah', kelas: 'XII RPL 2', perusahaan: 'PT Astra', absensi: 68, logbook: 30, nilai: null },
  { id: 5, siswa: 'Rudi Hermawan', kelas: 'XII AKL 1', perusahaan: 'PT Bank BCA', absensi: 92, logbook: 44, nilai: 85 },
  { id: 6, siswa: 'Eka Putri', kelas: 'XII RPL 1', perusahaan: 'PT Infomedia', absensi: 78, logbook: 35, nilai: null }
])

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'absensi', header: '% Absensi' },
  { accessorKey: 'logbook', header: 'Logbook' },
  { accessorKey: 'nilai', header: 'Nilai' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase())
  const matchJurusan = filterJurusan.value === 'Semua' || d.kelas.includes(filterJurusan.value)
  const matchKelas = filterKelas.value === 'Semua' || d.kelas === filterKelas.value
  return matchSearch && matchJurusan && matchKelas
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterYear, filterJurusan, filterKelas], () => { currentPage.value = 1 })

const viewDetail = (item: any) => {
  navigateTo(`/admin/monitoring/${item.id}`)
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 198, good: 156, warning: 30, critical: 12 })
  loading.value = false
})

useHead({ title: 'Monitoring | Admin' })
</script>
