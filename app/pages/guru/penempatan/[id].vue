<script setup lang="ts">
import penempatanData from '~/assets/data/guru_penempatan.json'

definePageMeta({
  layout: 'guru',
  title: 'Detail Penempatan Siswa'
})

const route = useRoute()
const id = Number(route.params.id)

const penempatan = computed(() =>
  (penempatanData.items as any[]).find((p) => p.idPenempatan === id)
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Wrapper with White Background -->
    <div class="bg-white min-h-screen">
      <!-- Content Section -->
      <div class="w-full px-6 py-6">
        <!-- Breadcrumb Section -->
        <div class="mb-6">
          <nav class="flex items-center text-sm mb-4">
            <NuxtLink to="/guru" class="text-gray-500 hover:text-gray-700">Dashboard</NuxtLink>
            <svg class="h-4 w-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <NuxtLink to="/guru/penempatan" class="text-gray-500 hover:text-gray-700">
              Penempatan PKL
            </NuxtLink>
            <svg class="h-4 w-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-900 font-medium">Detail Siswa</span>
          </nav>
        </div>

        <section v-if="penempatan" class="space-y-6">
          <!-- HEADER SECTION -->
          <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Detail Penempatan
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ penempatan.namaSiswa }}
                </h1>
                <p class="text-gray-600">
                  Kelas {{ penempatan.kelas }} • Penempatan di {{ penempatan.perusahaan }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  Dibimbing oleh {{ penempatan.mentor }}
                </p>
              </div>

              <div class="flex gap-3">
                <UButton
                  variant="outline"
                  size="md"
                  icon="i-lucide-edit"
                >
                  Edit Data
                </UButton>
                <UButton
                  variant="outline"
                  size="md"
                  icon="i-lucide-printer"
                >
                  Cetak Laporan
                </UButton>
              </div>
            </div>
          </div>

          <!-- OVERVIEW CARDS -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <!-- Periode PKL Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div class="flex items-center">
                <div class="shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">
                    Periode PKL
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ penempatan.periodeMulai }} – {{ penempatan.periodeSelesai }}
                  </p>
                </div>
              </div>
              <div class="mt-4">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  penempatan.statusPenempatan === 'AKTIF' ? 'bg-green-100 text-green-800' :
                  penempatan.statusPenempatan === 'SELESAI' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ penempatan.statusPenempatan }}
                </span>
              </div>
            </div>

            <!-- Perusahaan Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div class="flex items-center">
                <div class="shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">
                    Perusahaan
                  </h3>
                  <p class="text-sm font-semibold text-gray-900 mt-1">
                    {{ penempatan.perusahaan }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Mentor Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">
                    Mentor Lapangan
                  </h3>
                  <p class="text-sm font-semibold text-gray-900 mt-1">
                    {{ penempatan.mentor }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Kehadiran Card -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">
                    Tingkat Kehadiran
                  </h3>
                  <p class="text-2xl font-bold text-emerald-600 mt-1">
                    {{ penempatan.persenKehadiran.toFixed(1) }}%
                  </p>
                </div>
              </div>
              <div class="mt-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-emerald-500 h-2 rounded-full" 
                    :style="{ width: penempatan.persenKehadiran + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- DETAIL TABS SECTION -->
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Detail Aktivitas PKL</h2>
              <p class="text-sm text-gray-600 mt-1">Informasi lengkap mengenai aktivitas dan progress siswa</p>
            </div>
            
            <div class="p-6">
              <!-- Tab Navigation -->
              <div class="border-b border-gray-200 mb-6">
                <nav class="flex space-x-8">
                  <button class="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                    Absensi
                  </button>
                  <button class="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                    Logbook
                  </button>
                  <button class="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                    Dokumen
                  </button>
                  <button class="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                    Penilaian
                  </button>
                </nav>
              </div>

              <!-- Tab Content Placeholder -->
              <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <div class="mx-auto max-w-md">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-4 text-sm font-medium text-gray-900">Fitur Dalam Pengembangan</h3>
                  <p class="mt-2 text-sm text-gray-500">
                    Tab <strong>Absensi, Logbook, Dokumen, dan Penilaian</strong> akan segera tersedia setelah integrasi backend selesai.
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    Saat ini menampilkan data dummy dari JSON untuk preview interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div class="mx-auto max-w-md">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Data Tidak Ditemukan</h3>
            <p class="mt-2 text-sm text-gray-600">
              Data penempatan siswa yang Anda cari tidak dapat ditemukan.
            </p>
            <div class="mt-6">
              <UButton
                to="/guru/penempatan"
                variant="outline"
                size="md"
                icon="i-lucide-arrow-left"
              >
                Kembali ke Daftar Penempatan
              </UButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
