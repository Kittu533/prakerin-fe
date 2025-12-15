<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Verifikasi Pengajuan</h1>
      <p class="text-sm text-slate-500">Kelola pengajuan PKL siswa</p>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="['Semua', 'Menunggu', 'Disetujui', 'Ditolak']" class="w-full sm:w-36" />
        <USelectMenu v-model="filterJurusan" :items="['Semua Jurusan', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-36" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('') }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</p>
              <p class="text-xs text-slate-500">{{ row.original.kelas }}</p>
            </div>
          </div>
        </template>
        <template #jalur-cell="{ row }">
          <UBadge :color="row.original.jalur === 'Mitra' ? 'primary' : 'warning'" variant="subtle" size="xs">{{ row.original.jalur }}</UBadge>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle" size="xs">{{ row.original.status }}</UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" variant="ghost" @click="openDetail(row.original)">
            <Icon name="lucide:eye" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard v-if="selected">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Detail Pengajuan</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div class="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                {{ selected.siswa.split(' ').map((n: string) => n[0]).join('') }}
              </div>
              <div>
                <p class="font-semibold text-slate-900">{{ selected.siswa }}</p>
                <p class="text-sm text-slate-500">{{ selected.kelas }} - {{ selected.jurusan }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Perusahaan</p>
                <p class="font-medium text-slate-900">{{ selected.perusahaan }}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Jalur</p>
                <p class="font-medium text-slate-900">{{ selected.jalur }}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Bidang Perusahaan</p>
                <p class="font-medium text-slate-900">{{ selected.bidang }}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Tanggal Pengajuan</p>
                <p class="font-medium text-slate-900">{{ selected.tanggal }}</p>
              </div>
            </div>

            <!-- Match indicator -->
            <UAlert :color="selected.jurusan === selected.bidang ? 'success' : 'warning'" :icon="selected.jurusan === selected.bidang ? 'lucide:check-circle' : 'lucide:alert-circle'">
              <template #title>{{ selected.jurusan === selected.bidang ? 'Jurusan Sesuai' : 'Jurusan Berbeda' }}</template>
              <template #description>Jurusan siswa: {{ selected.jurusan }} | Bidang perusahaan: {{ selected.bidang }}</template>
            </UAlert>

            <UFormField v-if="selected.status === 'Menunggu'" label="Alasan Penolakan (jika ditolak)">
              <UTextarea v-model="rejectReason" placeholder="Masukkan alasan..." :rows="2" />
            </UFormField>
          </div>

          <template #footer>
            <div v-if="selected.status === 'Menunggu'" class="flex gap-3">
              <UButton color="error" variant="outline" class="flex-1" :loading="processing" @click="reject">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />Tolak
              </UButton>
              <UButton color="success" class="flex-1" :loading="processing" @click="approve">
                <Icon name="lucide:check" class="w-4 h-4 mr-2" />Setujui
              </UButton>
            </div>
            <UBadge v-else :color="statusColor(selected.status)" size="lg">{{ selected.status }}</UBadge>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref('Semua')
const filterJurusan = ref('Semua Jurusan')
const modalOpen = ref(false)
const selected = ref<any>(null)
const rejectReason = ref('')
const processing = ref(false)

const data = ref([
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII RPL 1', jurusan: 'RPL', perusahaan: 'PT Telkom', bidang: 'IT', jalur: 'Mitra', tanggal: '15 Des 2024', status: 'Menunggu' },
  { id: 2, siswa: 'Ani Wijaya', kelas: 'XII TKJ 2', jurusan: 'TKJ', perusahaan: 'PT Biznet', bidang: 'Jaringan', jalur: 'Mitra', tanggal: '14 Des 2024', status: 'Menunggu' },
  { id: 3, siswa: 'Deni Pratama', kelas: 'XII MM 1', jurusan: 'MM', perusahaan: 'CV Digital', bidang: 'Multimedia', jalur: 'Mandiri', tanggal: '14 Des 2024', status: 'Disetujui' },
  { id: 4, siswa: 'Siti Aminah', kelas: 'XII RPL 2', jurusan: 'RPL', perusahaan: 'PT Astra', bidang: 'Otomotif', jalur: 'Mitra', tanggal: '13 Des 2024', status: 'Ditolak' },
  { id: 5, siswa: 'Rudi Hermawan', kelas: 'XII AKL 1', jurusan: 'AKL', perusahaan: 'PT Bank BCA', bidang: 'Keuangan', jalur: 'Mandiri', tanggal: '12 Des 2024', status: 'Menunggu' }
])

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'jalur', header: 'Jalur' },
  { accessorKey: 'tanggal', header: 'Tanggal' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase())
  const matchStatus = filterStatus.value === 'Semua' || d.status === filterStatus.value
  const matchJurusan = filterJurusan.value === 'Semua Jurusan' || d.jurusan === filterJurusan.value
  return matchSearch && matchStatus && matchJurusan
}))

const statusColor = (s: string) => ({ Menunggu: 'warning', Disetujui: 'success', Ditolak: 'error' })[s] || 'neutral'

const openDetail = (item: any) => {
  selected.value = item
  rejectReason.value = ''
  modalOpen.value = true
}

const approve = async () => {
  processing.value = true
  await new Promise(r => setTimeout(r, 1000))
  selected.value.status = 'Disetujui'
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Pengajuan disetujui', color: 'success' })
}

const reject = async () => {
  if (!rejectReason.value) {
    toast.add({ title: 'Masukkan alasan penolakan', color: 'error' })
    return
  }
  processing.value = true
  await new Promise(r => setTimeout(r, 1000))
  selected.value.status = 'Ditolak'
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Pengajuan ditolak', color: 'error' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Verifikasi | Admin' })
</script>
