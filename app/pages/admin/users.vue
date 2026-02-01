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
        <template #identifier-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold" :class="roleColor(row.original.role).bg">
              {{ row.original.identifier.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.identifier }}</p>
              <p class="text-xs text-slate-500">ID: {{ row.original.id }}</p>
            </div>
          </div>
        </template>
        <template #role-cell="{ row }">
          <UBadge :color="roleColor(row.original.role).color" variant="subtle" size="xs">
            {{ row.original.role.toUpperCase() }}
          </UBadge>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.is_active ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.is_active ? 'Aktif' : 'Nonaktif' }}
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

      <div v-if="!loading && !filteredData.length" class="py-12 text-center">
        <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data pengguna</p>
      </div>
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
            <div class="space-y-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Informasi Akun</p>
              
              <UFormField label="Email/Username" required>
                <UInput v-model="form.identifier" placeholder="contoh@email.com" class="w-full" :disabled="editing">
                  <template #leading>
                    <Icon name="lucide:mail" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </UFormField>

              <UFormField v-if="!editing" label="Password" required>
                <UInput v-model="form.password" type="password" placeholder="Minimal 8 karakter" class="w-full">
                  <template #leading>
                    <Icon name="lucide:lock" class="w-4 h-4 text-slate-400" />
                  </template>
                </UInput>
              </UFormField>
            </div>

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
                    <p class="text-xs text-slate-500">{{ form.is_active ? 'Akun aktif dan dapat login' : 'Akun dinonaktifkan' }}</p>
                  </div>
                </div>
                <USwitch v-model="form.is_active" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <UButton variant="outline" color="neutral" @click="modalOpen = false" class="sm:w-auto w-full">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />Batal
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
            <p class="text-sm text-slate-500 mb-3">Password baru untuk {{ resetUser?.identifier }}:</p>
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
import { useUserApi, type User } from '~/composables/api/use-identity';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const userApi = useUserApi();

const loading = ref(true);
const search = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const filterRole = ref('Semua');
const modalOpen = ref(false);
const resetModalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);
const resetUser = ref<User | null>(null);
const newPassword = ref('');

const form = reactive({ 
  id: null as number | null, 
  identifier: '', 
  password: '',
  role: '' as string, 
  is_active: true 
});

const roleItems = ['admin', 'guru', 'mentor', 'siswa'];
const data = ref<User[]>([]);

const columns = [
  { accessorKey: 'identifier', header: 'Pengguna' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.identifier.toLowerCase().includes(search.value.toLowerCase());
  const matchRole = filterRole.value === 'Semua' || d.role.toLowerCase() === filterRole.value.toLowerCase();
  return matchSearch && matchRole;
}));

const totalItems = computed(() => allFilteredData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return allFilteredData.value.slice(start, start + itemsPerPage);
});

watch([search, filterRole], () => { currentPage.value = 1; });

const roleColor = (role: string): { color: 'error' | 'primary' | 'warning' | 'success' | 'neutral'; bg: string } => ({
  admin: { color: 'error' as const, bg: 'bg-red-100 text-red-600' },
  guru: { color: 'primary' as const, bg: 'bg-sky-100 text-sky-600' },
  mentor: { color: 'warning' as const, bg: 'bg-amber-100 text-amber-600' },
  siswa: { color: 'success' as const, bg: 'bg-green-100 text-green-600' },
})[role.toLowerCase()] || { color: 'neutral' as const, bg: 'bg-slate-100 text-slate-600' };

const openModal = (user?: User) => {
  editing.value = !!user;
  if (user) {
    Object.assign(form, { 
      id: user.id, 
      identifier: user.identifier, 
      password: '',
      role: user.role, 
      is_active: user.is_active 
    });
  } else {
    Object.assign(form, { id: null, identifier: '', password: '', role: '', is_active: true });
  }
  modalOpen.value = true;
};

const saveUser = async () => {
  if (!form.identifier || !form.role) {
    toast.add({ title: 'Lengkapi semua field', color: 'error' });
    return;
  }
  if (!editing.value && !form.password) {
    toast.add({ title: 'Password wajib diisi', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id) {
      const response = await userApi.update(form.id, { 
        role: form.role,
        is_active: form.is_active 
      });
      if (response.success) {
        toast.add({ title: 'Akun diperbarui', color: 'success' });
        await fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await userApi.create({
        identifier: form.identifier,
        password: form.password,
        role: form.role,
        entity_id: 1,
        entity_type: form.role,
      });
      if (response.success) {
        toast.add({ title: 'Akun ditambahkan', color: 'success' });
        await fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal menambahkan', color: 'error' });
      }
    }
    modalOpen.value = false;
  } catch (error) {
    toast.add({ title: 'Terjadi kesalahan', color: 'error' });
  } finally {
    processing.value = false;
  }
};

const resetPassword = async (user: User) => {
  try {
    const response = await userApi.resetPassword(user.id);
    if (response.success && response.data?.generated_password) {
      resetUser.value = user;
      newPassword.value = response.data.generated_password;
      resetModalOpen.value = true;
    } else {
      toast.add({ title: response.message || 'Gagal reset password', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Terjadi kesalahan', color: 'error' });
  }
};

const copyPassword = () => {
  navigator.clipboard.writeText(newPassword.value);
  toast.add({ title: 'Password disalin', color: 'success' });
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await userApi.getAll({ limit: 100 });
    if (response.success) {
      data.value = response.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // Fallback to dummy data if API not available
    data.value = [
      { id: 1, identifier: 'admin@prakerin.id', role: 'admin', entity_id: 1, entity_type: 'admin', is_active: true },
      { id: 2, identifier: 'guru@prakerin.id', role: 'guru', entity_id: 1, entity_type: 'guru', is_active: true },
      { id: 3, identifier: 'siswa@prakerin.id', role: 'siswa', entity_id: 1, entity_type: 'siswa', is_active: true },
      { id: 4, identifier: 'mentor@prakerin.id', role: 'mentor', entity_id: 1, entity_type: 'mentor', is_active: true },
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

useHead({ title: 'Kelola Akun | Admin' });
</script>
