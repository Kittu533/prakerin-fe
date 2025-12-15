<template>
  <section class="space-y-4 sm:space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500" aria-label="Breadcrumb">
      <NuxtLink to="/siswa" class="transition-colors hover:text-blue-600 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </NuxtLink>
      <span class="text-slate-300">›</span>
      <span class="text-slate-500">Profile</span>
      <span class="text-slate-300">›</span>
      <span class="font-semibold text-blue-600">Dokumen PKL</span>
    </nav>

    <!-- Header Section -->
    <div>
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Dokumen Prakerin</h1>
      <p class="mt-1 sm:mt-2 text-sm text-slate-600">Kelola dokumen prakerin Anda dengan mudah</p>
    </div>

    <!-- Upload Section -->
    <div class="bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div class="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">Upload Dokumen Baru</h2>
            <p class="text-xs sm:text-sm text-slate-600 mt-1">Format: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
          </div>
        </div>
        <button
          @click="isUploadModalOpen = true"
          class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base transition-all hover:bg-blue-700 active:scale-95 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Upload</span>
        </button>
      </div>
    </div>

    <!-- Documents Grid -->
    <div>
      <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Daftar Dokumen</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Document Card Component -->
        <DocumentCard
          v-for="doc in documents"
          :key="doc.name"
          :name="doc.name"
          :description="doc.description"
          :status="doc.status"
          :upload-date="doc.uploadDate"
          :file-size="doc.fileSize"
          :color="doc.color"
        />
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadModal
      v-model:open="isUploadModalOpen"
      :placements="placements"
      :document-types="documentTypes"
      @upload="handleUpload"
    />
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'siswa',
  title: 'Dokumen PKL'
})

const isUploadModalOpen = ref(false)

const documents = ref([
  {
    name: 'Laporan Mingguan',
    description: 'Laporan kegiatan mingguan prakerin',
    status: 'Perlu Review',
    uploadDate: '22 November 2024',
    fileSize: '1.2 MB',
    color: 'warning'
  },
  {
    name: 'Laporan Akhir',
    description: 'Laporan akhir kegiatan prakerin',
    status: 'Belum Upload',
    uploadDate: '-',
    fileSize: '-',
    color: 'blue'
  },
  {
    name: 'Dokumentasi',
    description: 'Foto dan video kegiatan prakerin',
    status: 'Disetujui',
    uploadDate: '25 November 2024',
    fileSize: '3.8 MB',
    color: 'purple'
  }
])

const placements = ref([
  { value: 1, label: 'PT. Telkom Indonesia - Web Developer' },
  { value: 2, label: 'PT. Gojek Indonesia - Mobile Developer' }
])

const documentTypes = ref([
  { value: 'laporan_mingguan', label: 'Laporan Mingguan' },
  { value: 'laporan_akhir', label: 'Laporan Akhir' },
  { value: 'dokumentasi', label: 'Dokumentasi Kegiatan' }
])

const handleUpload = async (form: any) => {
  console.log('📤 Uploading:', form)
  // API call here
}

useHead({
  title: 'Dokumen PKL | SIM Prakerin',
  meta: [{ name: 'description', content: 'Kelola dokumen prakerin' }]
})
</script>
