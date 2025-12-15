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
      <span class="font-semibold text-blue-600">Data Diri</span>
    </nav>

    <!-- Main Card -->
    <div class="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <!-- Header profil -->
      <div class="p-4 sm:p-6 border-b border-slate-100">
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center">
          <!-- Avatar + nama -->
          <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div class="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border-2 border-blue-500 bg-blue-50">
              <span class="text-xl sm:text-2xl font-bold text-blue-600">RS</span>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-lg font-semibold text-slate-900 uppercase truncate">
                RYOBI SURYA ATMAJA
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 truncate">
                Siswa SMK Negeri 2 Wonogiri - Program Praktik Kerja Lapangan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 space-y-6">
        <!-- Data Identitas Utama -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-slate-700 mb-3 sm:mb-4">
            Informasi Identitas
          </h3>
          <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in identitasData"
              :key="item.label"
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs text-slate-500">{{ item.label }}</p>
              <p class="mt-1 text-sm font-semibold text-slate-800 break-words">
                {{ item.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Data Akademik -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-slate-700 mb-3 sm:mb-4">
            Informasi Akademik
          </h3>
          <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div
              v-for="item in akademikData"
              :key="item.label"
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs text-slate-500">{{ item.label }}</p>
              <p class="mt-1 text-sm font-semibold text-slate-800 break-words">
                {{ item.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Data Kontak -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-slate-700 mb-3 sm:mb-4">
            Informasi Kontak
          </h3>
          <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div
              v-for="item in kontakData"
              :key="item.label"
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs text-slate-500">{{ item.label }}</p>
              <p class="mt-1 text-sm font-semibold text-slate-800 break-all">
                {{ item.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Status Kelengkapan -->
        <div>
          <h3 class="text-sm sm:text-base font-semibold text-slate-700 mb-3 sm:mb-4">
            Status Kelengkapan Data
          </h3>
          <div class="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <div
              v-for="status in statusData"
              :key="status.label"
              class="flex items-center rounded-xl px-4 py-3"
              :class="status.complete ? 'bg-green-50' : 'bg-amber-50'"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full shrink-0"
                :class="status.complete ? 'bg-green-500' : 'bg-amber-500'"
              >
                <svg v-if="status.complete" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <div class="ml-3 min-w-0">
                <p class="text-sm font-semibold" :class="status.complete ? 'text-green-800' : 'text-amber-800'">
                  {{ status.label }}
                </p>
                <p class="text-xs" :class="status.complete ? 'text-green-600' : 'text-amber-600'">
                  {{ status.complete ? 'Lengkap' : 'Belum Lengkap' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'siswa',
})

const identitasData = ref([
  { label: 'NIM', value: '5220311063' },
  { label: 'Jenis Kelamin', value: 'Laki-Laki' },
  { label: 'Tempat Lahir', value: 'Wonogiri' },
  { label: 'Tanggal Lahir', value: '05/03/2003' },
  { label: 'No. KTP', value: '3312010503030001' },
  { label: 'Alamat', value: 'TAMBAKAN RT 1 RW 8, KARANGLOR' },
])

const akademikData = ref([
  { label: 'Fakultas', value: 'Sains & Teknologi' },
  { label: 'Program Studi', value: 'Sistem Informasi Sarjana' },
  { label: 'IPK', value: '3.79' },
  { label: 'Total SKS', value: '124 SKS' },
])

const kontakData = ref([
  { label: 'No. HP', value: '082241908389' },
  { label: 'Email', value: 'ryobisuryaatmaja@gmail.com' },
])

const statusData = ref([
  { label: 'Data Pribadi', complete: true },
  { label: 'Data Akademik', complete: true },
  { label: 'Data Kontak', complete: true },
])
</script>
