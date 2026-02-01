<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Penempatan PKL</h1>
        <p class="text-sm text-slate-500 mt-1">Daftar penempatan siswa di industri</p>
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
            <Icon name="lucide:building-2" class="w-4 h-4" />
            <span class="text-sm">Total Industri</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.totalIndustri }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:users" class="w-4 h-4" />
            <span class="text-sm">Total Siswa</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.totalSiswa }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Aktif</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.aktif }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:flag" class="w-4 h-4" />
            <span class="text-sm">Selesai</span>
          </div>
          <p class="text-xl font-bold text-blue-600">{{ stats.selesai }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari industri atau siswa..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status" class="w-full sm:w-40" />
      </div>
    </div>

    <!-- List -->
    <div class="space-y-4">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-start gap-4">
            <USkeleton class="w-12 h-12 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-5 w-48" />
              <USkeleton class="h-4 w-32" />
              <div class="flex gap-2 mt-3">
                <USkeleton class="w-8 h-8 rounded-lg" />
                <USkeleton class="w-8 h-8 rounded-lg" />
                <USkeleton class="w-8 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="item in filteredData" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Icon name="lucide:building-2" class="w-6 h-6" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p class="font-semibold text-slate-900">{{ item.industri }}</p>
                  <p class="text-sm text-slate-500">{{ item.alamat }}</p>
                </div>
                <UBadge :color="item.status === 'Aktif' ? 'success' : 'primary'" variant="subtle" size="xs">{{ item.status }}</UBadge>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-slate-500 mb-3">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:users" class="w-4 h-4" />
                  {{ item.siswa.length }} siswa
                </span>
                <span v-if="item.mentor" class="flex items-center gap-1">
                  <Icon name="lucide:user" class="w-4 h-4" />
                  {{ item.mentor }}
                </span>
              </div>

              <!-- Students -->
              <div class="flex items-center gap-2 mb-3">
                <div class="flex -space-x-2">
                  <div v-for="(siswa, idx) in item.siswa.slice(0, 4)" :key="idx" class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-semibold border-2 border-white">
                    {{ siswa.inisial }}
                  </div>
                  <div v-if="item.siswa.length > 4" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                    +{{ item.siswa.length - 4 }}
                  </div>
                </div>
                <span class="text-sm text-slate-500">{{ item.siswa.map(s => s.nama.split(' ')[0]).join(', ') }}</span>
              </div>

              <UButton size="sm" variant="soft" color="primary" @click="viewDetail(item.id, item.industri)">
                <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                Lihat Detail
              </UButton>
            </div>
          </div>
        </div>

        <div v-if="!filteredData.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:building" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada data penempatan</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePenempatanApi } from '~/composables/api/use-internship'
import { useSiswaApi } from '~/composables/api/use-academic'
import { usePerusahaanApi } from '~/composables/api/use-partner'
import { encodeWithSlug } from '~/composables/use-id-encoder'

definePageMeta({ layout: 'guru' })

const { getAll: getPenempatan } = usePenempatanApi()
const { getAll: getAllSiswa } = useSiswaApi()
const { getAll: getAllPerusahaan } = usePerusahaanApi()

const loading = ref(true)
const search = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = ['Aktif', 'Selesai']
const stats = reactive({ totalIndustri: 0, totalSiswa: 0, aktif: 0, selesai: 0 })
const data = ref<any[]>([])

// Helper function to get initials
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const filteredData = computed(() => {
  return data.value.filter(item => {
    const matchSearch = !search.value || 
      item.industri.toLowerCase().includes(search.value.toLowerCase()) ||
      item.siswa.some((s: any) => s.nama.toLowerCase().includes(search.value.toLowerCase()))
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const viewDetail = (id: number, name: string) => navigateTo(`/guru/penempatan/${encodeWithSlug(id, name)}`)

async function fetchData() {
  loading.value = true
  try {
    // Fetch all penempatan data
    const penempatanRes = await getPenempatan({ limit: 100 })
    console.log('Penempatan response:', penempatanRes)

    if (!penempatanRes?.data?.length) {
      data.value = []
      return
    }

    // Fetch siswa and perusahaan data
    const [siswaRes, perusahaanRes] = await Promise.all([
      getAllSiswa({ limit: 1000 }).catch(err => {
        console.warn('Failed to fetch siswa:', err)
        return { data: [] }
      }),
      getAllPerusahaan({ limit: 1000 }).catch(err => {
        console.warn('Failed to fetch perusahaan:', err)
        return { data: [] }
      })
    ])

    // Create lookup maps
    const siswaMap = new Map()
    const perusahaanMap = new Map()

    if (siswaRes?.data) {
      siswaRes.data.forEach((s: any) => siswaMap.set(s.id_siswa, s))
    }
    if (perusahaanRes?.data) {
      perusahaanRes.data.forEach((p: any) => perusahaanMap.set(p.id_perusahaan, p))
    }

    // Group penempatan by perusahaan
    const groupedByPerusahaan = new Map<number, any[]>()
    
    for (const pen of penempatanRes.data) {
      const perusahaanId = pen.perusahaan_id
      if (!groupedByPerusahaan.has(perusahaanId)) {
        groupedByPerusahaan.set(perusahaanId, [])
      }
      groupedByPerusahaan.get(perusahaanId)!.push(pen)
    }

    // Transform to display format
    const displayData: any[] = []
    let totalAktif = 0
    let totalSelesai = 0
    let totalSiswa = 0

    for (const [perusahaanId, placements] of groupedByPerusahaan) {
      const perusahaan = perusahaanMap.get(perusahaanId)
      
      // Determine status based on majority of placements
      const aktifCount = placements.filter((p: any) => p.status_penempatan === 'aktif').length
      const selesaiCount = placements.filter((p: any) => p.status_penempatan === 'selesai').length
      const status = aktifCount >= selesaiCount ? 'Aktif' : 'Selesai'

      totalAktif += aktifCount
      totalSelesai += selesaiCount
      totalSiswa += placements.length

      // Get siswa data for this perusahaan
      const siswaList = placements.map((p: any) => {
        const siswa = siswaMap.get(p.siswa_id)
        return {
          id: p.siswa_id,
          nama: siswa?.nama_siswa || `Siswa (ID: ${p.siswa_id})`,
          inisial: getInitials(siswa?.nama_siswa || 'XX'),
          penempatanId: p.id_penempatan
        }
      })

      displayData.push({
        id: perusahaanId,
        industri: perusahaan?.nama_perusahaan || `Perusahaan (ID: ${perusahaanId})`,
        alamat: perusahaan?.alamat || '-',
        mentor: perusahaan?.mentor?.nama_mentor || null,
        status,
        siswa: siswaList
      })
    }

    data.value = displayData
    
    // Update stats
    stats.totalIndustri = displayData.length
    stats.totalSiswa = totalSiswa
    stats.aktif = totalAktif
    stats.selesai = totalSelesai

  } catch (error) {
    console.error('Failed to fetch penempatan data:', error)
    data.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Penempatan PKL | Guru PKL' })
</script>
