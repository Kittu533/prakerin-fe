<!-- layouts/siswa.vue -->
<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <AppHeader 
      :user-name="userName"
      :school-name="schoolName"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <!-- Main Content Area -->
    <div class="flex flex-col lg:flex-row relative">
      <!-- Overlay untuk mobile -->
      <Transition name="fade">
        <div 
          v-if="isSidebarOpen"
          @click="isSidebarOpen = false"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        >
        </div>
      </Transition>

      <!-- Sidebar -->
      <Transition name="slide">
        <div 
          v-show="isSidebarOpen || isDesktop"
          class="fixed left-0 top-0 h-full z-50 lg:relative lg:z-0"
        >
          <AppSidebar 
            :user-name="userName"
            :user-class="userClass"
          />
        </div>
      </Transition>

      <!-- Content -->
      <main class="flex-1 p-3 sm:p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Data siswa bisa diambil dari API/store
const userName = ref('Ryobi Surya Atmaja')
const userClass = ref('XII TM A')
const schoolName = ref('SMK N 2 Wonogiri')

// Sidebar state
const isSidebarOpen = ref(false)
const isDesktop = ref(false)

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024 // lg breakpoint
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
/* Transition untuk overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transition untuk sidebar slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>