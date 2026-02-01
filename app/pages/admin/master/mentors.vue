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
        <UInput v-model="search" placeholder="Cari mentor..." class="flex-1" @keyup.enter="fetchData">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterPerusahaanId" :items="perusahaanOptions" value-key="id" class="w-full sm:w-48" @change="fetchData">
          <template #default>{{ perusahaanOptions.find(p => p.id === filterPerusahaanId)?.nama_perusahaan || 'Semua Perusahaan' }}</template>
        </USelectMenu>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:users" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data mentor</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-semibold">
              {{ row.original.nama_mentor.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama_mentor }}</p>
              <p class="text-xs text-slate-500">{{ row.original.jabatan || '-' }}</p>
            </div>
          </div>
        </template>
        <template #perusahaan-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.perusahaan?.nama_perusahaan || '-' }}</UBadge>
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
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Mentor</h3></template>
          <div class="space-y-4">
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama_mentor" placeholder="Nama mentor" />
            </UFormField>
            <UFormField label="Perusahaan" required>
              <USelectMenu v-model="selectedPerusahaanId" :items="allPerusahaan" value-key="id_perusahaan" class="w-full">
                <template #default>{{ allPerusahaan.find(p => p.id_perusahaan === selectedPerusahaanId)?.nama_perusahaan || 'Pilih Perusahaan' }}</template>
                <template #item="{ item }">{{ item.nama_perusahaan }}</template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Jabatan">
              <UInput v-model="form.jabatan" placeholder="Manager / Supervisor" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="form.email" type="email" placeholder="email@company.com" />
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
          <template #header><h3 class="font-semibold text-slate-900">Mentor Berhasil Ditambahkan</h3></template>
          <div class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-700 mb-2">Password default untuk login:</p>
              <p class="font-mono text-lg font-bold text-green-800">{{ generatedPassword }}</p>
            </div>
            <p class="text-sm text-slate-500">Mentor dapat login menggunakan email dan password di atas.</p>
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
import { useMentorApi, usePerusahaanApi, type Mentor, type Perusahaan } from '~/composables/api/use-partner';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const mentorApi = useMentorApi();
const perusahaanApi = usePerusahaanApi();

const loading = ref(true);
const search = ref('');
const modalOpen = ref(false);
const passwordModal = ref(false);
const editing = ref(false);
const processing = ref(false);
const generatedPassword = ref('');

const data = ref<Mentor[]>([]);
const allPerusahaan = ref<Perusahaan[]>([]);
const filterPerusahaanId = ref<number | undefined>(undefined);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_mentor: null as number | null,
  nama_mentor: '',
  jabatan: '',
  email: '',
  no_hp: '',
});

const selectedPerusahaanId = ref<number | undefined>(undefined);

const columns = [
  { accessorKey: 'nama', header: 'Mentor' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'no_hp', header: 'No HP' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

const perusahaanOptions = computed(() => [
  { id: undefined as number | undefined, nama_perusahaan: 'Semua Perusahaan' },
  ...allPerusahaan.value.map(p => ({ id: p.id_perusahaan, nama_perusahaan: p.nama_perusahaan })),
]);

async function fetchData() {
  loading.value = true;
  try {
    const response = await mentorApi.getAll({
      page: currentPage.value,
      limit: 10,
      id_perusahaan: filterPerusahaanId.value || undefined,
    });
    if (response.success) {
      data.value = response.data || [];
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (error) {
    console.error('Failed to fetch mentor:', error);
    toast.add({ title: 'Gagal memuat data mentor', color: 'error' });
  } finally {
    loading.value = false;
  }
}

async function fetchPerusahaan() {
  try {
    const response = await perusahaanApi.getAll({ limit: 100 });
    if (response.success) {
      allPerusahaan.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch perusahaan:', error);
  }
}

function openModal(item?: Mentor) {
  editing.value = !!item;
  if (item) {
    form.id_mentor = item.id_mentor;
    form.nama_mentor = item.nama_mentor;
    form.jabatan = item.jabatan || '';
    form.email = item.email || '';
    form.no_hp = item.no_hp || '';
    selectedPerusahaanId.value = item.id_perusahaan;
  } else {
    form.id_mentor = null;
    form.nama_mentor = '';
    form.jabatan = '';
    form.email = '';
    form.no_hp = '';
    selectedPerusahaanId.value = undefined;
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nama_mentor || !form.email || !selectedPerusahaanId.value) {
    toast.add({ title: 'Lengkapi Nama, Email, dan Perusahaan', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_mentor) {
      const response = await mentorApi.update(form.id_mentor, {
        nama_mentor: form.nama_mentor,
        jabatan: form.jabatan || undefined,
        email: form.email,
        no_hp: form.no_hp || undefined,
        id_perusahaan: selectedPerusahaanId.value,
      });
      if (response.success) {
        toast.add({ title: 'Data mentor diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await mentorApi.create({
        nama_mentor: form.nama_mentor,
        jabatan: form.jabatan || undefined,
        email: form.email,
        no_hp: form.no_hp || undefined,
        id_perusahaan: selectedPerusahaanId.value,
      });
      if (response.success) {
        modalOpen.value = false;
        if (response.data.generated_password) {
          generatedPassword.value = response.data.generated_password;
          passwordModal.value = true;
        } else {
          toast.add({ title: 'Mentor berhasil ditambahkan', color: 'success' });
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

async function confirmDelete(item: Mentor) {
  if (!confirm(`Nonaktifkan mentor "${item.nama_mentor}"?`)) return;

  try {
    const response = await mentorApi.remove(item.id_mentor);
    if (response.success) {
      toast.add({ title: 'Mentor dinonaktifkan', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menonaktifkan', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menonaktifkan mentor', color: 'error' });
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), fetchPerusahaan()]);
});

useHead({ title: 'Mentor | Admin' });
</script>
