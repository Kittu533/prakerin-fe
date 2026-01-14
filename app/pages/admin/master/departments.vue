<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Jurusan</h1>
        <p class="text-sm text-slate-500">Kelola data jurusan</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="paginatedData" :columns="columns">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.aktif ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.aktif ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
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
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Jurusan</h3></template>
          <div class="space-y-4">
            <UFormField label="Kode Jurusan" required>
              <UInput v-model="form.kode" placeholder="RPL" />
            </UFormField>
            <UFormField label="Nama Jurusan" required>
              <UInput v-model="form.nama" placeholder="Rekayasa Perangkat Lunak" />
            </UFormField>
            <UFormField label="Status">
              <USwitch v-model="form.aktif" label="Aktif" />
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
const modalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)

const form = reactive({ id: null as number | null, kode: '', nama: '', aktif: true })
const currentPage = ref(1)
const itemsPerPage = 10

const data = ref([
  { id: 1, kode: 'RPL', nama: 'Rekayasa Perangkat Lunak', aktif: true },
  { id: 2, kode: 'TKJ', nama: 'Teknik Komputer & Jaringan', aktif: true },
  { id: 3, kode: 'MM', nama: 'Multimedia', aktif: true },
  { id: 4, kode: 'AKL', nama: 'Akuntansi & Keuangan Lembaga', aktif: true }
])

const columns = [
  { accessorKey: 'kode', header: 'Kode' },
  { accessorKey: 'nama', header: 'Nama Jurusan' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const totalItems = computed(() => data.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return data.value.slice(start, start + itemsPerPage)
})

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, kode: '', nama: '', aktif: true })
  modalOpen.value = true
}

const save = async () => {
  if (!form.kode || !form.nama) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), kode: form.kode, nama: form.nama, aktif: form.aktif })
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

useHead({ title: 'Jurusan | Admin' })
</script>
