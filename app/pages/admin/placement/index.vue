<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Penempatan PKL</h1>
        <p class="text-sm text-slate-500">Kelola penempatan siswa di industri</p>
      </div>
      <UButton color="primary" @click="openModal()">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah Penempatan
      </UButton>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa atau perusahaan..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="statusOptions" class="w-full sm:w-36" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ stats.aktif }}</p>
        <p class="text-sm text-slate-500">Aktif</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600">{{ stats.selesai }}</p>
        <p class="text-sm text-slate-500">Selesai</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ stats.dibatalkan }}</p>
        <p class="text-sm text-slate-500">Dibatalkan</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ getInitials(getSiswaName(row.original.siswa_id)) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ getSiswaName(row.original.siswa_id) }}</p>
              <p class="text-xs text-slate-500">{{ getSiswaKelas(row.original.siswa_id) }}</p>
            </div>
          </div>
        </template>
        <template #perusahaan-cell="{ row }">
          <div>
            <p class="text-sm font-medium">{{ getPerusahaanName(row.original.perusahaan_id) }}</p>
          </div>
        </template>
        <template #periode-cell="{ row }">
          <div class="text-sm">
            <p>{{ formatDate(row.original.tanggal_mulai) }}</p>
            <p class="text-slate-500">s/d {{ formatDate(row.original.tanggal_selesai) }}</p>
          </div>
        </template>
        <template #guru-cell="{ row }">
          <span class="text-sm">{{ getGuruName(row.original.guru_pembimbing_id) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status_penempatan)" variant="subtle" size="xs">
            {{ statusLabel(row.original.status_penempatan) }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <div class="flex gap-1">
            <UButton size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
              <Icon name="lucide:edit" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>

      <div v-if="!loading && !filteredData.length" class="py-12 text-center">
        <Icon name="lucide:building-2" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data penempatan</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Form Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">{{ editing ? 'Edit Penempatan' : 'Tambah Penempatan' }}</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="Siswa" required>
              <USelectMenu 
                v-model="form.siswa_id" 
                :items="siswaOptions" 
                value-key="value"
                placeholder="Pilih siswa"
                :disabled="editing"
              />
            </UFormField>

            <UFormField label="Perusahaan" required>
              <USelectMenu 
                v-model="form.perusahaan_id" 
                :items="perusahaanOptions" 
                value-key="value"
                placeholder="Pilih perusahaan"
              />
            </UFormField>

            <UFormField label="Guru Pembimbing" required>
              <USelectMenu 
                v-model="form.guru_pembimbing_id" 
                :items="guruOptions" 
                value-key="value"
                placeholder="Pilih guru"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Tanggal Mulai" required>
                <UInput v-model="form.tanggal_mulai" type="date" />
              </UFormField>
              <UFormField label="Tanggal Selesai" required>
                <UInput v-model="form.tanggal_selesai" type="date" />
              </UFormField>
            </div>

            <UFormField v-if="editing" label="Status">
              <USelectMenu v-model="form.status_penempatan" :items="['aktif', 'selesai', 'dibatalkan']" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :loading="processing" @click="savePenempatan">
                {{ editing ? 'Simpan' : 'Tambah' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { usePenempatanApi, type Penempatan } from '~/composables/api/use-internship';
import { useSiswaApi, useGuruApi } from '~/composables/api/use-academic';
import { usePerusahaanApi } from '~/composables/api/use-partner';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const penempatanApi = usePenempatanApi();
const siswaApi = useSiswaApi();
const guruApi = useGuruApi();
const perusahaanApi = usePerusahaanApi();

const loading = ref(true);
const search = ref('');
const filterStatus = ref('Semua');
const modalOpen = ref(false);
const editing = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const processing = ref(false);

const statusOptions = ['Semua', 'Aktif', 'Selesai', 'Dibatalkan'];
const data = ref<Penempatan[]>([]);
const stats = reactive({ aktif: 0, selesai: 0, dibatalkan: 0 });

// Options for select
const siswaOptions = ref<{ label: string; value: number }[]>([]);
const perusahaanOptions = ref<{ label: string; value: number }[]>([]);
const guruOptions = ref<{ label: string; value: number }[]>([]);

const form = reactive({
  id_penempatan: null as number | null,
  siswa_id: undefined as number | undefined,
  perusahaan_id: undefined as number | undefined,
  guru_pembimbing_id: undefined as number | undefined,
  tahun_ajaran_id: 1,
  tanggal_mulai: '',
  tanggal_selesai: '',
  status_penempatan: 'aktif',
});

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'perusahaan', header: 'Perusahaan & Mentor' },
  { accessorKey: 'periode', header: 'Periode' },
  { accessorKey: 'guru', header: 'Guru Pembimbing' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

// Helpers
const getInitials = (name: string) => {
  if (!name || name === '-') return '--';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
};

// Resolve names from options
const getSiswaName = (siswaId: number) => {
  const siswa = siswaOptions.value.find(s => s.value === siswaId);
  return siswa?.label?.split(' (')[0] || `Siswa #${siswaId}`;
};

const getSiswaKelas = (siswaId: number) => {
  const siswa = siswaOptions.value.find(s => s.value === siswaId);
  const match = siswa?.label?.match(/\(([^)]+)\)/);
  return match ? match[1] : '-';
};

const getPerusahaanName = (perusahaanId: number) => {
  const perusahaan = perusahaanOptions.value.find(p => p.value === perusahaanId);
  return perusahaan?.label || `Perusahaan #${perusahaanId}`;
};

const getGuruName = (guruId: number) => {
  const guru = guruOptions.value.find(g => g.value === guruId);
  return guru?.label || `Guru #${guruId}`;
};

const statusColor = (s: string): 'success' | 'primary' | 'error' | 'neutral' => {
  const colors: Record<string, 'success' | 'primary' | 'error' | 'neutral'> = { 
    aktif: 'success', 
    selesai: 'primary', 
    dibatalkan: 'error' 
  };
  return colors[s] || 'neutral';
};

const statusLabel = (s: string) => {
  const labels: Record<string, string> = { aktif: 'Aktif', selesai: 'Selesai', dibatalkan: 'Dibatalkan' };
  return labels[s] || s;
};

const statusApiValue = (s: string) => {
  const values: Record<string, string> = { Aktif: 'aktif', Selesai: 'selesai', Dibatalkan: 'dibatalkan' };
  return values[s] || '';
};

// Computed
const allFilteredData = computed(() => {
  return data.value.filter(d => {
    const siswaName = getSiswaName(d.siswa_id).toLowerCase();
    const perusahaanName = getPerusahaanName(d.perusahaan_id).toLowerCase();
    const matchSearch = !search.value || 
      siswaName.includes(search.value.toLowerCase()) ||
      perusahaanName.includes(search.value.toLowerCase());
    const matchStatus = filterStatus.value === 'Semua' || 
      d.status_penempatan === statusApiValue(filterStatus.value);
    return matchSearch && matchStatus;
  });
});

const totalItems = computed(() => allFilteredData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return allFilteredData.value.slice(start, start + itemsPerPage);
});

watch([search, filterStatus], () => { currentPage.value = 1; });

// Actions
const openModal = (item?: Penempatan) => {
  editing.value = !!item;
  if (item) {
    Object.assign(form, {
      id_penempatan: item.id_penempatan,
      siswa_id: item.siswa_id,
      perusahaan_id: item.perusahaan_id,
      guru_pembimbing_id: item.guru_pembimbing_id || undefined,
      tanggal_mulai: item.tanggal_mulai?.split('T')[0] || '',
      tanggal_selesai: item.tanggal_selesai?.split('T')[0] || '',
      status_penempatan: item.status_penempatan,
    });
  } else {
    Object.assign(form, {
      id_penempatan: null,
      siswa_id: undefined,
      perusahaan_id: undefined,
      guru_pembimbing_id: undefined,
      tanggal_mulai: '',
      tanggal_selesai: '',
      status_penempatan: 'aktif',
    });
  }
  modalOpen.value = true;
};

const savePenempatan = async () => {
  if (!form.siswa_id || !form.perusahaan_id || !form.guru_pembimbing_id || !form.tanggal_mulai || !form.tanggal_selesai) {
    toast.add({ title: 'Lengkapi semua field wajib', color: 'error' });
    return;
  }

  processing.value = true;
  try {
    if (editing.value && form.id_penempatan) {
      const response = await penempatanApi.update(form.id_penempatan, {
        guru_pembimbing_id: form.guru_pembimbing_id,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
        status_penempatan: form.status_penempatan,
      });
      if (response.success) {
        toast.add({ title: 'Penempatan diperbarui', color: 'success' });
        await fetchData();
      } else {
        toast.add({ title: response.message || 'Gagal memperbarui', color: 'error' });
      }
    } else {
      const response = await penempatanApi.create({
        siswa_id: form.siswa_id,
        perusahaan_id: form.perusahaan_id,
        guru_pembimbing_id: form.guru_pembimbing_id,
        tahun_ajaran_id: form.tahun_ajaran_id,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
      });
      if (response.success) {
        toast.add({ title: 'Penempatan ditambahkan', color: 'success' });
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

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await penempatanApi.getAll({ limit: 100 });
    if (response.success) {
      data.value = response.data || [];
      stats.aktif = data.value.filter(d => d.status_penempatan === 'aktif').length;
      stats.selesai = data.value.filter(d => d.status_penempatan === 'selesai').length;
      stats.dibatalkan = data.value.filter(d => d.status_penempatan === 'dibatalkan').length;
    }
  } catch (error) {
    console.error('Failed to fetch penempatan:', error);
  } finally {
    loading.value = false;
  }
};

const fetchOptions = async () => {
  try {
    const [siswaRes, perusahaanRes, guruRes] = await Promise.all([
      siswaApi.getAll({ limit: 100 }),
      perusahaanApi.getAll({ limit: 100 }),
      guruApi.getAll({ limit: 100 }),
    ]);

    if (siswaRes.success) {
      siswaOptions.value = (siswaRes.data || []).map(s => ({ 
        label: `${s.nama_siswa} (${s.kelas?.nama_kelas || '-'})`, 
        value: s.id_siswa 
      }));
    }
    if (perusahaanRes.success) {
      perusahaanOptions.value = (perusahaanRes.data || []).map(p => ({ 
        label: p.nama_perusahaan, 
        value: p.id_perusahaan 
      }));
    }
    if (guruRes.success) {
      guruOptions.value = (guruRes.data || []).map(g => ({ 
        label: g.nama_guru, 
        value: g.id_guru 
      }));
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};

onMounted(async () => {
  // Fetch options first so names can be resolved
  await fetchOptions();
  await fetchData();
});

useHead({ title: 'Penempatan | Admin' });
</script>
