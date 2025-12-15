<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Guru Pembimbing</h1>
        <p class="text-sm text-slate-500">Kelola data guru pembimbing PKL</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <UInput v-model="search" placeholder="Cari guru..." class="max-w-sm">
        <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
      </UInput>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
              <p class="text-xs text-slate-500">{{ row.original.nip }}</p>
            </div>
          </div>
        </template>
        <template #beban-cell="{ row }">
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ row.original.beban }} siswa</span>
            <div class="w-12 h-1.5 bg-slate-100 rounded-full">
              <div class="h-full bg-sky-500 rounded-full" :style="{ width: `${Math.min(row.original.beban * 5, 100)}%` }" />
            </div>
          </div>
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
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Guru</h3></template>
          <div class="space-y-4">
            <UFormField label="NIP">
              <UInput v-model="form.nip" placeholder="198501012010011001" />
            </UFormField>
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama" placeholder="Nama lengkap" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@sekolah.id" />
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const modalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)

const form = reactive({ id: null as number | null, nip: '', nama: '', email: '', hp: '' })

const data = ref([
  { id: 1, nip: '198501012010011001', nama: 'Siti Aminah, S.Pd', email: 'siti@sekolah.id', hp: '081234567890', beban: 12 },
  { id: 2, nip: '198702152011011002', nama: 'Budi Santoso, M.Pd', email: 'budi@sekolah.id', hp: '081234567891', beban: 8 },
  { id: 3, nip: '199003202012011003', nama: 'Ahmad Wijaya, S.Kom', email: 'ahmad@sekolah.id', hp: '081234567892', beban: 15 },
  { id: 4, nip: '198805102013011004', nama: 'Dewi Lestari, S.Pd', email: 'dewi@sekolah.id', hp: '081234567893', beban: 5 }
])

const columns = [
  { accessorKey: 'nama', header: 'Guru' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'hp', header: 'No HP' },
  { accessorKey: 'beban', header: 'Beban Bimbingan' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => 
  !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
))

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nip: '', nama: '', email: '', hp: '' })
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
    data.value.unshift({ id: Date.now(), ...form, beban: 0 })
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

useHead({ title: 'Guru | Admin' })
</script>
