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

              <UButton size="sm" variant="soft" color="primary" @click="viewDetail(item.id)">
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
import { useGuruApi } from '~/composables/api/use-guru'

definePageMeta({ layout: 'guru' })

const guruApi = useGuruApi()

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

// Navigate to perusahaan detail — use raw UUID (no encoding needed for UUIDs)
const viewDetail = (idPerusahaan: string) => navigateTo(`/guru/penempatan/${idPerusahaan}`)

async function fetchData() {
  loading.value = true
  try {
    // Fetch only the current guru's penempatan (my-students endpoint)
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    if (!res?.data?.length) {
      data.value = []
      stats.totalIndustri = 0
      stats.totalSiswa = 0
      stats.aktif = 0
      stats.selesai = 0
      return
    }

    // Group penempatan by perusahaan (nested data already available)
    const groupMap = new Map<string, any>()

    for (const pen of res.data) {
      const perusahaan = pen.perusahaan
      if (!perusahaan) continue

      const key = perusahaan.id_perusahaan
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          id: key,
          industri: perusahaan.nama_perusahaan || '-',
          alamat: perusahaan.alamat || '-',
          mentor: perusahaan.mentor?.[0]?.nama_mentor || null,
          siswaAktif: 0,
          siswaSelesai: 0,
          siswa: []
        })
      }

      const group = groupMap.get(key)!
      const siswa = pen.siswa

      if (pen.status_penempatan === 'aktif') group.siswaAktif++
      else group.siswaSelesai++

      group.siswa.push({
        id: siswa?.id_siswa || pen.id_penempatan,
        penempatanId: pen.id_penempatan,
        nama: siswa?.nama_siswa || '-',
        inisial: getInitials(siswa?.nama_siswa || 'XX'),
        kelas: siswa?.kelas?.nama_kelas || '-',
        nis: siswa?.nis || '-',
        status: pen.status_penempatan
      })
    }

    const displayData: any[] = []
    let totalAktif = 0
    let totalSelesai = 0

    for (const group of groupMap.values()) {
      group.status = group.siswaAktif > 0 ? 'Aktif' : 'Selesai'
      totalAktif += group.siswaAktif
      totalSelesai += group.siswaSelesai
      displayData.push(group)
    }

    data.value = displayData
    stats.totalIndustri = displayData.length
    stats.totalSiswa = res.data.length
    stats.aktif = totalAktif
    stats.selesai = totalSelesai

  } catch (error: any) {
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
