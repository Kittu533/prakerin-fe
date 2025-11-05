<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
    <div class="text-center">
      <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-4">SIM Prakerin</h1>
        <p class="text-gray-600 mb-6">Sistem Informasi Manajemen Praktik Kerja Industri</p>
        <div class="text-blue-600 font-medium mb-2">Memuat halaman login...</div>
        <div class="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-yellow-500 animate-pulse" style="width: 100%"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Redirect to login after 2.5 seconds
setTimeout(() => {
  router.push('/login')
}, 2500)

useHead({
  title: 'SIM Prakerin - Loading...',
  meta: [
    { name: 'description', content: 'Sistem Informasi Manajemen Praktik Kerja Industri' }
  ]
})
</script>
