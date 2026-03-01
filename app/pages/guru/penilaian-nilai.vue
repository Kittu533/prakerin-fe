<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton v-if="selectedSiswa" variant="ghost" color="neutral" size="sm" @click="backToList">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </UButton>
      <div class="flex-1">
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          {{ selectedSiswa ? `Nilai ${selectedSiswa.nama}` : 'Penilaian PKL' }}
        </h1>
        <p class="text-sm text-slate-500">{{ selectedSiswa ? `${selectedSiswa.kelas} • ${selectedSiswa.industri}` :
          'Pilih siswa untuk input nilai' }}</p>
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
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:users" class="w-4 h-4" />
            <span class="text-sm">Total Siswa</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Sudah Dinilai</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.graded }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm">Belum Dinilai</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.ungraded }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:trending-up" class="w-4 h-4" />
            <span class="text-sm">Rata-rata</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.average }}</p>
        </div>
      </template>
    </div>

    <!-- Student List View -->
    <template v-if="!selectedSiswa">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <UInput v-model="searchSiswa" placeholder="Cari nama siswa..." class="flex-1">
            <template #leading>
              <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
            </template>
          </UInput>
          <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status"
            class="w-full sm:w-44" />
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Siswa Bimbingan</h2>
          <p class="text-xs text-slate-500">Klik untuk melihat detail nilai siswa</p>
        </div>

        <div v-if="loading" class="divide-y divide-slate-100">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-4">
            <USkeleton class="w-12 h-12 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="siswa in filteredSiswa" :key="siswa.id"
            class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="selectSiswa(siswa)">
            <div
              class="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold shrink-0">
              {{ siswa.inisial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.industri }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="siswa.nilai" class="text-right">
                <p class="text-lg font-bold" :class="getNilaiColor(siswa.nilai)">{{ siswa.nilai }}</p>
                <p class="text-xs text-slate-500">Nilai Akhir</p>
              </div>
              <UBadge v-else color="warning" variant="subtle" size="xs">Belum Dinilai</UBadge>
              <Icon name="lucide:chevron-right" class="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div v-if="!filteredSiswa.length" class="py-12 text-center">
            <Icon name="lucide:award" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada data siswa</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Student Detail View -->
    <template v-else>
      <!-- Nilai Detail Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Detail Penilaian</h3>
          <UButton size="sm" :color="selectedSiswa.nilai ? 'neutral' : 'primary'" @click="openGradeModal">
            <Icon :name="selectedSiswa.nilai ? 'lucide:edit' : 'lucide:plus'" class="w-4 h-4 mr-1" />
            {{ selectedSiswa.nilai ? 'Edit Nilai' : 'Input Nilai' }}
          </UButton>
        </div>

        <div v-if="selectedSiswa.nilai" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">Sikap</p>
            <p class="text-2xl font-bold text-slate-900">{{ selectedSiswa.nilaiDetail?.nilai_sikap || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">Keterampilan</p>
            <p class="text-2xl font-bold text-slate-900">{{ selectedSiswa.nilaiDetail?.nilai_keterampilan || '-' }}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl text-center">
            <p class="text-sm text-slate-500 mb-1">Kedisiplinan</p>
            <p class="text-2xl font-bold text-slate-900">{{ selectedSiswa.nilaiDetail?.nilai_kedisiplinan || '-' }}</p>
          </div>
          <div class="p-4 bg-sky-50 rounded-xl text-center">
            <p class="text-sm text-sky-600 mb-1">Nilai Akhir</p>
            <p class="text-3xl font-bold" :class="getNilaiColor(selectedSiswa.nilai)">{{ selectedSiswa.nilai }}</p>
          </div>
        </div>

        <div v-else class="py-8 text-center">
          <Icon name="lucide:award" class="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p class="text-slate-500 mb-4">Siswa ini belum memiliki nilai</p>
          <UButton color="primary" @click="openGradeModal">
            <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
            Input Nilai Sekarang
          </UButton>
        </div>
      </div>
    </template>

    <!-- Grade Modal -->
    <UModal v-model:open="gradeModal">
      <template #content>
        <UCard class="max-h-[90vh] overflow-y-auto">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Input Nilai</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="gradeModal = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Siswa Info -->
            <div v-if="selectedSiswa" class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div class="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                {{ selectedSiswa.inisial }}
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ selectedSiswa.nama }}</p>
                <p class="text-xs text-slate-500">{{ selectedSiswa.kelas }} • {{ selectedSiswa.industri }}</p>
              </div>
            </div>

            <!-- Score Inputs -->
            <div class="grid grid-cols-1 gap-4">
              <UFormField label="Nilai Sikap" required>
                <UInput v-model.number="gradeForm.nilai_sikap" type="number" min="0" max="100"
                  placeholder="Masukkan nilai 0-100" class="w-full" size="lg" />
              </UFormField>

              <UFormField label="Nilai Keterampilan" required>
                <UInput v-model.number="gradeForm.nilai_keterampilan" type="number" min="0" max="100"
                  placeholder="Masukkan nilai 0-100" class="w-full" size="lg" />
              </UFormField>

              <UFormField label="Nilai Kedisiplinan" required>
                <UInput v-model.number="gradeForm.nilai_kedisiplinan" type="number" min="0" max="100"
                  placeholder="Masukkan nilai 0-100" class="w-full" size="lg" />
              </UFormField>
            </div>

            <!-- Calculated Grade -->
            <div class="flex items-center justify-between p-4 bg-sky-50 rounded-xl">
              <div>
                <p class="text-sm text-sky-600 font-medium">Nilai Akhir</p>
                <p class="text-xs text-slate-500">Rata-rata dari ketiga komponen</p>
              </div>
              <p class="text-3xl font-bold"
                :class="calculatedGrade !== '-' ? getNilaiColor(Number(calculatedGrade)) : 'text-slate-400'">
                {{ calculatedGrade }}
              </p>
            </div>

            <!-- Catatan -->
            <UFormField label="Catatan (opsional)">
              <UTextarea v-model="gradeForm.catatan_penilaian" placeholder="Tambahkan catatan untuk siswa..." :rows="2"
                class="w-full" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="gradeModal = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :disabled="calculatedGrade === '-'" @click="submitGrade">
                <Icon name="lucide:save" class="w-4 h-4 mr-2" />
                Simpan Nilai
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { usePenilaianApi } from '~/composables/api/use-internship'

definePageMeta({ layout: 'guru' })

const guruApi = useGuruApi()
const { upsert: upsertPenilaian } = usePenilaianApi()

const toast = useToast()
const loading = ref(true)
const searchSiswa = ref('')
const filterStatus = ref(null)
const gradeModal = ref(false)
const selectedSiswa = ref<any>(null)
const gradeForm = reactive({ 
  nilai_sikap: null, 
  nilai_keterampilan: null, 
  nilai_kedisiplinan: null, 
  catatan_penilaian: '' 
})

const statusOptions = ['Sudah Dinilai', 'Belum Dinilai']
const stats = reactive({ total: 0, graded: 0, ungraded: 0, average: 0 })
const siswaList = ref<any[]>([])

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const filteredSiswa = computed(() => {
  return siswaList.value.filter(item => {
    const matchSearch = !searchSiswa.value || item.nama.toLowerCase().includes(searchSiswa.value.toLowerCase())
    const matchStatus = !filterStatus.value ||
      (filterStatus.value === 'Sudah Dinilai' ? item.nilai : !item.nilai)
    return matchSearch && matchStatus
  })
})

const calculatedGrade = computed(() => {
  const { nilai_sikap, nilai_keterampilan, nilai_kedisiplinan } = gradeForm
  if (!nilai_sikap && !nilai_keterampilan && !nilai_kedisiplinan) return '-'
  const total = ((nilai_sikap || 0) + (nilai_keterampilan || 0) + (nilai_kedisiplinan || 0)) / 3
  return Math.round(total)
})

const getNilaiColor = (nilai: number) => {
  if (nilai >= 85) return 'text-green-600'
  if (nilai >= 70) return 'text-sky-600'
  if (nilai >= 55) return 'text-amber-600'
  return 'text-red-600'
}

const selectSiswa = (siswa: any) => {
  selectedSiswa.value = siswa
}

const backToList = () => {
  selectedSiswa.value = null
}

const openGradeModal = () => {
  if (selectedSiswa.value?.nilaiDetail) {
    Object.assign(gradeForm, selectedSiswa.value.nilaiDetail)
  } else {
    Object.assign(gradeForm, { nilai_sikap: null, nilai_keterampilan: null, nilai_kedisiplinan: null, catatan_penilaian: '' })
  }
  gradeModal.value = true
}

const submitGrade = async () => {
  if (selectedSiswa.value && calculatedGrade.value !== '-') {
    try {
      const payload = {
        nilai_sikap: gradeForm.nilai_sikap,
        nilai_keterampilan: gradeForm.nilai_keterampilan,
        nilai_kedisiplinan: gradeForm.nilai_kedisiplinan,
        nilai_pembimbing_sekolah: calculatedGrade.value as number,
        catatan_penilaian: gradeForm.catatan_penilaian
      }

      await upsertPenilaian(selectedSiswa.value.id_penempatan, payload)

      const wasUngraded = !selectedSiswa.value.nilai
      selectedSiswa.value.nilai = calculatedGrade.value
      selectedSiswa.value.nilaiDetail = { ...gradeForm }

      if (wasUngraded) {
        stats.graded++
        stats.ungraded--
      }

      // Recalculate average
      const gradedStudents = siswaList.value.filter(s => s.nilai)
      if (gradedStudents.length > 0) {
        stats.average = Math.round(gradedStudents.reduce((sum, s) => sum + s.nilai, 0) / gradedStudents.length)
      }

      gradeModal.value = false
      toast.add({ title: 'Nilai berhasil disimpan', color: 'success' })
    } catch (e) {
      console.error('Failed to save grade:', e)
      toast.add({ title: 'Gagal menyimpan nilai', color: 'error' })
    }
  }
}

async function fetchData() {
  try {
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    if (res?.data) {
      siswaList.value = res.data
        .filter((p: any) => p.status_penempatan === 'aktif')
        .map((p: any) => {
          const penilaian = p.penilaian || null
          const nilaiAkhir = penilaian?.nilai_akhir ? Math.round(Number(penilaian.nilai_akhir)) : null

          return {
            id: p.siswa?.id_siswa || p.id_penempatan,
            id_penempatan: p.id_penempatan,
            nama: p.siswa?.nama_siswa || '-',
            inisial: getInitials(p.siswa?.nama_siswa || 'XX'),
            kelas: p.siswa?.kelas?.nama_kelas || '-',
            industri: p.perusahaan?.nama_perusahaan || '-',
            nilai: nilaiAkhir,
            nilaiDetail: penilaian
          }
        })
    }

    // Calculate stats
    stats.total = siswaList.value.length
    stats.graded = siswaList.value.filter(s => s.nilai).length
    stats.ungraded = stats.total - stats.graded

    const gradedStudents = siswaList.value.filter(s => s.nilai)
    if (gradedStudents.length > 0) {
      stats.average = Math.round(gradedStudents.reduce((sum, s) => sum + s.nilai, 0) / gradedStudents.length)
    }
  } catch (e) {
    console.warn('Failed to fetch data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Penilaian PKL | Guru PKL' })
</script>
