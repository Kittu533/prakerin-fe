<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Verifikasi Logbook</h1>
        <p class="text-sm text-slate-500 mt-1">Verifikasi laporan kegiatan harian siswa</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-20 mb-2" />
          <USkeleton class="h-6 w-12" />
        </div>
      </template>
      <template v-else>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm">Pending</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Disetujui</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:x-circle" class="w-4 h-4" />
            <span class="text-sm">Revisi</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.revision }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:file-text" class="w-4 h-4" />
            <span class="text-sm">Total</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa atau kegiatan..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status" class="w-full sm:w-40" />
      </div>
    </div>

    <!-- List -->
    <div class="space-y-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-start gap-4">
            <USkeleton class="w-10 h-10 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
              <USkeleton class="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="item in filteredData" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm shrink-0">
              {{ item.inisial }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p class="font-medium text-slate-900">{{ item.nama }}</p>
                  <p class="text-sm text-slate-500">{{ item.kelas }} • {{ item.tanggal }}</p>
                </div>
                <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
              </div>
              
              <div class="bg-slate-50 rounded-lg p-3 mb-3">
                <p class="text-sm font-medium text-slate-700 mb-1">{{ item.kegiatan }}</p>
                <p class="text-sm text-slate-600">{{ item.deskripsi }}</p>
              </div>

              <div v-if="item.status === 'Pending'" class="flex gap-2">
                <UButton size="sm" color="success" @click="approve(item.id)">
                  <Icon name="lucide:check" class="w-4 h-4 mr-1" />
                  Setujui
                </UButton>
                <UButton size="sm" color="warning" variant="soft" @click="openRevision(item)">
                  <Icon name="lucide:edit" class="w-4 h-4 mr-1" />
                  Minta Revisi
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!filteredData.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada logbook</p>
        </div>
      </template>
    </div>

    <!-- Revision Modal -->
    <UModal v-model:open="revisionModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Minta Revisi</h3>
          <UTextarea v-model="revisionNote" placeholder="Tulis catatan revisi..." rows="4" class="mb-4" />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="revisionModal = false">Batal</UButton>
            <UButton color="warning" @click="submitRevision">Kirim</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref(null)
const revisionModal = ref(false)
const revisionNote = ref('')
const selectedItem = ref(null)

const statusOptions = ['Pending', 'Disetujui', 'Revisi']
const stats = reactive({ pending: 0, approved: 0, revision: 0, total: 0 })
const data = ref([])

const filteredData = computed(() => {
  return data.value.filter(item => {
    const matchSearch = !search.value || 
      item.nama.toLowerCase().includes(search.value.toLowerCase()) ||
      item.kegiatan.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const getStatusColor = (status) => {
  const colors = { Pending: 'warning', Disetujui: 'success', Revisi: 'error' }
  return colors[status] || 'neutral'
}

const approve = (id) => {
  const item = data.value.find(d => d.id === id)
  if (item) {
    item.status = 'Disetujui'
    stats.pending--
    stats.approved++
    toast.add({ title: 'Logbook disetujui', color: 'success' })
  }
}

const openRevision = (item) => {
  selectedItem.value = item
  revisionNote.value = ''
  revisionModal.value = true
}

const submitRevision = () => {
  if (selectedItem.value && revisionNote.value) {
    selectedItem.value.status = 'Revisi'
    stats.pending--
    stats.revision++
    revisionModal.value = false
    toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { pending: 12, approved: 156, revision: 8, total: 176 })
  data.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', tanggal: '15 Des 2024', kegiatan: 'Membuat UI Dashboard', deskripsi: 'Mengerjakan tampilan dashboard admin menggunakan Vue.js dan Tailwind CSS', status: 'Pending' },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', tanggal: '15 Des 2024', kegiatan: 'Meeting dengan Tim', deskripsi: 'Diskusi progress project dan pembagian tugas sprint berikutnya', status: 'Pending' },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', tanggal: '15 Des 2024', kegiatan: 'Konfigurasi Server', deskripsi: 'Setup dan konfigurasi web server nginx untuk deployment', status: 'Disetujui' },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', tanggal: '15 Des 2024', kegiatan: 'Desain Banner', deskripsi: 'Membuat desain banner promosi untuk media sosial', status: 'Pending' }
  ]
  loading.value = false
})

useHead({ title: 'Verifikasi Logbook | Guru PKL' })
</script>
