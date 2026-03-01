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

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p class="text-red-600">{{ error }}</p>
      <UButton color="primary" variant="soft" size="sm" class="mt-2" @click="fetchData">Coba Lagi</UButton>
    </div>

    <!-- Table (Desktop) -->
    <div v-else class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>
      <div v-else-if="!filteredData.length" class="p-8 text-center">
        <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data siswa</p>
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
              {{ getInitials(row.original.siswa?.nama_siswa || 'XX') }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa?.nama_siswa || `Siswa
                #${row.original.siswa_id}` }}</p>
              <p class="text-xs text-slate-500">{{ row.original.siswa?.nis || '-' }}</p>
            </div>
          </div>
        </template>
        <template #kelas-cell="{ row }">
          <span class="text-sm text-slate-700">{{ row.original.siswa?.kelas?.nama_kelas || '-' }}</span>
        </template>
        <template #periode-cell="{ row }">
          <span class="text-sm text-slate-700">{{ formatDate(row.original.tanggal_mulai) }} - {{
            formatDate(row.original.tanggal_selesai) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status_penempatan === 'aktif' ? 'success' : 'neutral'" variant="subtle"
            size="xs">
            {{ row.original.status_penempatan === 'aktif' ? 'Aktif' : row.original.status_penempatan }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" variant="ghost" :to="`/mentor/siswa/${row.original.id_penempatan}`">
            <Icon name="lucide:eye" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Card List (Mobile) -->
    <div v-if="!error" class="lg:hidden space-y-3">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-3/4 mb-2" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </template>
      <template v-else>
        <NuxtLink v-for="item in filteredData" :key="item.id_penempatan" :to="`/mentor/siswa/${item.id_penempatan}`"
          class="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {{ getInitials(item.siswa?.nama_siswa || 'XX') }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ item.siswa?.nama_siswa || `Siswa #${item.siswa_id}` }}</p>
              <p class="text-xs text-slate-500">{{ item.siswa?.kelas?.nama_kelas || '-' }} • {{ item.siswa?.nis || '-'
                }}</p>
            </div>
            <UBadge :color="item.status_penempatan === 'aktif' ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ item.status_penempatan === 'aktif' ? 'Aktif' : item.status_penempatan }}
            </UBadge>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-3">
            <div class="bg-slate-50 rounded-lg p-2">
              <p class="text-xs text-slate-500 mb-1">Periode</p>
              <p class="text-sm font-medium text-slate-900">{{ formatDate(item.tanggal_mulai) }}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-2">
              <p class="text-xs text-slate-500 mb-1">Sampai</p>
              <p class="text-sm font-medium text-slate-900">{{ formatDate(item.tanggal_selesai) }}</p>
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
import { useMentorApi } from '~/composables/api/use-partner'
import { usePenempatanApi, type Penempatan } from '~/composables/api/use-internship'

definePageMeta({ layout: 'mentor' })

const mentorApi = useMentorApi()
const penempatanApi = usePenempatanApi()

const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const data = ref<Penempatan[]>([])
const totalItems = ref(0)

const columns = [
  { accessorKey: 'nama', header: 'Siswa' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'periode', header: 'Periode PKL' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

// Helper functions
function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  if (!search.value) return data.value
  const searchLower = search.value.toLowerCase()
  return data.value.filter(d =>
    d.siswa?.nama_siswa?.toLowerCase().includes(searchLower) ||
    d.siswa?.nis?.toLowerCase().includes(searchLower)
  )
})

watch(search, () => { currentPage.value = 1 })

// Fetch data
async function fetchData() {
  loading.value = true
  error.value = null

  try {
    // Step 1: Get mentor data to get perusahaan_id
    const mentorResponse = await mentorApi.getMe()

    if (!mentorResponse.success || !mentorResponse.data?.id_perusahaan) {
      error.value = 'Gagal mengambil data mentor'
      loading.value = false
      return
    }

    const perusahaanId = mentorResponse.data.id_perusahaan

    // Step 2: Get penempatan data filtered by perusahaan_id
    const response = await penempatanApi.getAll({
      page: currentPage.value,
      limit: itemsPerPage,
      id_perusahaan: perusahaanId
    })

    if (response.success) {
      data.value = response.data
      totalItems.value = response.pagination?.total || response.data.length
    } else {
      error.value = response.message || 'Gagal memuat data siswa'
    }
  } catch (e: any) {
    console.error('Error fetching mentor students:', e)
    error.value = e.response?.data?.message || 'Gagal memuat data siswa'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

watch(currentPage, () => {
  fetchData()
})

useHead({ title: 'Siswa Bimbingan | Mentor' })
</script>
