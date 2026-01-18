<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Siswa Bimbingan</h1>
      <p class="text-sm text-slate-500">Daftar siswa PKL yang Anda bimbing</p>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <UInput v-model="search" placeholder="Cari siswa..." class="max-w-sm">
        <template #leading>
          <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
        </template>
      </UInput>
    </div>

    <!-- Table (Desktop) -->
    <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
              {{row.original.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
              <p class="text-xs text-slate-500">{{ row.original.nisn }}</p>
            </div>
          </div>
        </template>
        <template #absensi-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-16 h-2 bg-slate-100 rounded-full">
              <div class="h-full rounded-full" :class="row.original.absensi >= 80 ? 'bg-success-500' : 'bg-error-500'"
                :style="{ width: `${row.original.absensi}%` }" />
            </div>
            <span class="text-sm" :class="row.original.absensi >= 80 ? 'text-success-600' : 'text-error-600'">{{
              row.original.absensi }}%</span>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'Aktif' ? 'success' : 'neutral'" variant="subtle" size="xs">{{
            row.original.status }}</UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" variant="ghost" :to="`/mentor/siswa/${row.original.id}`">
            <Icon name="lucide:eye" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Card List (Mobile) -->
    <div class="lg:hidden space-y-3">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-3/4 mb-2" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </template>
      <template v-else>
        <NuxtLink v-for="item in filteredData" :key="item.id" :to="`/mentor/siswa/${item.id}`"
          class="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {{item.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ item.nama }}</p>
              <p class="text-xs text-slate-500">{{ item.kelas }} • {{ item.nisn }}</p>
            </div>
            <UBadge :color="item.status === 'Aktif' ? 'success' : 'neutral'" variant="subtle" size="xs">{{ item.status
              }}</UBadge>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-3">
            <div class="bg-slate-50 rounded-lg p-2">
              <p class="text-xs text-slate-500 mb-1">Kehadiran</p>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-slate-200 rounded-full">
                  <div class="h-full rounded-full" :class="item.absensi >= 80 ? 'bg-success-500' : 'bg-error-500'"
                    :style="{ width: `${item.absensi}%` }" />
                </div>
                <span class="text-sm font-medium" :class="item.absensi >= 80 ? 'text-success-600' : 'text-error-600'">{{
                  item.absensi }}%</span>
              </div>
            </div>
            <div class="bg-slate-50 rounded-lg p-2">
              <p class="text-xs text-slate-500 mb-1">Logbook</p>
              <p class="text-sm font-medium text-slate-900">{{ item.logbook }} entries</p>
            </div>
          </div>
        </NuxtLink>

        <div v-if="!filteredData.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada data siswa</p>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const data = ref([
  { id: 1, nama: 'Budi Santoso', nisn: '0012345678', kelas: 'XII RPL 1', absensi: 95, logbook: 45, status: 'Aktif' },
  { id: 2, nama: 'Ani Wijaya', nisn: '0012345679', kelas: 'XII RPL 1', absensi: 88, logbook: 42, status: 'Aktif' },
  { id: 3, nama: 'Deni Pratama', nisn: '0012345680', kelas: 'XII RPL 2', absensi: 72, logbook: 38, status: 'Aktif' },
  { id: 4, nama: 'Siti Aminah', nisn: '0012345681', kelas: 'XII TKJ 1', absensi: 90, logbook: 44, status: 'Aktif' },
  { id: 5, nama: 'Rudi Hermawan', nisn: '0012345682', kelas: 'XII TKJ 2', absensi: 85, logbook: 40, status: 'Aktif' }
])

const columns = [
  { accessorKey: 'nama', header: 'Siswa' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'absensi', header: 'Kehadiran' },
  { accessorKey: 'logbook', header: 'Logbook' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d =>
  !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch(search, () => { currentPage.value = 1 })

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Siswa Bimbingan | Mentor' })
</script>
