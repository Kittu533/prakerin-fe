<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Riwayat Kunjungan</h1>
        <p class="text-sm text-slate-500 mt-1">Catatan kunjungan ke tempat PKL siswa</p>
      </div>
      <UButton color="primary" to="/guru/kunjungan/create">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Input Kunjungan
      </UButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 text-slate-500 mb-1">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          <span class="text-sm">Total Kunjungan</span>
        </div>
        <p class="text-xl font-bold text-slate-900">{{ totalKunjungan }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 text-slate-500 mb-1">
          <Icon name="lucide:calendar" class="w-4 h-4" />
          <span class="text-sm">Bulan Ini</span>
        </div>
        <p class="text-xl font-bold text-sky-600">{{ kunjunganBulanIni }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 text-slate-500 mb-1">
          <Icon name="lucide:users" class="w-4 h-4" />
          <span class="text-sm">Siswa Dikunjungi</span>
        </div>
        <p class="text-xl font-bold text-green-600">{{ siswaDikunjungi }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 text-slate-500 mb-1">
          <Icon name="lucide:building-2" class="w-4 h-4" />
          <span class="text-sm">Perusahaan</span>
        </div>
        <p class="text-xl font-bold text-amber-600">{{ perusahaanDikunjungi }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa, industri, atau catatan..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="itemsPerPage" :items="perPageOptions" class="w-full sm:w-28" />
      </div>
    </div>

    <!-- Data Table (Desktop) -->
    <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Siswa</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Perusahaan</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Catatan</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Foto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in paginatedKunjungan" :key="item.id_monitoring" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 text-sm text-slate-600">{{ startIndex + index + 1 }}</td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-900">{{ formatDate(item.tanggal_monitoring) }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-xs shrink-0">
                    {{ getInitials(item.siswa_nama) }}
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ item.siswa_nama }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:building-2" class="w-4 h-4 text-slate-400" />
                  <span class="text-sm text-slate-700 truncate max-w-[200px]">{{ item.perusahaan_nama }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-600 truncate max-w-[300px]" :title="item.hasil_monitoring">
                  {{ item.hasil_monitoring || '-' }}
                </p>
              </td>
              <td class="px-6 py-4 text-center">
                <Icon v-if="item.foto_monitoring" name="lucide:image" class="w-5 h-5 text-green-500" />
                <Icon v-else name="lucide:image-off" class="w-5 h-5 text-slate-300" />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!paginatedKunjungan.length" class="py-12 text-center">
          <Icon name="lucide:map" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada riwayat kunjungan</p>
          <UButton class="mt-3" variant="soft" color="primary" to="/guru/kunjungan/create">
            Input Kunjungan Pertama
          </UButton>
        </div>
      </div>
    </div>

    <!-- Card List (Mobile) -->
    <div class="lg:hidden space-y-3">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-3/4 mb-2" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </template>
      <template v-else>
        <div v-for="item in paginatedKunjungan" :key="item.id_monitoring" class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold shrink-0">
                {{ getInitials(item.siswa_nama) }}
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ item.siswa_nama }}</p>
                <div class="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="lucide:building-2" class="w-3 h-3" />
                  <span class="truncate max-w-[150px]">{{ item.perusahaan_nama }}</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-slate-500 shrink-0">{{ formatDate(item.tanggal_monitoring) }}</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg">
            <p class="text-sm text-slate-600 line-clamp-2">{{ item.hasil_monitoring || 'Tidak ada catatan' }}</p>
          </div>

          <div v-if="item.foto_monitoring" class="mt-3 flex items-center gap-2 text-xs text-green-600">
            <Icon name="lucide:image" class="w-4 h-4" />
            <span>Ada dokumentasi foto</span>
          </div>
        </div>

        <div v-if="!paginatedKunjungan.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:map" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada riwayat kunjungan</p>
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
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'

definePageMeta({ layout: 'guru' })

const guruApi = useGuruApi()

const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const perPageOptions = [5, 10, 25, 50]

interface KunjunganDisplay {
  id_monitoring: string | number
  id_penempatan: string
  tanggal_monitoring: string
  hasil_monitoring: string | null
  foto_monitoring: string | null
  kendala: string | null
  solusi: string | null
  siswa_nama: string
  siswa_id: string
  perusahaan_nama: string
  perusahaan_id: string
}

const kunjunganList = ref<KunjunganDisplay[]>([])

// Stats computed
const totalKunjungan = computed(() => kunjunganList.value.length)
const kunjunganBulanIni = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return kunjunganList.value.filter(k => {
    const date = new Date(k.tanggal_monitoring)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length
})
const siswaDikunjungi = computed(() => new Set(kunjunganList.value.map(k => k.siswa_id)).size)
const perusahaanDikunjungi = computed(() => new Set(kunjunganList.value.map(k => k.perusahaan_id)).size)

function getInitials(name: string): string {
  const parts = (name || '').split(' ').filter(Boolean)
  if (parts.length === 0) return 'XX'
  return parts.map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filteredKunjungan = computed(() => {
  if (!search.value) return kunjunganList.value
  const q = search.value.toLowerCase()
  return kunjunganList.value.filter(item =>
    item.siswa_nama.toLowerCase().includes(q) ||
    item.perusahaan_nama.toLowerCase().includes(q) ||
    (item.hasil_monitoring || '').toLowerCase().includes(q)
  )
})

const totalItems = computed(() => filteredKunjungan.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedKunjungan = computed(() => filteredKunjungan.value.slice(startIndex.value, endIndex.value))

watch([search, itemsPerPage], () => { currentPage.value = 1 })

async function fetchData() {
  loading.value = true
  try {
    // Get guru's penempatan — monitoring records are nested inside each penempatan
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    const allKunjungan: KunjunganDisplay[] = []

    for (const pen of (res?.data ?? [])) {
      const siswa_nama = pen.siswa?.nama_siswa || '-'
      const siswa_id = pen.siswa?.id_siswa ?? pen.id_penempatan
      const perusahaan_nama = pen.perusahaan?.nama_perusahaan || '-'
      const perusahaan_id = pen.perusahaan?.id_perusahaan ?? ''

      // monitoring is an array of kunjungan records for this penempatan
      const monitoringRecords: any[] = (pen as any).monitoring ?? []

      for (const m of monitoringRecords) {
        allKunjungan.push({
          id_monitoring: m.id_monitoring,
          id_penempatan: pen.id_penempatan,
          tanggal_monitoring: m.tanggal_monitoring,
          hasil_monitoring: m.hasil_monitoring ?? null,
          foto_monitoring: m.foto_monitoring ?? null,
          kendala: m.kendala ?? null,
          solusi: m.solusi ?? null,
          siswa_nama,
          siswa_id,
          perusahaan_nama,
          perusahaan_id,
        })
      }
    }

    // Sort by date descending
    allKunjungan.sort((a, b) =>
      new Date(b.tanggal_monitoring).getTime() - new Date(a.tanggal_monitoring).getTime()
    )

    kunjunganList.value = allKunjungan
  } catch (error) {
    console.error('Failed to fetch kunjungan data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Riwayat Kunjungan | Guru PKL' })
</script>
