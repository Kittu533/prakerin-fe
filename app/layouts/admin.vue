<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-screen">
      <!-- Logo -->
      <div class="h-16 flex items-center px-5 border-b border-slate-100">
        <div class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center mr-3">
          <Icon name="lucide:shield" class="w-5 h-5 text-white" />
        </div>
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
    <div class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-40">
      <UButton variant="ghost" color="neutral" size="sm" @click="mobileOpen = true">
        <Icon name="lucide:menu" class="w-5 h-5" />
      </UButton>
      <span class="ml-3 font-semibold text-slate-900">Admin Panel</span>
    </div>

    <!-- Mobile Sidebar -->
    <USlideover v-model:open="mobileOpen" side="left" class="lg:hidden">
      <template #content>
        <div class="p-4">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center">
              <Icon name="lucide:shield" class="w-5 h-5 text-white" />
            </div>
            <span class="font-bold text-slate-900">SIM Prakerin</span>
          </div>
          <nav class="space-y-1">
            <NuxtLink v-for="item in [...menuItems, ...masterItems]" :key="item.to" :to="item.to" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" :class="isActive(item.to) ? 'bg-sky-50 text-sky-600 font-medium' : 'text-slate-600'" @click="mobileOpen = false">
              <Icon :name="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
      </template>
    </USlideover>

    <!-- Main -->
    <main class="flex-1 lg:ml-64 pt-14 lg:pt-0">
      <div class="p-4 lg:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const mobileOpen = ref(false)

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

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const logout = () => navigateTo('/login')
</script>
