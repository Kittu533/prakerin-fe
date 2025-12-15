<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Laporan Akhir PKL</h1>
        <p class="text-sm text-slate-500 mt-1">Rekap laporan akhir siswa bimbingan</p>
      </div>
      <UButton color="primary" variant="outline" @click="exportAll">
        <Icon name="lucide:download" class="w-4 h-4 mr-2" />
        Export Semua
      </UButton>
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
            <Icon name="lucide:file-text" class="w-4 h-4" />
            <span class="text-sm">Total Laporan</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:edit" class="w-4 h-4" />
            <span class="text-sm">Draft</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.draft }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:eye" class="w-4 h-4" />
            <span class="text-sm">Review</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.review }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Final</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.final }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa..." class="flex-1">
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
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-6 w-20 rounded-full" />
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
                  <p class="text-sm text-slate-500">{{ item.kelas }} • {{ item.industri }}</p>
                </div>
                <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-slate-500 mb-3">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-4 h-4" />
                  {{ item.tanggalSubmit }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:file" class="w-4 h-4" />
                  {{ item.halaman }} halaman
                </span>
              </div>

              <div class="flex gap-2">
                <UButton size="sm" variant="soft" color="neutral" @click="viewReport(item.id)">
                  <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                  Lihat
                </UButton>
                <UButton v-if="item.status === 'Review'" size="sm" color="success" @click="approveReport(item.id)">
                  <Icon name="lucide:check" class="w-4 h-4 mr-1" />
                  Setujui
                </UButton>
                <UButton v-if="item.status === 'Review'" size="sm" variant="soft" color="warning" @click="requestRevision(item.id)">
                  <Icon name="lucide:edit" class="w-4 h-4 mr-1" />
                  Revisi
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!filteredData.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:file-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada laporan</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref(null)

const statusOptions = ['Draft', 'Review', 'Final']
const stats = reactive({ total: 0, draft: 0, review: 0, final: 0 })
const data = ref([])

const filteredData = computed(() => {
  return data.value.filter(item => {
    const matchSearch = !search.value || item.nama.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const getStatusColor = (status) => {
  const colors = { Draft: 'warning', Review: 'primary', Final: 'success' }
  return colors[status] || 'neutral'
}

const viewReport = (id) => navigateTo(`/guru/laporan-akhir/${id}`)

const approveReport = (id) => {
  const item = data.value.find(d => d.id === id)
  if (item) {
    item.status = 'Final'
    stats.review--
    stats.final++
    toast.add({ title: 'Laporan disetujui', color: 'success' })
  }
}

const requestRevision = (id) => {
  toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
}

const exportAll = () => {
  toast.add({ title: 'Export dimulai...', color: 'primary' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 24, draft: 5, review: 7, final: 12 })
  data.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', industri: 'PT. Telkom', status: 'Review', tanggalSubmit: '14 Des 2024', halaman: 45 },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', industri: 'PT. Gojek', status: 'Final', tanggalSubmit: '12 Des 2024', halaman: 52 },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', industri: 'CV. Digital', status: 'Draft', tanggalSubmit: '10 Des 2024', halaman: 28 },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', industri: 'PT. Media', status: 'Review', tanggalSubmit: '13 Des 2024', halaman: 38 }
  ]
  loading.value = false
})

useHead({ title: 'Laporan Akhir | Guru PKL' })
</script>
