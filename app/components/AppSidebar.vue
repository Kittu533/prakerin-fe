<template>
  <aside 
    class="h-full bg-[#f5f5f5] lg:min-h-screen transition-all duration-300 ease-in-out relative"
    :class="isMinimized ? 'w-16' : 'w-80'"
  >
    <div class="flex h-full flex-col bg-white shadow-xl rounded-xl border-r border-gray-200 lg:min-h-screen overflow-hidden">
      <!-- Header Section -->
      <div class="flex-shrink-0 px-6 py-8">
        <div 
          class="text-center pb-6 border-b border-gray-200 transition-all duration-300"
          :class="isMinimized ? 'mb-2' : 'mb-6'"
        >
          <div 
            class="bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300"
            :class="[
              isMinimized ? 'w-8 h-8' : 'w-16 h-16',
              role === 'mentor' ? 'from-blue-400 to-indigo-500' : 'from-emerald-400 to-teal-500'
            ]"
          >
            <span 
              class="text-white font-bold transition-all duration-300"
              :class="isMinimized ? 'text-sm' : 'text-2xl'"
            >
              {{ role === 'mentor' ? 'M' : 'S' }}
            </span>
          </div>
          <div v-show="!isMinimized" class="transition-all duration-300">
            <h2 class="font-bold text-gray-900 text-lg">
              {{ role === 'mentor' ? 'MENTOR PKL' : 'SIMPRAKERIN' }}
            </h2>
            <p class="text-sm text-gray-500 mt-2">SMK N 2 Wonogiri</p>
          </div>
        </div>
      </div>

      <!-- Navigation Section -->
      <div class="flex-1 overflow-y-auto px-6">
        <!-- Mentor Navigation -->
        <nav v-if="role === 'mentor'" class="space-y-4">
          <!-- Dashboard -->
          <NuxtLink
            to="/mentor"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path === '/mentor' 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Dashboard' : ''"
          >
            <UIcon
              name="i-heroicons-squares-2x2"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Dashboard</span>
          </NuxtLink>

          <!-- Monitoring Section Label -->
          <div v-show="!isMinimized" class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Monitoring
            </p>
          </div>

          <!-- Penempatan Siswa -->
          <NuxtLink
            to="/mentor/penempatan"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path.startsWith('/mentor/penempatan') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Penempatan Siswa' : ''"
          >
            <UIcon
              name="i-heroicons-map-pin"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Penempatan Siswa</span>
          </NuxtLink>

          <!-- Verifikasi Section Label -->
          <div v-show="!isMinimized" class="pt-4 pb-2">
            <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Verifikasi
            </p>
          </div>

          <!-- Verifikasi Absensi -->
          <NuxtLink
            to="/mentor/verifikasi/absensi"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path.startsWith('/mentor/verifikasi/absensi') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Verifikasi Absensi' : ''"
          >
            <UIcon
              name="i-heroicons-calendar-days"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Verifikasi Absensi</span>
          </NuxtLink>

          <!-- Verifikasi Logbook -->
          <NuxtLink
            to="/mentor/verifikasi/logbook"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path.startsWith('/mentor/verifikasi/logbook') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Verifikasi Logbook' : ''"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Verifikasi Logbook</span>
          </NuxtLink>

          <!-- Penilaian -->
          <NuxtLink
            to="/mentor/penilaian"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path.startsWith('/mentor/penilaian') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Penilaian' : ''"
          >
            <UIcon
              name="i-heroicons-star"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Penilaian</span>
          </NuxtLink>

          <!-- Logbook Menu -->
          <NuxtLink
            to="/mentor/logbook"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              $route.path.startsWith('/mentor/logbook') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Logbook' : ''"
          >
            <UIcon
              name="i-heroicons-book-open"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Logbook</span>
          </NuxtLink>
        </nav>

        <!-- Siswa Navigation -->
        <nav v-else class="space-y-4">
          <NuxtLink
            to="/siswa/program"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              activeMain === 'program'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Program' : ''"
          >
            <UIcon
              name="i-heroicons-briefcase"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Program</span>
          </NuxtLink>

          <div class="space-y-3">
            <button
              type="button"
              @click="toggleProfile"
              class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
              :class="[
                activeMain === 'profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50',
                isMinimized ? 'justify-center' : 'justify-between'
              ]"
              :title="isMinimized ? 'Profile' : ''"
            >
              <div class="flex items-center" :class="isMinimized ? '' : 'gap-4'">
                <UIcon
                  name="i-heroicons-user-circle"
                  class="w-6 h-6 shrink-0"
                />
                <span v-show="!isMinimized" class="transition-all duration-300">Profile</span>
              </div>
              <UIcon
                v-show="!isMinimized"
                :name="isProfileOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-5 h-5 transition-transform duration-200"
              />
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-show="isProfileOpen && !isMinimized" class="space-y-3 pl-10">
                <button
                  type="button"
                  @click="navigateToDataDiri"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activeProfileSub === 'data-diri'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-identification"
                    class="w-5 h-5"
                  />
                  <span>Data Diri</span>
                </button>

                <button
                  type="button"
                  @click="navigateToDaftarProgram"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activeProfileSub === 'daftar-program'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-clipboard-document-list"
                    class="w-5 h-5"
                  />
                  <span>Daftar Program</span>
                </button>

                <button
                  type="button"
                  @click="navigateToDokumen"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activeProfileSub === 'document'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-5 h-5"
                  />
                  <span>Dokumen PKL</span>
                </button>
              </div>
            </transition>

            <!-- Minimized Profile Menu Popup -->
            <div v-if="isMinimized && isProfileOpen" 
                 class="absolute left-full top-0 ml-2 min-w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
              <button
                type="button"
                @click="navigateToDataDiri"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activeProfileSub === 'data-diri'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Data Diri
              </button>
              <button
                type="button"
                @click="navigateToDaftarProgram"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activeProfileSub === 'daftar-program'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Daftar Program
              </button>
              <button
                type="button"
                @click="navigateToDokumen"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activeProfileSub === 'document'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Dokumen PKL
              </button>
            </div>
          </div>

          <NuxtLink
            to="/siswa/logbook"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              activeMain === 'logbook'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Logbook' : ''"
          >
            <UIcon
              name="i-heroicons-book-open"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Logbook</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Footer Section -->
      <div class="flex-shrink-0 border-t border-gray-200">
        <!-- Minimize Toggle Button (only for non-mentor roles) -->
        <div v-if="role !== 'mentor'" class="px-6 py-4 border-b border-gray-200">
          <button
            @click="toggleSidebar"
            class="group flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            :class="isMinimized ? 'justify-center' : 'gap-4'"
            :title="isMinimized ? (isMinimized ? 'Expand' : 'Collapse') : ''"
          >
            <UIcon
              :name="isMinimized ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
              class="w-5 h-5 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">
              {{ isMinimized ? 'Expand' : 'Collapse' }}
            </span>
          </button>
        </div>

        <!-- User Info (only for non-mentor roles) -->
        <div v-if="role !== 'mentor'" class="px-6 py-4">
          <div class="flex items-center" :class="isMinimized ? 'justify-center' : 'gap-4'">
            <img
              :src="`https://ui-avatars.com/api/?name=Siswa&background=10b981&color=fff`"
              alt="Profile"
              class="h-10 w-10 rounded-xl"
            />
            <div v-show="!isMinimized" class="flex-1 transition-all duration-300">
              <p class="text-sm font-semibold text-gray-900">Ryobi Surya Atmaja</p>
              <p class="text-xs text-gray-500">XII TM A</p>
            </div>
          </div>
        </div>

        <!-- Logout -->
        <div class="px-6 py-4">
          <button
            @click="logout"
            class="group flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
            :class="isMinimized ? 'justify-center' : 'justify-between'"
            :title="isMinimized ? 'Keluar' : ''"
          >
            <div class="flex items-center" :class="isMinimized ? '' : 'gap-4'">
              <UIcon
                name="i-heroicons-arrow-right-on-rectangle"
                class="w-5 h-5"
              />
              <span v-show="!isMinimized" class="transition-all duration-300">Keluar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  isMinimized?: boolean
  role?: string
}

const props = withDefaults(defineProps<Props>(), {
  isMinimized: false,
  role: 'siswa'
})

defineEmits(['toggle-minimize'])

const route = useRoute()

// Use shared sidebar state
const {
  isDesktopSidebarMinimized,
  isDesktop,
  toggleDesktopSidebar,
} = useSidebar()

// Use the shared state instead of local state
const isMinimized = isDesktopSidebarMinimized
const isProfileOpen = ref(false)

// Toggle functions
const toggleSidebar = () => {
  toggleDesktopSidebar()
}

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

// Active state computeds
const activeMain = computed(() => {
  const path = route.path
  if (path.startsWith('/siswa/profile')) return 'profile'
  if (path.startsWith('/siswa/program')) return 'program'
  if (path.startsWith('/siswa/logbook')) return 'logbook'
  return ''
})

const activeProfileSub = computed(() => {
  const path = route.path
  if (path.startsWith('/siswa/profile/document')) return 'document'
  if (path.startsWith('/siswa/profile/daftar-program')) return 'daftar-program'
  if (path.startsWith('/siswa/profile/data-diri')) return 'data-diri'
  if (path === '/siswa/profile') return 'data-diri'
  return ''
})

// Watch for profile route changes
watch(
  activeMain,
  (val) => {
    if (val === 'profile' && !isMinimized.value) {
      isProfileOpen.value = true
    }
  },
  { immediate: true }
)

// Watch for sidebar minimization to close profile menu
watch(
  isMinimized,
  (newValue) => {
    if (newValue) {
      isProfileOpen.value = false
    }
  }
)

// Navigation functions
const navigateToDataDiri = () => {
  navigateTo('/siswa/profile/data-diri')
}

const navigateToDaftarProgram = () => {
  navigateTo('/siswa/profile/daftar-program')
}

const navigateToDokumen = () => {
  navigateTo('/siswa/profile/document')
}

const logout = () => {
  // Handle logout logic here
  navigateTo('/login')
}

// Debug scroll behavior
onMounted(() => {
  console.log('Sidebar mounted, checking sidebar scroll...')
  setTimeout(() => {
    const sidebarElement = document.querySelector('aside')
    const sidebarContent = document.querySelector('.overflow-y-auto')
    
    if (sidebarElement) {
      console.log('Sidebar element:')
      console.log('- ScrollHeight:', sidebarElement.scrollHeight)
      console.log('- ClientHeight:', sidebarElement.clientHeight)
      console.log('- OverflowY:', getComputedStyle(sidebarElement).overflowY)
    }
    
    if (sidebarContent) {
      console.log('Sidebar content area:')
      console.log('- ScrollHeight:', sidebarContent.scrollHeight)
      console.log('- ClientHeight:', sidebarContent.clientHeight)
      console.log('- OverflowY:', getComputedStyle(sidebarContent).overflowY)
    }
  }, 100)
})
</script>
