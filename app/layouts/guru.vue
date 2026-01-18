<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex">
      <!-- Sidebar - Desktop (sticky) -->
      <div class="hidden lg:block sticky top-0 h-screen shrink-0">
        <GuruSidebar />
      </div>

      <!-- Main Area -->
      <div class="flex-1 min-w-0 flex flex-col min-h-screen">
        <!-- Header -->
        <header
          class="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 lg:h-16 flex items-center px-4 lg:px-6 shrink-0">
          <div class="flex items-center justify-between w-full">
            <!-- Left -->
            <div class="flex items-center gap-3">
              <!-- Mobile Logo -->
              <div class="flex items-center gap-2 lg:hidden">
                <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-8 h-8 object-contain" />
                <span class="font-semibold text-slate-900 text-sm">SIM Prakerin</span>
              </div>

              <!-- Page Title (Desktop) -->
              <div class="hidden lg:block">
                <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
              </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-2">
              <!-- Search (Desktop) -->
              <div class="hidden lg:block">
                <UInput placeholder="Cari..." class="w-64" size="sm">
                  <template #leading>
                    <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </div>

              <!-- Notifications -->
              <button
                class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <!-- User Menu -->
              <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }" :ui="{ width: 'w-48' }">
                <div
                  class="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors select-none">
                  <div
                    class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-transparent group-hover:ring-sky-100">
                    BS
                  </div>
                  <div class="text-left hidden sm:block">
                    <p class="text-xs font-semibold text-slate-900 leading-tight">Budi Santoso</p>
                    <p class="text-[10px] text-slate-500 font-medium leading-tight">Guru Pembimbing</p>
                  </div>
                  <Icon name="lucide:chevron-down" class="w-4 h-4 text-slate-400 hidden sm:block" />
                </div>
              </UDropdown>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <slot />
        </main>

        <!-- Footer (Desktop only) -->
        <footer class="hidden lg:block border-t border-slate-200 bg-white px-4 lg:px-6 py-4 shrink-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-500">
            <p>© 2024 SIM Prakerin - SMK N 2 Wonogiri</p>
            <p class="text-xs">v1.0.0</p>
          </div>
        </footer>

        <!-- Bottom Navigation (Mobile/Tablet Only) -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-bottom">
          <div class="flex items-center justify-around h-16">
            <NuxtLink v-for="item in bottomNavItems" :key="item.to" :to="item.to"
              class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
              :class="isActiveRoute(item.to) ? 'text-sky-600' : 'text-slate-500'">
              <div class="relative">
                <Icon :name="item.icon" class="w-5 h-5" />
                <span v-if="item.badge"
                  class="absolute -top-1 -right-2 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                  {{ item.badge > 9 ? '9+' : item.badge }}
                </span>
              </div>
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

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

  if (titles[route.path]) return titles[route.path]

  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path) && path !== '/guru') return title
  }

  return 'Dashboard'
})

const bottomNavItems = [
  { to: '/guru', icon: 'lucide:home', label: 'Home' },
  { to: '/guru/siswa-bimbingan', icon: 'lucide:users', label: 'Siswa', badge: 24 },
  { to: '/guru/verifikasi-logbook', icon: 'lucide:book-open', label: 'Logbook', badge: 12 },
  { to: '/guru/absensi', icon: 'lucide:calendar-check', label: 'Absensi', badge: 5 },
  { to: '/guru/penilaian-nilai', icon: 'lucide:award', label: 'Nilai' }
]

const isActiveRoute = (path: string) => {
  if (path === '/guru') return route.path === '/guru'
  return route.path.startsWith(path)
}

const userMenuItems = [
  [{
    label: 'Profil Saya',
    icon: 'i-lucide-user',
    click: () => { }
  }, {
    label: 'Pengaturan',
    icon: 'i-lucide-settings',
    click: () => { }
  }],
  [{
    label: 'Keluar',
    icon: 'i-lucide-log-out',
    click: () => navigateTo('/login')
  }]
]
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
