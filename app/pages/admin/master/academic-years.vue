<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Tahun Ajaran</h1>
        <p class="text-sm text-slate-500">Kelola data tahun ajaran</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #aktif-cell="{ row }">
          <USwitch :model-value="row.original.aktif" @update:model-value="setActive(row.original)" />
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
          <template #header>
            <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Tahun Ajaran</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Tahun Ajaran" required>
              <UInput v-model="form.nama" placeholder="2024/2025" />
            </UFormField>
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Tanggal Mulai">
                <UInput v-model="form.mulai" type="date" />
              </UFormField>
              <UFormField label="Tanggal Selesai">
                <UInput v-model="form.selesai" type="date" />
              </UFormField>
            </div>
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

const form = reactive({ id: null as number | null, nama: '', mulai: '', selesai: '' })

const data = ref([
  { id: 1, nama: '2024/2025', mulai: '2024-07-01', selesai: '2025-06-30', aktif: true },
  { id: 2, nama: '2023/2024', mulai: '2023-07-01', selesai: '2024-06-30', aktif: false },
  { id: 3, nama: '2022/2023', mulai: '2022-07-01', selesai: '2023-06-30', aktif: false }
])

const columns = [
  { accessorKey: 'nama', header: 'Tahun Ajaran' },
  { accessorKey: 'mulai', header: 'Mulai' },
  { accessorKey: 'selesai', header: 'Selesai' },
  { accessorKey: 'aktif', header: 'Aktif' },
  { accessorKey: 'aksi', header: '' }
]

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nama: '', mulai: '', selesai: '' })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nama) { toast.add({ title: 'Nama wajib diisi', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), nama: form.nama, mulai: form.mulai, selesai: form.selesai, aktif: false })
  }
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Data disimpan', color: 'success' })
}

const setActive = (item: any) => {
  data.value.forEach(d => d.aktif = d.id === item.id)
  toast.add({ title: `${item.nama} diaktifkan`, color: 'success' })
}

const deleteItem = (id: number) => {
  data.value = data.value.filter(d => d.id !== id)
  toast.add({ title: 'Data dihapus', color: 'neutral' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: 'Tahun Ajaran | Admin' })
</script>
