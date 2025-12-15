<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Nilai PKL</h1>
      <p class="text-sm text-slate-500 mt-1">Lihat nilai PKL kamu</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-xl" />
      <USkeleton class="h-48 w-full rounded-xl" />
    </div>

    <template v-else>
      <!-- Final Score -->
      <div class="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white text-center">
        <p class="text-sm opacity-90">Nilai Akhir PKL</p>
        <p class="text-5xl font-bold mt-2">{{ finalScore }}</p>
        <UBadge color="white" variant="solid" class="mt-3">{{ grade }}</UBadge>
      </div>

      <!-- Score Breakdown -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Rincian Nilai</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in scores" :key="item.label" class="px-5 py-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-slate-900 text-sm">{{ item.label }}</p>
              <p class="text-xs text-slate-500">{{ item.source }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-slate-900">{{ item.score ?? '-' }}</p>
              <p class="text-xs text-slate-500">{{ item.weight }}%</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'siswa' })

const loading = ref(true)
const finalScore = ref(0)
const grade = ref('-')
const scores = ref([])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  finalScore.value = 87
  grade.value = 'A'
  scores.value = [
    { label: 'Sikap & Disiplin', source: 'Pembimbing Industri', score: 90, weight: 30 },
    { label: 'Keterampilan Kerja', source: 'Pembimbing Industri', score: 85, weight: 30 },
    { label: 'Laporan Akhir', source: 'Guru Pembimbing', score: 88, weight: 25 },
    { label: 'Presentasi', source: 'Guru Pembimbing', score: 84, weight: 15 }
  ]
  loading.value = false
})

useHead({ title: 'Nilai PKL | Siswa PKL' })
</script>
