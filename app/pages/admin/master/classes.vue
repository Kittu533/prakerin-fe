<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Kelas</h1>
        <p class="text-sm text-slate-500">Kelola data kelas</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari kelas..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterJurusan" :items="['Semua', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-32" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #jurusan-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.jurusan }}</UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" color="error" variant="ghost" @click="deleteItem(row.original.id)">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard class="w-full max-w-md">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Icon :name="editing ? 'lucide:edit' : 'lucide:school'" class="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Kelas</h3>
                <p class="text-xs text-slate-500">Atur informasi kelas dan wali kelas</p>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Nama Kelas" required>
              <UInput v-model="form.nama" placeholder="Contoh: XII RPL 1" class="w-full">
                <template #leading>
                  <Icon name="lucide:hash" class="w-4 h-4 text-slate-400" />
                </template>
              </UInput>
            </UFormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Jurusan" required>
                <USelectMenu 
                  v-model="form.jurusan" 
                  :items="jurusanList" 
                  placeholder="Pilih jurusan"
                  class="w-full"
                >
                  <template #leading>
                    <Icon name="lucide:layers" class="w-4 h-4 text-slate-400" />
                  </template>
                </USelectMenu>
              </UFormField>

              <UFormField label="Wali Kelas">
                <USelectMenu 
                  v-model="form.wali" 
                  :items="guruList" 
                  placeholder="Pilih guru"
                  class="w-full"
                >
                  <template #leading>
                    <Icon name="lucide:user" class="w-4 h-4 text-slate-400" />
                  </template>
                </USelectMenu>
              </UFormField>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <UButton variant="outline" color="neutral" @click="modalOpen = false" class="sm:w-auto w-full">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                Batal
              </UButton>
              <UButton color="primary" :loading="processing" @click="save" class="sm:w-auto w-full">
                <Icon name="lucide:check" class="w-4 h-4 mr-2" />
                {{ editing ? 'Simpan Perubahan' : 'Tambah Kelas' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterJurusan = ref('Semua')
const modalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)

// Data untuk dropdown
const jurusanList = ['RPL', 'TKJ', 'MM', 'AKL']
const guruList = [
  'Siti Aminah, S.Pd',
  'Budi Santoso, S.Kom',
  'Ahmad Wijaya, M.Pd',
  'Dewi Lestari, S.Pd',
  'Rina Susanti, S.Kom',
  'Joko Prasetyo, S.Pd',
  'Maya Putri, M.Kom'
]

const form = reactive({ id: null as number | null, nama: '', jurusan: null as string | null, wali: null as string | null })
const currentPage = ref(1)
const itemsPerPage = 10

const data = ref([
  { id: 1, nama: 'XII RPL 1', jurusan: 'RPL', wali: 'Siti Aminah, S.Pd', siswa: 32 },
  { id: 2, nama: 'XII RPL 2', jurusan: 'RPL', wali: 'Budi Santoso, S.Kom', siswa: 30 },
  { id: 3, nama: 'XII TKJ 1', jurusan: 'TKJ', wali: 'Ahmad Wijaya, M.Pd', siswa: 34 },
  { id: 4, nama: 'XII MM 1', jurusan: 'MM', wali: 'Dewi Lestari, S.Pd', siswa: 28 },
  { id: 5, nama: 'XII AKL 1', jurusan: 'AKL', wali: 'Rina Susanti, S.Kom', siswa: 30 }
])

const columns = [
  { accessorKey: 'nama', header: 'Nama Kelas' },
  { accessorKey: 'jurusan', header: 'Jurusan' },
  { accessorKey: 'wali', header: 'Wali Kelas' },
  { accessorKey: 'siswa', header: 'Jml Siswa' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
  const matchJurusan = filterJurusan.value === 'Semua' || d.jurusan === filterJurusan.value
  return matchSearch && matchJurusan
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterJurusan], () => { currentPage.value = 1 })

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nama: '', jurusan: null, wali: null })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nama || !form.jurusan) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], nama: form.nama, jurusan: form.jurusan!, wali: form.wali || '' }
  } else {
    data.value.unshift({ id: Date.now(), nama: form.nama, jurusan: form.jurusan!, wali: form.wali || '', siswa: 0 })
  }
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Data disimpan', color: 'success' })
}

const deleteItem = (id: number) => {
  data.value = data.value.filter(d => d.id !== id)
  toast.add({ title: 'Data dihapus', color: 'neutral' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Kelas | Admin' })
</script>
