<template>
  <header class="w-full bg-white shadow-sm">
    <div class="flex items-center justify-between px-3 sm:px-6 md:px-8 py-3">
      <!-- Hamburger + Logo kiri -->
      <div class="flex items-center gap-3">
        <!-- Hamburger button (mobile only) -->
        <button
          @click="toggleSidebar"
          class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        <img
          src="../assets/img/logo-skanda.png"
          alt="Logo Sekolah"
          class="h-10 w-10 object-contain"
        />
      </div>

      <!-- Nama user kanan -->
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-slate-600">
          Ryobi Surya Atmaja
        </span>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500"
        >
          <!-- placeholder avatar/logo -->
          <span class="text-xs font-semibold text-white">RS</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
  console.log('🍔 Hamburger menu clicked')
}
</script>
