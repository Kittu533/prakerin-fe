<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Verifikasi Pengajuan</h1>
      <p class="text-sm text-slate-500">Kelola pengajuan PKL siswa</p>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="statusOptions" class="w-full sm:w-36" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-amber-600">{{ stats.pending }}</p>
        <p class="text-sm text-slate-500">Menunggu</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-600">{{ stats.approved }}</p>
        <p class="text-sm text-slate-500">Disetujui</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ stats.rejected }}</p>
        <p class="text-sm text-slate-500">Ditolak</p>
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
              {{ getInitials(row.original.siswa?.nama_siswa || '-') }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa?.nama_siswa || '-' }}</p>
              <p class="text-xs text-slate-500">{{ row.original.siswa?.kelas?.nama_kelas || '-' }}</p>
            </div>
          </div>
        </template>
        <template #perusahaan-cell="{ row }">
          <span class="text-sm">{{ row.original.perusahaan?.nama_perusahaan || '-' }}</span>
        </template>
        <template #tanggal-cell="{ row }">
          <span class="text-sm">{{ formatDate(row.original.tanggal_pengajuan) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="subtle" size="xs">
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </template>
        <template #aksi-cell="{ row }">
          <UButton size="xs" color="primary" variant="ghost" @click="openDetail(row.original)">
            <Icon name="lucide:eye" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>

      <div v-if="!loading && !filteredData.length" class="py-12 text-center">
        <Icon name="lucide:inbox" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada data pengajuan</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard v-if="selected">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Detail Pengajuan</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div class="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                {{ getInitials(selected.siswa?.nama_siswa || '-') }}
              </div>
              <div>
                <p class="font-semibold text-slate-900">{{ selected.siswa?.nama_siswa }}</p>
                <p class="text-sm text-slate-500">
                  {{ selected.siswa?.kelas?.nama_kelas }} - {{ selected.siswa?.kelas?.jurusan?.nama_jurusan }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Perusahaan</p>
                <p class="font-medium text-slate-900">{{ selected.perusahaan?.nama_perusahaan }}</p>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg">
                <p class="text-slate-500">Tanggal Pengajuan</p>
                <p class="font-medium text-slate-900">{{ formatDate(selected.tanggal_pengajuan) }}</p>
              </div>
            </div>

            <div v-if="selected.catatan" class="p-3 bg-amber-50 rounded-lg">
              <p class="text-sm text-amber-700">Catatan: {{ selected.catatan }}</p>
            </div>

            <UFormField v-if="selected.status === 'pending'" label="Catatan (opsional untuk approve, wajib untuk tolak)">
              <UTextarea v-model="actionNote" placeholder="Masukkan catatan..." :rows="2" />
            </UFormField>
          </div>

          <template #footer>
            <div v-if="selected.status === 'pending'" class="flex gap-3">
              <UButton color="error" variant="outline" class="flex-1" :loading="processing" @click="handleReject">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />Tolak
              </UButton>
              <UButton color="success" class="flex-1" :loading="processing" @click="handleApprove">
                <Icon name="lucide:check" class="w-4 h-4 mr-2" />Setujui
              </UButton>
            </div>
            <UBadge v-else :color="statusColor(selected.status)" size="lg">
              {{ statusLabel(selected.status) }}
            </UBadge>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { usePengajuanApi, type Pengajuan } from '~/composables/api/use-internship';

definePageMeta({ layout: 'admin' });

const toast = useToast();
const pengajuanApi = usePengajuanApi();

const loading = ref(true);
const search = ref('');
const filterStatus = ref('Semua');
const modalOpen = ref(false);
const selected = ref<Pengajuan | null>(null);
const actionNote = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const processing = ref(false);

const statusOptions = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak'];
const data = ref<Pengajuan[]>([]);
const stats = reactive({ pending: 0, approved: 0, rejected: 0 });

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'tanggal', header: 'Tanggal' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aksi', header: '' },
];

// Helpers
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusColor = (s: string): 'warning' | 'success' | 'error' | 'neutral' => {
  const colors: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = { 
    pending: 'warning', 
    approved: 'success', 
    rejected: 'error' 
  };
  return colors[s] || 'neutral';
};

const statusLabel = (s: string) => {
  const labels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
  return labels[s] || s;
};

const statusApiValue = (s: string) => {
  const values: Record<string, string> = { Menunggu: 'pending', Disetujui: 'approved', Ditolak: 'rejected' };
  return values[s] || '';
};

// Computed
const allFilteredData = computed(() => {
  return data.value.filter(d => {
    const matchSearch = !search.value || 
      d.siswa?.nama_siswa?.toLowerCase().includes(search.value.toLowerCase());
    const matchStatus = filterStatus.value === 'Semua' || 
      d.status === statusApiValue(filterStatus.value);
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
const openDetail = (item: Pengajuan) => {
  selected.value = item;
  actionNote.value = '';
  modalOpen.value = true;
};

const handleApprove = async () => {
  if (!selected.value) return;
  processing.value = true;
  try {
    const response = await pengajuanApi.approve(selected.value.id_pengajuan, actionNote.value || undefined);
    if (response.success) {
      selected.value.status = 'approved';
      stats.pending--;
      stats.approved++;
      modalOpen.value = false;
      toast.add({ title: 'Pengajuan disetujui', color: 'success' });
    } else {
      toast.add({ title: response.message || 'Gagal menyetujui', color: 'error' });
    }
  } catch (error) {
    toast.add({ title: 'Terjadi kesalahan', color: 'error' });
  } finally {
    processing.value = false;
  }
};

const handleReject = async () => {
  if (!selected.value) return;
  if (!actionNote.value) {
    toast.add({ title: 'Masukkan alasan penolakan', color: 'error' });
    return;
  }
  processing.value = true;
  try {
    const response = await pengajuanApi.reject(selected.value.id_pengajuan, actionNote.value);
    if (response.success) {
      selected.value.status = 'rejected';
      stats.pending--;
      stats.rejected++;
      modalOpen.value = false;
      toast.add({ title: 'Pengajuan ditolak', color: 'error' });
    } else {
      toast.add({ title: response.message || 'Gagal menolak', color: 'error' });
    }
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
    const response = await pengajuanApi.getAll({ limit: 100 });
    if (response.success) {
      data.value = response.data || [];
      // Calculate stats
      stats.pending = data.value.filter(d => d.status === 'pending').length;
      stats.approved = data.value.filter(d => d.status === 'approved').length;
      stats.rejected = data.value.filter(d => d.status === 'rejected').length;
    }
  } catch (error) {
    console.error('Failed to fetch pengajuan:', error);
    toast.add({ title: 'Gagal memuat data', color: 'error' });
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

useHead({ title: 'Verifikasi | Admin' });
</script>
