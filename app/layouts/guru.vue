<!-- layouts/guru.vue -->
<template>
  <div class="bg-[#f5f5f5]">
    <!-- Header -->
    <AppHeader 
      :role="'guru'"
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
      <!-- Desktop: Always show sidebar, but can be minimized via GuruSidebar toggle -->
      <div class="hidden lg:block">
        <GuruSidebar />
      </div>

      <!-- Mobile Sidebar - Show/hide via hamburger menu -->
      <Transition name="slide">
        <div 
          v-show="isMobileSidebarOpen && !isDesktop"
          class="fixed left-0 top-0 h-screen z-50 lg:hidden"
        >
          <GuruSidebar />
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

// Data guru bisa diambil dari API/store
const userName = ref('Dr. Ahmad Wijaya, M.Pd')
const userRole = ref('Guru Pembimbing PKL')
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
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
/* Transition overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transition sidebar slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
