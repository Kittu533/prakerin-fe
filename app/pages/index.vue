<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="text-center relative z-10">
      <div class="bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-white/20">
        <!-- Logo/Icon with animation -->
        <div class="flex justify-center mb-8">
          <div class="relative">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <!-- Pulse effect -->
            <div class="absolute inset-0 rounded-2xl bg-blue-600 opacity-20 animate-ping"></div>
          </div>
        </div>

        <!-- Title and description -->
        <h1 class="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          SIM Prakerin
        </h1>
        <p class="text-gray-600 text-lg mb-8 leading-relaxed">
          Sistem Informasi Manajemen<br />Praktik Kerja Industri
        </p>

        <!-- Loading section -->
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2 text-blue-700 font-semibold">
            <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Mempersiapkan halaman...</span>
          </div>
          
          <!-- Progress bar -->
          <div class="w-64 h-2.5 bg-gray-200 rounded-full mx-auto overflow-hidden shadow-inner">
            <div class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-progress shadow-sm"></div>
          </div>
          
          <p class="text-sm text-gray-500 mt-4">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>

      <!-- Additional info -->
      <p class="text-white/80 text-sm mt-6 font-light">
        © 2025 SIM Prakerin. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Redirect to login after 2.5 seconds with smooth transition
onMounted(() => {
  setTimeout(() => {
    router.push('/login')
  }, 2500)
})

useHead({
  title: 'SIM Prakerin - Sistem Informasi Manajemen Praktik Kerja Industri',
  meta: [
    { name: 'description', content: 'Sistem Informasi Manajemen Praktik Kerja Industri - Platform digital untuk mengelola kegiatan prakerin secara efisien dan terstruktur' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}
</style>
