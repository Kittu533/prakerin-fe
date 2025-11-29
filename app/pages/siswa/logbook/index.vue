<template>
  <section class="min-h-screen space-y-4 sm:space-y-6 bg-white px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 -m-3 sm:-m-4 md:-m-6 lg:-m-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-slate-500 sm:text-sm" aria-label="Breadcrumb">
      <NuxtLink to="/siswa" class="transition-colors hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="ml-1">Home</span>
      </NuxtLink>
      <span class="text-slate-300">›</span>
      <span class="font-semibold text-blue-600">Logbook</span>
    </nav>

    <!-- Header Section -->
    <div class="space-y-4 sm:space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex-1">
          <h1 class="text-xl font-bold text-slate-800 sm:text-2xl lg:text-3xl">Logbook Prakerin</h1>
          <p class="mt-1 sm:mt-2 text-sm text-slate-600 lg:text-base">
            Kelola absensi dan catatan aktivitas harian prakerin / PKL
          </p>
        </div>
        <!-- Tombol Absensi -->
        <div class="shrink-0">
          <AbsensiModal @success="markHasCheckedIn" />
        </div>
      </div>

      <!-- Status Absensi Alert -->
      <div
        v-if="!hasCheckedInToday"
        class="flex items-start gap-3 rounded-lg sm:rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-3 sm:px-4 sm:py-4 text-sm text-amber-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-sm sm:text-base">Belum Absensi Hari Ini</p>
          <p class="mt-1 text-xs sm:text-sm">
            Lakukan absensi terlebih dahulu menggunakan kamera & lokasi sebelum menambah logbook.
          </p>
        </div>
      </div>

      <div
        v-else
        class="flex items-start gap-3 rounded-lg sm:rounded-xl border-2 border-green-200 bg-green-50 px-3 py-3 sm:px-4 sm:py-4 text-sm text-green-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-sm sm:text-base">Absensi Tercatat</p>
          <p class="mt-1 text-xs sm:text-sm">
            Absensi hari ini sudah tercatat. Anda dapat menambah dan mengelola logbook.
          </p>
        </div>
      </div>
    </div>

    <!-- Informasi Siswa -->
    <div class="overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-slate-200 bg-slate-50">
      <div class="bg-blue-600 px-4 py-3 sm:px-6 sm:py-4">
        <h2 class="text-base sm:text-lg font-bold text-white">Informasi Siswa</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <tbody class="divide-y divide-slate-200">
            <tr class="hover:bg-white transition-colors">
              <td class="w-28 sm:w-36 lg:w-48 px-4 py-3 sm:px-6 font-semibold text-slate-700">Nama Lengkap</td>
              <td class="w-4 sm:w-8 text-center text-slate-400">:</td>
              <td class="px-4 py-3 sm:px-6 font-semibold uppercase text-slate-800">{{ profile.nama }}</td>
            </tr>
            <tr class="hover:bg-white transition-colors">
              <td class="px-4 py-3 sm:px-6 font-semibold text-slate-700">NIS</td>
              <td class="text-center text-slate-400">:</td>
              <td class="px-4 py-3 sm:px-6 text-slate-800">{{ profile.nis }}</td>
            </tr>
            <tr class="hover:bg-white transition-colors">
              <td class="px-4 py-3 sm:px-6 font-semibold text-slate-700">Kelas</td>
              <td class="text-center text-slate-400">:</td>
              <td class="px-4 py-3 sm:px-6 text-slate-800">{{ profile.kelas }}</td>
            </tr>
            <tr class="hover:bg-white transition-colors">
              <td class="px-4 py-3 sm:px-6 font-semibold text-slate-700">Jurusan</td>
              <td class="text-center text-slate-400">:</td>
              <td class="px-4 py-3 sm:px-6 text-slate-800">{{ profile.jurusan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Logbook Table -->
    <LogbookTable title="Riwayat Logbook" :page-size="5" />
  </section>
</template>


<script setup lang="ts">
import LogbookTable from '~/components/logbook/LogbookTable.vue'
import AbsensiModal from '~/components/logbook/AbsensiModal.vue'

definePageMeta({
  layout: 'siswa',
  title: 'Logbook'
})

const profile = {
  nama: 'Ryobi Surya Atmaja',
  nis: '2023010563',
  kelas: 'XII RPL 1',
  jurusan: 'Rekayasa Perangkat Lunak'
}

// status absensi hari ini (di-set dari komponen AbsensiModal)
const hasCheckedInToday = ref(false)
const markHasCheckedIn = () => {
  hasCheckedInToday.value = true
}

// SEO
useHead({
  title: 'Logbook PKL | SIM Prakerin',
  meta: [
    { name: 'description', content: 'Kelola logbook dan absensi kegiatan prakerin siswa' }
  ]
})
</script>