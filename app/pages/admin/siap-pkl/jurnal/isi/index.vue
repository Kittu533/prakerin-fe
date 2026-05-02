<script setup lang="ts">
import {
  useLogbookApi,
  usePenempatanApi,
  type Logbook,
  type Penempatan,
} from '~/composables/api/use-internship'

definePageMeta({
  layout: 'admin'
})

const toast = useToast()
const logbookApi = useLogbookApi()
const penempatanApi = usePenempatanApi()

const loading = ref(true)
const placements = ref<Penempatan[]>([])
const logbooks = ref<Logbook[]>([])
const selectedPenempatan = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')

const filteredLogbooks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return logbooks.value.filter((item) => {
    const matchStatus = !selectedStatus.value || item.status_persetujuan === selectedStatus.value
    const matchPenempatan = !selectedPenempatan.value || item.id_penempatan === selectedPenempatan.value
    const haystack = [
      item.judul_kegiatan,
      item.isi_kegiatan,
      item.penempatan?.siswa?.nama_siswa,
      item.penempatan?.siswa?.nis,
      item.penempatan?.perusahaan?.nama_perusahaan,
      item.penempatan?.guru?.nama_guru
    ].filter(Boolean).join(' ').toLowerCase()

    return matchStatus && matchPenempatan && (!query || haystack.includes(query))
  })
})

const summary = computed(() => {
  const total = logbooks.value.length
  const menunggu = logbooks.value.filter((item) => item.status_persetujuan === 'menunggu').length
  const disetujui = logbooks.value.filter((item) => item.status_persetujuan === 'disetujui').length
  const ditolak = logbooks.value.filter((item) => item.status_persetujuan === 'ditolak').length

  return { total, menunggu, disetujui, ditolak }
})

const placementOptions = computed(() =>
  placements.value.map((item) => ({
    value: item.id_penempatan,
    label: [
      item.siswa?.nama_siswa || 'Siswa tanpa nama',
      item.perusahaan?.nama_perusahaan || 'Tempat PKL belum terisi'
    ].join(' - ')
  }))
)

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

function statusLabel(status: Logbook['status_persetujuan']) {
  const labels = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak'
  }

  return labels[status] || status
}

function statusClass(status: Logbook['status_persetujuan']) {
  return {
    'border-amber-100 bg-amber-50 text-amber-700': status === 'menunggu',
    'border-emerald-100 bg-emerald-50 text-emerald-700': status === 'disetujui',
    'border-rose-100 bg-rose-50 text-rose-700': status === 'ditolak'
  }
}

async function loadData() {
  loading.value = true
  try {
    const [placementResponse, logbookResponse] = await Promise.all([
      penempatanApi.getAll({ page: 1, limit: 100 }),
      logbookApi.getAll({ page: 1, limit: 100 })
    ])

    placements.value = placementResponse.data || []
    logbooks.value = logbookResponse.data || []
  } catch (error) {
    console.error('Failed to load jurnal data:', error)
    toast.add({ title: 'Gagal memuat data jurnal PKL', color: 'error' })
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  selectedPenempatan.value = ''
  selectedStatus.value = ''
  searchQuery.value = ''
}

onMounted(loadData)

useHead({
  title: 'Data Jurnal PKL | Admin'
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-slate-950 p-6 text-white md:p-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-white/10">
                <Icon name="lucide:book-open-check" class="h-7 w-7" />
              </div>
              <div>
                <p class="text-[11px] font-black uppercase tracking-widest text-blue-200">Rekap Jurnal PKL</p>
                <h1 class="mt-2 text-3xl font-black uppercase tracking-tight">Data Jurnal Siswa</h1>
                <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                  Admin memantau jurnal/logbook yang diisi siswa, melihat status feedback pembimbing, dan mengecek kelengkapan catatan kegiatan PKL.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row">
              <NuxtLink
                to="/admin/siap-pkl/jurnal/monitoring"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-500"
              >
                <Icon name="lucide:monitor-check" class="h-4 w-4" />
                Monitoring
              </NuxtLink>
              <NuxtLink
                to="/admin/siap-pkl/jurnal"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
              >
                <Icon name="lucide:arrow-left" class="h-4 w-4" />
                Kembali
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Jurnal</p>
            <p class="mt-1 text-3xl font-black text-slate-900">{{ summary.total }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Menunggu</p>
            <p class="mt-1 text-3xl font-black text-amber-600">{{ summary.menunggu }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Disetujui</p>
            <p class="mt-1 text-3xl font-black text-emerald-600">{{ summary.disetujui }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Ditolak</p>
            <p class="mt-1 text-3xl font-black text-rose-600">{{ summary.ditolak }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-2">
            <Icon name="lucide:filter" class="h-5 w-5 text-blue-600" />
            <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Filter Data</h2>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              @click="loadData"
            >
              <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              @click="resetFilters"
            >
              <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1fr_240px_220px]">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cari Jurnal</label>
            <div class="relative">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari siswa, IDUKA, judul, atau isi kegiatan"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Penempatan</label>
            <select
              v-model="selectedPenempatan"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua penempatan</option>
              <option v-for="option in placementOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
            <select
              v-model="selectedStatus"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Semua status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:list-checks" class="h-5 w-5 text-emerald-600" />
            <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Daftar Jurnal</h2>
          </div>
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">
            {{ filteredLogbooks.length }} data
          </p>
        </div>

        <div v-if="loading" class="rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm font-bold text-slate-500">
          Memuat jurnal siswa...
        </div>

        <div v-else-if="filteredLogbooks.length === 0" class="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <Icon name="lucide:book-open" class="mx-auto h-10 w-10 text-slate-300" />
          <p class="mt-3 text-sm font-black text-slate-700">Jurnal tidak ditemukan</p>
          <p class="mt-1 text-sm font-medium text-slate-400">Ubah filter atau cek lagi setelah siswa mengisi logbook.</p>
        </div>

        <div v-else class="overflow-hidden rounded-xl border border-slate-200">
          <div class="hidden grid-cols-[150px_1.2fr_1fr_1fr_140px] gap-4 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 lg:grid">
            <div>Tanggal</div>
            <div>Siswa</div>
            <div>Tempat PKL</div>
            <div>Judul</div>
            <div>Status</div>
          </div>

          <article
            v-for="item in filteredLogbooks"
            :key="item.id_logbook"
            class="border-t border-slate-100 p-4 first:border-t-0 lg:grid lg:grid-cols-[150px_1.2fr_1fr_1fr_140px] lg:gap-4"
          >
            <div class="text-sm font-black text-slate-700">{{ formatDate(item.tanggal) }}</div>
            <div class="mt-3 lg:mt-0">
              <p class="font-black text-slate-900">{{ item.penempatan?.siswa?.nama_siswa || '-' }}</p>
              <p class="mt-1 text-xs font-bold text-slate-400">{{ item.penempatan?.siswa?.nis || 'NIS belum ada' }}</p>
            </div>
            <div class="mt-3 text-sm font-bold text-slate-600 lg:mt-0">
              {{ item.penempatan?.perusahaan?.nama_perusahaan || '-' }}
            </div>
            <div class="mt-3 lg:mt-0">
              <p class="font-black text-slate-900">{{ item.judul_kegiatan }}</p>
              <p class="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{{ item.isi_kegiatan }}</p>
            </div>
            <div class="mt-3 lg:mt-0">
              <span
                class="inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                :class="statusClass(item.status_persetujuan)"
              >
                {{ statusLabel(item.status_persetujuan) }}
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
