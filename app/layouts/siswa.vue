<!-- layouts/siswa.vue -->
<template>
  <div class="bg-[#f5f5f5]">
    <!-- Header -->
    <AppHeader 
      :user-name="userName"
      :school-name="schoolName"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content Area -->
    <div class="flex">
      <!-- Overlay untuk mobile -->
      <Transition name="fade">
        <div 
          v-if="isMobileSidebarOpen && !isDesktop"
          @click="closeMobileSidebar"
          class="fixed inset-0 bg-black/50 z-40"
        >
        </div>
      </Transition>

      <!-- Sidebar - Responsive behavior -->
      <!-- Desktop: Always show sidebar, but can be minimized via AppSidebar toggle -->
      <div class="hidden lg:block">
        <AppSidebar />
      </div>

      <!-- Mobile Sidebar - Show/hide via hamburger menu -->
      <Transition name="slide">
        <div 
          v-show="isMobileSidebarOpen && !isDesktop"
          class="fixed left-0 top-0 h-screen z-50 lg:hidden"
        >
          <AppSidebar />
        </div>
      </Transition>

      <!-- Content -->
      <main class="flex-1 min-h-screen overflow-x-hidden">
        <div class="p-3 sm:p-4 md:p-6 lg:p-8">
          <slot />
        </div>
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

// Use sidebar composable
const {
  isMobileSidebarOpen,
  isDesktopSidebarMinimized,
  isDesktop,
  toggleSidebar,
  closeMobileSidebar,
  updateScreenSize,
  initializeDesktopSidebar
} = useSidebar()

onMounted(() => {
  updateScreenSize()
  initializeDesktopSidebar()
  window.addEventListener('resize', updateScreenSize)
  
  // Debug scroll issues
  console.log('Layout mounted, checking scroll behavior...')
  console.log('Document body height:', document.body.scrollHeight)
  console.log('Window height:', window.innerHeight)
  console.log('Document overflow:', getComputedStyle(document.documentElement).overflow)
  console.log('Body overflow:', getComputedStyle(document.body).overflow)
  
  // Check main content area
  setTimeout(() => {
    const mainElement = document.querySelector('main')
    const layoutContainer = document.querySelector('.h-screen')
    
    if (mainElement) {
      console.log('Main element found:')
      console.log('- ScrollHeight:', mainElement.scrollHeight)
      console.log('- ClientHeight:', mainElement.clientHeight)
      console.log('- OverflowY:', getComputedStyle(mainElement).overflowY)
      console.log('- Position:', getComputedStyle(mainElement).position)
    } else {
      console.log('Main element not found!')
    }
    
    if (layoutContainer) {
      console.log('Layout container found:')
      console.log('- ScrollHeight:', layoutContainer.scrollHeight)
      console.log('- ClientHeight:', layoutContainer.clientHeight)
      console.log('- OverflowY:', getComputedStyle(layoutContainer).overflowY)
    } else {
      console.log('Layout container not found!')
    }
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
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