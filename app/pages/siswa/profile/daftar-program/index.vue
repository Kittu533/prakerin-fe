<template>
  <section class="space-y-4 sm:space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500" aria-label="Breadcrumb">
      <NuxtLink to="/siswa" class="transition-colors hover:text-blue-600 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </NuxtLink>
      <span class="text-slate-300">›</span>
      <span class="text-slate-500">Profile</span>
      <span class="text-slate-300">›</span>
      <span class="font-semibold text-blue-600">Daftar Program</span>
    </nav>

    <!-- Main Card -->
    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-xl" />
      <USkeleton class="h-48 w-full rounded-xl" />
    </div>
    
    <div v-else-if="penempatan" class="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <!-- Header perusahaan -->
      <div class="p-4 sm:p-6 border-b border-slate-100">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div class="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div class="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <span class="text-2xl sm:text-3xl">🏢</span>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-lg font-semibold text-slate-900 line-clamp-2">
                {{ penempatan.perusahaan?.nama_perusahaan || '-' }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-3 sm:line-clamp-none">
                {{ penempatan.perusahaan?.deskripsi || '-' }}
              </p>
            </div>
          </div>
          <button class="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors shrink-0 self-start">
            DETAIL
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-6 space-y-6">
        <!-- Info Posisi / Jenis / Deskripsi -->
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span>🏷️</span>
              <span>Posisi</span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ penempatan.posisi || '-' }}</p>
          </div>

          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span>🧑‍💻</span>
              <span>Jenis Kegiatan</span>
            </div>
            <p class="mt-1 text-sm font-semibold text-slate-800">{{ penempatan.jenis_kegiatan || 'Magang/Kerja Praktik' }}</p>
          </div>

          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span>📄</span>
              <span>Deskripsi Pekerjaan</span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ penempatan.deskripsi_pekerjaan || '-' }}</p>
          </div>
        </div>

        <!-- Tahun ajaran + semester -->
        <div class="grid gap-4 grid-cols-2">
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <p class="text-xs sm:text-sm text-slate-500">Tahun Ajaran</p>
            <p class="mt-1 text-sm sm:text-base font-semibold text-slate-800">{{ penempatan.tahun_ajaran?.nama_tahun_ajaran || '-' }}</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <p class="text-xs sm:text-sm text-slate-500">Semester</p>
            <p class="mt-1 text-sm sm:text-base font-semibold text-slate-800">{{ penempatan.tahun_ajaran?.semester || '-' }}</p>
          </div>
        </div>

        <!-- Keterangan status -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-slate-700 mb-3">
            Keterangan Status
          </h3>
          <div class="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <div
              v-for="status in statuses"
              :key="status.label"
              class="flex items-center rounded-xl px-4 py-3"
              :class="status.approved ? 'bg-green-50' : 'bg-amber-50'"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
                :class="status.approved ? 'bg-green-500' : 'bg-amber-500'"
              >
                <svg v-if="status.approved" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <div class="ml-3 min-w-0">
                <p class="text-sm font-semibold" :class="status.approved ? 'text-green-800' : 'text-amber-800'">
                  {{ status.label }}
                </p>
                <p class="text-xs" :class="status.approved ? 'text-green-600' : 'text-amber-600'">
                  {{ status.note }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSiswaPenempatanApi } from '~/composables/api/use-siswa'

definePageMeta({
  layout: 'siswa',
})

const loading = ref(true)
const penempatanApi = useSiswaPenempatanApi()

interface Penempatan {
  perusahaan?: {
    nama_perusahaan: string
    deskripsi?: string
    alamat?: string
  }
  posisi?: string
  jenis_kegiatan?: string
  deskripsi_pekerjaan?: string
  tahun_ajaran?: {
    nama_tahun_ajaran: string
    semester?: string
  }
}

const penempatan = ref<Penempatan | null>(null)
const statuses = ref<{ label: string; note: string; approved: boolean }[]>([])

onMounted(async () => {
  try {
    const response = await penempatanApi.getMyPenempatan()
    if (response.success && response.data) {
      penempatan.value = response.data
      
      // Set approval statuses based on penempatan status
      const status = response.data.status
      statuses.value = [
        { label: 'DPA', note: status === 'approved' || status === 'active' ? 'Sudah ACC' : 'Menunggu', approved: status === 'approved' || status === 'active' },
        { label: 'Prodi', note: status === 'approved' || status === 'active' ? 'Sudah ACC' : 'Menunggu', approved: status === 'approved' || status === 'active' },
        { label: 'Mitra', note: status === 'approved' || status === 'active' ? 'Sudah ACC' : 'Menunggu', approved: status === 'approved' || status === 'active' },
      ]
    } else {
      loadMockData()
    }
  } catch (error) {
    console.error('Failed to load penempatan:', error)
    loadMockData()
  } finally {
    loading.value = false
  }
})

function loadMockData() {
  penempatan.value = {
    perusahaan: {
      nama_perusahaan: 'PT. Gama Integra Informatika (GAMA INFORMATIKA)',
      deskripsi: 'Gama Informatika merupakan satu-satunya tempat kursus dan pelatihan yang memiliki keunggulan dalam mencetak lulusan kursus yang berkompeten.',
    },
    posisi: '-',
    jenis_kegiatan: 'Magang/Kerja Praktik',
    deskripsi_pekerjaan: '-',
    tahun_ajaran: {
      nama_tahun_ajaran: '2024/2025',
      semester: 'Genap'
    }
  }
  statuses.value = [
    { label: 'DPA', note: 'Sudah ACC', approved: true },
    { label: 'Prodi', note: 'Sudah ACC', approved: true },
    { label: 'Mitra', note: 'Sudah ACC', approved: true },
  ]
}
</script>
