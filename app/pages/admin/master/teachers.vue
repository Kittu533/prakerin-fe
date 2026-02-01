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
      <UInput v-model="search" placeholder="Cari guru..." class="max-w-sm" @keyup.enter="fetchData">
        <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
      </UInput>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:users" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data guru</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.nama_guru.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama_guru }}</p>
              <p class="text-xs text-slate-500">{{ row.original.nip }}</p>
            </div>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status_aktif ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.status_aktif ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" color="error" variant="ghost" @click="confirmDelete(row.original)">
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="pagination.total" :items-per-page="pagination.limit" @update:page="fetchData" />
    </div>

    <!-- Form Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Guru</h3></template>
          <div class="space-y-4">
            <UFormField label="NIP" required>
              <UInput v-model="form.nip" placeholder="198501012010011001" />
            </UFormField>
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama_guru" placeholder="Nama lengkap guru" />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@sekolah.id" />
            </UFormField>
            <UFormField label="No HP">
              <UInput v-model="form.no_hp" type="tel" placeholder="08xxx" />
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

    <!-- Password Info Modal -->
    <UModal v-model:open="passwordModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Guru Berhasil Ditambahkan</h3></template>
          <div class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-700 mb-2">Password default untuk login:</p>
              <p class="font-mono text-lg font-bold text-green-800">{{ generatedPassword }}</p>
            </div>
            <p class="text-sm text-slate-500">Guru dapat login menggunakan NIP dan password di atas.</p>
          </div>
          <template #footer>
            <UButton color="primary" class="w-full" @click="passwordModal = false">Mengerti</UButton>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi, type Guru } from '~/composables/api/use-academic';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const guruApi = useGuruApi();

const loading = ref(true);
const search = ref('');
const modalOpen = ref(false);
const passwordModal = ref(false);
const editing = ref(false);
const processing = ref(false);
const generatedPassword = ref('');

const data = ref<Guru[]>([]);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_guru: null as number | null,
  nip: '',
  nama_guru: '',
  email: '',
  no_hp: '',
});

const columns = [
  { accessorKey: 'nama', header: 'Guru' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'no_hp', header: 'No HP' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

async function fetchData() {
  loading.value = true;
  try {
    const response = await guruApi.getAll({
      page: currentPage.value,
      limit: 10,
      search: search.value || undefined,
    });
    if (response.success) {
      data.value = response.data || [];
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (error) {
    console.error('Failed to fetch guru:', error);
    toast.add({ title: 'Gagal memuat data guru', color: 'error' });
  } finally {
    loading.value = false;
  }
}

function openModal(item?: Guru) {
  editing.value = !!item;
  if (item) {
    form.id_guru = item.id_guru;
    form.nip = item.nip;
    form.nama_guru = item.nama_guru;
    form.email = item.email || '';
    form.no_hp = item.no_hp || '';
  } else {
    form.id_guru = null;
    form.nip = '';
    form.nama_guru = '';
    form.email = '';
    form.no_hp = '';
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nip || !form.nama_guru) {
    toast.add({ title: 'Lengkapi NIP dan Nama', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_guru) {
      const response = await guruApi.update(form.id_guru, {
        nip: form.nip,
        nama_guru: form.nama_guru,
        email: form.email || undefined,
        no_hp: form.no_hp || undefined,
      });
      if (response.success) {
        toast.add({ title: 'Data guru diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await guruApi.create({
        nip: form.nip,
        nama_guru: form.nama_guru,
        email: form.email || undefined,
        no_hp: form.no_hp || undefined,
      });
      if (response.success) {
        modalOpen.value = false;
        if (response.data.generated_password) {
          generatedPassword.value = response.data.generated_password;
          passwordModal.value = true;
        } else {
          toast.add({ title: 'Guru berhasil ditambahkan', color: 'success' });
        }
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal menambahkan', color: 'error' });
      }
    }
  } catch (error: any) {
    toast.add({ title: error.message || 'Terjadi kesalahan', color: 'error' });
  } finally {
    processing.value = false;
  }
}

async function confirmDelete(item: Guru) {
  if (!confirm(`Nonaktifkan guru "${item.nama_guru}"?`)) return;

  try {
    const response = await guruApi.remove(item.id_guru);
    if (response.success) {
      toast.add({ title: 'Guru dinonaktifkan', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menonaktifkan', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menonaktifkan guru', color: 'error' });
  }
}

onMounted(() => fetchData());

useHead({ title: 'Guru | Admin' });
</script>
