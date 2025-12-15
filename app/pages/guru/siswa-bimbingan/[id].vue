<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/siswa-bimbingan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <div v-if="loading" class="flex flex-col sm:flex-row gap-6">
        <USkeleton class="w-20 h-20 rounded-2xl" />
        <div class="flex-1 space-y-3">
          <USkeleton class="h-6 w-48" />
          <USkeleton class="h-4 w-32" />
          <div class="flex gap-2">
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col sm:flex-row gap-6">
        <div class="w-20 h-20 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold shrink-0">
          {{ siswa.inisial }}
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-slate-900">{{ siswa.nama }}</h1>
          <p class="text-slate-500">{{ siswa.nis }} • {{ siswa.kelas }}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <UBadge :color="siswa.status === 'Aktif' ? 'success' : 'neutral'" variant="subtle">{{ siswa.status }}</UBadge>
            <UBadge color="primary" variant="subtle">
              <Icon name="lucide:building-2" class="w-3 h-3 mr-1" />
              {{ siswa.industri }}
            </UBadge>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton variant="outline" color="neutral" size="sm">
            <Icon name="lucide:message-square" class="w-4 h-4" />
          </UButton>
          <UButton variant="outline" color="neutral" size="sm">
            <Icon name="lucide:phone" class="w-4 h-4" />
          </UButton>
        </div>
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
          <p class="text-sm text-slate-500 mb-1">Kehadiran</p>
          <p class="text-xl font-bold" :class="siswa.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">{{ siswa.kehadiran }}%</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Total Logbook</p>
          <p class="text-xl font-bold text-slate-900">{{ siswa.totalLogbook }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Hari PKL</p>
          <p class="text-xl font-bold text-slate-900">{{ siswa.hariPkl }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Nilai Sementara</p>
          <p class="text-xl font-bold text-sky-600">{{ siswa.nilai || '-' }}</p>
        </div>
      </template>
    </div>

    <!-- Tabs Content -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="border-b border-slate-200">
        <nav class="flex gap-4 px-6">
          <button v-for="item in tabItems" :key="item.key" @click="activeTab = item.key" class="py-4 text-sm font-medium border-b-2 transition-colors" :class="activeTab === item.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'">
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-slate-500">Email</p>
              <p class="font-medium text-slate-900">{{ siswa.email }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">No. HP</p>
              <p class="font-medium text-slate-900">{{ siswa.phone }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Alamat</p>
              <p class="font-medium text-slate-900">{{ siswa.alamat }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500">Periode PKL</p>
              <p class="font-medium text-slate-900">{{ siswa.periode }}</p>
            </div>
          </div>
        </div>

        <!-- Logbook Tab -->
        <div v-if="activeTab === 'logbook'">
          <div v-if="loading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-lg" />
          </div>
          <div v-else class="space-y-3">
            <div v-for="log in logbooks" :key="log.id" class="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
              <div class="p-2 rounded-lg bg-sky-100 text-sky-600">
                <Icon name="lucide:file-text" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">{{ log.kegiatan }}</p>
                <p class="text-sm text-slate-500">{{ log.tanggal }}</p>
              </div>
              <UBadge :color="getLogStatusColor(log.status)" variant="subtle" size="xs">{{ log.status }}</UBadge>
            </div>
          </div>
        </div>

        <!-- Absensi Tab -->
        <div v-if="activeTab === 'absensi'">
          <div class="text-center py-8 text-slate-500">
            <Icon name="lucide:calendar" class="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>Data absensi akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const route = useRoute()
const loading = ref(true)
const activeTab = ref('info')

const tabItems = [
  { key: 'info', label: 'Informasi' },
  { key: 'logbook', label: 'Logbook' },
  { key: 'absensi', label: 'Absensi' }
]

const siswa = ref({})
const logbooks = ref([])

const getLogStatusColor = (status) => {
  const colors = { Disetujui: 'success', Pending: 'warning', Ditolak: 'error' }
  return colors[status] || 'neutral'
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  siswa.value = {
    id: route.params.id,
    nama: 'Ryobi Surya Atmaja',
    inisial: 'RS',
    nis: '2023010563',
    kelas: 'XII RPL 1',
    industri: 'PT. Telkom Indonesia',
    status: 'Aktif',
    kehadiran: 95,
    totalLogbook: 48,
    hariPkl: 85,
    nilai: 'A',
    email: 'ryobi@student.smk.sch.id',
    phone: '081234567890',
    alamat: 'Jl. Merdeka No. 123, Wonogiri',
    periode: '1 Juli - 31 Desember 2024'
  }
  logbooks.value = [
    { id: 1, kegiatan: 'Membuat UI Dashboard', tanggal: '15 Des 2024', status: 'Disetujui' },
    { id: 2, kegiatan: 'Meeting dengan tim', tanggal: '14 Des 2024', status: 'Disetujui' },
    { id: 3, kegiatan: 'Implementasi API', tanggal: '13 Des 2024', status: 'Pending' }
  ]
  loading.value = false
})

useHead({ title: 'Detail Siswa | Guru PKL' })
</script>
