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
                  @click="navigateTo(`/guru/siswa-bimbingan/${encodeWithSlug(siswa.id, siswa.nama)}`)" />
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
const filterKelas = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

const kelasOptions = ref<string[]>([])
const statusOptions = ['Aktif', 'Selesai', 'Dibatalkan']

const students = ref<any[]>([])
const stats = reactive({ totalSiswa: 0 })

// Helper function to get initials
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = { Aktif: 'success', Selesai: 'primary', Dibatalkan: 'error' }
  return colors[status] || 'neutral'
}

async function fetchData() {
  try {
    // Fetch penempatan data
    const penempatanRes = await getPenempatan({ limit: 100, status: 'aktif' })
    console.log('Penempatan response:', penempatanRes)
    
    if (penempatanRes?.data && Array.isArray(penempatanRes.data)) {
      // Check if data is already populated
      const isPopulated = penempatanRes.data.length > 0 && penempatanRes.data[0].siswa !== undefined
      
      if (isPopulated) {
        // Data already has siswa/perusahaan populated
        students.value = penempatanRes.data.map((p: any) => ({
          id: p.id_penempatan,
          nama: p.siswa?.nama_siswa || 'Unknown',
          inisial: getInitials(p.siswa?.nama_siswa || 'U'),
          nis: p.siswa?.nis || '-',
          kelas: p.siswa?.kelas?.nama_kelas || '-',
          industri: p.perusahaan?.nama_perusahaan || '-',
          kehadiran: p.kehadiran_persen || 85,
          status: p.status_penempatan === 'aktif' ? 'Aktif' : 
                  p.status_penempatan === 'selesai' ? 'Selesai' : 'Dibatalkan'
        }))
      } else {
        // Data is not populated - need to fetch siswa/perusahaan separately
        console.log('Data not populated, fetching siswa and perusahaan...')
        
        try {
          // Fetch all siswa and perusahaan data in parallel
          const [siswaRes, perusahaanRes] = await Promise.all([
            getAllSiswa({ limit: 1000 }).catch(err => {
              console.warn('Failed to fetch siswa (permission?)', err)
              return { data: [] }
            }),
            getAllPerusahaan({ limit: 1000 }).catch(err => {
              console.warn('Failed to fetch perusahaan (permission?)', err)
              return { data: [] }
            })
          ])
          
          console.log('Siswa response:', siswaRes)
          console.log('Perusahaan response:', perusahaanRes)
          
          // Create lookup maps
          const siswaMap = new Map()
          const perusahaanMap = new Map()
          
          if (siswaRes?.data) {
            siswaRes.data.forEach((s: any) => {
              siswaMap.set(s.id_siswa, s)
            })
          }
          
          if (perusahaanRes?.data) {
            perusahaanRes.data.forEach((p: any) => {
              perusahaanMap.set(p.id_perusahaan, p)
            })
          }
          
          console.log('Created maps - siswa:', siswaMap.size, 'perusahaan:', perusahaanMap.size)
          
          // Map penempatan with looked-up data
          students.value = penempatanRes.data.map((p: any) => {
            const siswa = siswaMap.get(p.siswa_id)
            const perusahaan = perusahaanMap.get(p.perusahaan_id)
            
            console.log(`Mapping penempatan ${p.id_penempatan}: siswa_id=${p.siswa_id}, perusahaan_id=${p.perusahaan_id}`, { siswa, perusahaan })
            
            return {
              id: p.id_penempatan,
              nama: siswa?.nama_siswa || `Siswa ID: ${p.siswa_id}`,
              inisial: getInitials(siswa?.nama_siswa || 'SX'),
              nis: siswa?.nis || '-',
              kelas: siswa?.kelas?.nama_kelas || '-',
              industri: perusahaan?.nama_perusahaan || `Perusahaan ID: ${p.perusahaan_id}`,
              kehadiran: p.kehadiran_persen || 85,
              status: p.status_penempatan === 'aktif' ? 'Aktif' : 
                      p.status_penempatan === 'selesai' ? 'Selesai' : 'Dibatalkan'
            }
          })
        } catch (err) {
          console.error('Error fetching siswa/perusahaan data', err)
          // Fallback: just show IDs
          students.value = penempatanRes.data.map((p: any) => ({
            id: p.id_penempatan,
            nama: `Siswa ID: ${p.siswa_id}`,
            inisial: 'SX',
            nis: '-',
            kelas: '-',
            industri: `Perusahaan ID: ${p.perusahaan_id}`,
            kehadiran: p.kehadiran_persen || 85,
            status: p.status_penempatan === 'aktif' ? 'Aktif' : 
                    p.status_penempatan === 'selesai' ? 'Selesai' : 'Dibatalkan'
          }))
        }
      }
      
      // Extract unique kelas for filter options
      const uniqueKelas = [...new Set(students.value.map(s => s.kelas).filter(k => k !== '-'))]
      kelasOptions.value = uniqueKelas as string[]
      
      // Get total from meta or pagination
      stats.totalSiswa = penempatanRes.meta?.total || penempatanRes.pagination?.total || students.value.length
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
    // Fallback to empty
    students.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Siswa Bimbingan | Guru PKL' })
</script>
