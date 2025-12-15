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

    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Kelas</h3></template>
          <div class="space-y-4">
            <UFormField label="Nama Kelas" required>
              <UInput v-model="form.nama" placeholder="XII RPL 1" />
            </UFormField>
            <UFormField label="Jurusan" required>
              <USelectMenu v-model="form.jurusan" :items="['RPL', 'TKJ', 'MM', 'AKL']" />
            </UFormField>
            <UFormField label="Wali Kelas">
              <UInput v-model="form.wali" placeholder="Nama wali kelas" />
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

const form = reactive({ id: null as number | null, nama: '', jurusan: null as string | null, wali: '' })

const data = ref([
  { id: 1, nama: 'XII RPL 1', jurusan: 'RPL', wali: 'Siti Aminah', siswa: 32 },
  { id: 2, nama: 'XII RPL 2', jurusan: 'RPL', wali: 'Budi Santoso', siswa: 30 },
  { id: 3, nama: 'XII TKJ 1', jurusan: 'TKJ', wali: 'Ahmad Wijaya', siswa: 34 },
  { id: 4, nama: 'XII MM 1', jurusan: 'MM', wali: 'Dewi Lestari', siswa: 28 },
  { id: 5, nama: 'XII AKL 1', jurusan: 'AKL', wali: 'Rina Susanti', siswa: 30 }
])

const columns = [
  { accessorKey: 'nama', header: 'Nama Kelas' },
  { accessorKey: 'jurusan', header: 'Jurusan' },
  { accessorKey: 'wali', header: 'Wali Kelas' },
  { accessorKey: 'siswa', header: 'Jml Siswa' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
  const matchJurusan = filterJurusan.value === 'Semua' || d.jurusan === filterJurusan.value
  return matchSearch && matchJurusan
}))

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nama: '', jurusan: null, wali: '' })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nama || !form.jurusan) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), nama: form.nama, jurusan: form.jurusan!, wali: form.wali, siswa: 0 })
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
