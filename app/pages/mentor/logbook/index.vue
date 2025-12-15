<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Verifikasi Logbook</h1>
      <p class="text-sm text-slate-500">Review dan verifikasi logbook siswa</p>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="['Semua', 'Pending', 'Disetujui', 'Revisi']" class="w-full sm:w-32" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-warning-600">{{ stats.pending }}</p>
        <p class="text-sm text-slate-500">Pending</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-success-600">{{ stats.approved }}</p>
        <p class="text-sm text-slate-500">Disetujui</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-error-600">{{ stats.revision }}</p>
        <p class="text-sm text-slate-500">Revisi</p>
      </div>
    </div>

    <!-- List -->
    <div class="space-y-3">
      <template v-if="loading">
        <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
      </template>
      <template v-else>
        <div v-for="log in filteredData" :key="log.id" class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
                {{ log.siswa.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ log.siswa }}</p>
                <p class="text-xs text-slate-500">{{ log.tanggal }}</p>
              </div>
            </div>
            <UBadge :color="statusColor(log.status)" variant="subtle" size="xs">{{ log.status }}</UBadge>
          </div>
          <p class="text-sm font-medium text-slate-900 mb-1">{{ log.judul }}</p>
          <p class="text-sm text-slate-600 line-clamp-2 mb-3">{{ log.deskripsi }}</p>
          <div v-if="log.status === 'Pending'" class="flex gap-2">
            <UButton size="xs" color="success" @click="approve(log)">
              <Icon name="lucide:check" class="w-3 h-3 mr-1" />Setujui
            </UButton>
            <UButton size="xs" color="error" variant="outline" @click="openRevision(log)">
              <Icon name="lucide:edit" class="w-3 h-3 mr-1" />Minta Revisi
            </UButton>
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
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Minta Revisi</h3></template>
          <div class="space-y-4">
            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="text-sm font-medium text-slate-900">{{ selectedLog?.judul }}</p>
              <p class="text-xs text-slate-500">{{ selectedLog?.siswa }}</p>
            </div>
            <UFormField label="Catatan Revisi" required>
              <UTextarea v-model="revisionNote" placeholder="Jelaskan apa yang perlu diperbaiki..." :rows="3" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="revisionModal = false">Batal</UButton>
              <UButton color="error" class="flex-1" @click="requestRevision">Kirim</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterStatus = ref('Semua')
const revisionModal = ref(false)
const revisionNote = ref('')
const selectedLog = ref<any>(null)

const stats = reactive({ pending: 12, approved: 85, revision: 3 })

const data = ref([
  { id: 1, siswa: 'Budi Santoso', tanggal: '16 Des 2024', judul: 'Membuat UI Dashboard Admin', deskripsi: 'Mengerjakan tampilan dashboard admin menggunakan Vue.js dan Tailwind CSS untuk project internal perusahaan.', status: 'Pending' },
  { id: 2, siswa: 'Ani Wijaya', tanggal: '16 Des 2024', judul: 'Meeting dengan Tim Development', deskripsi: 'Diskusi progress project dan pembagian tugas untuk sprint berikutnya.', status: 'Pending' },
  { id: 3, siswa: 'Deni Pratama', tanggal: '15 Des 2024', judul: 'Implementasi REST API', deskripsi: 'Membuat endpoint API untuk fitur authentication dan user management.', status: 'Disetujui' },
  { id: 4, siswa: 'Siti Aminah', tanggal: '15 Des 2024', judul: 'Code Review', deskripsi: 'Review kode dari tim dan memberikan feedback untuk improvement.', status: 'Revisi' }
])

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase()) || d.judul.toLowerCase().includes(search.value.toLowerCase())
  const matchStatus = filterStatus.value === 'Semua' || d.status === filterStatus.value
  return matchSearch && matchStatus
}))

const statusColor = (s: string) => ({ Pending: 'warning', Disetujui: 'success', Revisi: 'error' })[s] || 'neutral'

const approve = (log: any) => {
  log.status = 'Disetujui'
  stats.pending--
  stats.approved++
  toast.add({ title: 'Logbook disetujui', color: 'success' })
}

const openRevision = (log: any) => {
  selectedLog.value = log
  revisionNote.value = ''
  revisionModal.value = true
}

const requestRevision = () => {
  if (!revisionNote.value) {
    toast.add({ title: 'Masukkan catatan revisi', color: 'error' })
    return
  }
  selectedLog.value.status = 'Revisi'
  stats.pending--
  stats.revision++
  revisionModal.value = false
  toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Verifikasi Logbook | Mentor' })
</script>
