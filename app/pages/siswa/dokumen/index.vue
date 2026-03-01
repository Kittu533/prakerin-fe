<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Dokumen PKL</h1>
        <p class="text-sm text-slate-500 mt-1">Kelola dan pantau kelengkapan dokumen PKL kamu</p>
      </div>
      <!-- Mini stat pills -->
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
          {{ completedCount }} Lengkap
        </span>
        <span v-if="requiredPendingCount > 0" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {{ requiredPendingCount }} Wajib
        </span>
      </div>
    </div>

    <!-- Progress Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 via-sky-500 to-indigo-600 p-5 lg:p-6 text-white">
      <!-- Decorative circles -->
      <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div class="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

      <div class="relative flex items-center justify-between mb-4">
        <div>
          <p class="text-sky-100 text-sm font-medium">Kelengkapan Dokumen</p>
          <div class="flex items-baseline gap-1.5 mt-1">
            <p class="text-3xl font-bold tracking-tight">{{ progressPercent }}%</p>
            <p class="text-sky-200 text-sm">{{ completedCount }}/{{ allDocuments.length }} file</p>
          </div>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
          <Icon name="lucide:folder-check" class="w-7 h-7" />
        </div>
      </div>

      <!-- Segmented progress bar -->
      <div class="relative flex gap-1">
        <div
          v-for="doc in allDocuments"
          :key="doc.id"
          class="h-2 flex-1 rounded-full transition-all duration-500"
          :class="doc.uploaded ? 'bg-white' : 'bg-white/20'"
        />
      </div>
      <p class="text-sky-100/80 text-xs mt-2.5">
        {{ progressPercent === 100 ? 'Semua dokumen sudah lengkap! Kamu siap menyelesaikan PKL.' : `${allDocuments.length - completedCount} dokumen lagi perlu dilengkapi` }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="space-y-3">
        <USkeleton class="h-5 w-40 rounded-md" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <USkeleton class="h-40 rounded-2xl" />
          <USkeleton class="h-40 rounded-2xl" />
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Document Categories -->
      <div v-for="(category, ci) in categories" :key="category.label" class="space-y-3">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="categoryStyles[ci].iconBg">
            <Icon :name="category.icon" class="w-4 h-4" :class="categoryStyles[ci].iconColor" />
          </div>
          <h2 class="text-sm font-semibold text-slate-700">{{ category.label }}</h2>
          <div class="flex-1 h-px bg-slate-100" />
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="category.docs.every(d => d.uploaded) ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'">
            {{ category.docs.filter(d => d.uploaded).length }}/{{ category.docs.length }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="doc in category.docs"
            :key="doc.id"
            class="group relative rounded-2xl border bg-white transition-all duration-300"
            :class="[
              doc.uploaded
                ? 'border-green-100 shadow-sm hover:shadow-md hover:shadow-green-100/50'
                : dragOverId === doc.id
                  ? 'border-sky-400 bg-sky-50/50 shadow-md shadow-sky-100/50 scale-[1.01]'
                  : doc.required
                    ? 'border-amber-100 shadow-sm hover:shadow-md hover:shadow-amber-100/50'
                    : 'border-slate-100 shadow-sm hover:shadow-md hover:shadow-slate-100/50',
            ]"
            @dragover.prevent="onDragOver(doc.id)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop($event, doc)"
          >
            <div class="p-4 lg:p-5">
              <!-- Top row: icon + title + badge -->
              <div class="flex items-start gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                  :class="doc.uploaded ? 'bg-green-50 ring-1 ring-green-100' : doc.required ? 'bg-amber-50 ring-1 ring-amber-100' : 'bg-slate-50 ring-1 ring-slate-100'"
                >
                  <Icon
                    :name="doc.uploaded ? 'lucide:file-check-2' : getDocIcon(doc.type)"
                    class="w-5.5 h-5.5"
                    :class="doc.uploaded ? 'text-green-500' : doc.required ? 'text-amber-500' : 'text-slate-400'"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-semibold text-slate-900 text-sm leading-snug">{{ doc.name }}</p>
                    <span
                      class="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      :class="doc.uploaded ? 'bg-green-50 text-green-600' : doc.required ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'"
                    >
                      <span class="w-1 h-1 rounded-full" :class="doc.uploaded ? 'bg-green-500' : doc.required ? 'bg-amber-500' : 'bg-slate-400'" />
                      {{ doc.uploaded ? 'Lengkap' : doc.required ? 'Wajib' : 'Opsional' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ doc.description }}</p>
                </div>
              </div>

              <!-- Uploaded state -->
              <div v-if="doc.uploaded" class="mt-4">
                <!-- File info pill -->
                <div class="flex items-center gap-2 p-2.5 rounded-xl bg-green-50/70">
                  <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Icon :name="getFileTypeIcon(doc.fileName)" class="w-4 h-4 text-green-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-slate-700 truncate">{{ doc.fileName }}</p>
                    <p class="text-[10px] text-green-600">Diupload {{ doc.date }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="mt-3 flex items-center gap-2">
                  <UButton size="xs" variant="soft" color="primary" class="flex-1 justify-center" @click="viewDoc(doc)">
                    <Icon name="lucide:eye" class="w-3.5 h-3.5 mr-1.5" />
                    Lihat
                  </UButton>
                  <UButton size="xs" variant="soft" color="neutral" class="flex-1 justify-center" @click="downloadDoc(doc)">
                    <Icon name="lucide:download" class="w-3.5 h-3.5 mr-1.5" />
                    Unduh
                  </UButton>
                  <UButton size="xs" variant="ghost" color="neutral" @click="triggerUpload(doc)" title="Ganti file">
                    <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
                  </UButton>
                </div>
              </div>

              <!-- Empty / Upload state -->
              <div v-else class="mt-4">
                <button
                  class="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
                  :class="dragOverId === doc.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'"
                  @click="triggerUpload(doc)"
                >
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center transition-colors" :class="dragOverId === doc.id ? 'bg-sky-100' : 'group-hover:bg-sky-50'">
                    <Icon name="lucide:cloud-upload" class="w-5 h-5" :class="dragOverId === doc.id ? 'text-sky-500' : 'text-slate-400'" />
                  </div>
                  <div class="text-center">
                    <p class="text-xs font-medium" :class="dragOverId === doc.id ? 'text-sky-600' : 'text-slate-600'">
                      {{ dragOverId === doc.id ? 'Lepas file di sini' : 'Klik atau seret file ke sini' }}
                    </p>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ doc.formatHint }}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips Card -->
      <div class="rounded-2xl bg-linear-to-br from-sky-50 to-indigo-50 border border-sky-100/80 p-5">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
            <Icon name="lucide:lightbulb" class="w-4.5 h-4.5 text-sky-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">Tips Upload Dokumen</p>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div class="flex items-start gap-2 p-2.5 rounded-xl bg-white/60">
                <Icon name="lucide:scan" class="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <p class="text-xs text-slate-600 leading-relaxed">Pastikan dokumen jelas dan dapat dibaca</p>
              </div>
              <div class="flex items-start gap-2 p-2.5 rounded-xl bg-white/60">
                <Icon name="lucide:file-type" class="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <p class="text-xs text-slate-600 leading-relaxed">Format: PDF, JPG, PNG (maks. 5MB)</p>
              </div>
              <div class="flex items-start gap-2 p-2.5 rounded-xl bg-white/60">
                <Icon name="lucide:calendar-clock" class="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <p class="text-xs text-slate-600 leading-relaxed">Dokumen wajib dilengkapi sebelum PKL selesai</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="handleFileUpload" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'siswa' })

const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const uploadTarget = ref<any>(null)
const loading = ref(true)
const dragOverId = ref<number | null>(null)

interface DocItem {
  id: number
  name: string
  description: string
  type: 'surat' | 'kartu' | 'laporan' | 'sertifikat'
  category: 'administrasi' | 'pelaksanaan' | 'akhir'
  required: boolean
  uploaded: boolean
  date?: string
  fileName?: string
  formatHint: string
}

const documents = ref<DocItem[]>([])

const allDocuments = computed(() => documents.value)
const completedCount = computed(() => documents.value.filter(d => d.uploaded).length)
const requiredPendingCount = computed(() => documents.value.filter(d => d.required && !d.uploaded).length)
const progressPercent = computed(() =>
  documents.value.length > 0
    ? Math.round((completedCount.value / documents.value.length) * 100)
    : 0
)

const categoryStyles = [
  { iconBg: 'bg-sky-50', iconColor: 'text-sky-500' },
  { iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
  { iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
]

const categories = computed(() => [
  {
    label: 'Administrasi Awal',
    icon: 'lucide:file-text',
    docs: documents.value.filter(d => d.category === 'administrasi'),
  },
  {
    label: 'Pelaksanaan PKL',
    icon: 'lucide:clipboard-list',
    docs: documents.value.filter(d => d.category === 'pelaksanaan'),
  },
  {
    label: 'Akhir PKL',
    icon: 'lucide:award',
    docs: documents.value.filter(d => d.category === 'akhir'),
  },
])

function getDocIcon(type: string) {
  const icons: Record<string, string> = {
    surat: 'lucide:mail',
    kartu: 'lucide:id-card',
    laporan: 'lucide:file-text',
    sertifikat: 'lucide:award',
  }
  return icons[type] || 'lucide:file'
}

function getFileTypeIcon(fileName?: string) {
  if (!fileName) return 'lucide:file'
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'lucide:file-text'
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'lucide:image'
  return 'lucide:file'
}

// Drag & drop handlers
function onDragOver(docId: number) {
  dragOverId.value = docId
}

function onDragLeave() {
  dragOverId.value = null
}

function onDrop(e: DragEvent, doc: DocItem) {
  dragOverId.value = null
  if (doc.uploaded) return
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    uploadTarget.value = doc
    processUpload(file)
  }
}

function triggerUpload(doc: DocItem) {
  uploadTarget.value = doc
  fileInput.value?.click()
}

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !uploadTarget.value) return
  processUpload(file)
  if (fileInput.value) fileInput.value.value = ''
}

function processUpload(file: File) {
  // Validate size
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'File terlalu besar', description: 'Maksimal 5MB per file', color: 'error' })
    uploadTarget.value = null
    return
  }

  // Validate type
  const allowed = ['application/pdf', 'image/jpeg', 'image/png']
  if (!allowed.includes(file.type)) {
    toast.add({ title: 'Format tidak didukung', description: 'Gunakan PDF, JPG, atau PNG', color: 'error' })
    uploadTarget.value = null
    return
  }

  // Simulate upload
  const doc = documents.value.find(d => d.id === uploadTarget.value?.id)
  if (doc) {
    doc.uploaded = true
    doc.date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    doc.fileName = file.name
    toast.add({ title: `${doc.name} berhasil diupload`, color: 'success' })
  }

  uploadTarget.value = null
}

function viewDoc(doc: DocItem) {
  toast.add({ title: `Membuka ${doc.name}...`, color: 'info' })
}

function downloadDoc(doc: DocItem) {
  toast.add({ title: `Mengunduh ${doc.name}...`, color: 'info' })
}

onMounted(async () => {
  // Simulated load — replace with real API when backend document module is ready
  await new Promise(r => setTimeout(r, 400))

  documents.value = [
    {
      id: 1, name: 'Surat Pengantar Sekolah',
      description: 'Surat pengantar resmi dari sekolah untuk perusahaan',
      type: 'surat', category: 'administrasi', required: true,
      uploaded: true, date: '10 Nov 2024', fileName: 'surat_pengantar.pdf',
      formatHint: 'PDF, maks 5MB',
    },
    {
      id: 2, name: 'Surat Balasan Industri',
      description: 'Surat penerimaan dari perusahaan tujuan PKL',
      type: 'surat', category: 'administrasi', required: true,
      uploaded: true, date: '15 Nov 2024', fileName: 'balasan_industri.pdf',
      formatHint: 'PDF, maks 5MB',
    },
    {
      id: 3, name: 'Fotokopi KTP / Kartu Pelajar',
      description: 'Identitas diri untuk keperluan administrasi',
      type: 'kartu', category: 'administrasi', required: true,
      uploaded: false,
      formatHint: 'PDF / JPG / PNG, maks 5MB',
    },
    {
      id: 4, name: 'Kartu Bimbingan',
      description: 'Kartu catatan bimbingan guru pembimbing',
      type: 'kartu', category: 'pelaksanaan', required: true,
      uploaded: false,
      formatHint: 'PDF / JPG, maks 5MB',
    },
    {
      id: 5, name: 'Daftar Hadir / Absensi',
      description: 'Rekap kehadiran selama pelaksanaan PKL',
      type: 'laporan', category: 'pelaksanaan', required: false,
      uploaded: false,
      formatHint: 'PDF, maks 5MB',
    },
    {
      id: 6, name: 'Laporan Akhir PKL',
      description: 'Laporan lengkap hasil kegiatan PKL',
      type: 'laporan', category: 'akhir', required: true,
      uploaded: false,
      formatHint: 'PDF, maks 5MB',
    },
    {
      id: 7, name: 'Sertifikat PKL',
      description: 'Sertifikat kelulusan dari perusahaan',
      type: 'sertifikat', category: 'akhir', required: false,
      uploaded: false,
      formatHint: 'PDF / JPG / PNG, maks 5MB',
    },
  ]

  loading.value = false
})

useHead({ title: 'Dokumen | Siswa PKL' })
</script>
