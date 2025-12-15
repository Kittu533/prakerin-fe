<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Dokumen PKL</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola dokumen PKL kamu</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-20 w-full rounded-xl" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="doc in documents" :key="doc.id" class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="doc.uploaded ? 'bg-green-100' : 'bg-slate-100'">
            <Icon :name="doc.uploaded ? 'lucide:file-check' : 'lucide:file'" class="w-6 h-6" :class="doc.uploaded ? 'text-green-600' : 'text-slate-400'" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900">{{ doc.name }}</p>
            <p class="text-xs text-slate-500">{{ doc.uploaded ? `Diupload: ${doc.date}` : 'Belum diupload' }}</p>
          </div>
          <UButton v-if="doc.uploaded" size="xs" variant="ghost" color="primary">
            <Icon name="lucide:download" class="w-4 h-4" />
          </UButton>
          <UButton v-else size="xs" color="primary">Upload</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'siswa' })

const loading = ref(true)
const documents = ref([])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  documents.value = [
    { id: 1, name: 'Surat Pengantar Sekolah', uploaded: true, date: '10 Nov 2024' },
    { id: 2, name: 'Surat Balasan Industri', uploaded: true, date: '15 Nov 2024' },
    { id: 3, name: 'Kartu Bimbingan', uploaded: false },
    { id: 4, name: 'Sertifikat PKL', uploaded: false }
  ]
  loading.value = false
})

useHead({ title: 'Dokumen | Siswa PKL' })
</script>
