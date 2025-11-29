<template>
  <header class="sticky top-0 z-40 w-full bg-white/95 border-b border-gray-200 backdrop-blur-sm">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
      <div class="flex items-center gap-4">
        <!-- Hamburger Menu - Now visible on all screen sizes -->
        <button
          @click="toggleSidebar"
          class="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 lg:hover:bg-gray-50"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <UIcon name="i-heroicons-bars-3" class="w-6 h-6 text-gray-700" />
        </button>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-lg">S</span>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-sm font-semibold text-gray-900">SIMPRAKERIN</h1>
            <p class="text-xs text-gray-500">SMK N 2 Wonogiri</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UButton icon="i-heroicons-bell" color="gray" variant="ghost" size="lg" class="hidden sm:flex" />

        <div class="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
          <div class="hidden md:block text-right">
            <p class="text-sm font-medium text-gray-900">Ryobi Surya Atmaja</p>
            <p class="text-xs text-gray-500">XII TM A</p>
          </div>
          <UAvatar
            text="RS"
            size="md"
            :ui="{ background: 'bg-gradient-to-br from-emerald-500 to-emerald-600' }"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>
