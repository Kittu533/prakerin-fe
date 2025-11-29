<template>
  <aside class="h-full w-64 py-4">
    <div
      class="flex h-full flex-col justify-between rounded-[32px] bg-white px-4 py-6 shadow-sm"
    >
      <!-- MENU ATAS -->
      <nav class="space-y-4">
        <!-- Dashboard -->
        <NuxtLink
          to="/guru"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="isActive('/guru')
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">📊</span>
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Penempatan & Monitoring -->
        <NuxtLink
          to="/guru/penempatan"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="isActive('/guru/penempatan')
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">👥</span>
          <span>Penempatan & Monitoring</span>
        </NuxtLink>

        <!-- Verifikasi -->
        <div class="space-y-2">
          <button
            type="button"
            @click="toggleVerifikasi"
            class="flex w-full items-center justify-between rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
            :class="isVerifikasiSectionActive
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">✅</span>
              <span>Verifikasi</span>
            </div>
            <span class="text-xs">
              {{ isVerifikasiOpen ? '▲' : '▼' }}
            </span>
          </button>

          <div v-show="isVerifikasiOpen" class="space-y-2">
            <!-- Verifikasi Absensi -->
            <NuxtLink
              to="/guru/verifikasi/absensi"
              class="block w-full rounded-[999px] border pr-4 py-2 text-left text-sm font-medium transition"
              :class="[
                'pl-7',
                isActive('/guru/verifikasi/absensi')
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Absensi PKL
            </NuxtLink>

            <!-- Verifikasi Logbook -->
            <NuxtLink
              to="/guru/verifikasi/logbook"
              class="block w-full rounded-[999px] border pr-4 py-2 text-left text-sm font-medium transition"
              :class="[
                'pl-7',
                isActive('/guru/verifikasi/logbook')
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Logbook PKL
            </NuxtLink>
          </div>
        </div>

        <!-- Penilaian & Laporan -->
        <div class="space-y-2">
          <button
            type="button"
            @click="togglePenilaian"
            class="flex w-full items-center justify-between rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
            :class="isPenilaianSectionActive
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">📑</span>
              <span>Penilaian & Laporan</span>
            </div>
            <span class="text-xs">
              {{ isPenilaianOpen ? '▲' : '▼' }}
            </span>
          </button>

          <div v-show="isPenilaianOpen" class="space-y-2">
            <!-- Penilaian PKL -->
            <NuxtLink
              to="/guru/penilaian"
              class="block w-full rounded-[999px] border pr-4 py-2 text-left text-sm font-medium transition"
              :class="[
                'pl-7',
                isActive('/guru/penilaian')
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Penilaian PKL
            </NuxtLink>

            <!-- Laporan Akhir PKL -->
            <NuxtLink
              to="/guru/laporan-akhir"
              class="block w-full rounded-[999px] border pr-4 py-2 text-left text-sm font-medium transition"
              :class="[
                'pl-7',
                isActive('/guru/laporan-akhir')
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
              ]"
            >
              Laporan Akhir
            </NuxtLink>
          </div>
        </div>

        <!-- Dokumen PKL Siswa -->
        <NuxtLink
          to="/guru/dokumen"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="isActive('/guru/dokumen')
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">📂</span>
          <span>Dokumen PKL</span>
        </NuxtLink>

        <!-- Notifikasi -->
        <NuxtLink
          to="/guru/notifikasi"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="isActive('/guru/notifikasi')
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">🔔</span>
          <span>Notifikasi</span>
        </NuxtLink>

        <!-- Agenda Monitoring -->
        <NuxtLink
          to="/guru/agenda"
          class="flex w-full items-center gap-2 rounded-[999px] border px-4 py-2 text-sm font-semibold transition"
          :class="isActive('/guru/agenda')
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-blue-400 bg-white text-blue-500 hover:bg-blue-50'"
        >
          <span class="text-lg">📅</span>
          <span>Agenda Monitoring</span>
        </NuxtLink>
      </nav>

      <!-- PROFIL BAWAH -->
      <div class="flex items-center justify-between rounded-full px-3 py-2">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white"
          >
            {{ initials }}
          </div>
          <div class="leading-tight">
            <p class="text-xs font-semibold text-slate-700">
              {{ userName }}
            </p>
            <p class="text-[11px] text-slate-500">
              {{ userRole }}
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#app'

const props = defineProps<{
  userName: string
  userRole: string
}>()

const route = useRoute()

// helper: cek aktif berdasarkan prefix path
const isActive = (basePath: string) => {
  if (basePath === '/guru') {
    return route.path === '/guru'
  }
  return route.path.startsWith(basePath)
}

/* ---------- STATE COLLAPSE SECTION ---------- */

const isVerifikasiOpen = ref(false)
const isPenilaianOpen = ref(false)

const isVerifikasiSectionActive = computed(() =>
  route.path.startsWith('/guru/verifikasi')
)

const isPenilaianSectionActive = computed(() =>
  route.path.startsWith('/guru/penilaian') ||
  route.path.startsWith('/guru/laporan-akhir')
)

// otomatis buka section sesuai route
watch(
  () => route.path,
  (path) => {
    isVerifikasiOpen.value = path.startsWith('/guru/verifikasi')
    isPenilaianOpen.value =
      path.startsWith('/guru/penilaian') ||
      path.startsWith('/guru/laporan-akhir')
  },
  { immediate: true }
)

const toggleVerifikasi = () => {
  isVerifikasiOpen.value = !isVerifikasiOpen.value
}

const togglePenilaian = () => {
  isPenilaianOpen.value = !isPenilaianOpen.value
}

/* ---------- INITIALS UNTUK AVATAR ---------- */

const initials = computed(() => {
  if (!props.userName) return 'GU'
  const parts = props.userName.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
})
</script>
