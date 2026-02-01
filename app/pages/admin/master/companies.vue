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
      <UInput v-model="search" placeholder="Cari perusahaan..." class="max-w-sm" @keyup.enter="fetchData">
        <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
      </UInput>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:building-2" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data perusahaan</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #nama-cell="{ row }">
          <div>
            <p class="text-sm font-medium text-slate-900">{{ row.original.nama_perusahaan }}</p>
            <p class="text-xs text-slate-500">{{ row.original.alamat || '-' }}</p>
          </div>
        </template>
        <template #bidang-cell="{ row }">
          <UBadge v-if="row.original.bidang_usaha" color="primary" variant="subtle" size="xs">{{ row.original.bidang_usaha }}</UBadge>
          <span v-else class="text-slate-400">-</span>
        </template>
        <template #kapasitas-cell="{ row }">
          <span class="text-sm">{{ row.original.kapasitas_siswa || '-' }} siswa</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status_kerjasama ? 'success' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.status_kerjasama ? 'Aktif' : 'Nonaktif' }}
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

    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard class="w-full max-w-lg">
          <template #header>
            <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Perusahaan</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Perusahaan" required>
              <UInput v-model="form.nama_perusahaan" placeholder="PT. Contoh Indonesia" />
            </UFormField>
            <UFormField label="Alamat">
              <UTextarea v-model="form.alamat" placeholder="Jl. Contoh No. 123, Kota" :rows="2" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Bidang Usaha">
                <UInput v-model="form.bidang_usaha" placeholder="IT & Software" />
              </UFormField>
              <UFormField label="Kapasitas Siswa">
                <UInput v-model.number="form.kapasitas_siswa" type="number" min="1" placeholder="10" />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="No. HP">
                <UInput v-model="form.no_hp" type="tel" placeholder="08xxx" />
              </UFormField>
              <UFormField label="Email">
                <UInput v-model="form.email" type="email" placeholder="info@company.com" />
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
import { usePerusahaanApi, type Perusahaan } from '~/composables/api/use-partner';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const perusahaanApi = usePerusahaanApi();

const loading = ref(true);
const search = ref('');
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Perusahaan[]>([]);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_perusahaan: null as number | null,
  nama_perusahaan: '',
  alamat: '',
  no_hp: '',
  email: '',
  bidang_usaha: '',
  kapasitas_siswa: 10,
});

const columns = [
  { accessorKey: 'nama', header: 'Perusahaan' },
  { accessorKey: 'bidang', header: 'Bidang' },
  { accessorKey: 'kapasitas', header: 'Kapasitas' },
  { accessorKey: 'no_hp', header: 'Telepon' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

async function fetchData() {
  loading.value = true;
  try {
    const response = await perusahaanApi.getAll({
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
    console.error('Failed to fetch perusahaan:', error);
    toast.add({ title: 'Gagal memuat data perusahaan', color: 'error' });
  } finally {
    loading.value = false;
  }
}

function openModal(item?: Perusahaan) {
  editing.value = !!item;
  if (item) {
    form.id_perusahaan = item.id_perusahaan;
    form.nama_perusahaan = item.nama_perusahaan;
    form.alamat = item.alamat || '';
    form.no_hp = item.no_hp || '';
    form.email = item.email || '';
    form.bidang_usaha = item.bidang_usaha || '';
    form.kapasitas_siswa = item.kapasitas_siswa || 10;
  } else {
    form.id_perusahaan = null;
    form.nama_perusahaan = '';
    form.alamat = '';
    form.no_hp = '';
    form.email = '';
    form.bidang_usaha = '';
    form.kapasitas_siswa = 10;
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nama_perusahaan) {
    toast.add({ title: 'Nama perusahaan wajib diisi', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_perusahaan) {
      const response = await perusahaanApi.update(form.id_perusahaan, {
        nama_perusahaan: form.nama_perusahaan,
        alamat: form.alamat || undefined,
        no_hp: form.no_hp || undefined,
        email: form.email || undefined,
        bidang_usaha: form.bidang_usaha || undefined,
        kapasitas_siswa: form.kapasitas_siswa,
      });
      if (response.success) {
        toast.add({ title: 'Perusahaan diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await perusahaanApi.create({
        nama_perusahaan: form.nama_perusahaan,
        alamat: form.alamat || undefined,
        no_hp: form.no_hp || undefined,
        email: form.email || undefined,
        bidang_usaha: form.bidang_usaha || undefined,
        kapasitas_siswa: form.kapasitas_siswa,
      });
      if (response.success) {
        toast.add({ title: 'Perusahaan ditambahkan', color: 'success' });
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

async function confirmDelete(item: Perusahaan) {
  if (!confirm(`Nonaktifkan perusahaan "${item.nama_perusahaan}"?`)) return;

  try {
    const response = await perusahaanApi.remove(item.id_perusahaan);
    if (response.success) {
      toast.add({ title: 'Perusahaan dinonaktifkan', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menonaktifkan', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menonaktifkan perusahaan', color: 'error' });
  }
}

onMounted(() => fetchData());

useHead({ title: 'Perusahaan | Admin' });
</script>
