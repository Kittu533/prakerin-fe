<!-- layouts/guru.vue -->
<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <!-- Header umum -->
    <AppHeader 
      :user-name="userName"
      :school-name="schoolName"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <!-- Main Content Area -->
    <div class="relative flex">
      <!-- Overlay + sidebar MOBILE -->
      <Transition name="fade">
        <div
          v-if="isSidebarOpen"
          @click="isSidebarOpen = false"
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      </Transition>

      <Transition name="slide">
        <div
          v-if="isSidebarOpen"
          class="fixed left-0 top-0 z-50 h-full lg:hidden"
        >
          <GuruSidebar
            :user-name="userName"
            :user-role="userRole"
          />
        </div>
      </Transition>

      <!-- Sidebar DESKTOP -->
      <div class="hidden lg:block lg:h-[calc(100vh-4rem)]">
        <!-- 4rem kira-kira tinggi header, kalau beda tinggal sesuaikan -->
        <GuruSidebar
          :user-name="userName"
          :user-role="userRole"
        />
      </div>

      <!-- Content -->
      <main class="flex-1 p-3 sm:p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userName = ref('Nama Guru Pembimbing')
const userRole = ref('Guru Pembimbing PKL')
const schoolName = ref('SMK N 2 Wonogiri')

const isSidebarOpen = ref(false)
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
