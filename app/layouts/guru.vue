<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex">
      <!-- Overlay untuk mobile -->
      <Transition name="fade">
        <div 
          v-if="isMobileSidebarOpen && !isDesktop"
          @click="closeMobileSidebar"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      </Transition>

      <!-- Sidebar - Desktop (sticky) -->
      <div class="hidden lg:block sticky top-0 h-screen shrink-0">
        <GuruSidebar />
      </div>

      <!-- Mobile Sidebar -->
      <Transition name="slide">
        <div 
          v-show="isMobileSidebarOpen && !isDesktop"
          class="fixed left-0 top-0 h-screen z-50 lg:hidden"
        >
          <GuruSidebar />
        </div>
      </Transition>

      <!-- Main Area -->
      <div class="flex-1 min-w-0 flex flex-col min-h-screen">
        <!-- Header -->
        <header class="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 shrink-0">
          <div class="flex items-center justify-between w-full">
            <!-- Left -->
            <div class="flex items-center gap-3">
              <button
                @click="toggleSidebar"
                class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Icon name="lucide:menu" class="w-5 h-5 text-slate-700" />
              </button>
              
              <!-- Mobile Logo -->
              <div class="flex items-center gap-2 lg:hidden">
                <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <Icon name="lucide:graduation-cap" class="w-4 h-4 text-white" />
                </div>
                <span class="font-semibold text-slate-900 text-sm">SIM Prakerin</span>
              </div>

              <!-- Breadcrumb / Page Title (Desktop) -->
              <div class="hidden lg:block">
                <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
              </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-2">
              <!-- Search (Desktop) -->
              <div class="hidden md:block">
                <UInput 
                  placeholder="Cari..." 
                  class="w-64"
                  size="sm"
                >
                  <template #leading>
                    <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </div>

              <!-- Notifications -->
              <button class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <!-- User Menu -->
              <UDropdown 
                :items="userMenuItems" 
                :popper="{ placement: 'bottom-end' }"
              >
                <button class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                    BS
                  </div>
                  <div class="hidden sm:block text-left">
                    <p class="text-sm font-medium text-slate-900">Budi Santoso</p>
                    <p class="text-xs text-slate-500">Guru</p>
                  </div>
                  <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>
              </UDropdown>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 p-4 lg:p-6">
          <slot />
        </main>

        <!-- Footer -->
        <footer class="border-t border-slate-200 bg-white px-4 lg:px-6 py-4 shrink-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-500">
            <p>© 2024 SIM Prakerin - SMK N 2 Wonogiri</p>
            <p class="text-xs">v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const {
  isMobileSidebarOpen,
  isDesktop,
  toggleSidebar,
  closeMobileSidebar,
  updateScreenSize,
  initializeDesktopSidebar
} = useSidebar()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/guru': 'Dashboard',
    '/guru/siswa-bimbingan': 'Siswa Bimbingan',
    '/guru/penempatan': 'Penempatan PKL',
    '/guru/kunjungan': 'Monitoring Kunjungan',
    '/guru/absensi': 'Validasi Absensi',
    '/guru/verifikasi-logbook': 'Verifikasi Logbook',
    '/guru/penilaian-nilai': 'Penilaian PKL',
    '/guru/laporan-akhir': 'Laporan Akhir'
  }
  
  // Check exact match first
  if (titles[route.path]) return titles[route.path]
  
  // Check prefix match
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path) && path !== '/guru') return title
  }
  
  return 'Dashboard'
})

const userMenuItems = [
  [{
    label: 'Profil Saya',
    icon: 'i-lucide-user',
    click: () => {}
  }, {
    label: 'Pengaturan',
    icon: 'i-lucide-settings',
    click: () => {}
  }],
  [{
    label: 'Keluar',
    icon: 'i-lucide-log-out',
    click: () => navigateTo('/login')
  }]
]

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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
