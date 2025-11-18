<template>
  <header class="sticky top-0 z-50 backdrop-blur-lg bg-blue-600 border-b border-white/20">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400"></div>
          </div>
          <div class="text-3xl font-bold">
            <span class="text-white">U</span>
            <span class="text-yellow-400">T</span>
            <span class="text-white">Y</span>
          </div>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink 
            to="/siswa/program" 
            class="text-white hover:text-yellow-400 transition-colors duration-200 font-medium"
          >
            Program
          </NuxtLink>
          <NuxtLink 
            to="/siswa/profile" 
            class="text-white hover:text-yellow-400 transition-colors duration-200 font-medium"
          >
            Profil
          </NuxtLink>
          <NuxtLink 
            to="/siswa/logbook" 
            class="text-white hover:text-yellow-400 transition-colors duration-200 font-medium"
          >
            Logbook Kegiatan
          </NuxtLink>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <button class="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/30">
            <span class="text-sm font-medium">BYOBI SURYA ATMAJA</span>
          </button>
          <button class="p-2 hover:bg-white/20 text-white rounded-lg transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button class="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-all duration-200 font-medium shadow-lg">
            Keluar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header component untuk siswa
</script>
