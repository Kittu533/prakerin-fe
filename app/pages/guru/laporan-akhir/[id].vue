<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/laporan-akhir" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Header -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <div v-if="loading" class="flex flex-col md:flex-row gap-6">
        <USkeleton class="w-14 h-14 rounded-xl" />
        <div class="flex-1 space-y-3">
          <USkeleton class="h-6 w-48" />
          <USkeleton class="h-4 w-32" />
          <div class="flex gap-2">
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col md:flex-row gap-6">
        <div class="w-14 h-14 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold shrink-0">
          {{ laporan.inisial }}
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 class="text-xl font-bold text-slate-900">{{ laporan.nama }}</h1>
              <p class="text-slate-500">{{ laporan.kelas }} • {{ laporan.nis }}</p>
            </div>
            <UBadge :color="getStatusColor(laporan.status)" variant="subtle">{{ laporan.status }}</UBadge>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
            <span class="flex items-center gap-1">
              <Icon name="lucide:building-2" class="w-4 h-4" />
              {{ laporan.industri }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              Submit: {{ laporan.tanggalSubmit }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:file" class="w-4 h-4" />
              {{ laporan.halaman }} halaman
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="!loading && laporan.status === 'Review'" class="bg-sky-50 border border-sky-200 rounded-xl p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-sky-100 text-sky-600">
            <Icon name="lucide:clock" class="w-5 h-5" />
          </div>
          <div>
            <p class="font-medium text-sky-800">Menunggu Review</p>
            <p class="text-sm text-sky-600">Laporan ini membutuhkan verifikasi Anda</p>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton color="success" @click="approve">
            <Icon name="lucide:check" class="w-4 h-4 mr-1" />
            Setujui
          </UButton>
          <UButton color="warning" variant="soft" @click="revisionModal = true">
            <Icon name="lucide:edit" class="w-4 h-4 mr-1" />
            Minta Revisi
          </UButton>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Preview -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">Preview Laporan</h2>
            <UButton variant="soft" color="primary" size="sm" @click="downloadPdf">
              <Icon name="lucide:download" class="w-4 h-4 mr-1" />
              Download PDF
            </UButton>
          </div>
          <div v-if="loading" class="p-6">
            <USkeleton class="h-96 w-full rounded-lg" />
          </div>
          <div v-else class="p-6">
            <div class="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
              <div class="text-center">
                <Icon name="lucide:file-text" class="w-16 h-16 text-slate-400 mx-auto mb-3" />
                <p class="text-slate-600 font-medium">{{ laporan.judul }}</p>
                <p class="text-sm text-slate-500 mt-1">Klik untuk melihat preview</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapters -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Daftar Bab</h2>
          </div>
          <div v-if="loading" class="p-4 space-y-3">
            <USkeleton v-for="i in 5" :key="i" class="h-12 w-full rounded-lg" />
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="(bab, idx) in chapters" :key="idx" class="flex items-center gap-4 px-6 py-3 hover:bg-slate-50">
              <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-semibold">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">{{ bab.judul }}</p>
                <p class="text-xs text-slate-500">{{ bab.halaman }} halaman</p>
              </div>
              <Icon name="lucide:check-circle" class="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Info -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Informasi Laporan</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Judul</span>
              <span class="font-medium text-slate-900 text-right max-w-[60%]">{{ laporan.judul }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Total Halaman</span>
              <span class="font-medium text-slate-900">{{ laporan.halaman }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Ukuran File</span>
              <span class="font-medium text-slate-900">{{ laporan.ukuran }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Terakhir Update</span>
              <span class="font-medium text-slate-900">{{ laporan.lastUpdate }}</span>
            </div>
          </div>
        </div>

        <!-- History -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Riwayat</h3>
          <div class="space-y-4">
            <div v-for="(item, idx) in history" :key="idx" class="flex gap-3">
              <div class="w-2 h-2 rounded-full mt-2 shrink-0" :class="item.color" />
              <div>
                <p class="text-sm text-slate-900">{{ item.action }}</p>
                <p class="text-xs text-slate-500">{{ item.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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

const route = useRoute()
const toast = useToast()
const loading = ref(true)
const revisionModal = ref(false)
const revisionNote = ref('')

const laporan = ref({})
const chapters = ref([])
const history = ref([])

const getStatusColor = (status) => {
  const colors = { Draft: 'warning', Review: 'primary', Final: 'success' }
  return colors[status] || 'neutral'
}

const approve = () => {
  laporan.value.status = 'Final'
  toast.add({ title: 'Laporan disetujui', color: 'success' })
}

const submitRevision = () => {
  if (revisionNote.value) {
    laporan.value.status = 'Draft'
    revisionModal.value = false
    toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
  }
}

const downloadPdf = () => {
  toast.add({ title: 'Download dimulai...', color: 'primary' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  laporan.value = {
    id: route.params.id,
    nama: 'Ryobi Surya Atmaja',
    inisial: 'RS',
    kelas: 'XII RPL 1',
    nis: '2023010563',
    industri: 'PT. Telkom Indonesia',
    status: 'Review',
    tanggalSubmit: '14 Des 2024',
    halaman: 45,
    judul: 'Laporan PKL di PT. Telkom',
    ukuran: '2.4 MB',
    lastUpdate: '14 Des 2024, 10:30'
  }
  chapters.value = [
    { judul: 'Pendahuluan', halaman: 5 },
    { judul: 'Profil Perusahaan', halaman: 8 },
    { judul: 'Pelaksanaan PKL', halaman: 15 },
    { judul: 'Hasil dan Pembahasan', halaman: 12 },
    { judul: 'Penutup', halaman: 5 }
  ]
  history.value = [
    { action: 'Laporan disubmit untuk review', date: '14 Des 2024', color: 'bg-sky-500' },
    { action: 'Draft laporan dibuat', date: '10 Des 2024', color: 'bg-amber-500' },
    { action: 'Mulai menulis laporan', date: '1 Des 2024', color: 'bg-slate-400' }
  ]
  loading.value = false
})

useHead({ title: 'Detail Laporan | Guru PKL' })
</script>
