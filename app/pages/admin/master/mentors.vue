<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Mentor Industri</h1>
        <p class="text-sm text-slate-500">Kelola data mentor dari perusahaan</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari mentor..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterCompany" :items="companyOptions" class="w-full sm:w-44" />
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-semibold">
              {{ row.original.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
              <p class="text-xs text-slate-500">{{ row.original.jabatan }}</p>
            </div>
          </div>
        </template>
        <template #perusahaan-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.perusahaan }}</UBadge>
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
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Mentor</h3></template>
          <div class="space-y-4">
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama" placeholder="Nama mentor" />
            </UFormField>
            <UFormField label="Perusahaan" required>
              <USelectMenu v-model="form.perusahaan" :items="['PT. Telkom Indonesia', 'PT. Biznet Networks', 'CV. Digital Kreatif', 'PT. Astra International', 'PT. Bank BCA']" />
            </UFormField>
            <UFormField label="Jabatan">
              <UInput v-model="form.jabatan" placeholder="Manager / Supervisor" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@company.com" />
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
const filterCompany = ref('Semua')
const modalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)

const form = reactive({ id: null as number | null, nama: '', perusahaan: null as string | null, jabatan: '', email: '', hp: '' })

const companyOptions = ['Semua', 'PT. Telkom Indonesia', 'PT. Biznet Networks', 'CV. Digital Kreatif', 'PT. Astra International', 'PT. Bank BCA']

const data = ref([
  { id: 1, nama: 'Pak Joko', perusahaan: 'PT. Telkom Indonesia', jabatan: 'IT Manager', email: 'joko@telkom.id', hp: '081234567890', siswa: 3 },
  { id: 2, nama: 'Bu Sari', perusahaan: 'PT. Telkom Indonesia', jabatan: 'HR Supervisor', email: 'sari@telkom.id', hp: '081234567891', siswa: 2 },
  { id: 3, nama: 'Pak Andi', perusahaan: 'PT. Biznet Networks', jabatan: 'Network Engineer', email: 'andi@biznet.id', hp: '081234567892', siswa: 4 },
  { id: 4, nama: 'Bu Rina', perusahaan: 'PT. Astra International', jabatan: 'Production Manager', email: 'rina@astra.id', hp: '081234567893', siswa: 5 },
  { id: 5, nama: 'Pak Dedi', perusahaan: 'PT. Bank BCA', jabatan: 'Branch Manager', email: 'dedi@bca.id', hp: '081234567894', siswa: 2 }
])

const columns = [
  { accessorKey: 'nama', header: 'Mentor' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'hp', header: 'No HP' },
  { accessorKey: 'siswa', header: 'Jml Siswa' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase())
  const matchCompany = filterCompany.value === 'Semua' || d.perusahaan === filterCompany.value
  return matchSearch && matchCompany
}))

const openModal = (item?: any) => {
  editing.value = !!item
  if (item) Object.assign(form, item)
  else Object.assign(form, { id: null, nama: '', perusahaan: null, jabatan: '', email: '', hp: '' })
  modalOpen.value = true
}

const save = async () => {
  if (!form.nama || !form.perusahaan) { toast.add({ title: 'Lengkapi semua field', color: 'error' }); return }
  processing.value = true
  await new Promise(r => setTimeout(r, 500))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.unshift({ id: Date.now(), nama: form.nama, perusahaan: form.perusahaan!, jabatan: form.jabatan, email: form.email, hp: form.hp, siswa: 0 })
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

useHead({ title: 'Mentor | Admin' })
</script>
