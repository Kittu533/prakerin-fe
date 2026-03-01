<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/penempatan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <Icon name="lucide:alert-circle" class="w-10 h-10 mx-auto mb-2 text-red-400" />
      <p class="text-red-600 font-medium">{{ error }}</p>
      <UButton @click="fetchData" variant="outline" color="error" size="sm" class="mt-4">
        Coba Lagi
      </UButton>
    </div>

    <template v-else>
      <!-- Header Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div v-if="loading" class="flex flex-col md:flex-row gap-6">
          <USkeleton class="w-16 h-16 rounded-xl" />
          <div class="flex-1 space-y-3">
            <USkeleton class="h-6 w-64" />
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-4 w-32" />
          </div>
        </div>
        <div v-else class="flex flex-col md:flex-row gap-6">
          <div class="w-16 h-16 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Icon name="lucide:building-2" class="w-8 h-8" />
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 class="text-xl font-bold text-slate-900">{{ perusahaan?.nama_perusahaan || '-' }}</h1>
                <p class="text-slate-500">{{ perusahaan?.alamat || '-' }}</p>
              </div>
              <UBadge :color="penempatanAktif > 0 ? 'success' : 'primary'" variant="subtle">
                {{ penempatanAktif > 0 ? 'Aktif' : 'Selesai' }}
              </UBadge>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
              <span v-if="perusahaan?.no_telp" class="flex items-center gap-1">
                <Icon name="lucide:phone" class="w-4 h-4" />
                {{ perusahaan.no_telp }}
              </span>
              <span v-if="perusahaan?.email" class="flex items-center gap-1">
                <Icon name="lucide:mail" class="w-4 h-4" />
                {{ perusahaan.email }}
              </span>
            </div>
          </div>
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
            <p class="text-sm text-slate-500 mb-1">Jumlah Siswa</p>
            <p class="text-xl font-bold text-slate-900">{{ siswaList.length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Rata-rata Kehadiran</p>
            <p class="text-xl font-bold" :class="avgKehadiran >= 80 ? 'text-green-600' : 'text-red-600'">
              {{ avgKehadiran }}%
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Penempatan Aktif</p>
            <p class="text-xl font-bold text-green-600">{{ penempatanAktif }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Penempatan Selesai</p>
            <p class="text-xl font-bold text-blue-600">{{ penempatanSelesai }}</p>
          </div>
        </template>
      </div>

      <!-- Students List -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Daftar Siswa</h2>
        </div>

        <div v-if="loading" class="divide-y divide-slate-100">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-6 py-4">
            <USkeleton class="w-10 h-10 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-24" />
            </div>
            <USkeleton class="h-4 w-16" />
          </div>
        </div>

        <div v-else-if="siswaList.length === 0" class="py-12 text-center">
          <Icon name="lucide:users" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p class="text-slate-500">Belum ada siswa ditempatkan</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="siswa in siswaList" :key="siswa.id" class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
              {{ siswa.inisial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.nis }}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium" :class="siswa.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">
                  {{ siswa.kehadiran }}%
                </p>
                <p class="text-xs text-slate-500">Kehadiran</p>
              </div>
              <UBadge :color="siswa.status === 'aktif' ? 'success' : 'primary'" variant="subtle" size="xs">
                {{ siswa.status === 'aktif' ? 'Aktif' : 'Selesai' }}
              </UBadge>
              <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-eye" @click="navigateTo(`/guru/siswa-bimbingan/${siswa.penempatanId}`)" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { usePerusahaanApi } from '~/composables/api/use-partner'

definePageMeta({ layout: 'guru' })

const route = useRoute()
const guruApi = useGuruApi()
const { getById: getPerusahaanById } = usePerusahaanApi()

const loading = ref(true)
const error = ref<string | null>(null)

const perusahaan = ref<any>(null)
const siswaList = ref<any[]>([])
const penempatanAktif = ref(0)
const penempatanSelesai = ref(0)

// UUID passed directly in the URL — read as-is
const idPerusahaan = computed(() => {
  const param = route.params.id
  return typeof param === 'string' && param ? param : null
})

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const avgKehadiran = computed(() => {
  if (!siswaList.value.length) return 0
  const total = siswaList.value.reduce((sum, s) => sum + s.kehadiran, 0)
  return Math.round(total / siswaList.value.length)
})

async function fetchData() {
  if (!idPerusahaan.value) {
    error.value = 'ID Perusahaan tidak valid'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Fetch perusahaan details and guru's penempatan list in parallel
    const [perusahaanRes, siswaBimbinganRes] = await Promise.all([
      getPerusahaanById(idPerusahaan.value),
      guruApi.getSiswaBimbingan({ limit: 100 })
    ])

    perusahaan.value = perusahaanRes?.data ?? null

    // Filter penempatan for this specific perusahaan
    const placements = (siswaBimbinganRes?.data ?? []).filter(
      (p: any) => p.perusahaan?.id_perusahaan === idPerusahaan.value
    )

    penempatanAktif.value = placements.filter((p: any) => p.status_penempatan === 'aktif').length
    penempatanSelesai.value = placements.filter((p: any) => p.status_penempatan === 'selesai').length

    siswaList.value = placements.map((pen: any) => {
      const siswa = pen.siswa
      return {
        id: pen.id_penempatan,
        penempatanId: pen.id_penempatan,
        nama: siswa?.nama_siswa || '-',
        inisial: getInitials(siswa?.nama_siswa || 'XX'),
        kelas: siswa?.kelas?.nama_kelas || '-',
        nis: siswa?.nis || '-',
        kehadiran: pen.stats?.kehadiran ?? 0,
        status: pen.status_penempatan
      }
    })

  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = err?.message || 'Gagal memuat data perusahaan'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Detail Penempatan | Guru PKL' })
</script>
