<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Perusahaan Mitra</h1>
        <p class="text-sm text-slate-500">Kelola data perusahaan mitra PKL</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari perusahaan..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterBidang" :items="['Semua', 'IT & Software', 'Jaringan', 'Multimedia', 'Otomotif', 'Keuangan']" class="w-full sm:w-36" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
            <p class="text-xs text-slate-500">{{ row.original.alamat }}</p>
          </div>
        </template>
        <template #bidang-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.bidang }}</UBadge>
        </template>
        <template #kapasitas-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-16 h-2 bg-slate-100 rounded-full">
              <div class="h-full rounded-full" :class="row.original.terisi >= row.original.kuota ? 'bg-red-500' : 'bg-green-500'" :style="{ width: `${(row.original.terisi / row.original.kuota) * 100}%` }" />
            </div>
            <span class="text-sm" :class="row.original.terisi >= row.original.kuota ? 'text-red-600' : 'text-slate-600'">
              {{ row.original.terisi }}/{{ row.original.kuota }}
            </span>
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
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Perusahaan</h3></template>
          <div class="space-y-4">
            <UFormField label="Nama Perusahaan" required>
              <UInput v-model="form.nama" placeholder="PT. Contoh" />
            </UFormField>
            <UFormField label="Alamat" required>
              <UTextarea v-model="form.alamat" placeholder="Alamat lengkap" :rows="2" />
            </UFormField>
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Bidang Usaha" required>
                <USelectMenu v-model="form.bidang" :items="['IT & Software', 'Jaringan', 'Multimedia', 'Otomotif', 'Keuangan']" />
              </UFormField>
              <UFormField label="Kuota" required>
                <UInput v-model.number="form.kuota" type="number" min="1" />
              </UFormField>
            </div>
            <UFormField label="Contact Person">
              <UInput v-model="form.cp" placeholder="Nama CP" />
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
const filterBidang = ref('Semua')
const modalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)

const form = reactive({ id: null as number | null, nama: '', alamat: '', bidang: null as string | null, kuota: 5, cp: '', hp: '' })

const data = ref([
  { id: 1, nama: 'PT. Telkom Indonesia', alamat: 'Jl. Japati No. 1, Bandung', bidang: 'IT & Software', kuota: 5, terisi: 3, cp: 'Pak Joko', hp: '081234567890' },
  { id: 2, nama: 'PT. Biznet Networks', alamat: 'Jl. Raya Bogor, Jakarta', bidang: 'Jaringan', kuota: 4, terisi: 4, cp: 'Pak Andi', hp: '081234567891' },
  { id: 3, nama: 'CV. Digital Kreatif', alamat: 'Jl. Malioboro, Yogyakarta', bidang: 'Multimedia', kuota: 3, terisi: 1, cp: 'Bu Sari', hp: '081234567892' },
  { id: 4, nama: 'PT. Astra International', alamat: 'Jl. Gaya Motor, Jakarta', bidang: 'Otomotif', kuota: 6, terisi: 5, cp: 'Bu Rina', hp: '081234567893' },
  { id: 5, nama: 'PT. Bank BCA', alamat: 'Jl. Sudirman, Jakarta', bidang: 'Keuangan', kuota: 4, terisi: 2, cp: 'Pak Dedi', hp: '081234567894' }
])

const columns = [
  { accessorKey: 'nama', header: 'Perusahaan' },
  { accessorKey: 'bidang', header: 'Bidang' },
  { accessorKey: 'kapasitas', header: 'Kapasitas' },
  { accessorKey: 'cp', header: 'Contact Person' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
  const matchBidang = filterBidang.value === 'Semua' || d.bidang === filterBidang.value
  return matchSearch && matchBidang
}))

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nama: '', alamat: '', bidang: null, kuota: 5, cp: '', hp: '' })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nama || !form.alamat || !form.bidang) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), nama: form.nama, alamat: form.alamat, bidang: form.bidang!, kuota: form.kuota, terisi: 0, cp: form.cp, hp: form.hp })
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

useHead({ title: 'Perusahaan | Admin' })
</script>
