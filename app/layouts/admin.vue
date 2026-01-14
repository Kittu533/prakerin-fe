<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex">
      <!-- Sidebar - Desktop (sticky) -->
      <div class="hidden lg:block sticky top-0 h-screen shrink-0">
        <aside class="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
          <!-- Logo -->
          <div class="h-16 flex items-center px-5 border-b border-slate-100">
            <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-9 h-9 object-contain mr-3" />
            <div>
              <h1 class="font-bold text-slate-900 text-sm">SIM Prakerin</h1>
              <p class="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>

          <!-- Nav -->
          <nav class="flex-1 overflow-y-auto py-4 px-3">
            <div class="space-y-1">
              <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors" :class="isActive(item.to) ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'">
                <Icon :name="item.icon" class="w-5 h-5" />
                <span>{{ item.label }}</span>
                <UBadge v-if="item.badge" :color="item.badgeColor || 'primary'" variant="subtle" size="xs" class="ml-auto">{{ item.badge }}</UBadge>
              </NuxtLink>
            </div>

            <div class="mt-6 pt-6 border-t border-slate-100">
              <p class="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase">Master Data</p>
              <div class="space-y-1">
                <NuxtLink v-for="item in masterItems" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors" :class="isActive(item.to) ? 'bg-sky-50 text-sky-600 font-medium' : 'text-slate-600 hover:bg-slate-50'">
                  <Icon :name="item.icon" class="w-4 h-4" />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </nav>

          <!-- User -->
          <div class="p-3 border-t border-slate-100">
            <div class="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
              <div class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">AD</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">Administrator</p>
                <p class="text-xs text-slate-500">Super Admin</p>
              </div>
              <UButton variant="ghost" color="neutral" size="xs" @click="logout">
                <Icon name="lucide:log-out" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </aside>
      </div>

      <!-- Main Area -->
      <div class="flex-1 min-w-0 flex flex-col min-h-screen">
        <!-- Header -->
        <header class="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 lg:h-16 flex items-center px-4 lg:px-6 shrink-0">
          <div class="flex items-center justify-between w-full">
            <!-- Left -->
            <div class="flex items-center gap-3">
              <!-- Mobile Logo -->
              <div class="flex items-center gap-2 lg:hidden">
                <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-8 h-8 object-contain" />
                <span class="font-semibold text-slate-900 text-sm">Prakerin</span>
              </div>

              <!-- Page Title (Desktop) -->
              <div class="hidden lg:block">
                <h1 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h1>
              </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-2">
              <!-- Notifications -->
              <button class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
                <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
                <span v-if="hasNotification" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <!-- User (Desktop) -->
              <div class="hidden sm:flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                  AD
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-slate-900">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <slot />
        </main>

        <!-- Bottom Navigation (Mobile/Tablet Only) -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-bottom">
          <div class="flex items-center justify-around h-16">
            <NuxtLink 
              v-for="item in bottomNavItems" 
              :key="item.to"
              :to="item.to"
              class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
              :class="isActiveRoute(item.to) ? 'text-sky-600' : 'text-slate-500'"
            >
              <div class="relative">
                <Icon :name="item.icon" class="w-5 h-5" />
                <span v-if="item.badge" class="absolute -top-1 -right-2 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
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

const hasNotification = ref(true)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/verification': 'Verifikasi Pengajuan',
    '/admin/placement': 'Penempatan Siswa',
    '/admin/monitoring': 'Monitoring PKL',
    '/admin/users': 'Kelola Akun',
    '/admin/master/academic-years': 'Tahun Ajaran',
    '/admin/master/departments': 'Jurusan',
    '/admin/master/classes': 'Kelas',
    '/admin/master/teachers': 'Guru Pembimbing',
    '/admin/master/students': 'Siswa',
    '/admin/master/companies': 'Perusahaan',
    '/admin/master/mentors': 'Mentor Industri'
  }
  
  if (titles[route.path]) return titles[route.path]
  
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path) && path !== '/admin') return title
  }
  
  return 'Dashboard'
})

const menuItems = [
  { to: '/admin', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { to: '/admin/verification', icon: 'lucide:file-check', label: 'Verifikasi', badge: 5, badgeColor: 'warning' },
  { to: '/admin/placement', icon: 'lucide:map-pin', label: 'Penempatan' },
  { to: '/admin/monitoring', icon: 'lucide:activity', label: 'Monitoring' },
  { to: '/admin/users', icon: 'lucide:users', label: 'Kelola Akun' }
]

const masterItems = [
  { to: '/admin/master/academic-years', icon: 'lucide:calendar', label: 'Tahun Ajaran' },
  { to: '/admin/master/departments', icon: 'lucide:layers', label: 'Jurusan' },
  { to: '/admin/master/classes', icon: 'lucide:school', label: 'Kelas' },
  { to: '/admin/master/teachers', icon: 'lucide:user-check', label: 'Guru' },
  { to: '/admin/master/students', icon: 'lucide:graduation-cap', label: 'Siswa' },
  { to: '/admin/master/companies', icon: 'lucide:building', label: 'Perusahaan' },
  { to: '/admin/master/mentors', icon: 'lucide:briefcase', label: 'Mentor' }
]

const bottomNavItems = [
  { to: '/admin', icon: 'lucide:home', label: 'Home' },
  { to: '/admin/verification', icon: 'lucide:file-check', label: 'Verifikasi', badge: 5 },
  { to: '/admin/placement', icon: 'lucide:map-pin', label: 'Penempatan' },
  { to: '/admin/users', icon: 'lucide:users', label: 'Akun' },
  { to: '/admin/master/students', icon: 'lucide:database', label: 'Master' }
]

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const isActiveRoute = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  if (path === '/admin/master/students') return route.path.startsWith('/admin/master')
  return route.path.startsWith(path)
}

const logout = () => navigateTo('/login')
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
