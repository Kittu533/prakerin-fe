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

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Form Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard class="w-full max-w-md">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="editing ? 'bg-amber-100' : 'bg-sky-100'">
                <Icon :name="editing ? 'lucide:user-cog' : 'lucide:user-plus'" class="w-5 h-5" :class="editing ? 'text-amber-600' : 'text-sky-600'" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit Akun' : 'Tambah Akun Baru' }}</h3>
                <p class="text-xs text-slate-500">{{ editing ? 'Perbarui informasi akun pengguna' : 'Buat akun baru untuk pengguna' }}</p>
              </div>
            </div>
          </template>

          <div class="space-y-5">
            <!-- Informasi Akun -->
            <div class="space-y-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Informasi Akun</p>
              
              <UFormField label="Nama Lengkap" required>
                <UInput v-model="form.nama" placeholder="Masukkan nama lengkap" class="w-full">
                  <template #leading>
                    <Icon name="lucide:user" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </UFormField>

              <UFormField label="Email" required>
                <UInput v-model="form.email" type="email" placeholder="contoh@email.com" class="w-full">
                  <template #leading>
                    <Icon name="lucide:mail" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </UFormField>
            </div>

            <!-- Hak Akses -->
            <div class="space-y-4 pt-2 border-t border-slate-100">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hak Akses</p>
              
              <UFormField label="Role Pengguna" required>
                <USelectMenu v-model="form.role" :items="roleItems" placeholder="Pilih role" class="w-full">
                  <template #leading>
                    <Icon name="lucide:shield" class="w-4 h-4 text-slate-400" />
                  </template>
                </USelectMenu>
              </UFormField>

              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Icon name="lucide:power" class="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">Status Akun</p>
                    <p class="text-xs text-slate-500">{{ form.active ? 'Akun aktif dan dapat login' : 'Akun dinonaktifkan' }}</p>
                  </div>
                </div>
                <USwitch v-model="form.active" />
              </div>
            </div>

            <!-- Password info for new account -->
            <div v-if="!editing" class="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div class="flex items-start gap-2">
                <Icon name="lucide:info" class="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p class="text-xs text-amber-700">Password default akan digenerate otomatis dan dapat direset setelah akun dibuat.</p>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <UButton variant="outline" color="neutral" @click="modalOpen = false" class="sm:w-auto w-full">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                Batal
              </UButton>
              <UButton color="primary" :loading="processing" @click="saveUser" class="sm:w-auto w-full">
                <Icon :name="editing ? 'lucide:save' : 'lucide:user-plus'" class="w-4 h-4 mr-2" />
                {{ editing ? 'Simpan Perubahan' : 'Buat Akun' }}
              </UButton>
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
const currentPage = ref(1)
const itemsPerPage = 10
const filterRole = ref('Semua')
const modalOpen = ref(false)
const resetModalOpen = ref(false)
const editing = ref(false)
const processing = ref(false)
const resetUser = ref<any>(null)
const newPassword = ref('')

const form = reactive({ id: null as number | null, nama: '', email: '', role: null as string | null, active: true })

const roleItems = ['Admin', 'Guru', 'Mentor', 'Siswa']

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

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.nama.toLowerCase().includes(search.value.toLowerCase()) || d.email.toLowerCase().includes(search.value.toLowerCase())
  const matchRole = filterRole.value === 'Semua' || d.role === filterRole.value
  return matchSearch && matchRole
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterRole], () => { currentPage.value = 1 })

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
