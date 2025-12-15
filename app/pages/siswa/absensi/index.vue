<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Absensi PKL</h1>
      <p class="text-sm text-slate-500 mt-1">{{ currentDate }}</p>
    </div>

    <!-- Map Card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <ClientOnly>
        <LMap
          ref="map"
          :zoom="17"
          :center="userCoords || officeCoords"
          :use-global-leaflet="false"
          class="h-48 lg:h-64 w-full z-0"
        >
          <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <!-- Office marker & radius -->
          <LCircle :lat-lng="officeCoords" :radius="validRadius" color="#0ea5e9" :fill-opacity="0.15" />
          <LMarker :lat-lng="officeCoords">
            <LIcon :icon-url="officeIcon" :icon-size="[32, 32]" :icon-anchor="[16, 32]" />
          </LMarker>
          <!-- User marker -->
          <LMarker v-if="userCoords" :lat-lng="userCoords">
            <LIcon :icon-url="userIcon" :icon-size="[32, 32]" :icon-anchor="[16, 32]" />
          </LMarker>
        </LMap>
        <template #fallback>
          <div class="h-48 lg:h-64 bg-slate-100 flex items-center justify-center">
            <Icon name="lucide:map" class="w-8 h-8 text-slate-300" />
          </div>
        </template>
      </ClientOnly>

      <!-- Status & Action -->
      <div class="p-5">
        <!-- Location Status Alert -->
        <UAlert
          :color="isInRange ? 'success' : 'error'"
          :icon="isInRange ? 'lucide:check-circle' : 'lucide:alert-circle'"
          :title="isInRange ? `Posisi Valid (${Math.round(distance)}m)` : `Terlalu Jauh (${Math.round(distance)}m)`"
          :description="isInRange ? 'Kamu berada dalam radius lokasi PKL' : `Jarak minimal ${validRadius}m dari lokasi PKL`"
          class="mb-4"
        />

        <!-- Today Status -->
        <div v-if="todayAttendance" class="text-center mb-4">
          <div class="w-16 h-16 rounded-full mx-auto mb-3 bg-green-100 flex items-center justify-center">
            <Icon name="lucide:check-circle" class="w-8 h-8 text-green-600" />
          </div>
          <p class="font-semibold text-green-600">Sudah Absen Hari Ini</p>
          <p class="text-sm text-slate-500 mt-1">Masuk: {{ todayAttendance.checkIn }}</p>
          <p v-if="todayAttendance.checkOut" class="text-sm text-slate-500">Pulang: {{ todayAttendance.checkOut }}</p>
        </div>

        <!-- Action Button -->
        <UButton
          v-if="!todayAttendance"
          color="primary"
          size="xl"
          block
          :disabled="!isInRange || geoLoading"
          :loading="submitting"
          @click="handleCheckIn"
        >
          <Icon name="lucide:map-pin" class="w-5 h-5 mr-2" />
          Absen Masuk
        </UButton>

        <UButton
          v-else-if="!todayAttendance.checkOut && canCheckOut"
          color="primary"
          size="xl"
          block
          :disabled="!isInRange"
          :loading="submitting"
          @click="handleCheckOut"
        >
          <Icon name="lucide:log-out" class="w-5 h-5 mr-2" />
          Absen Pulang
        </UButton>

        <UButton v-else-if="todayAttendance.checkOut" color="neutral" size="xl" block disabled>
          <Icon name="lucide:check" class="w-5 h-5 mr-2" />
          Sudah Absen Lengkap
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-green-600">{{ stats.hadir }}</p>
        <p class="text-xs text-slate-500">Hadir</p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-amber-600">{{ stats.izin }}</p>
        <p class="text-xs text-slate-500">Izin</p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-red-600">{{ stats.alpha }}</p>
        <p class="text-xs text-slate-500">Alpha</p>
      </div>
    </div>

    <!-- History -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-900">Riwayat Absensi</h2>
      </div>
      <div v-if="historyLoading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-lg" />
      </div>
      <div v-else class="divide-y divide-slate-100">
        <div v-for="item in history" :key="item.id" class="px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getStatusBg(item.status)">
              <Icon :name="getStatusIcon(item.status)" class="w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ item.tanggal }}</p>
              <p class="text-xs text-slate-500">{{ item.checkIn }} - {{ item.checkOut || '-' }}</p>
            </div>
          </div>
          <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LCircle, LIcon } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

definePageMeta({ layout: 'siswa' })

const toast = useToast()
const { coords, error: geoError, resume } = useGeolocation({ enableHighAccuracy: true })

// Office location (mock - should come from API)
const officeCoords: [number, number] = [-6.2088, 106.8456]
const validRadius = 100

// Icons
const officeIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
const userIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'

// State
const submitting = ref(false)
const historyLoading = ref(true)
const todayAttendance = ref<{ checkIn: string; checkOut: string | null } | null>(null)
const stats = reactive({ hadir: 0, izin: 0, alpha: 0 })
const history = ref<any[]>([])

// Computed
const geoLoading = computed(() => coords.value.latitude === Infinity)
const userCoords = computed<[number, number] | null>(() => {
  if (coords.value.latitude === Infinity) return null
  return [coords.value.latitude, coords.value.longitude]
})

const distance = computed(() => {
  if (!userCoords.value) return 9999
  return calculateDistance(userCoords.value, officeCoords)
})

const isInRange = computed(() => distance.value <= validRadius)
const canCheckOut = computed(() => new Date().getHours() >= 15) // After 3 PM

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

// Haversine formula
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371e3
  const φ1 = (coord1[0] * Math.PI) / 180
  const φ2 = (coord2[0] * Math.PI) / 180
  const Δφ = ((coord2[0] - coord1[0]) * Math.PI) / 180
  const Δλ = ((coord2[1] - coord1[1]) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function handleCheckIn() {
  if (!userCoords.value) return
  submitting.value = true
  
  // API payload
  const payload = {
    latitude: userCoords.value[0],
    longitude: userCoords.value[1],
    type: 'check_in',
    device_time: new Date().toISOString()
  }
  console.log('POST /api/attendance', payload)
  
  await new Promise(r => setTimeout(r, 1500))
  todayAttendance.value = {
    checkIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    checkOut: null
  }
  submitting.value = false
  toast.add({ title: 'Absen masuk berhasil!', color: 'success' })
}

async function handleCheckOut() {
  if (!userCoords.value) return
  submitting.value = true
  
  const payload = {
    latitude: userCoords.value[0],
    longitude: userCoords.value[1],
    type: 'check_out',
    device_time: new Date().toISOString()
  }
  console.log('POST /api/attendance', payload)
  
  await new Promise(r => setTimeout(r, 1500))
  if (todayAttendance.value) {
    todayAttendance.value.checkOut = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  submitting.value = false
  toast.add({ title: 'Absen pulang berhasil!', color: 'success' })
}

const getStatusColor = (status: string) => ({ Hadir: 'success', Izin: 'warning', Alpha: 'error' })[status] || 'neutral'
const getStatusBg = (status: string) => ({ Hadir: 'bg-green-100 text-green-600', Izin: 'bg-amber-100 text-amber-600', Alpha: 'bg-red-100 text-red-600' })[status] || 'bg-slate-100'
const getStatusIcon = (status: string) => ({ Hadir: 'lucide:check', Izin: 'lucide:clock', Alpha: 'lucide:x' })[status] || 'lucide:minus'

onMounted(async () => {
  resume()
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { hadir: 78, izin: 5, alpha: 2 })
  history.value = [
    { id: 1, tanggal: 'Senin, 15 Des 2024', checkIn: '07:45', checkOut: '16:30', status: 'Hadir' },
    { id: 2, tanggal: 'Jumat, 13 Des 2024', checkIn: '07:30', checkOut: '16:00', status: 'Hadir' },
    { id: 3, tanggal: 'Kamis, 12 Des 2024', checkIn: '-', checkOut: '-', status: 'Izin' },
    { id: 4, tanggal: 'Rabu, 11 Des 2024', checkIn: '08:00', checkOut: '16:15', status: 'Hadir' },
    { id: 5, tanggal: 'Selasa, 10 Des 2024', checkIn: '07:50', checkOut: '16:30', status: 'Hadir' }
  ]
  historyLoading.value = false
})

useHead({ title: 'Absensi | Siswa PKL' })
</script>
