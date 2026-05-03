<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Riwayat Harian PKL</h1>
        <p class="mt-1 text-sm text-slate-500">
          Rekap absensi, logbook, dan bukti selfie dalam satu tabel.
        </p>
      </div>
      <UButton color="primary" variant="soft" :loading="loading" @click="loadData">
        <Icon name="lucide:refresh-cw" class="mr-1.5 h-4 w-4" />
        Refresh
      </UButton>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Total Hari</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">{{ summary.total }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Hadir</p>
        <p class="mt-1 text-2xl font-bold text-emerald-600">{{ summary.hadir }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Logbook</p>
        <p class="mt-1 text-2xl font-bold text-sky-600">{{ summary.logbook }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Selfie</p>
        <p class="mt-1 text-2xl font-bold text-indigo-600">{{ summary.selfie }}</p>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white">
      <div class="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_180px_180px]">
        <div class="relative">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="search"
            class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="Cari kegiatan atau keterangan..."
          />
        </div>
        <select
          v-model="statusFilter"
          class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Semua status</option>
          <option value="lengkap">Lengkap</option>
          <option value="belum_logbook">Belum logbook</option>
          <option value="belum_selfie">Belum selfie</option>
          <option value="belum_absen">Belum absen</option>
        </select>
        <select
          v-model.number="pageSize"
          class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <option :value="10">10 baris</option>
          <option :value="25">25 baris</option>
          <option :value="50">50 baris</option>
        </select>
      </div>

      <div v-if="loading" class="space-y-3 p-4">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>

      <div v-else-if="!filteredRows.length" class="p-10 text-center">
        <Icon name="lucide:clipboard-list" class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-700">Belum ada riwayat harian</p>
        <p class="mt-1 text-sm text-slate-500">Absensi dan logbook akan muncul setelah dibuat.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1080px] table-fixed text-left text-sm">
          <colgroup>
            <col class="w-[16%]" />
            <col class="w-[20%]" />
            <col class="w-[12%]" />
            <col class="w-[28%]" />
            <col class="w-[10%]" />
            <col class="w-[14%]" />
          </colgroup>
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Tanggal</th>
              <th class="px-4 py-3 font-semibold">Absensi</th>
              <th class="px-4 py-3 font-semibold">Jam</th>
              <th class="px-4 py-3 font-semibold">Logbook</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Bukti Foto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in paginatedRows" :key="row.dateKey" class="hover:bg-slate-50/70">
              <td class="px-4 py-3 align-top">
                <p class="font-semibold text-slate-900">{{ row.dateLabel }}</p>
                <p class="mt-0.5 text-xs text-slate-500">{{ row.dateKey }}</p>
              </td>
              <td class="px-4 py-3 align-top">
                <UBadge :color="attendanceColor(row.absensi?.status_absensi)" variant="subtle">
                  {{ attendanceLabel(row.absensi?.status_absensi) }}
                </UBadge>
                <p v-if="row.absensi?.keterangan" class="mt-1 max-w-[220px] text-xs text-slate-500">
                  {{ row.absensi.keterangan }}
                </p>
              </td>
              <td class="px-4 py-3 align-top text-slate-700">
                <p>Masuk: <span class="font-medium">{{ formatAttendanceTime(row.absensi?.waktu_masuk) }}</span></p>
                <p class="mt-1">Keluar: <span class="font-medium">{{ formatAttendanceTime(row.absensi?.waktu_keluar) }}</span></p>
              </td>
              <td class="px-4 py-3 align-top">
                <template v-if="row.logbook">
                  <p class="line-clamp-2 max-w-full break-words font-semibold text-slate-900 [overflow-wrap:anywhere]">
                    {{ row.logbook.judul_kegiatan }}
                  </p>
                  <p class="mt-1 line-clamp-2 max-w-full break-words text-xs leading-5 text-slate-500 [overflow-wrap:anywhere]">
                    {{ row.logbook.isi_kegiatan }}
                  </p>
                </template>
                <span v-else class="text-slate-400">Belum isi logbook</span>
              </td>
              <td class="px-4 py-3 align-top">
                <UBadge :color="logbookColor(row.logbook?.status_persetujuan)" variant="subtle">
                  {{ logbookLabel(row.logbook?.status_persetujuan) }}
                </UBadge>
                <p class="mt-2">
                  <UBadge :color="row.completionColor" variant="soft">
                    {{ row.completionLabel }}
                  </UBadge>
                </p>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="flex flex-col gap-2">
                  <button
                    v-if="row.absensi?.foto_absensi && selfieUrls[row.absensi.id_absensi]"
                    type="button"
                    class="group w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-sky-300 hover:shadow"
                    @click="openSelfie(row)"
                  >
                    <img
                      :src="selfieUrls[row.absensi.id_absensi]"
                      alt="Bukti selfie absensi"
                      class="h-20 w-24 object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <span class="block truncate px-2 py-1 text-[11px] font-medium text-slate-600">Selfie</span>
                  </button>
                  <div
                    v-else-if="row.absensi?.foto_absensi"
                    class="flex h-24 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                  <UBadge v-else color="neutral" variant="subtle" class="w-fit">Belum selfie</UBadge>

                  <button
                    v-if="getDirectPhotoSrc(row.logbook?.foto_kegiatan)"
                    type="button"
                    class="group w-24 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50 text-left shadow-sm transition hover:border-emerald-300 hover:shadow"
                    @click="selectedSelfieUrl = getDirectPhotoSrc(row.logbook?.foto_kegiatan)"
                  >
                    <img
                      :src="getDirectPhotoSrc(row.logbook?.foto_kegiatan)"
                      alt="Bukti foto kegiatan"
                      class="h-20 w-24 object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <span class="block truncate px-2 py-1 text-[11px] font-medium text-emerald-700">Kegiatan</span>
                  </button>
                  <UBadge v-else-if="row.logbook?.foto_kegiatan" color="success" variant="subtle" class="w-fit">
                    Foto kegiatan ada
                  </UBadge>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 p-4">
        <p class="text-xs text-slate-500">
          Menampilkan {{ pageStart + 1 }}-{{ pageEnd }} dari {{ filteredRows.length }}
        </p>
        <UPagination v-model:page="page" :total="filteredRows.length" :items-per-page="pageSize" size="xs" />
      </div>
    </div>

    <div
      v-if="selectedSelfieUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      @click.self="closeSelfie"
    >
      <div class="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p class="font-semibold text-slate-900">Bukti Selfie Absensi</p>
          <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" @click="closeSelfie">
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>
        <div class="bg-slate-950 p-3">
          <img :src="selectedSelfieUrl" alt="Bukti selfie absensi" class="max-h-[70vh] w-full rounded-lg object-contain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useSiswaAbsensiApi,
  useSiswaLogbookApi,
  type SiswaAbsensi,
  type SiswaLogbook,
} from '~/composables/api/use-siswa'
import { useDataStore } from '~/stores/data-store'
import { formatDate, formatTime } from '~/utils/format-date'
import { getLocalDateKey } from '~/utils/date-only'

definePageMeta({ layout: 'siswa' })

type DailyRow = {
  dateKey: string
  dateLabel: string
  absensi: SiswaAbsensi | null
  logbook: SiswaLogbook | null
  completionLabel: string
  completionColor: 'success' | 'warning' | 'error' | 'neutral'
}

const toast = useToast()
const absensiApi = useSiswaAbsensiApi()
const logbookApi = useSiswaLogbookApi()
const dataStore = useDataStore()

const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const rows = ref<DailyRow[]>([])
const selectedSelfieUrl = ref('')
const openingSelfieId = ref('')
const selfieUrls = ref<Record<string, string>>({})
const selfieObjectUrls = new Set<string>()

const summary = computed(() => ({
  total: rows.value.length,
  hadir: rows.value.filter((row) => row.absensi?.status_absensi === 'hadir').length,
  logbook: rows.value.filter((row) => row.logbook).length,
  selfie: rows.value.filter((row) => row.absensi?.foto_absensi).length,
}))

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const haystack = [
      row.dateKey,
      row.dateLabel,
      row.absensi?.status_absensi,
      row.absensi?.keterangan,
      row.logbook?.judul_kegiatan,
      row.logbook?.isi_kegiatan,
      row.logbook?.status_persetujuan,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchSearch = !keyword || haystack.includes(keyword)
    const matchStatus =
      !statusFilter.value ||
      (statusFilter.value === 'lengkap' && !!row.absensi && !!row.logbook && !!row.absensi.foto_absensi) ||
      (statusFilter.value === 'belum_logbook' && !!row.absensi && !row.logbook) ||
      (statusFilter.value === 'belum_selfie' && !!row.absensi && !row.absensi.foto_absensi) ||
      (statusFilter.value === 'belum_absen' && !row.absensi)

    return matchSearch && matchStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize.value))
const pageStart = computed(() => (page.value - 1) * pageSize.value)
const pageEnd = computed(() => Math.min(page.value * pageSize.value, filteredRows.value.length))
const paginatedRows = computed(() => filteredRows.value.slice(pageStart.value, pageEnd.value))

watch([search, statusFilter, pageSize], () => {
  page.value = 1
})

function normalizeList<T>(data?: T[] | { data?: T[] } | null): T[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as { data?: T[] }).data)) return (data as { data: T[] }).data
  return []
}

function buildRows(absensiList: SiswaAbsensi[], logbookList: SiswaLogbook[]) {
  revokeSelfieObjectUrls()
  selfieUrls.value = {}
  const map = new Map<string, { absensi: SiswaAbsensi | null; logbook: SiswaLogbook | null }>()

  for (const absensi of absensiList) {
    const key = getLocalDateKey(new Date(absensi.tanggal))
    const existing = map.get(key) || { absensi: null, logbook: null }
    existing.absensi = absensi
    map.set(key, existing)
  }

  for (const logbook of logbookList) {
    const key = getLocalDateKey(new Date(logbook.tanggal))
    const existing = map.get(key) || { absensi: null, logbook: null }
    existing.logbook = logbook
    map.set(key, existing)
  }

  rows.value = Array.from(map.entries())
    .map(([dateKey, value]) => {
      const completion = getCompletion(value.absensi, value.logbook)
      return {
        dateKey,
        dateLabel: formatDate(`${dateKey}T00:00:00.000Z`, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        absensi: value.absensi,
        logbook: value.logbook,
        ...completion,
      }
    })
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

function getCompletion(absensi: SiswaAbsensi | null, logbook: SiswaLogbook | null) {
  if (!absensi) return { completionLabel: 'Belum absen', completionColor: 'error' as const }
  if (!logbook) return { completionLabel: 'Belum logbook', completionColor: 'warning' as const }
  if (!absensi.foto_absensi) return { completionLabel: 'Belum selfie', completionColor: 'warning' as const }
  return { completionLabel: 'Lengkap', completionColor: 'success' as const }
}

function formatAttendanceTime(value?: string | null) {
  if (!value) return '-'
  return value.includes('T') ? formatTime(value) : value.slice(0, 5)
}

function getDirectPhotoSrc(value?: string | null) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  if (value.startsWith('/')) {
    const config = useRuntimeConfig()
    const apiOrigin = String(config.public.apiUrl || '').replace(/\/api\/?$/, '')
    return `${apiOrigin}${value}`
  }
  return ''
}

function toSameOriginApiUrl(value: string) {
  if (!import.meta.client) return value

  try {
    const url = new URL(value)
    if (url.pathname.startsWith('/api/')) {
      return `${window.location.origin}${url.pathname}${url.search}`
    }
  } catch {
    return value
  }

  return value
}

function revokeSelfieObjectUrls() {
  if (!import.meta.client) return
  for (const url of selfieObjectUrls) {
    URL.revokeObjectURL(url)
  }
  selfieObjectUrls.clear()
}

async function loadSelfieObjectUrl(idAbsensi: string) {
  const token = dataStore.token || useCookie<string | null>('token').value
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await fetch(`/api/absensi/${idAbsensi}/selfie-file`, {
    cache: 'no-store',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Foto selfie gagal dimuat (${response.status})`)
  }

  const objectUrl = URL.createObjectURL(await response.blob())
  selfieObjectUrls.add(objectUrl)
  return objectUrl
}

function attendanceLabel(status?: string) {
  const map: Record<string, string> = {
    hadir: 'Hadir',
    izin: 'Izin',
    sakit: 'Sakit',
    alpa: 'Alpa',
    alpha: 'Alpa',
  }
  return status ? map[status] || status : 'Belum absen'
}

function attendanceColor(status?: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'hadir') return 'success'
  if (status === 'izin' || status === 'sakit') return 'warning'
  if (status === 'alpa' || status === 'alpha') return 'error'
  return 'neutral'
}

function logbookLabel(status?: string) {
  const map: Record<string, string> = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    revisi: 'Revisi',
  }
  return status ? map[status] || status : 'Belum logbook'
}

function logbookColor(status?: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'disetujui') return 'success'
  if (status === 'menunggu' || status === 'revisi') return 'warning'
  if (status === 'ditolak') return 'error'
  return 'neutral'
}

async function openSelfie(row: DailyRow) {
  if (!row.absensi?.id_absensi) return
  const cachedUrl = selfieUrls.value[row.absensi.id_absensi]
  if (cachedUrl) {
    selectedSelfieUrl.value = cachedUrl
    return
  }

  openingSelfieId.value = row.absensi.id_absensi

  try {
    const objectUrl = await loadSelfieObjectUrl(row.absensi.id_absensi)
    if (!objectUrl) {
      toast.add({
        title: 'Selfie tidak tersedia',
        color: 'warning',
      })
      return
    }

    selectedSelfieUrl.value = objectUrl
    selfieUrls.value = {
      ...selfieUrls.value,
      [row.absensi.id_absensi]: objectUrl,
    }
  } finally {
    openingSelfieId.value = ''
  }
}

function closeSelfie() {
  selectedSelfieUrl.value = ''
}

async function preloadSelfieUrls() {
  const absensiWithPhoto = rows.value
    .map((row) => row.absensi)
    .filter((absensi): absensi is SiswaAbsensi => !!absensi?.id_absensi && !!absensi.foto_absensi)

  const results = await Promise.allSettled(
    absensiWithPhoto.map(async (absensi) => {
      const objectUrl = await loadSelfieObjectUrl(absensi.id_absensi)
      return [absensi.id_absensi, objectUrl] as const
    }),
  )

  const nextUrls: Record<string, string> = {}
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      nextUrls[result.value[0]] = result.value[1]
    }
  }

  selfieUrls.value = nextUrls
}

async function loadData() {
  loading.value = true

  try {
    const [absensiRes, logbookRes] = await Promise.all([
      absensiApi.getAll({ page: 1, limit: 1000 }),
      logbookApi.getByPenempatan('', { page: 1, limit: 1000 }),
    ])

    buildRows(
      normalizeList<SiswaAbsensi>(absensiRes.data),
      normalizeList<SiswaLogbook>(logbookRes.data),
    )
    await preloadSelfieUrls()
  } catch (error: any) {
    toast.add({
      title: 'Gagal memuat riwayat harian',
      description: error?.message || 'Data absensi dan logbook tidak berhasil dimuat',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
onBeforeUnmount(revokeSelfieObjectUrls)

useHead({ title: 'Riwayat Harian PKL | Siswa PKL' })
</script>
