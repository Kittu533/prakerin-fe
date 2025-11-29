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
            class="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300"
            :class="isMinimized ? 'w-8 h-8' : 'w-16 h-16'"
          >
            <span 
              class="text-white font-bold transition-all duration-300"
              :class="isMinimized ? 'text-sm' : 'text-2xl'"
            >
              S
            </span>
          </div>
          <div v-show="!isMinimized" class="transition-all duration-300">
            <h2 class="font-bold text-gray-900 text-lg">SIMPRAKERIN</h2>
            <p class="text-sm text-gray-500 mt-2">SMK N 2 Wonogiri</p>
          </div>
        </div>
      </div>

      <!-- Navigation Section -->
      <div class="flex-1 overflow-y-auto px-6">

        <nav class="space-y-4">
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

      <div class="shrink-0 px-6 py-6 border-t border-gray-200">
        <div class="rounded-2xl bg-gray-50" :class="isMinimized ? 'p-3' : 'p-6'">
          <button
            class="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            :class="[
              isMinimized ? 'justify-center' : 'justify-between'
            ]"
            :title="isMinimized ? 'Keluar' : ''"
          >
            <span v-show="!isMinimized" class="transition-all duration-300">Keluar</span>
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

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
