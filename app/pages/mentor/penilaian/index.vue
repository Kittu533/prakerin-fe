<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Penilaian Siswa</h1>
        <p class="text-sm text-slate-500">Berikan penilaian untuk siswa PKL</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <UInput v-model="search" placeholder="Cari siswa..." class="max-w-sm">
        <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
      </UInput>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</p>
              <p class="text-xs text-slate-500">{{ row.original.kelas }}</p>
            </div>
          </div>
        </template>
        <template #nilai-cell="{ row }">
          <span v-if="row.original.nilai" class="text-sm font-bold" :class="row.original.nilai >= 80 ? 'text-success-600' : row.original.nilai >= 70 ? 'text-warning-600' : 'text-error-600'">
            {{ row.original.nilai }}
          </span>
          <span v-else class="text-sm text-slate-400">Belum dinilai</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.nilai ? 'success' : 'warning'" variant="subtle" size="xs">
            {{ row.original.nilai ? 'Sudah Dinilai' : 'Belum Dinilai' }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" @click="openModal(row.original)">
            <Icon name="lucide:edit" class="w-3 h-3 mr-1" />
            {{ row.original.nilai ? 'Edit' : 'Nilai' }}
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Penilaian Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard v-if="selected">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Penilaian Siswa</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="font-medium text-slate-900">{{ selected.siswa }}</p>
              <p class="text-sm text-slate-500">{{ selected.kelas }}</p>
            </div>

            <UFormField label="Sikap & Disiplin (0-100)" required>
              <UInput v-model.number="form.sikap" type="number" min="0" max="100" />
            </UFormField>

            <UFormField label="Keterampilan Kerja (0-100)" required>
              <UInput v-model.number="form.keterampilan" type="number" min="0" max="100" />
            </UFormField>

            <UFormField label="Kerjasama Tim (0-100)" required>
              <UInput v-model.number="form.kerjasama" type="number" min="0" max="100" />
            </UFormField>

            <UFormField label="Inisiatif (0-100)" required>
              <UInput v-model.number="form.inisiatif" type="number" min="0" max="100" />
            </UFormField>

            <UFormField label="Catatan">
              <UTextarea v-model="form.catatan" placeholder="Catatan tambahan..." :rows="2" />
            </UFormField>

            <div class="p-3 bg-primary-50 rounded-lg text-center">
              <p class="text-sm text-primary-600">Nilai Rata-rata</p>
              <p class="text-2xl font-bold text-primary-700">{{ averageScore }}</p>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :loading="processing" @click="saveNilai">Simpan</UButton>
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
const modalOpen = ref(false)
const processing = ref(false)
const selected = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = 10

const form = reactive({ sikap: 0, keterampilan: 0, kerjasama: 0, inisiatif: 0, catatan: '' })

const data = ref([
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII RPL 1', nilai: 87 },
  { id: 2, siswa: 'Ani Wijaya', kelas: 'XII RPL 1', nilai: 82 },
  { id: 3, siswa: 'Deni Pratama', kelas: 'XII RPL 2', nilai: null },
  { id: 4, siswa: 'Siti Aminah', kelas: 'XII TKJ 1', nilai: null },
  { id: 5, siswa: 'Rudi Hermawan', kelas: 'XII TKJ 2', nilai: 85 }
])

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'nilai', header: 'Nilai' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d => 
  !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase())
))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch(search, () => { currentPage.value = 1 })

const averageScore = computed(() => {
  const total = form.sikap + form.keterampilan + form.kerjasama + form.inisiatif
  return Math.round(total / 4) || 0
})

const openModal = (item: any) => {
  selected.value = item
  if (item.nilai) {
    Object.assign(form, { sikap: item.nilai, keterampilan: item.nilai, kerjasama: item.nilai, inisiatif: item.nilai, catatan: '' })
  } else {
    Object.assign(form, { sikap: 0, keterampilan: 0, kerjasama: 0, inisiatif: 0, catatan: '' })
  }
  modalOpen.value = true
}

const saveNilai = async () => {
  if (form.sikap < 0 || form.keterampilan < 0 || form.kerjasama < 0 || form.inisiatif < 0) {
    toast.add({ title: 'Nilai tidak boleh negatif', color: 'error' })
    return
  }
  processing.value = true
  await new Promise(r => setTimeout(r, 1000))
  selected.value.nilai = averageScore.value
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Penilaian disimpan', color: 'success' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Penilaian | Mentor' })
</script>
