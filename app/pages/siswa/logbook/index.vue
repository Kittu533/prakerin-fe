<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Logbook Harian</h1>
        <p class="text-sm text-slate-500 mt-1">Catat kegiatan PKL harianmu</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Tambah Kegiatan
      </UButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ stats.total }}</p>
        <p class="text-xs text-slate-500">Total</p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-green-600">{{ stats.approved }}</p>
        <p class="text-xs text-slate-500">Disetujui</p>
      </div>
      <div class="bg-white rounded-xl p-4 border border-slate-200 text-center">
        <p class="text-2xl font-bold text-amber-600">{{ stats.pending }}</p>
        <p class="text-xs text-slate-500">Pending</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari kegiatan..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="statusOptions" placeholder="Filter Status" class="w-full sm:w-36" />
      </div>
    </div>

    <!-- Table (Desktop) -->
    <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
      <UTable :data="filteredLogbooks" :columns="columns" :loading="loading">
        <template #tanggal-cell="{ row }">
          <span class="text-sm">{{ row.original.tanggal }}</span>
        </template>
        <template #waktu-cell="{ row }">
          <span class="text-sm text-slate-500">{{ row.original.jamMulai }} - {{ row.original.jamSelesai }}</span>
        </template>
        <template #judul-cell="{ row }">
          <span class="text-sm font-medium truncate max-w-[200px] block">{{ row.original.judul }}</span>
        </template>
        <template #preview-cell="{ row }">
          <img v-if="row.original.foto" :src="row.original.foto" class="w-10 h-10 rounded object-cover" />
          <span v-else class="text-slate-400">-</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="xs">{{ row.original.status }}</UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" color="neutral" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" variant="ghost" color="error" @click="deleteLogbook(row.original.id)">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Card List (Mobile) -->
    <div class="lg:hidden space-y-3">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-3/4 mb-2" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </template>
      <template v-else>
        <div v-for="log in filteredLogbooks" :key="log.id" class="bg-white rounded-xl border border-slate-200 p-4" @click="openModal(log)">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <p class="font-medium text-slate-900 text-sm">{{ log.judul }}</p>
              <p class="text-xs text-slate-500">{{ log.tanggal }}</p>
            </div>
            <UBadge :color="getStatusColor(log.status)" variant="subtle" size="xs">{{ log.status }}</UBadge>
          </div>
          <div v-if="log.status === 'Ditolak' && log.catatan" class="mt-2 p-2 bg-red-50 rounded-lg">
            <p class="text-xs text-red-600">{{ log.catatan }}</p>
          </div>
        </div>
        <div v-if="!filteredLogbooks.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada logbook</p>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Modal Form -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">{{ editingLog ? 'Edit Logbook' : 'Tambah Logbook' }}</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <!-- Revision Alert -->
          <UAlert v-if="editingLog?.status === 'Ditolak'" color="error" icon="lucide:alert-circle" class="mb-4">
            <template #title>Catatan Pembimbing</template>
            <template #description>{{ editingLog.catatan }}</template>
          </UAlert>

          <form @submit.prevent="submitForm" class="space-y-4">
            <UFormField label="Tanggal" required>
              <UInput v-model="form.tanggal" type="date" :max="today" />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Jam Mulai" required>
                <UInput v-model="form.jamMulai" type="time" />
              </UFormField>
              <UFormField label="Jam Selesai" required>
                <UInput v-model="form.jamSelesai" type="time" />
              </UFormField>
            </div>

            <UFormField label="Judul Kegiatan" required>
              <UInput v-model="form.judul" placeholder="Min. 5 karakter" />
            </UFormField>

            <UFormField label="Deskripsi" required>
              <UTextarea v-model="form.deskripsi" placeholder="Min. 20 karakter" :rows="4" autoresize />
            </UFormField>

            <UFormField label="Foto Kegiatan">
              <div 
                class="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-sky-400 transition-colors"
                @click="$refs.fileInput.click()"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                <div v-if="form.fotoPreview">
                  <img :src="form.fotoPreview" class="w-20 h-20 mx-auto rounded-lg object-cover mb-2" />
                  <p class="text-xs text-slate-500">Klik untuk ganti</p>
                </div>
                <div v-else>
                  <Icon name="lucide:upload" class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p class="text-sm text-slate-500">Drag & drop atau klik untuk upload</p>
                  <p class="text-xs text-slate-400">Max 2MB, format gambar</p>
                </div>
              </div>
            </UFormField>

            <div class="flex gap-3 pt-2">
              <UButton type="button" variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton type="submit" color="primary" class="flex-1" :loading="submitting">
                {{ editingLog ? 'Simpan Perubahan' : 'Simpan' }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'siswa' })

const toast = useToast()

// State
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const search = ref('')
const filterStatus = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

const statusOptions = ['Disetujui', 'Pending', 'Ditolak']
const stats = reactive({ total: 0, approved: 0, pending: 0 })
const logbooks = ref<any[]>([])
const editingLog = ref<any>(null)

const form = reactive({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  judul: '',
  deskripsi: '',
  foto: null as File | null,
  fotoPreview: ''
})

const today = computed(() => new Date().toISOString().split('T')[0])

const columns = [
  { accessorKey: 'tanggal', header: 'Tanggal' },
  { accessorKey: 'waktu', header: 'Waktu' },
  { accessorKey: 'judul', header: 'Judul' },
  { accessorKey: 'preview', header: 'Preview' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: 'Aksi' }
]

const filteredLogbooks = computed(() => {
  let result = logbooks.value.filter(log => {
    const matchSearch = !search.value || log.judul.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || log.status === filterStatus.value
    return matchSearch && matchStatus
  })
  const start = (currentPage.value - 1) * itemsPerPage
  return result.slice(start, start + itemsPerPage)
})

const totalItems = computed(() => logbooks.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const getStatusColor = (status: string) => ({ Disetujui: 'success', Pending: 'warning', Ditolak: 'error' })[status] || 'neutral'

function openModal(log?: any) {
  editingLog.value = log || null
  if (log) {
    form.tanggal = log.tanggalRaw || ''
    form.jamMulai = log.jamMulai || ''
    form.jamSelesai = log.jamSelesai || ''
    form.judul = log.judul || ''
    form.deskripsi = log.deskripsi || ''
    form.fotoPreview = log.foto || ''
  } else {
    Object.assign(form, { tanggal: '', jamMulai: '', jamSelesai: '', judul: '', deskripsi: '', foto: null, fotoPreview: '' })
  }
  modalOpen.value = true
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'File terlalu besar (max 2MB)', color: 'error' })
    return
  }
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Format file harus gambar', color: 'error' })
    return
  }
  form.foto = file
  form.fotoPreview = URL.createObjectURL(file)
}

async function submitForm() {
  // Validation
  if (!form.tanggal || !form.jamMulai || !form.jamSelesai || !form.judul || !form.deskripsi) {
    toast.add({ title: 'Lengkapi semua field', color: 'error' })
    return
  }
  if (form.judul.length < 5) {
    toast.add({ title: 'Judul minimal 5 karakter', color: 'error' })
    return
  }
  if (form.deskripsi.length < 20) {
    toast.add({ title: 'Deskripsi minimal 20 karakter', color: 'error' })
    return
  }
  if (form.jamMulai >= form.jamSelesai) {
    toast.add({ title: 'Jam mulai harus sebelum jam selesai', color: 'error' })
    return
  }

  submitting.value = true
  await new Promise(r => setTimeout(r, 1000))

  if (editingLog.value) {
    const idx = logbooks.value.findIndex(l => l.id === editingLog.value.id)
    if (idx !== -1) {
      logbooks.value[idx] = { ...logbooks.value[idx], ...form, status: 'Pending' }
    }
    toast.add({ title: 'Logbook berhasil diperbarui', color: 'success' })
  } else {
    logbooks.value.unshift({
      id: Date.now(),
      tanggal: new Date(form.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      tanggalRaw: form.tanggal,
      jamMulai: form.jamMulai,
      jamSelesai: form.jamSelesai,
      judul: form.judul,
      deskripsi: form.deskripsi,
      foto: form.fotoPreview,
      status: 'Pending'
    })
    stats.total++
    stats.pending++
    toast.add({ title: 'Logbook berhasil ditambahkan', color: 'success' })
  }

  submitting.value = false
  modalOpen.value = false
}

function deleteLogbook(id: number) {
  logbooks.value = logbooks.value.filter(l => l.id !== id)
  toast.add({ title: 'Logbook dihapus', color: 'neutral' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 48, approved: 42, pending: 4 })
  logbooks.value = [
    { id: 1, tanggal: '15 Des 2024', tanggalRaw: '2024-12-15', jamMulai: '08:00', jamSelesai: '16:00', judul: 'Membuat UI Dashboard Admin', deskripsi: 'Mengerjakan tampilan dashboard admin menggunakan Vue.js dan Tailwind CSS untuk project internal perusahaan.', foto: '', status: 'Pending' },
    { id: 2, tanggal: '14 Des 2024', tanggalRaw: '2024-12-14', jamMulai: '09:00', jamSelesai: '12:00', judul: 'Meeting dengan Tim Development', deskripsi: 'Diskusi progress project dan pembagian tugas untuk sprint berikutnya.', foto: '', status: 'Disetujui' },
    { id: 3, tanggal: '13 Des 2024', tanggalRaw: '2024-12-13', jamMulai: '08:00', jamSelesai: '17:00', judul: 'Implementasi REST API', deskripsi: 'Membuat endpoint API untuk fitur authentication dan user management.', foto: '', status: 'Ditolak', catatan: 'Tolong tambahkan detail teknis yang lebih spesifik tentang endpoint yang dibuat.' },
    { id: 4, tanggal: '12 Des 2024', tanggalRaw: '2024-12-12', jamMulai: '10:00', jamSelesai: '15:00', judul: 'Code Review', deskripsi: 'Review kode dari tim dan memberikan feedback untuk improvement.', foto: '', status: 'Disetujui' }
  ]
  loading.value = false
})

useHead({ title: 'Logbook | Siswa PKL' })
</script>
