<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar (Desktop only) -->
    <aside class="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-screen">
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

    <!-- Mobile Header -->
    <div class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
      <div class="flex items-center gap-2">
        <img src="~/assets/img/logo-skanda.png" alt="Logo" class="w-8 h-8 object-contain" />
        <span class="font-semibold text-slate-900 text-sm">Admin Panel</span>
      </div>
      <button class="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors">
        <Icon name="lucide:bell" class="w-5 h-5 text-slate-600" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      </button>
    </div>

    <!-- Main -->
    <main class="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
      <div class="p-4 lg:p-6">
        <slot />
      </div>
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
</template>

<script setup lang="ts">
const route = useRoute()

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
