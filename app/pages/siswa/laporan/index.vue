<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Laporan Akhir</h1>
      <p class="text-sm text-slate-500 mt-1">Upload dan kelola laporan akhir PKL</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-40 w-full rounded-xl" />
      <USkeleton class="h-24 w-full rounded-xl" />
    </div>

    <template v-else>
      <!-- Status Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="report.status === 'Final' ? 'bg-green-100' : 'bg-amber-100'">
            <Icon :name="report.status === 'Final' ? 'lucide:check-circle' : 'lucide:clock'" class="w-7 h-7" :class="report.status === 'Final' ? 'text-green-600' : 'text-amber-600'" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-slate-900">Status Laporan</p>
            <UBadge :color="report.status === 'Final' ? 'success' : 'warning'" variant="subtle">{{ report.status }}</UBadge>
          </div>
        </div>
      </div>

      <!-- Chapters -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Bab Laporan</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="ch in chapters" :key="ch.id" class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" :class="ch.uploaded ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'">
                {{ ch.id }}
              </div>
              <div>
                <p class="font-medium text-slate-900 text-sm">{{ ch.name }}</p>
                <p class="text-xs text-slate-500">{{ ch.uploaded ? ch.date : 'Belum diupload' }}</p>
              </div>
            </div>
            <UButton size="xs" :color="ch.uploaded ? 'neutral' : 'primary'" :variant="ch.uploaded ? 'ghost' : 'solid'">
              {{ ch.uploaded ? 'Ganti' : 'Upload' }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'siswa' })

const loading = ref(true)
const report = reactive({ status: 'Draft' })
const chapters = ref([])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  report.status = 'Review'
  chapters.value = [
    { id: 1, name: 'Pendahuluan', uploaded: true, date: '10 Des 2024' },
    { id: 2, name: 'Profil Industri', uploaded: true, date: '11 Des 2024' },
    { id: 3, name: 'Pelaksanaan PKL', uploaded: true, date: '12 Des 2024' },
    { id: 4, name: 'Penutup', uploaded: false }
  ]
  loading.value = false
})

useHead({ title: 'Laporan Akhir | Siswa PKL' })
</script>
