<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex">
      <!-- Sidebar - Desktop (sticky) -->
      <div class="hidden lg:block sticky top-0 h-screen shrink-0">
        <SiswaSidebar />
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
              <NuxtLink to="/siswa/profil" class="hidden sm:flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                  {{ userInitials || 'S' }}
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium text-slate-900">{{ userName || 'Siswa' }}</p>
                </div>
              </NuxtLink>
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
                <span v-if="item.dot" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
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
import { useSiswaProfileApi } from '~/composables/api/use-siswa'
import { useAuth } from '~/composables/auth/use-auth'

const route = useRoute()
const toast = useToast()
const profileApi = useSiswaProfileApi()
const { logout: authLogout } = useAuth()

const hasNotification = ref(true)

// Profile state
const userName = ref('')
const userInitials = ref('')
const userClass = ref('')

// Fetch profile on mount
onMounted(async () => {
  try {
    const res = await profileApi.getMyProfile()
    if (res.success && res.data) {
      userName.value = res.data.nama_siswa || 'Siswa'
      userInitials.value = res.data.nama_siswa
        ? res.data.nama_siswa.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'S'
      userClass.value = res.data.kelas?.nama_kelas || ''
    }
  } catch (e) {
    console.error('[SiswaLayout] Failed to load profile:', e)
  }
})

// Provide profile data to sidebar
provide('siswaProfile', { userName, userInitials, userClass })

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/siswa': 'Dashboard',
    '/siswa/aktivitas-harian': 'Flow Harian Siswa',
    '/siswa/riwayat-harian': 'Riwayat Harian PKL',
    '/siswa/profil': 'Profil Saya',
    '/siswa/ubah-password': 'Ubah Password'
  }
  
  if (titles[route.path]) return titles[route.path]
  
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path) && path !== '/siswa') return title
  }
  
  return 'Dashboard'
})

const bottomNavItems = [
  { to: '/siswa', icon: 'lucide:home', label: 'Home' },
  { to: '/siswa/aktivitas-harian', icon: 'lucide:list-checks', label: 'Flow', badge: 1 },
  { to: '/siswa/riwayat-harian', icon: 'lucide:table-2', label: 'Riwayat' },
  { to: '/siswa/profil', icon: 'lucide:user', label: 'Profil' }
]

const isActiveRoute = (path: string) => {
  if (path === '/siswa') return route.path === '/siswa'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
