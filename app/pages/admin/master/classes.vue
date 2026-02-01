<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Kelas</h1>
        <p class="text-sm text-slate-500">Kelola data kelas</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
      </UButton>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari kelas..." class="flex-1" @keyup.enter="fetchData">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterJurusanId" :items="jurusanOptions" value-key="id" class="w-full sm:w-40" @change="fetchData">
          <template #default>{{ jurusanOptions.find(j => j.id === filterJurusanId)?.nama || 'Semua Jurusan' }}</template>
        </USelectMenu>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:school" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data kelas</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #jurusan-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.jurusan?.nama_jurusan || '-' }}</UBadge>
        </template>
        <template #tingkat-cell="{ row }">
          <span class="text-sm">{{ row.original.tingkat?.kode_tingkat || '-' }}</span>
        </template>
        <template #tahun-cell="{ row }">
          <span class="text-sm text-slate-500">{{ row.original.tahun_ajaran?.nama_tahun_ajaran || '-' }}</span>
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
        <UCard class="w-full max-w-md">
          <template #header>
            <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Kelas</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Kelas" required>
              <UInput v-model="form.nama_kelas" placeholder="Contoh: XII RPL 1" />
            </UFormField>
            <UFormField label="Jurusan" required>
              <USelectMenu v-model="selectedJurusanId" :items="allJurusan" value-key="id_jurusan" class="w-full">
                <template #default>{{ allJurusan.find(j => j.id_jurusan === selectedJurusanId)?.nama_jurusan || 'Pilih Jurusan' }}</template>
                <template #item="{ item }">{{ item.nama_jurusan }}</template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Tingkat" required>
              <USelectMenu v-model="selectedTingkatId" :items="allTingkat" value-key="id_tingkat" class="w-full">
                <template #default>{{ allTingkat.find(t => t.id_tingkat === selectedTingkatId)?.kode_tingkat || 'Pilih Tingkat' }}</template>
                <template #item="{ item }">{{ item.kode_tingkat }}</template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Tahun Ajaran" required>
              <USelectMenu v-model="selectedTahunAjaranId" :items="allTahunAjaran" value-key="id_tahun_ajaran" class="w-full">
                <template #default>{{ allTahunAjaran.find(t => t.id_tahun_ajaran === selectedTahunAjaranId)?.nama_tahun_ajaran || 'Pilih Tahun Ajaran' }}</template>
                <template #item="{ item }">{{ item.nama_tahun_ajaran }}</template>
              </USelectMenu>
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
import { useKelasApi, useJurusanApi, useTahunAjaranApi, type Kelas, type Jurusan, type TahunAjaran } from '~/composables/api/use-academic';
import { apiFetch } from '~/composables/api-fetch';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const kelasApi = useKelasApi();
const jurusanApi = useJurusanApi();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(true);
const search = ref('');
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Kelas[]>([]);
const allJurusan = ref<Jurusan[]>([]);
const allTahunAjaran = ref<TahunAjaran[]>([]);
const allTingkat = ref<{ id_tingkat: number; kode_tingkat: string; urutan: number }[]>([]);

const filterJurusanId = ref<number | undefined>(undefined);
const selectedJurusanId = ref<number | undefined>(undefined);
const selectedTingkatId = ref<number | undefined>(undefined);
const selectedTahunAjaranId = ref<number | undefined>(undefined);

const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_kelas: null as number | null,
  nama_kelas: '',
});

const columns = [
  { accessorKey: 'nama_kelas', header: 'Nama Kelas' },
  { accessorKey: 'jurusan', header: 'Jurusan' },
  { accessorKey: 'tingkat', header: 'Tingkat' },
  { accessorKey: 'tahun', header: 'Tahun Ajaran' },
  { accessorKey: 'aksi', header: '' },
];

const jurusanOptions = computed(() => [
  { id: undefined as number | undefined, nama: 'Semua Jurusan' },
  ...allJurusan.value.map(j => ({ id: j.id_jurusan, nama: j.nama_jurusan })),
]);

async function fetchData() {
  loading.value = true;
  try {
    const response = await kelasApi.getAll({
      page: currentPage.value,
      limit: 10,
      id_jurusan: filterJurusanId.value,
    });
    if (response.success) {
      data.value = response.data || [];
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (error) {
    console.error('Failed to fetch kelas:', error);
    toast.add({ title: 'Gagal memuat data kelas', color: 'error' });
  } finally {
    loading.value = false;
  }
}

async function fetchDropdownData() {
  try {
    const [jurusanRes, tahunRes, tingkatRes] = await Promise.all([
      jurusanApi.getAll({ limit: 100 }),
      tahunAjaranApi.getAll({ limit: 100 }),
      apiFetch<{ success: boolean; data: { id_tingkat: number; kode_tingkat: string; urutan: number }[] }>(
        'CoreService', '/tingkat', { method: 'GET' }, true
      ),
    ]);
    if (jurusanRes.success) allJurusan.value = jurusanRes.data;
    if (tahunRes.success) allTahunAjaran.value = tahunRes.data;
    if (tingkatRes.data.success) allTingkat.value = tingkatRes.data.data;
  } catch (error) {
    console.error('Failed to fetch dropdown data:', error);
  }
}

function openModal(item?: Kelas) {
  editing.value = !!item;
  if (item) {
    form.id_kelas = item.id_kelas;
    form.nama_kelas = item.nama_kelas;
    selectedJurusanId.value = item.id_jurusan;
    selectedTingkatId.value = item.id_tingkat;
    selectedTahunAjaranId.value = item.id_tahun_ajaran;
  } else {
    form.id_kelas = null;
    form.nama_kelas = '';
    selectedJurusanId.value = undefined;
    selectedTingkatId.value = undefined;
    selectedTahunAjaranId.value = undefined;
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nama_kelas || !selectedJurusanId.value || !selectedTingkatId.value || !selectedTahunAjaranId.value) {
    toast.add({ title: 'Lengkapi semua field', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_kelas) {
      const response = await kelasApi.update(form.id_kelas, {
        nama_kelas: form.nama_kelas,
        id_jurusan: selectedJurusanId.value,
        id_tingkat: selectedTingkatId.value,
        id_tahun_ajaran: selectedTahunAjaranId.value,
      });
      if (response.success) {
        toast.add({ title: 'Kelas diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await kelasApi.create({
        nama_kelas: form.nama_kelas,
        id_jurusan: selectedJurusanId.value,
        id_tingkat: selectedTingkatId.value,
        id_tahun_ajaran: selectedTahunAjaranId.value,
      });
      if (response.success) {
        toast.add({ title: 'Kelas ditambahkan', color: 'success' });
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

async function confirmDelete(item: Kelas) {
  if (!confirm(`Hapus kelas "${item.nama_kelas}"?`)) return;

  try {
    const response = await kelasApi.remove(item.id_kelas);
    if (response.success) {
      toast.add({ title: 'Kelas dihapus', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menghapus', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menghapus kelas', color: 'error' });
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), fetchDropdownData()]);
});

useHead({ title: 'Kelas | Admin' });
</script>
