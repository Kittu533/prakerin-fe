

<template>
  <div>
    <!-- Tombol utama -->
    <UButton
      color="primary"
      icon="i-lucide-camera"
      size="sm"
      @click="openModal"
    >
      Absen Sekarang
    </UButton>

    <!-- Canvas buat capture (disembunyikan) -->
    <canvas ref="canvasRef" class="hidden" />

    <!-- Modal absensi -->
    <UModal 
      v-model:open="isOpen" 
      title="Absensi Kehadiran" 
      :ui="{ 
        width: 'max-w-4xl',
        container: 'p-8',
        header: 'px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50',
        body: 'px-8 py-8',
        footer: 'px-8 py-6 border-t border-gray-200 bg-gray-50'
      }"
    >
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-camera" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Absensi Kehadiran</h3>
            <p class="text-sm text-gray-600">Lakukan absensi dengan mengambil foto selfie</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-8">
          <!-- Alert Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 class="text-sm font-medium text-blue-900 mb-1">Panduan Absensi</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                  <li>• Pastikan wajah terlihat jelas dan pencahayaan cukup</li>
                  <li>• Anda harus berada di lokasi magang yang terdaftar</li>
                  <li>• Sistem akan merekam lokasi GPS untuk verifikasi</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="grid gap-8 lg:grid-cols-2">
            <!-- Live kamera -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-medium text-gray-900">Kamera (Live Preview)</h4>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span class="text-xs text-gray-500">LIVE</span>
                </div>
              </div>
              
              <div class="relative aspect-video overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-900 shadow-lg">
                <video
                  ref="videoRef"
                  autoplay
                  playsinline
                  muted
                  class="h-full w-full object-cover"
                />
                <div class="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl pointer-events-none"></div>
              </div>
              
              <UButton
                type="button"
                color="primary"
                size="lg"
                block
                :loading="isStartingCamera"
                class="font-medium"
                @click="takeSnapshot"
              >
                <UIcon name="i-lucide-camera" class="w-4 h-4 mr-2" />
                Ambil Foto Sekarang
              </UButton>
            </div>

            <!-- Preview hasil foto -->
            <div class="space-y-4">
              <h4 class="text-base font-medium text-gray-900">Hasil Foto</h4>
              
              <div class="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 shadow-inner">
                <img
                  v-if="snapshotDataUrl"
                  :src="snapshotDataUrl"
                  alt="Hasil foto absensi"
                  class="h-full w-full object-cover rounded-xl"
                >
                <div
                  v-else
                  class="flex items-center justify-center h-full"
                >
                  <div class="text-center">
                    <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p class="text-sm text-gray-500 font-medium">Belum ada foto</p>
                    <p class="text-xs text-gray-400">Tekan tombol "Ambil Foto" untuk memulai</p>
                  </div>
                </div>
                
                <!-- Success overlay when photo taken -->
                <div 
                  v-if="snapshotDataUrl" 
                  class="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                >
                  <UIcon name="i-heroicons-check" class="w-3 h-3" />
                  <span>Foto Siap</span>
                </div>
              </div>
              
              <div v-if="snapshotDataUrl" class="space-y-3">
                <UButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="lg"
                  block
                  class="font-medium"
                  @click="takeSnapshot"
                >
                  <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4 mr-2" />
                  Ambil Ulang Foto
                </UButton>
              </div>
            </div>
          </div>

          <!-- Footer info -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-gray-500 mt-0.5" />
              <div class="text-sm text-gray-600">
                <p class="font-medium mb-1">Keamanan & Privasi</p>
                <p>Sistem akan menyimpan koordinat lokasi dan foto Anda untuk keperluan verifikasi kehadiran oleh pembimbing. Data ini akan dijaga kerahasiaannya sesuai kebijakan privasi.</p>
              </div>
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="flex items-start space-x-3">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 class="text-sm font-medium text-red-900 mb-1">Terjadi Kesalahan</h4>
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex items-center justify-between w-full">
          <UButton
            type="button"
            variant="ghost"
            color="neutral"
            size="lg"
            @click="close"
          >
            Batal
          </UButton>
          
          <UButton
            type="button"
            color="primary"
            size="lg"
            :loading="isSubmitting"
            :disabled="!snapshotDataUrl"
            class="px-8 font-medium"
            @click="submitAbsensi"
          >
            <UIcon name="i-lucide-send" class="w-4 h-4 mr-2" />
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Absensi' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

interface AttendanceRecord {
  id: string
  date: string
  checkInTime: string
  photo: string
  location: { lat: number; lng: number } | null
  status: 'pending' | 'approved' | 'rejected'
}

const emit = defineEmits<{
  (e: 'success', data: AttendanceRecord): void
}>()

const isOpen = ref(false)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const snapshotDataUrl = ref<string | null>(null)

const isStartingCamera = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Attendance validation state
const attendanceStore = useState<AttendanceRecord[]>('attendance-records', () => [])

const checkTodayAttendance = () => {
  const today = new Date().toISOString().split('T')[0]
  return attendanceStore.value.find(record => record.date === today)
}

const canAddLogbook = () => {
  const todayAttendance = checkTodayAttendance()
  return todayAttendance && todayAttendance.status === 'approved'
}

const openModal = () => {
  isOpen.value = true
}

const startCamera = async () => {
  if (!process.client) return
  if (stream.value || isStartingCamera.value) return

  if (!navigator.mediaDevices?.getUserMedia) {
    errorMessage.value = 'Browser tidak mendukung akses kamera.'
    return
  }

  isStartingCamera.value = true
  errorMessage.value = null

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })
    stream.value = mediaStream

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
    }
  } catch (err) {
    console.error('Gagal mengakses kamera', err)
    errorMessage.value = 'Gagal mengakses kamera. Pastikan izin sudah diberikan.'
  } finally {
    isStartingCamera.value = false
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

watch(isOpen, (open) => {
  if (open) {
    snapshotDataUrl.value = null
    startCamera()
  } else {
    stopCamera()
  }
})

onBeforeUnmount(() => {
  stopCamera()
})

const takeSnapshot = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value

  const w = video.videoWidth || 640
  const h = video.videoHeight || 480

  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0, w, h)
  snapshotDataUrl.value = canvas.toDataURL('image/jpeg', 0.9)
}

// ambil lokasi (location based service)
const captureLocation = () =>
  new Promise<{ lat: number | null; lng: number | null }>((resolve) => {
    if (!process.client || !('geolocation' in navigator)) {
      resolve({ lat: null, lng: null })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })

const submitAbsensi = async () => {
  if (!snapshotDataUrl.value) {
    errorMessage.value = 'Ambil foto terlebih dahulu sebelum mengirim absensi.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const { lat, lng } = await captureLocation()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const timeNow = now.toTimeString().split(' ')[0].substring(0, 5)

    // Check if already attended today
    const existingAttendance = checkTodayAttendance()
    if (existingAttendance) {
      errorMessage.value = 'Anda sudah melakukan absensi hari ini.'
      return
    }

    const attendanceRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: today,
      checkInTime: timeNow,
      photo: snapshotDataUrl.value,
      location: lat && lng ? { lat, lng } : null,
      status: 'pending'
    }

    // Save to store
    attendanceStore.value.unshift(attendanceRecord)

    const payload = {
      image: snapshotDataUrl.value, // base64 foto
      latitude: lat,
      longitude: lng,
      takenAt: now.toISOString()
    }

    // TODO: kirim ke backend kamu di sini
    // await $fetch('/api/absensi', { method: 'POST', body: payload })

    const toast = typeof useToast === 'function' ? useToast() : null
    toast?.add({
      title: 'Absensi berhasil',
      description: `Absensi ${timeNow} telah terkirim dan menunggu verifikasi pembimbing.`,
      color: 'green'
    })

    emit('success', attendanceRecord)
    isOpen.value = false
  } catch (err) {
    console.error('Gagal submit absensi', err)
    errorMessage.value = 'Terjadi kesalahan saat mengirim absensi. Silakan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}

// Export validation functions for use in parent components
defineExpose({
  checkTodayAttendance,
  canAddLogbook
})
</script>