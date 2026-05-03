<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Flow Harian Siswa</h1>
      <p class="text-sm text-slate-500 mt-1">
        Ikuti urutan: absensi lokasi, isi logbook, lalu upload selfie verifikasi.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        class="rounded-xl border p-3 text-left transition-colors"
        :class="activeTab === 'absensi' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'"
        @click="activeTab = 'absensi'"
      >
        <p class="text-xs text-slate-500">Langkah 1</p>
        <p class="font-semibold text-slate-900">Absensi Lokasi</p>
        <p class="text-xs mt-1" :class="todayAttendance ? 'text-green-600' : 'text-amber-600'">
          {{ todayAttendance ? 'Selesai' : 'Belum selesai' }}
        </p>
      </button>

      <button
        type="button"
        class="rounded-xl border p-3 text-left transition-colors"
        :class="activeTab === 'logbook' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'"
        @click="activeTab = 'logbook'"
      >
        <p class="text-xs text-slate-500">Langkah 2</p>
        <p class="font-semibold text-slate-900">Logbook Hari Ini</p>
        <p class="text-xs mt-1" :class="todayLogbook ? 'text-green-600' : 'text-amber-600'">
          {{ todayLogbook ? 'Selesai' : 'Belum selesai' }}
        </p>
      </button>

      <button
        type="button"
        class="rounded-xl border p-3 text-left transition-colors"
        :class="activeTab === 'selfie' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'"
        @click="activeTab = 'selfie'"
      >
        <p class="text-xs text-slate-500">Langkah 3</p>
        <p class="font-semibold text-slate-900">Selfie Verifikasi</p>
        <p class="text-xs mt-1" :class="hasSelfieToday ? 'text-green-600' : 'text-amber-600'">
          {{ hasSelfieToday ? 'Selesai' : 'Belum selesai' }}
        </p>
      </button>
    </div>

    <div v-if="activeTab === 'absensi'" class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="font-semibold text-slate-900">Absensi Sesuai Lokasi Magang</h2>
          <p class="text-sm text-slate-500 mt-1">Sistem memverifikasi posisi GPS dengan lokasi perusahaan.</p>
        </div>
        <UBadge :color="withinRange ? 'success' : 'warning'" variant="subtle">
          {{ withinRange ? 'Dalam radius' : 'Di luar radius' }}
        </UBadge>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-slate-500">Lokasi perusahaan</p>
          <p class="font-medium text-slate-900">{{ officeLocationText }}</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-slate-500">Jarak saat ini</p>
          <p class="font-medium text-slate-900">{{ distanceText }}</p>
        </div>
      </div>

      <UAlert
        v-if="todayAttendance"
        color="success"
        variant="soft"
        title="Absensi hari ini sudah tercatat"
        :description="`Waktu masuk: ${formatAttendanceTime(todayAttendance.waktu_masuk)}. Lanjut ke langkah logbook.`"
      />

      <div class="flex gap-3">
        <UButton color="primary" :loading="submittingAbsensi" :disabled="!canSubmitAbsensi" @click="submitAbsensi">
          Absen Sekarang
        </UButton>
        <UButton color="neutral" variant="outline" @click="refreshLocation">Refresh Lokasi</UButton>
      </div>
    </div>

    <div v-if="activeTab === 'logbook'" class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <h2 class="font-semibold text-slate-900">Isi Logbook Kegiatan Hari Ini</h2>
        <p class="text-sm text-slate-500 mt-1">Logbook hanya bisa diisi setelah absensi hadir pada hari yang sama.</p>
      </div>

      <UAlert
        v-if="!todayAttendance"
        color="warning"
        variant="soft"
        title="Absensi belum selesai"
        description="Selesaikan langkah absensi dulu sebelum isi logbook."
      />

      <UAlert
        v-if="todayLogbook"
        color="success"
        variant="soft"
        title="Logbook hari ini sudah dibuat"
        description="Lanjut ke langkah selfie verifikasi."
      />

      <UAlert
        v-if="isDevMode && hasAnyFlowData"
        color="warning"
        variant="soft"
        title="Mode Dev Aktif"
        description="Gunakan reset flow harian untuk testing ulang absensi, logbook, dan selfie tanpa ganti akun."
      />

      <div class="space-y-3">
        <UFormField label="Judul kegiatan" required>
          <UInput v-model="logbookForm.judul" placeholder="Contoh: Setup modul API monitoring" class="w-full" />
        </UFormField>
        <UFormField label="Rencana kegiatan hari ini" required>
          <UTextarea
            v-model="logbookForm.deskripsi"
            :rows="5"
            placeholder="Jelaskan kegiatan yang akan dikerjakan hari ini"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        color="primary"
        class="w-full"
        :loading="submittingLogbook"
        :disabled="!canSubmitLogbook"
        @click="submitLogbook"
      >
        Simpan Logbook
      </UButton>

      <UButton
        v-if="isDevMode && hasAnyFlowData"
        color="error"
        variant="outline"
        :loading="deletingLogbook"
        @click="resetDailyFlowForDev"
      >
        Reset Flow Harian (Absensi + Logbook + Selfie) (Dev)
      </UButton>
    </div>

    <div v-if="activeTab === 'selfie'" class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <h2 class="font-semibold text-slate-900">Upload Selfie Verifikasi</h2>
        <p class="text-sm text-slate-500 mt-1">
          Selfie wajib menampilkan seluruh wajah dan rambut dengan jelas.
        </p>
      </div>

      <UAlert
        v-if="!canStartSelfie"
        color="warning"
        variant="soft"
        title="Langkah sebelumnya belum selesai"
        description="Selesaikan absensi dan logbook hari ini sebelum upload selfie."
      />

      <UAlert
        v-if="hasSelfieToday"
        color="success"
        variant="soft"
        title="Selfie verifikasi sudah tersimpan"
        description="Flow utama hari ini sudah lengkap."
      />

      <div class="space-y-3">
        <label class="text-sm font-medium text-slate-700">Foto selfie</label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="selfieSource === 'camera' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700'"
            :disabled="!canStartSelfie || hasSelfieToday"
            @click="setSelfieSource('camera')"
          >
            Foto langsung kamera
          </button>
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="selfieSource === 'upload' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-700'"
            :disabled="!canStartSelfie || hasSelfieToday"
            @click="setSelfieSource('upload')"
          >
            Upload dari galeri/file
          </button>
        </div>

        <div v-if="selfieSource === 'camera'" class="space-y-3">
          <div class="w-full max-w-xs sm:max-w-sm mx-auto rounded-xl border border-slate-200 bg-slate-50 overflow-hidden aspect-9/16">
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover bg-black"
            />
          </div>

          <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>

          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              variant="outline"
              :disabled="!canStartSelfie || hasSelfieToday"
              @click="startCamera"
            >
              Aktifkan Kamera
            </UButton>
            <UButton
              color="primary"
              :disabled="!cameraReady || !canStartSelfie || hasSelfieToday"
              @click="captureFromCamera"
            >
              Ambil Foto
            </UButton>
          </div>
        </div>

        <input
          v-if="selfieSource === 'upload'"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          :disabled="!canStartSelfie || hasSelfieToday"
          @change="onSelfieChange"
        />

        <div v-if="selfiePreview" class="rounded-xl border border-slate-200 p-3">
          <img :src="selfiePreview" class="w-full max-w-xs sm:max-w-sm mx-auto rounded-lg aspect-9/16 object-cover" alt="Preview selfie" />
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-700">
          <input v-model="selfieChecklist" type="checkbox" :disabled="hasSelfieToday" />
          Saya memastikan wajah dan rambut terlihat jelas pada selfie ini.
        </label>
      </div>

      <UButton
        color="primary"
        :loading="submittingSelfie"
        :disabled="!canSubmitSelfie"
        @click="submitSelfie"
      >
        Upload Selfie
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSiswaAbsensiApi, useSiswaLogbookApi, useSiswaPenempatanApi, type SiswaAbsensi, type SiswaLogbook } from '~/composables/api/use-siswa'
import { formatTime } from '~/utils/format-date'

definePageMeta({ layout: 'siswa' })

const toast = useToast()
const config = useRuntimeConfig()
const absensiApi = useSiswaAbsensiApi()
const logbookApi = useSiswaLogbookApi()
const penempatanApi = useSiswaPenempatanApi()

const activeTab = ref<'absensi' | 'logbook' | 'selfie'>('absensi')
const submittingAbsensi = ref(false)
const submittingLogbook = ref(false)
const submittingSelfie = ref(false)
const deletingLogbook = ref(false)

const isDevMode = computed(() => Boolean(config.public.dev))

const penempatan = ref<any>(null)
const todayAttendance = ref<SiswaAbsensi | null>(null)
const todayLogbook = ref<SiswaLogbook | null>(null)

const logbookForm = reactive({
  judul: '',
  deskripsi: '',
})

const selfieFile = ref<File | null>(null)
const selfiePreview = ref('')
const selfieChecklist = ref(false)
const selfieSource = ref<'camera' | 'upload'>('camera')
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)
const cameraReady = ref(false)
const cameraError = ref('')

const today = computed(() => getLocalDateKey())
const currentTime = computed(() => getLocalTimeHHmm())

function formatAttendanceTime(value?: string | null) {
  if (!value) return '-'
  return value.includes('T') ? formatTime(value) : value.slice(0, 5)
}

const { coords, resume, pause } = useGeolocation({ enableHighAccuracy: true, immediate: true })

const officeCoords = computed<[number, number] | null>(() => {
  const lat = Number(penempatan.value?.perusahaan?.latitude)
  const lng = Number(penempatan.value?.perusahaan?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
})

const userCoords = computed<[number, number] | null>(() => {
  const lat = Number(coords.value.latitude)
  const lng = Number(coords.value.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
})

const distanceMeter = computed(() => {
  if (!userCoords.value || !officeCoords.value) return null
  const [lat1, lon1] = userCoords.value
  const [lat2, lon2] = officeCoords.value
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
})

const withinRange = computed(() => {
  if (!officeCoords.value || distanceMeter.value === null) return true
  return distanceMeter.value <= 500
})

const officeLocationText = computed(() => {
  if (!officeCoords.value) return 'Koordinat perusahaan belum tersedia'
  const [lat, lng] = officeCoords.value
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
})

const distanceText = computed(() => {
  if (distanceMeter.value === null) return 'Lokasi belum terdeteksi'
  return `${distanceMeter.value} meter`
})

const hasSelfieToday = computed(() => !!todayAttendance.value?.foto_absensi)

const canSubmitAbsensi = computed(() => {
  if (todayAttendance.value) return false
  if (!penempatan.value) return false
  if (!userCoords.value) return false
  return withinRange.value
})

const canSubmitLogbook = computed(() => {
  return !!todayAttendance.value && !todayLogbook.value && !!logbookForm.judul.trim() && !!logbookForm.deskripsi.trim()
})

const canStartSelfie = computed(() => !!todayAttendance.value && !!todayLogbook.value)

const canSubmitSelfie = computed(() => {
  return canStartSelfie.value && !hasSelfieToday.value && !!selfieFile.value && selfieChecklist.value
})

const hasAnyFlowData = computed(() => {
  return !!todayAttendance.value || !!todayLogbook.value
})

const stopCamera = () => {
  if (cameraStream.value) {
    for (const track of cameraStream.value.getTracks()) {
      track.stop()
    }
  }
  cameraStream.value = null
  cameraReady.value = false
}

const startCamera = async () => {
  cameraError.value = ''
  if (typeof window === 'undefined') return
  if (!canStartSelfie.value || hasSelfieToday.value) return

  try {
    stopCamera()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    })

    cameraStream.value = stream

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      cameraReady.value = true
    }
  } catch (error) {
    console.error('Gagal mengaktifkan kamera', error)
    cameraError.value = 'Kamera tidak dapat diakses. Silakan izinkan kamera atau gunakan upload file.'
    stopCamera()
  }
}

const setSelfieSource = (source: 'camera' | 'upload') => {
  selfieSource.value = source
  cameraError.value = ''
  if (source !== 'camera') {
    stopCamera()
  }
}

const validateAndSetSelfieFile = (file: File) => {
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'Ukuran file maksimal 2MB', color: 'warning' })
    return
  }

  const objectUrl = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const width = img.naturalWidth
    const height = img.naturalHeight

    if (width < 480 || height < 640) {
      toast.add({ title: 'Resolusi selfie minimal 480x640', color: 'warning' })
      URL.revokeObjectURL(objectUrl)
      return
    }

    if (selfiePreview.value) {
      URL.revokeObjectURL(selfiePreview.value)
    }

    selfieFile.value = file
    selfiePreview.value = objectUrl
  }
  img.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    toast.add({ title: 'File selfie tidak valid', color: 'error' })
  }
  img.src = objectUrl
}

const captureFromCamera = async () => {
  if (!videoRef.value || !cameraReady.value) return

  const video = videoRef.value
  const canvas = document.createElement('canvas')
  const targetRatio = 9 / 16
  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight
  const sourceRatio = sourceWidth / sourceHeight

  let cropWidth = sourceWidth
  let cropHeight = sourceHeight
  let cropX = 0
  let cropY = 0

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio
    cropX = (sourceWidth - cropWidth) / 2
  } else if (sourceRatio < targetRatio) {
    cropHeight = sourceWidth / targetRatio
    cropY = (sourceHeight - cropHeight) / 2
  }

  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    toast.add({ title: 'Gagal memproses hasil kamera', color: 'error' })
    return
  }

  ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))

  if (!blob) {
    toast.add({ title: 'Gagal mengambil foto', color: 'error' })
    return
  }

  const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' })
  validateAndSetSelfieFile(file)
}

const refreshLocation = () => {
  pause()
  setTimeout(() => resume(), 600)
}

const loadInitial = async () => {
  const penempatanRes = await penempatanApi.getMyPenempatan()
  if (!penempatanRes.success || !penempatanRes.data) {
    toast.add({ title: 'Penempatan aktif tidak ditemukan', color: 'warning' })
    return
  }

  penempatan.value = penempatanRes.data
  await Promise.all([loadTodayAttendance(), loadTodayLogbook()])
}

const normalizeDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const loadTodayAttendance = async () => {
  const res = await absensiApi.getAll({
    page: 1,
    limit: 20,
    start_date: today.value,
    end_date: today.value,
  })

  if (!res.success || !res.data) {
    todayAttendance.value = null
    return
  }

  todayAttendance.value = (res.data as SiswaAbsensi[]).find((row) => normalizeDate(row.tanggal) === today.value) || null
}

const loadTodayLogbook = async () => {
  if (!penempatan.value?.id_penempatan) return

  const res = await logbookApi.getByPenempatan(penempatan.value.id_penempatan, {
    page: 1,
    limit: 20,
  })

  if (!res.success || !res.data) {
    todayLogbook.value = null
    return
  }

  todayLogbook.value = (res.data as SiswaLogbook[]).find((row) => normalizeDate(row.tanggal) === today.value) || null
}

const submitAbsensi = async () => {
  if (!penempatan.value?.id_penempatan || !userCoords.value) return

  submittingAbsensi.value = true
  try {
    const payload = {
      id_penempatan: penempatan.value.id_penempatan,
      tanggal: today.value,
      waktu_masuk: currentTime.value,
      status_absensi: 'hadir' as const,
      metode_absensi: 'gps' as const,
      latitude: userCoords.value[0],
      longitude: userCoords.value[1],
      keterangan: 'Absensi melalui flow harian siswa',
    }

    const res = await absensiApi.create(payload)
    if (!res.success) {
      toast.add({ title: res.message || 'Gagal absen', color: 'error' })
      return
    }

    toast.add({ title: 'Absensi berhasil', color: 'success' })
    await loadTodayAttendance()
    activeTab.value = 'logbook'
  } finally {
    submittingAbsensi.value = false
  }
}

const submitLogbook = async () => {
  submittingLogbook.value = true
  try {
    const res = await logbookApi.create({
      tanggal: today.value,
      judul_kegiatan: logbookForm.judul,
      isi_kegiatan: logbookForm.deskripsi,
    })

    if (!res.success) {
      toast.add({ title: res.message || 'Gagal simpan logbook', color: 'error' })
      return
    }

    toast.add({ title: 'Logbook berhasil disimpan', color: 'success' })
    await loadTodayLogbook()
    activeTab.value = 'selfie'
  } finally {
    submittingLogbook.value = false
  }
}

const resetDailyFlowForDev = async () => {
  if (!hasAnyFlowData.value) return
  if (!isDevMode.value) return

  const confirmed = typeof window !== 'undefined'
    ? window.confirm('Reset flow harian hari ini? Data absensi, logbook, dan selfie akan dihapus untuk testing.')
    : false

  if (!confirmed) return

  deletingLogbook.value = true
  try {
    const res = await absensiApi.resetDailyFlowDev()
    if (!res.success) {
      toast.add({ title: res.message || 'Gagal reset flow harian', color: 'error' })
      return
    }

    todayAttendance.value = null
    todayLogbook.value = null
    logbookForm.judul = ''
    logbookForm.deskripsi = ''
    selfieFile.value = null
    selfieChecklist.value = false
    if (selfiePreview.value) {
      URL.revokeObjectURL(selfiePreview.value)
    }
    selfiePreview.value = ''
    stopCamera()
    activeTab.value = 'logbook'

    toast.add({ title: 'Flow harian hari ini berhasil direset (dev)', color: 'success' })
  } finally {
    deletingLogbook.value = false
  }
}

const onSelfieChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  validateAndSetSelfieFile(file)
}

const submitSelfie = async () => {
  if (!selfieFile.value || !todayAttendance.value?.id_absensi) return

  submittingSelfie.value = true
  try {
    const upload = await absensiApi.uploadSelfie(selfieFile.value)
    if (!upload.success || !upload.data?.path) {
      toast.add({ title: upload.message || 'Upload selfie gagal', color: 'error' })
      return
    }

    const update = await absensiApi.update(todayAttendance.value.id_absensi, {
      foto_absensi: upload.data.path,
      keterangan: 'Selfie verifikasi sudah diunggah',
    })

    if (!update.success) {
      toast.add({ title: update.message || 'Gagal menyimpan selfie ke absensi', color: 'error' })
      return
    }

    toast.add({ title: 'Selfie verifikasi berhasil disimpan', color: 'success' })
    await loadTodayAttendance()
  } finally {
    submittingSelfie.value = false
  }
}

onMounted(async () => {
  await loadInitial()
  if (activeTab.value === 'selfie' && canStartSelfie.value && !hasSelfieToday.value && selfieSource.value === 'camera') {
    startCamera()
  }
})

watch(activeTab, (value) => {
  if (value === 'selfie' && selfieSource.value === 'camera' && canStartSelfie.value && !hasSelfieToday.value) {
    startCamera()
    return
  }
  stopCamera()
})

watch(selfieSource, (source) => {
  if (source === 'camera' && activeTab.value === 'selfie' && canStartSelfie.value && !hasSelfieToday.value) {
    startCamera()
  }
})

onBeforeUnmount(() => {
  stopCamera()
  if (selfiePreview.value) {
    URL.revokeObjectURL(selfiePreview.value)
  }
})
</script>
