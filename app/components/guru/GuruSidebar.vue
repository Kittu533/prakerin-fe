<template>
  <aside 
    class="h-full transition-all duration-300 ease-in-out bg-white shadow-xl border-r border-gray-200 lg:min-h-screen"
    :class="[
      isMinimized ? 'w-20' : 'w-80'
    ]"
  >
    <div class="flex h-full flex-col bg-white shadow-xl rounded-xl border-r border-gray-200 lg:min-h-screen overflow-hidden">
      <!-- Header Section -->
      <div class="shrink-0 px-6 py-8">
        <div 
          class="rounded-2xl p-6 transition-all duration-300"
          :class="[
            isMinimized ? 'p-3' : 'p-6'
          ]"
          style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
        >
          <div class="flex items-center" :class="isMinimized ? 'justify-center' : 'gap-4'">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <span class="text-white font-bold text-lg">G</span>
            </div>
            <div v-show="!isMinimized" class="flex-1 min-w-0 transition-all duration-300">
              <h1 class="text-lg font-bold text-white truncate">GURU PKL</h1>
              <p class="text-sm text-blue-100 truncate">Pembimbing & Evaluator</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto px-6 pb-6">
        <nav class="space-y-4">
          <NuxtLink
            to="/guru"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              activeMain === 'dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Dashboard' : ''"
          >
            <UIcon
              name="i-heroicons-chart-pie"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/guru/penempatan"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              activeMain === 'penempatan'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Penempatan' : ''"
          >
            <UIcon
              name="i-heroicons-users"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Penempatan</span>
          </NuxtLink>

          <div class="space-y-3">
            <button
              type="button"
              @click="toggleVerifikasi"
              class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
              :class="[
                activeMain === 'verifikasi'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50',
                isMinimized ? 'justify-center' : 'justify-between'
              ]"
              :title="isMinimized ? 'Verifikasi' : ''"
            >
              <div class="flex items-center" :class="isMinimized ? '' : 'gap-4'">
                <UIcon
                  name="i-heroicons-shield-check"
                  class="w-6 h-6 shrink-0"
                />
                <span v-show="!isMinimized" class="transition-all duration-300">Verifikasi</span>
              </div>
              <UIcon
                v-show="!isMinimized"
                :name="isVerifikasiOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
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
              <div v-show="isVerifikasiOpen && !isMinimized" class="space-y-3 pl-10">
                <button
                  type="button"
                  @click="navigateToVerifikasiAbsensi"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activeVerifikasiSub === 'absensi'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-calendar-days"
                    class="w-5 h-5"
                  />
                  <span>Verifikasi Absensi</span>
                </button>

                <button
                  type="button"
                  @click="navigateToVerifikasiLogbook"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activeVerifikasiSub === 'logbook'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-book-open"
                    class="w-5 h-5"
                  />
                  <span>Verifikasi Logbook</span>
                </button>
              </div>
            </transition>

            <!-- Minimized Verifikasi Menu Popup -->
            <div v-if="isMinimized && isVerifikasiOpen" 
                 class="absolute left-full top-0 ml-2 min-w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
              <button
                type="button"
                @click="navigateToVerifikasiAbsensi"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activeVerifikasiSub === 'absensi'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Verifikasi Absensi
              </button>
              <button
                type="button"
                @click="navigateToVerifikasiLogbook"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activeVerifikasiSub === 'logbook'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Verifikasi Logbook
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <button
              type="button"
              @click="togglePenilaian"
              class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
              :class="[
                activeMain === 'penilaian'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50',
                isMinimized ? 'justify-center' : 'justify-between'
              ]"
              :title="isMinimized ? 'Penilaian' : ''"
            >
              <div class="flex items-center" :class="isMinimized ? '' : 'gap-4'">
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="w-6 h-6 shrink-0"
                />
                <span v-show="!isMinimized" class="transition-all duration-300">Penilaian</span>
              </div>
              <UIcon
                v-show="!isMinimized"
                :name="isPenilaianOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
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
              <div v-show="isPenilaianOpen && !isMinimized" class="space-y-3 pl-10">
                <button
                  type="button"
                  @click="navigateToPenilaian"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activePenilaianSub === 'penilaian'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-star"
                    class="w-5 h-5"
                  />
                  <span>Nilai PKL</span>
                </button>

                <button
                  type="button"
                  @click="navigateToLaporanAkhir"
                  class="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
                  :class="activePenilaianSub === 'laporan-akhir'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-5 h-5"
                  />
                  <span>Laporan Akhir</span>
                </button>
              </div>
            </transition>

            <!-- Minimized Penilaian Menu Popup -->
            <div v-if="isMinimized && isPenilaianOpen" 
                 class="absolute left-full top-0 ml-2 min-w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
              <button
                type="button"
                @click="navigateToPenilaian"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activePenilaianSub === 'penilaian'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Nilai PKL
              </button>
              <button
                type="button"
                @click="navigateToLaporanAkhir"
                class="block w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200"
                :class="activePenilaianSub === 'laporan-akhir'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                Laporan Akhir
              </button>
            </div>
          </div>

          <NuxtLink
            to="/guru/dokumen"
            class="group flex w-full items-center rounded-xl px-4 py-4 text-base font-medium transition-all duration-200"
            :class="[
              activeMain === 'dokumen'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50',
              isMinimized ? 'justify-center' : 'gap-4'
            ]"
            :title="isMinimized ? 'Dokumen' : ''"
          >
            <UIcon
              name="i-heroicons-folder"
              class="w-6 h-6 shrink-0"
            />
            <span v-show="!isMinimized" class="transition-all duration-300">Dokumen PKL</span>
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
const isVerifikasiOpen = ref(false)
const isPenilaianOpen = ref(false)

// Toggle functions
const toggleSidebar = () => {
  toggleDesktopSidebar()
}

const toggleVerifikasi = () => {
  isVerifikasiOpen.value = !isVerifikasiOpen.value
}

const togglePenilaian = () => {
  isPenilaianOpen.value = !isPenilaianOpen.value
}

// Active state computeds
const activeMain = computed(() => {
  const path = route.path
  if (path === '/guru') return 'dashboard'
  if (path.startsWith('/guru/penempatan')) return 'penempatan'
  if (path.startsWith('/guru/verifikasi')) return 'verifikasi'
  if (path.startsWith('/guru/penilaian') || path.startsWith('/guru/laporan-akhir')) return 'penilaian'
  if (path.startsWith('/guru/dokumen')) return 'dokumen'
  return ''
})

const activeVerifikasiSub = computed(() => {
  const path = route.path
  if (path.startsWith('/guru/verifikasi/absensi')) return 'absensi'
  if (path.startsWith('/guru/verifikasi/logbook')) return 'logbook'
  return ''
})

const activePenilaianSub = computed(() => {
  const path = route.path
  if (path.startsWith('/guru/penilaian')) return 'penilaian'
  if (path.startsWith('/guru/laporan-akhir')) return 'laporan-akhir'
  return ''
})

// Watch for route changes to auto-open sections
watch(
  activeMain,
  (val) => {
    if (val === 'verifikasi' && !isMinimized.value) {
      isVerifikasiOpen.value = true
    }
    if (val === 'penilaian' && !isMinimized.value) {
      isPenilaianOpen.value = true
    }
  },
  { immediate: true }
)

// Watch for sidebar minimization to close menus
watch(
  isMinimized,
  (newValue) => {
    if (newValue) {
      isVerifikasiOpen.value = false
      isPenilaianOpen.value = false
    }
  }
)

// Navigation functions
const navigateToVerifikasiAbsensi = () => {
  navigateTo('/guru/verifikasi/absensi')
}

const navigateToVerifikasiLogbook = () => {
  navigateTo('/guru/verifikasi/logbook')
}

const navigateToPenilaian = () => {
  navigateTo('/guru/penilaian')
}

const navigateToLaporanAkhir = () => {
  navigateTo('/guru/laporan-akhir')
}
</script>
