<template>
  <aside class="w-64">
    <div
      class="mt-6 flex h-[calc(100vh-6.5rem)] flex-col justify-between rounded-[32px] bg-white px-4 py-6 shadow-sm"
    >
      <!-- MENU ATAS -->
      <nav class="space-y-3">
        <!-- Program -->
        <NuxtLink
          to="/siswa/program"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="activeMain === 'program'
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">🏢</span>
          <span>Program</span>
        </NuxtLink>

        <!-- Profile + dropdown -->
        <div class="space-y-2">
          <button
            type="button"
            @click="toggleProfile"
            class="flex w-full items-center justify-between rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
            :class="activeMain === 'profile'
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">👤</span>
              <span>Profile</span>
            </div>
            <span class="text-xs">
              {{ isProfileOpen ? '▲' : '▼' }}
            </span>
          </button>

          <!-- submenu Profile -->
          <div v-show="isProfileOpen" class="space-y-2">
            <!-- Data Diri -->
            <button
              type="button"
              @click="navigateToDataDiri"
              class="block w-full rounded-[999px] border pr-4 py-2 text-sm font-medium transition text-left"
              :class="[
                'pl-7',               // indent kiri, tapi tinggi sama
                activeProfileSub === 'data-diri'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Data Diri
            </button>

            <!-- Daftar Program Anda -->
            <button
              type="button"
              @click="navigateToDaftarProgram"
              class="block w-full rounded-[999px] border pr-4 py-2 text-sm font-medium transition text-left"
              :class="[
                'pl-7',
                activeProfileSub === 'daftar-program'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Daftar Program Anda
            </button>
          </div>
        </div>

        <!-- Logbook -->
        <NuxtLink
          to="/siswa/logbook"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="activeMain === 'logbook'
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">📒</span>
          <span>Logbook</span>
        </NuxtLink>
      </nav>

      <!-- PROFIL BAWAH -->
      <div class="flex items-center justify-between rounded-full px-3 py-2">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white"
          >
            RS
          </div>
          <div class="leading-tight">
            <p class="text-xs font-semibold text-slate-700">
              Ryobi Surya Atmaja
            </p>
            <p class="text-[11px] text-slate-500">
              XII TM A
            </p>
          </div>
        </div>

        <button class="text-xs text-slate-400">
          ▼
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const route = useRoute()

// menu utama aktif
const activeMain = computed(() => {
  const path = route.path
  if (path.startsWith('/siswa/profile')) return 'profile'
  if (path.startsWith('/siswa/program')) return 'program'
  if (path.startsWith('/siswa/logbook')) return 'logbook'
  // home atau path lain: tidak ada yang aktif
  return ''
})

// sub menu profile aktif
const activeProfileSub = computed(() => {
  const path = route.path
  if (path === '/siswa/profile/daftar-program') return 'daftar-program'
  if (path === '/siswa/profile/data-diri') return 'data-diri'
  // kalau di /siswa/profile saja, anggap Data Diri
  if (path.startsWith('/siswa/profile')) return 'data-diri'
  return ''
})

const isProfileOpen = ref(false)

// otomatis buka dropdown kalau lagi di halaman profile
watch(
  activeMain,
  (val) => {
    if (val === 'profile') {
      isProfileOpen.value = true
    } else {
      isProfileOpen.value = false
    }
  },
  { immediate: true }
)

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}

const navigateToDataDiri = async () => {
  const targetPath = '/siswa/profile/data-diri'
  console.log('🔍 Navigation Debug (Data Diri):')
  console.log('  Target Path:', targetPath)
  console.log('  Current Path:', route.path)
  console.log('  Active Main:', activeMain.value)
  console.log('  Active Profile Sub:', activeProfileSub.value)
  console.log('  Profile Open:', isProfileOpen.value)
  
  try {
    console.log('🚀 Attempting navigation...')
    await navigateTo(targetPath)
    console.log('✅ Navigation successful!')
  } catch (error) {
    console.error('❌ Navigation failed:', error)
  }
}

const navigateToDaftarProgram = async () => {
  const targetPath = '/siswa/profile/daftar-program'
  console.log('🔍 Navigation Debug (Daftar Program):')
  console.log('  Target Path:', targetPath)
  console.log('  Current Path:', route.path)
  
  try {
    console.log('🚀 Attempting navigation...')
    await navigateTo(targetPath)
    console.log('✅ Navigation successful!')
  } catch (error) {
    console.error('❌ Navigation failed:', error)
  }
}
</script>
