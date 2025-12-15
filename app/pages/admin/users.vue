<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Kelola Akun</h1>
        <p class="text-sm text-slate-500">Manajemen akun pengguna sistem</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah Akun
      </UButton>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari pengguna..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterRole" :items="['Semua', 'Admin', 'Guru', 'Mentor', 'Siswa']" class="w-full sm:w-32" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold" :class="roleColor(row.original.role).bg">
              {{ row.original.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama }}</p>
              <p class="text-xs text-slate-500">{{ row.original.email }}</p>
            </div>
          </div>
        </template>
        <template #role-cell="{ row }">
          <UBadge :color="roleColor(row.original.role).color" variant="subtle" size="xs">{{ row.original.role }}</UBadge>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.active ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.active ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" color="neutral" variant="ghost" @click="resetPassword(row.original)">
              <Icon name="lucide:key" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Form Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit Akun' : 'Tambah Akun' }}</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama" placeholder="Nama lengkap" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="form.email" type="email" placeholder="email@example.com" />
            </UFormField>
            <UFormField label="Role" required>
              <USelectMenu v-model="form.role" :items="['Admin', 'Guru', 'Mentor', 'Siswa']" />
            </UFormField>
            <UFormField label="Status">
              <USwitch v-model="form.active" label="Aktif" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :loading="processing" @click="saveUser">Simpan</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Reset Password Modal -->
    <UModal v-model:open="resetModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-slate-900">Password Baru</h3>
          </template>
          <div class="text-center py-4">
            <p class="text-sm text-slate-500 mb-3">Password baru untuk {{ resetUser?.nama }}:</p>
            <div class="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg">
              <code class="text-lg font-mono font-bold text-slate-900">{{ newPassword }}</code>
              <UButton size="xs" color="primary" variant="ghost" @click="copyPassword">
                <Icon name="lucide:copy" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
          <template #footer>
            <UButton color="primary" block @click="resetModalOpen = false">Tutup</UButton>
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
const filterRole = ref('Semua')
const modalOpen = ref(false)
const resetModalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)
const resetUser = ref<any>(null)
const newPassword = ref('')

const form = reactive({ id: null as number | null, nama: '', email: '', role: null as string | null, active: true })

const data = ref([
  { id: 1, nama: 'Administrator', email: 'admin@sekolah.id', role: 'Admin', active: true },
  { id: 2, nama: 'Siti Aminah', email: 'siti@sekolah.id', role: 'Guru', active: true },
  { id: 3, nama: 'Budi Santoso', email: 'budi@sekolah.id', role: 'Guru', active: true },
  { id: 4, nama: 'Pak Joko', email: 'joko@telkom.id', role: 'Mentor', active: true },
  { id: 5, nama: 'Bu Rina', email: 'rina@astra.id', role: 'Mentor', active: false },
  { id: 6, nama: 'Andi Pratama', email: 'andi@siswa.id', role: 'Siswa', active: true }
])

const columns = [
  { accessorKey: 'nama', header: 'Pengguna' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase()) || d.email.toLowerCase().includes(search.value.toLowerCase())
  const matchRole = filterRole.value === 'Semua' || d.role === filterRole.value
  return matchSearch && matchRole
}))

const roleColor = (role: string) => ({
  Admin: { color: 'error', bg: 'bg-red-100 text-red-600' },
  Guru: { color: 'primary', bg: 'bg-sky-100 text-sky-600' },
  Mentor: { color: 'warning', bg: 'bg-amber-100 text-amber-600' },
  Siswa: { color: 'success', bg: 'bg-green-100 text-green-600' }
})[role] || { color: 'neutral', bg: 'bg-slate-100 text-slate-600' }

const openModal = (user?: any) => {
  editing.value = !!user
  if (user) {
    Object.assign(form, { id: user.id, nama: user.nama, email: user.email, role: user.role, active: user.active })
  } else {
    Object.assign(form, { id: null, nama: '', email: '', role: null, active: true })
  }
  modalOpen.value = true
}

const saveUser = async () => {
  if (!form.nama || !form.email || !form.role) {
    toast.add({ title: 'Lengkapi semua field', color: 'error' })
    return
  }
  processing.value = true
  await new Promise(r => setTimeout(r, 1000))
  if (editing.value) {
    const idx = data.value.findIndex(d => d.id === form.id)
    if (idx !== -1) data.value[idx] = { ...data.value[idx], ...form }
  } else {
    data.value.push({ id: Date.now(), nama: form.nama, email: form.email, role: form.role!, active: form.active })
  }
  processing.value = false
  modalOpen.value = false
  toast.add({ title: editing.value ? 'Akun diperbarui' : 'Akun ditambahkan', color: 'success' })
}

const resetPassword = async (user: any) => {
  resetUser.value = user
  newPassword.value = Math.random().toString(36).slice(-8).toUpperCase()
  resetModalOpen.value = true
}

const copyPassword = () => {
  navigator.clipboard.writeText(newPassword.value)
  toast.add({ title: 'Password disalin', color: 'success' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Kelola Akun | Admin' })
</script>
