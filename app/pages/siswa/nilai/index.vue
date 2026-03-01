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
      <!-- No Penempatan -->
      <div v-if="noPenempatan" class="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Icon name="lucide:map-pin-off" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="font-medium text-slate-700">Belum Ada Penempatan</p>
        <p class="text-sm text-slate-500 mt-1">Kamu belum memiliki penempatan PKL aktif</p>
      </div>

      <!-- No Penilaian Yet -->
      <div v-else-if="!penilaian" class="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Icon name="lucide:award" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="font-medium text-slate-700">Belum Ada Penilaian</p>
        <p class="text-sm text-slate-500 mt-1">Nilai PKL akan muncul setelah pembimbing memberikan penilaian</p>
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
        
        <!-- Catatan Penilaian -->
        <div v-if="penilaian.catatan_penilaian" class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-2">Catatan Pembimbing</h3>
          <p class="text-sm text-slate-600">{{ penilaian.catatan_penilaian }}</p>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  useSiswaPenilaianApi,
  useSiswaPenempatanApi,
  type SiswaPenilaian,
  type SiswaPenempatan
} from '~/composables/api/use-siswa'

definePageMeta({ layout: 'siswa' })

const toast = useToast()

// API composables
const penilaianApi = useSiswaPenilaianApi()
const penempatanApi = useSiswaPenempatanApi()

// State
const loading = ref(true)
const penilaian = ref<SiswaPenilaian | null>(null)
const finalScore = ref(0)
const grade = ref('-')
const scores = ref<any[]>([])
const noPenempatan = ref(false)

// Calculate grade from score
function calculateGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'E'
}

// Build scores breakdown from penilaian data
function buildScores(p: SiswaPenilaian) {
  // Weights match backend: 20% each (total 100%)
  scores.value = [
    { label: 'Kedisiplinan', source: 'Pembimbing Industri', score: p.nilai_kedisiplinan, weight: 20 },
    { label: 'Keterampilan Kerja', source: 'Pembimbing Industri', score: p.nilai_keterampilan, weight: 20 },
    { label: 'Sikap & Perilaku', source: 'Pembimbing Industri', score: p.nilai_sikap, weight: 20 },
    { label: 'Nilai Pembimbing Perusahaan', source: 'Pembimbing Industri', score: p.nilai_pembimbing_perusahaan, weight: 20 },
    { label: 'Nilai Pembimbing Sekolah', source: 'Guru Pembimbing', score: p.nilai_pembimbing_sekolah, weight: 20 }
  ]
}

// Load data from API
async function loadData() {
  loading.value = true
  noPenempatan.value = false
  
  try {
    // Get penempatan first
    const penempatanRes = await penempatanApi.getMyPenempatan()
    if (!penempatanRes.success || !penempatanRes.data) {
      noPenempatan.value = true
      return
    }

    // Get penilaian by penempatan ID
    const penilaianRes = await penilaianApi.getByPenempatan(penempatanRes.data.id_penempatan)
    if (penilaianRes.success && penilaianRes.data) {
      penilaian.value = penilaianRes.data
      
      const p = penilaianRes.data

      // Use backend-calculated nilai_akhir, fallback to average of available scores
      if (p.nilai_akhir != null) {
        finalScore.value = Math.round(Number(p.nilai_akhir))
      } else {
        const nilaiValues = [
          p.nilai_kedisiplinan,
          p.nilai_keterampilan,
          p.nilai_sikap,
          p.nilai_pembimbing_perusahaan,
          p.nilai_pembimbing_sekolah
        ].filter((v): v is number => v != null)
        
        if (nilaiValues.length > 0) {
          finalScore.value = Math.round(nilaiValues.reduce((a, b) => a + b, 0) / nilaiValues.length)
        }
      }

      grade.value = calculateGrade(finalScore.value)
      buildScores(p)
    }
    // If penilaianRes not success, penilaian stays null → shows "Belum Ada Penilaian"
  } catch (err) {
    console.error('Error loading penilaian:', err)
    toast.add({ title: 'Gagal memuat data penilaian', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

useHead({ title: 'Nilai PKL | Siswa PKL' })
</script>
