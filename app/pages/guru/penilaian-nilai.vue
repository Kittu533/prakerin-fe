<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Penilaian PKL</h1>
        <p class="text-sm text-slate-500 mt-1">Input dan kelola nilai siswa PKL</p>
      </div>
      <UButton color="primary" @click="exportData">
        <Icon name="lucide:download" class="w-4 h-4 mr-2" />
        Export Nilai
      </UButton>
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
            <span class="text-sm">Rata-rata Nilai</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.average }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterKelas" :options="kelasOptions" placeholder="Filter Kelas" class="w-full sm:w-40" />
        <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status" class="w-full sm:w-44" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="w-10 h-10 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-24" />
          </div>
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-8 w-24 rounded-lg" />
        </div>
      </div>

      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Siswa</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase hidden sm:table-cell">Kelas</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase hidden md:table-cell">Industri</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nilai</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in filteredData" :key="item.id" class="hover:bg-slate-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
                  {{ item.inisial }}
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ item.nama }}</p>
                  <p class="text-xs text-slate-500">{{ item.nis }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{{ item.kelas }}</td>
            <td class="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{{ item.industri }}</td>
            <td class="px-6 py-4">
              <span v-if="item.nilai" class="text-lg font-bold" :class="getNilaiColor(item.nilai)">{{ item.nilai }}</span>
              <span v-else class="text-slate-400">-</span>
            </td>
            <td class="px-6 py-4">
              <UBadge :color="item.nilai ? 'success' : 'warning'" variant="subtle" size="xs">
                {{ item.nilai ? 'Sudah Dinilai' : 'Belum Dinilai' }}
              </UBadge>
            </td>
            <td class="px-6 py-4">
              <UButton size="sm" :color="item.nilai ? 'neutral' : 'primary'" :variant="item.nilai ? 'soft' : 'solid'" @click="openGradeModal(item)">
                <Icon :name="item.nilai ? 'lucide:edit' : 'lucide:plus'" class="w-4 h-4 mr-1" />
                {{ item.nilai ? 'Edit' : 'Input' }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && !filteredData.length" class="py-12 text-center">
        <Icon name="lucide:award" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data</p>
      </div>
    </div>

    <!-- Grade Modal -->
    <UModal v-model:open="gradeModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Input Nilai</h3>
          <div v-if="selectedItem" class="mb-4 p-3 bg-slate-50 rounded-lg">
            <p class="font-medium text-slate-900">{{ selectedItem.nama }}</p>
            <p class="text-sm text-slate-500">{{ selectedItem.kelas }} • {{ selectedItem.industri }}</p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nilai Sikap (30%)</label>
              <UInput v-model.number="gradeForm.sikap" type="number" min="0" max="100" placeholder="0-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nilai Keterampilan (40%)</label>
              <UInput v-model.number="gradeForm.keterampilan" type="number" min="0" max="100" placeholder="0-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nilai Pengetahuan (30%)</label>
              <UInput v-model.number="gradeForm.pengetahuan" type="number" min="0" max="100" placeholder="0-100" />
            </div>
            <div class="p-3 bg-sky-50 rounded-lg">
              <p class="text-sm text-slate-600">Nilai Akhir</p>
              <p class="text-2xl font-bold text-sky-600">{{ calculatedGrade }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="ghost" color="neutral" @click="gradeModal = false">Batal</UButton>
            <UButton color="primary" @click="submitGrade">Simpan</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterKelas = ref(null)
const filterStatus = ref(null)
const gradeModal = ref(false)
const selectedItem = ref(null)
const gradeForm = reactive({ sikap: null, keterampilan: null, pengetahuan: null })

const kelasOptions = ['XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII MM 1']
const statusOptions = ['Sudah Dinilai', 'Belum Dinilai']
const stats = reactive({ total: 0, graded: 0, ungraded: 0, average: 0 })
const data = ref([])

const filteredData = computed(() => {
  return data.value.filter(item => {
    const matchSearch = !search.value || item.nama.toLowerCase().includes(search.value.toLowerCase())
    const matchKelas = !filterKelas.value || item.kelas === filterKelas.value
    const matchStatus = !filterStatus.value || 
      (filterStatus.value === 'Sudah Dinilai' ? item.nilai : !item.nilai)
    return matchSearch && matchKelas && matchStatus
  })
})

const calculatedGrade = computed(() => {
  const { sikap, keterampilan, pengetahuan } = gradeForm
  if (!sikap && !keterampilan && !pengetahuan) return '-'
  const total = ((sikap || 0) * 0.3) + ((keterampilan || 0) * 0.4) + ((pengetahuan || 0) * 0.3)
  return Math.round(total)
})

const getNilaiColor = (nilai) => {
  if (nilai >= 85) return 'text-green-600'
  if (nilai >= 70) return 'text-sky-600'
  if (nilai >= 55) return 'text-amber-600'
  return 'text-red-600'
}

const openGradeModal = (item) => {
  selectedItem.value = item
  Object.assign(gradeForm, { sikap: null, keterampilan: null, pengetahuan: null })
  gradeModal.value = true
}

const submitGrade = () => {
  if (selectedItem.value && calculatedGrade.value !== '-') {
    const wasUngraded = !selectedItem.value.nilai
    selectedItem.value.nilai = calculatedGrade.value
    if (wasUngraded) {
      stats.graded++
      stats.ungraded--
    }
    gradeModal.value = false
    toast.add({ title: 'Nilai berhasil disimpan', color: 'success' })
  }
}

const exportData = () => {
  toast.add({ title: 'Export data dimulai...', color: 'primary' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 24, graded: 18, ungraded: 6, average: 82 })
  data.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', nis: '2023010563', kelas: 'XII RPL 1', industri: 'PT. Telkom', nilai: 88 },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', nis: '2023010564', kelas: 'XII RPL 2', industri: 'PT. Gojek', nilai: 85 },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', nis: '2023010565', kelas: 'XII TKJ 1', industri: 'CV. Digital', nilai: null },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', nis: '2023010566', kelas: 'XII MM 1', industri: 'PT. Media', nilai: 92 },
    { id: 5, nama: 'Budi Prasetyo', inisial: 'BP', nis: '2023010567', kelas: 'XII RPL 1', industri: 'PT. Tokopedia', nilai: null }
  ]
  loading.value = false
})

useHead({ title: 'Penilaian PKL | Guru PKL' })
</script>
