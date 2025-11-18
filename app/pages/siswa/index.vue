<!-- pages/siswa/program.vue -->
<template>
  <div>
    <!-- Welcome Card -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm opacity-90 mb-2">{{ currentDate }}</p>
          <h1 class="text-3xl font-bold mb-2">Selamat datang Admin DDV,</h1>
          <p class="text-blue-100">Sistem Informasi Manajemen Prakerin</p>
        </div>
        <div class="bg-white rounded-xl p-4 flex items-center gap-3 shadow-md">
          <img src="../../assets/img/logo-skanda.png" alt="School" class="h-12 w-12" />
          <span class="font-bold text-blue-600 text-lg">SMK N 2 Wonogiri</span>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="mt-6">
      <!-- Konten halaman program Anda di sini -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Program Prakerin</h2>
        <p class="text-gray-600">Konten program akan ditampilkan di sini...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'siswa'
})

const currentDate = computed(() => {
  const date = new Date()
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
})
</script>