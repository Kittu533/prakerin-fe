<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Siswa</h1>
        <p class="text-sm text-slate-500">Kelola data siswa</p>
      </div>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" @click="importModal = true">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />Import
        </UButton>
        <UButton color="primary" @click="openModal()">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
        </UButton>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterJurusan" :items="['Semua', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-28" />
        <USelectMenu v-model="filterKelas" :items="kelasOptions" class="w-full sm:w-32" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
              <p class="text-xs text-slate-500">{{ row.original.nisn }}</p>
            </div>
          </div>
        </template>
        <template #kelas-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.kelas }}</UBadge>
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

    <!-- Form Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Siswa</h3></template>
          <div class="space-y-4">
            <UFormField label="NISN" required>
              <UInput v-model="form.nisn" placeholder="0012345678" />
            </UFormField>
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama" placeholder="Nama lengkap" />
            </UFormField>
            <UFormField label="Kelas" required>
              <USelectMenu v-model="form.kelas" :items="['XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII MM 1', 'XII AKL 1']" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@siswa.id" />
            </UFormField>
            <UFormField label="No HP">
              <UInput v-model="form.hp" type="tel" placeholder="08xxx" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :loading="processing" @click="save">Simpan</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Import Modal -->
    <UModal v-model:open="importModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Import Data Siswa</h3></template>
          <div class="space-y-4">
            <div class="p-4 bg-sky-50 rounded-lg">
              <p class="text-sm text-sky-700 mb-2">1. Download template Excel terlebih dahulu</p>
              <UButton size="sm" color="primary" variant="outline">
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />Download Template
              </UButton>
            </div>
            <div class="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
              <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="handleImport" />
              <Icon name="lucide:file-spreadsheet" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p class="text-sm text-slate-500 mb-2">Upload file Excel (.xlsx)</p>
              <UButton size="sm" color="primary" @click="($refs.fileInput as HTMLInputElement).click()">Pilih File</UButton>
            </div>
            <div v-if="importPreview.length" class="border border-slate-200 rounded-lg overflow-hidden">
              <p class="px-3 py-2 bg-slate-50 text-sm font-medium text-slate-700">Preview ({{ importPreview.length }} data)</p>
              <div class="max-h-40 overflow-y-auto">
                <table class="w-full text-sm">
                  <tr v-for="(row, i) in importPreview.slice(0, 5)" :key="i" class="border-t border-slate-100">
                    <td class="px-3 py-2">{{ row.nisn }}</td>
                    <td class="px-3 py-2">{{ row.nama }}</td>
                    <td class="px-3 py-2">{{ row.kelas }}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="importModal = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :disabled="!importPreview.length" :loading="importing" @click="commitImport">
                Import {{ importPreview.length }} Data
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
const filterKelas = ref('Semua')
const modalOpen = ref(false)
const importModal = ref(false)
const editing = ref(false)
const processing = ref(false)
const importing = ref(false)
const importPreview = ref<any[]>([])

const form = reactive({ id: null as number | null, nisn: '', nama: '', kelas: null as string | null, email: '', hp: '' })
const currentPage = ref(1)
const itemsPerPage = 10

const kelasOptions = ['Semua', 'XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII MM 1', 'XII AKL 1']

const data = ref([
  { id: 1, nisn: '0012345678', nama: 'Budi Santoso', kelas: 'XII RPL 1', email: 'budi@siswa.id', hp: '081234567890' },
  { id: 2, nisn: '0012345679', nama: 'Ani Wijaya', kelas: 'XII TKJ 1', email: 'ani@siswa.id', hp: '081234567891' },
  { id: 3, nisn: '0012345680', nama: 'Deni Pratama', kelas: 'XII MM 1', email: 'deni@siswa.id', hp: '081234567892' },
  { id: 4, nisn: '0012345681', nama: 'Siti Aminah', kelas: 'XII RPL 2', email: 'siti@siswa.id', hp: '081234567893' },
  { id: 5, nisn: '0012345682', nama: 'Rudi Hermawan', kelas: 'XII AKL 1', email: 'rudi@siswa.id', hp: '081234567894' }
])

const columns = [
  { accessorKey: 'nama', header: 'Siswa' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'hp', header: 'No HP' },
  { accessorKey: 'aksi', header: '' }
]

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase()) || d.nisn.includes(search.value)
  const matchJurusan = filterJurusan.value === 'Semua' || d.kelas.includes(filterJurusan.value)
  const matchKelas = filterKelas.value === 'Semua' || d.kelas === filterKelas.value
  return matchSearch && matchJurusan && matchKelas
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterJurusan, filterKelas], () => { currentPage.value = 1 })

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nisn: '', nama: '', kelas: null, email: '', hp: '' })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nisn || !form.nama || !form.kelas) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), nisn: form.nisn, nama: form.nama, kelas: form.kelas!, email: form.email, hp: form.hp })
  }
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Data disimpan', color: 'success' })
}

const deleteItem = (id: number) => {
  data.value = data.value.filter(d => d.id !== id)
  toast.add({ title: 'Data dihapus', color: 'neutral' })
}

const handleImport = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  // Mock preview - in real app, parse Excel file
  importPreview.value = [
    { nisn: '0012345690', nama: 'Import Siswa 1', kelas: 'XII RPL 1' },
    { nisn: '0012345691', nama: 'Import Siswa 2', kelas: 'XII RPL 1' },
    { nisn: '0012345692', nama: 'Import Siswa 3', kelas: 'XII TKJ 1' }
  ]
}

const commitImport = async () => {
  importing.value = true
  await new Promise(r => setTimeout(r, 1000))
  importPreview.value.forEach(row => {
    data.value.unshift({ id: Date.now() + Math.random(), ...row, email: '', hp: '' })
  })
  importing.value = false
  importModal.value = false
  importPreview.value = []
  toast.add({ title: 'Import berhasil', color: 'success' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Siswa | Admin' })
</script>
