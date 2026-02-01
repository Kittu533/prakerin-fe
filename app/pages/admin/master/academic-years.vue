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
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:calendar" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data tahun ajaran</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status_aktif ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.status_aktif ? 'Aktif' : 'Nonaktif' }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton v-if="!row.original.status_aktif" size="xs" color="success" variant="ghost" @click="setActive(row.original)">
              <Icon name="lucide:check-circle" class="w-4 h-4" />
            </UButton>
            <UButton size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="pagination.total" :items-per-page="pagination.limit" @update:page="fetchData" />
    </div>

    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Tahun Ajaran</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Tahun Ajaran" required>
              <UInput v-model="form.nama_tahun_ajaran" placeholder="2024/2025" />
            </UFormField>
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Tanggal Mulai" required>
                <UInput v-model="form.tanggal_mulai" type="date" />
              </UFormField>
              <UFormField label="Tanggal Selesai" required>
                <UInput v-model="form.tanggal_selesai" type="date" />
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
import { useTahunAjaranApi, type TahunAjaran } from '~/composables/api/use-academic';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<TahunAjaran[]>([]);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_tahun_ajaran: null as number | null,
  nama_tahun_ajaran: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
});

const columns = [
  { accessorKey: 'nama_tahun_ajaran', header: 'Tahun Ajaran' },
  { accessorKey: 'tanggal_mulai', header: 'Mulai' },
  { accessorKey: 'tanggal_selesai', header: 'Selesai' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

async function fetchData() {
  loading.value = true;
  try {
    const response = await tahunAjaranApi.getAll({ page: currentPage.value, limit: 10 });
    if (response.success) {
      data.value = response.data || [];
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (error) {
    console.error('Failed to fetch tahun ajaran:', error);
    toast.add({ title: 'Gagal memuat data tahun ajaran', color: 'error' });
  } finally {
    loading.value = false;
  }
}

function openModal(item?: TahunAjaran) {
  editing.value = !!item;
  if (item) {
    form.id_tahun_ajaran = item.id_tahun_ajaran;
    form.nama_tahun_ajaran = item.nama_tahun_ajaran;
    form.tanggal_mulai = item.tanggal_mulai || '';
    form.tanggal_selesai = item.tanggal_selesai || '';
  } else {
    form.id_tahun_ajaran = null;
    form.nama_tahun_ajaran = '';
    form.tanggal_mulai = '';
    form.tanggal_selesai = '';
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nama_tahun_ajaran) {
    toast.add({ title: 'Nama tahun ajaran wajib diisi', color: 'error' });
    return;
  }
  if (!editing.value && (!form.tanggal_mulai || !form.tanggal_selesai)) {
    toast.add({ title: 'Tanggal mulai dan selesai wajib diisi', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_tahun_ajaran) {
      const payload: any = { nama_tahun_ajaran: form.nama_tahun_ajaran };
      if (form.tanggal_mulai) payload.tanggal_mulai = form.tanggal_mulai;
      if (form.tanggal_selesai) payload.tanggal_selesai = form.tanggal_selesai;
      
      const response = await tahunAjaranApi.update(form.id_tahun_ajaran, payload);
      if (response.success) {
        toast.add({ title: 'Tahun ajaran diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await tahunAjaranApi.create({
        nama_tahun_ajaran: form.nama_tahun_ajaran,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
      });
      if (response.success) {
        toast.add({ title: 'Tahun ajaran ditambahkan', color: 'success' });
        modalOpen.value = false;
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

async function setActive(item: TahunAjaran) {
  try {
    const response = await tahunAjaranApi.update(item.id_tahun_ajaran, { status_aktif: true });
    if (response.success) {
      toast.add({ title: `${item.nama_tahun_ajaran} diaktifkan`, color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal mengaktifkan', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal mengaktifkan tahun ajaran', color: 'error' });
  }
}

onMounted(() => fetchData());

useHead({ title: 'Tahun Ajaran | Admin' });
</script>
