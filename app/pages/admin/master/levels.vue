<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Tingkat</h1>
        <p class="text-sm text-slate-500">Kelola data tingkat kelas (X, XI, XII)</p>
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
        <Icon name="lucide:signal" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Belum ada data tingkat</p>
      </div>
      <UTable v-else :data="data" :columns="columns">
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

    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit' : 'Tambah' }} Tingkat</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Kode Tingkat" required>
              <UInput v-model="form.kode_tingkat" placeholder="X, XI, XII" />
            </UFormField>
            <UFormField label="Urutan" required>
              <UInput v-model.number="form.urutan" type="number" min="1" placeholder="1" />
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
import { useTingkatApi, type Tingkat } from '~/composables/api/use-academic';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const tingkatApi = useTingkatApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Tingkat[]>([]);

const form = reactive({
  id_tingkat: null as number | null,
  kode_tingkat: '',
  urutan: 1,
});

const columns = [
  { accessorKey: 'kode_tingkat', header: 'Kode Tingkat' },
  { accessorKey: 'urutan', header: 'Urutan' },
  { accessorKey: 'aksi', header: '' },
];

async function fetchData() {
  loading.value = true;
  try {
    const response = await tingkatApi.getAll();
    if (response.success) {
      data.value = response.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch tingkat:', error);
    toast.add({ title: 'Gagal memuat data tingkat', color: 'error' });
  } finally {
    loading.value = false;
  }
}

function openModal(item?: Tingkat) {
  editing.value = !!item;
  if (item) {
    form.id_tingkat = item.id_tingkat;
    form.kode_tingkat = item.kode_tingkat;
    form.urutan = item.urutan;
  } else {
    form.id_tingkat = null;
    form.kode_tingkat = '';
    form.urutan = data.value.length + 1;
  }
  modalOpen.value = true;
}

async function save() {
  if (!form.kode_tingkat || !form.urutan) {
    toast.add({ title: 'Lengkapi Kode Tingkat dan Urutan', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_tingkat) {
      const response = await tingkatApi.update(form.id_tingkat, {
        kode_tingkat: form.kode_tingkat,
        urutan: form.urutan,
      });
      if (response.success) {
        toast.add({ title: 'Tingkat diperbarui', color: 'success' });
        modalOpen.value = false;
        fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await tingkatApi.create({
        kode_tingkat: form.kode_tingkat,
        urutan: form.urutan,
      });
      if (response.success) {
        toast.add({ title: 'Tingkat ditambahkan', color: 'success' });
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

async function confirmDelete(item: Tingkat) {
  if (!confirm(`Hapus tingkat "${item.kode_tingkat}"?`)) return;

  try {
    const response = await tingkatApi.remove(item.id_tingkat);
    if (response.success) {
      toast.add({ title: 'Tingkat dihapus', color: 'success' });
      fetchData();
    } else {
      toast.add({ title: response.message || 'Gagal menghapus', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Gagal menghapus tingkat', color: 'error' });
  }
}

onMounted(() => fetchData());

useHead({ title: 'Tingkat | Admin' });
</script>
