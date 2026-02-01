<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Siswa</h1>
        <p class="text-sm text-slate-500">Kelola data siswa</p>
      </div>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" @click="importModal = true">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />Import
        </UButton>
        <UButton color="primary" @click="openModal()">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
        </UButton>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1" @keyup.enter="fetchData">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterKelasId" :items="kelasOptions" value-key="id" class="w-full sm:w-48" @change="fetchData">
          <template #default>{{ kelasOptions.find(k => k.id === filterKelasId)?.nama_kelas || 'Semua Kelas' }}</template>
        </USelectMenu>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else-if="!data.length" class="p-8 text-center text-slate-500">
        <Icon name="lucide:users" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data siswa</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
        <template #nama-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.nama_siswa.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.nama_siswa }}</p>
              <p class="text-xs text-slate-500">{{ row.original.nis }}</p>
            </div>
          </div>
        </template>
        <template #kelas-cell="{ row }">
          <UBadge color="primary" variant="subtle" size="xs">{{ row.original.kelas?.nama_kelas || '-' }}</UBadge>
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
          <template #header><h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Siswa</h3></template>
          <div class="space-y-4">
            <UFormField label="NIS" required>
              <UInput v-model="form.nis" placeholder="Nomor Induk Siswa" />
            </UFormField>
            <UFormField label="Nama Lengkap" required>
              <UInput v-model="form.nama_siswa" placeholder="Nama lengkap siswa" />
            </UFormField>
            <UFormField label="Kelas" required>
              <USelectMenu v-model="form.id_kelas" :items="allKelas" value-key="id_kelas" class="w-full">
                <template #default>{{ allKelas.find(k => k.id_kelas === form.id_kelas)?.nama_kelas || 'Pilih Kelas' }}</template>
                <template #item="{ item }">{{ item.nama_kelas }}</template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Jenis Kelamin">
              <USelectMenu v-model="form.jenis_kelamin" :items="['L', 'P']" class="w-full">
                <template #default>{{ form.jenis_kelamin === 'L' ? 'Laki-laki' : form.jenis_kelamin === 'P' ? 'Perempuan' : 'Pilih' }}</template>
                <template #item="{ item }">{{ item === 'L' ? 'Laki-laki' : 'Perempuan' }}</template>
              </USelectMenu>
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="form.email" type="email" placeholder="email@siswa.id" />
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

    <!-- Import Modal -->
    <UModal v-model:open="importModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Import Data Siswa</h3></template>
          <div class="space-y-4">
            <div class="p-4 bg-sky-50 rounded-lg">
              <p class="text-sm text-sky-700 mb-2">1. Download template Excel terlebih dahulu</p>
              <UButton size="sm" color="primary" variant="outline">
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />Download Template
              </UButton>
            </div>
            <div class="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
              <Icon name="lucide:file-spreadsheet" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p class="text-sm text-slate-500 mb-2">Fitur import akan segera tersedia</p>
            </div>
          </div>
          <template #footer>
            <UButton variant="outline" color="neutral" class="w-full" @click="importModal = false">Tutup</UButton>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Password Info Modal -->
    <UModal v-model:open="passwordModal">
      <template #content>
        <UCard>
          <template #header><h3 class="font-semibold text-slate-900">Siswa Berhasil Ditambahkan</h3></template>
          <div class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-700 mb-2">Password default untuk login:</p>
              <p class="font-mono text-lg font-bold text-green-800">{{ generatedPassword }}</p>
            </div>
            <p class="text-sm text-slate-500">Siswa dapat login menggunakan NIS dan password di atas. Pastikan untuk menginformasikan ke siswa.</p>
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
import { useSiswaApi, useKelasApi, type Siswa, type Kelas } from '~/composables/api/use-academic';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const siswaApi = useSiswaApi();
const kelasApi = useKelasApi();

const loading = ref(true);
const search = ref('');
const modalOpen = ref(false);
const importModal = ref(false);
const passwordModal = ref(false);
const editing = ref(false);
const processing = ref(false);
const generatedPassword = ref('');

const data = ref<Siswa[]>([]);
const allKelas = ref<Kelas[]>([]);
const filterKelasId = ref<number | undefined>(undefined);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 });

const form = reactive({
  id_siswa: null as number | null,
  nis: '',
  nama_siswa: '',
  jenis_kelamin: '' as string,
  email: '',
  no_hp: '',
  id_kelas: undefined as number | undefined,
});

const columns = [
  { accessorKey: 'nama', header: 'Siswa' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'no_hp', header: 'No HP' },
  { accessorKey: 'aksi', header: '' },
];

const kelasOptions = computed(() => [{ id: null, nama_kelas: 'Semua Kelas' }, ...allKelas.value.map(k => ({ id: k.id_kelas, nama_kelas: k.nama_kelas }))]);

async function fetchData() {
  loading.value = true;
  try {
    const response = await siswaApi.getAll({
      page: currentPage.value,
      limit: 10,
      search: search.value || undefined,
      id_kelas: filterKelasId.value || undefined,
    });
    if (response.success) {
      data.value = response.data || [];
      if (response.pagination) {
        pagination.value = response.pagination;
      }
    }
  } catch (error) {
    console.error('Failed to fetch siswa:', error);
    toast.add({ title: 'Gagal memuat data siswa', color: 'error' });
  } finally {
    loading.value = false;
  }
}

async function fetchKelas() {
  try {
    const response = await kelasApi.getAll({ limit: 100 });
    if (response.success) {
      allKelas.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch kelas:', error);
  }
}

function openModal(item?: Siswa) {
  editing.value = !!item;
  if (item) {
    form.id_siswa = item.id_siswa;
    form.nis = item.nis;
    form.nama_siswa = item.nama_siswa;
    form.jenis_kelamin = item.jenis_kelamin || '';
    form.email = item.email || '';
    form.no_hp = item.no_hp || '';
    form.id_kelas = item.id_kelas;
  } else {
    form.id_siswa = null;
    form.nis = '';
    form.nama_siswa = '';
    form.jenis_kelamin = '';
    form.email = '';
    form.no_hp = '';
    form.id_kelas = undefined;
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.nis || !form.nama_siswa || !form.id_kelas) {
    toast.add({ title: 'Lengkapi NIS, Nama, dan Kelas', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_siswa) {
      const response = await siswaApi.update(form.id_siswa, {
        nis: form.nis,
        nama_siswa: form.nama_siswa,
        jenis_kelamin: form.jenis_kelamin || undefined,
        email: form.email || undefined,
        no_hp: form.no_hp || undefined,
        id_kelas: form.id_kelas,
      });
      if (response.success) {
        toast.add({ title: 'Data siswa diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await siswaApi.create({
        nis: form.nis,
        nama_siswa: form.nama_siswa,
        jenis_kelamin: form.jenis_kelamin || undefined,
        email: form.email || undefined,
        no_hp: form.no_hp || undefined,
        id_kelas: form.id_kelas,
      });
      if (response.success) {
        modalOpen.value = false;
        // Show generated password
        if (response.data.generated_password) {
          generatedPassword.value = response.data.generated_password;
          passwordModal.value = true;
        } else {
          toast.add({ title: 'Siswa berhasil ditambahkan', color: 'success' });
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

async function confirmDelete(item: Siswa) {
  if (!confirm(`Hapus siswa "${item.nama_siswa}"?`)) return;
  
  try {
    const response = await siswaApi.remove(item.id_siswa);
    if (response.success) {
      toast.add({ title: 'Siswa dihapus', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menghapus', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menghapus siswa', color: 'error' });
  }
}

onMounted(async () => {
  await Promise.all([fetchData(), fetchKelas()]);
});

useHead({ title: 'Siswa | Admin' });
</script>
