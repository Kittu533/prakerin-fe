<template>
  <aside 
    class="h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col"
    :class="isMinimized ? 'w-[72px]' : 'w-72'"
  >
    <!-- Logo Section -->
    <div class="p-4 border-b border-slate-100">
      <div class="flex items-center gap-3" :class="isMinimized ? 'justify-center' : ''">
        <div 
          class="flex items-center justify-center rounded-xl shrink-0 transition-all duration-300"
          :class="[
            isMinimized ? 'w-10 h-10' : 'w-11 h-11',
            role === 'mentor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
          ]"
        >
          <span class="text-white font-bold" :class="isMinimized ? 'text-sm' : 'text-lg'">
            {{ role === 'mentor' ? 'M' : 'SP' }}
          </span>
        </div>
        <div v-show="!isMinimized" class="min-w-0">
          <h2 class="font-bold text-slate-900 text-sm truncate">
            {{ role === 'mentor' ? 'MENTOR PKL' : 'SIMPRAKERIN' }}
          </h2>
          <p class="text-xs text-slate-500 truncate">SMK N 2 Wonogiri</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <!-- Siswa Navigation -->
      <template v-if="role === 'siswa'">
        <!-- Dashboard -->
        <SidebarItem
          to="/siswa"
          icon="i-heroicons-squares-2x2"
          label="Dashboard"
          :active="$route.path === '/siswa'"
          :minimized="isMinimized"
        />

        <!-- Program -->
        <SidebarItem
          to="/siswa/program"
          icon="i-heroicons-briefcase"
          label="Program"
          :active="activeMain === 'program'"
          :minimized="isMinimized"
        />

        <!-- Profile with submenu -->
        <div class="relative">
          <button
            @click="toggleProfile"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="[
              activeMain === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
              isMinimized ? 'justify-center' : ''
            ]"
            :title="isMinimized ? 'Profile' : ''"
          >
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5 shrink-0" />
            <span v-show="!isMinimized" class="flex-1 text-left">Profile</span>
            <UIcon
              v-show="!isMinimized"
              :name="isProfileOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="w-4 h-4 transition-transform"
            />
          </button>

          <!-- Submenu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-show="isProfileOpen && !isMinimized" class="mt-1 ml-4 pl-4 border-l-2 border-slate-200 space-y-1">
              <NuxtLink
                to="/siswa/profile/data-diri"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                :class="activeProfileSub === 'data-diri' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'"
              >
                <UIcon name="i-heroicons-identification" class="w-4 h-4" />
                <span>Data Diri</span>
              </NuxtLink>
              <NuxtLink
                to="/siswa/profile/daftar-program"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                :class="activeProfileSub === 'daftar-program' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'"
              >
                <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4" />
                <span>Daftar Program</span>
              </NuxtLink>
              <NuxtLink
                to="/siswa/profile/document"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                :class="activeProfileSub === 'document' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                <span>Dokumen PKL</span>
              </NuxtLink>
            </div>
          </Transition>

          <!-- Minimized Popup -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div 
              v-if="isMinimized && isProfileOpen" 
              class="absolute left-full top-0 ml-2 w-48 bg-white shadow-lg rounded-xl border border-slate-200 py-2 z-50"
            >
              <p class="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">Profile</p>
              <NuxtLink
                to="/siswa/profile/data-diri"
                @click="isProfileOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                :class="activeProfileSub === 'data-diri' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              >
                Data Diri
              </NuxtLink>
              <NuxtLink
                to="/siswa/profile/daftar-program"
                @click="isProfileOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                :class="activeProfileSub === 'daftar-program' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              >
                Daftar Program
              </NuxtLink>
              <NuxtLink
                to="/siswa/profile/document"
                @click="isProfileOpen = false"
                class="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                :class="activeProfileSub === 'document' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              >
                Dokumen PKL
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- Logbook -->
        <SidebarItem
          to="/siswa/logbook"
          icon="i-heroicons-book-open"
          label="Logbook"
          :active="activeMain === 'logbook'"
          :minimized="isMinimized"
        />
      </template>

      <!-- Mentor Navigation -->
      <template v-else-if="role === 'mentor'">
        <SidebarItem to="/mentor" icon="i-heroicons-squares-2x2" label="Dashboard" :active="$route.path === '/mentor'" :minimized="isMinimized" />
        
        <div v-show="!isMinimized" class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitoring</p>
        </div>
        
        <SidebarItem to="/mentor/penempatan" icon="i-heroicons-map-pin" label="Penempatan Siswa" :active="$route.path.startsWith('/mentor/penempatan')" :minimized="isMinimized" />
        
        <div v-show="!isMinimized" class="pt-4 pb-2">
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Verifikasi</p>
        </div>
        
        <SidebarItem to="/mentor/verifikasi/absensi" icon="i-heroicons-calendar-days" label="Verifikasi Absensi" :active="$route.path.startsWith('/mentor/verifikasi/absensi')" :minimized="isMinimized" />
        <SidebarItem to="/mentor/verifikasi/logbook" icon="i-heroicons-document-text" label="Verifikasi Logbook" :active="$route.path.startsWith('/mentor/verifikasi/logbook')" :minimized="isMinimized" />
        <SidebarItem to="/mentor/penilaian" icon="i-heroicons-star" label="Penilaian" :active="$route.path.startsWith('/mentor/penilaian')" :minimized="isMinimized" />
      </template>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-100 p-3 space-y-2">
      <!-- Toggle Button -->
      <button
        @click="toggleSidebar"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Expand' : 'Collapse'"
      >
        <UIcon :name="isMinimized ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'" class="w-5 h-5" />
        <span v-show="!isMinimized">Collapse</span>
      </button>

      <!-- User Info -->
      <div 
        class="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
        :class="isMinimized ? 'justify-center' : ''"
      >
        <img
          src="https://ui-avatars.com/api/?name=RS&background=3b82f6&color=fff&size=40"
          alt="Profile"
          class="w-9 h-9 rounded-lg shrink-0"
        />
        <div v-show="!isMinimized" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">Ryobi Surya A.</p>
          <p class="text-xs text-slate-500 truncate">XII RPL 1</p>
        </div>
      </div>

      <!-- Logout -->
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        :class="isMinimized ? 'justify-center' : ''"
        :title="isMinimized ? 'Keluar' : ''"
      >
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
        <span v-show="!isMinimized">Keluar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  role?: string
}>(), {
  role: 'siswa'
})

const route = useRoute()
const { isDesktopSidebarMinimized, toggleDesktopSidebar } = useSidebar()

const isMinimized = isDesktopSidebarMinimized
const isProfileOpen = ref(false)

const toggleSidebar = () => toggleDesktopSidebar()
const toggleProfile = () => { isProfileOpen.value = !isProfileOpen.value }

const activeMain = computed(() => {
  const path = route.path
  if (path.startsWith('/siswa/profile')) return 'profile'
  if (path.startsWith('/siswa/program')) return 'program'
  if (path.startsWith('/siswa/logbook')) return 'logbook'
  return ''
})

const activeProfileSub = computed(() => {
  const path = route.path
  if (path.includes('/document')) return 'document'
  if (path.includes('/daftar-program')) return 'daftar-program'
  if (path.includes('/data-diri')) return 'data-diri'
  return ''
})

watch(activeMain, (val) => {
  if (val === 'profile' && !isMinimized.value) isProfileOpen.value = true
}, { immediate: true })

watch(isMinimized, (val) => { if (val) isProfileOpen.value = false })

const logout = () => navigateTo('/login')
</script>
