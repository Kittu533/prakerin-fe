<script setup lang="ts">
import type { Disposisi, DisposisiStatus } from "~/composables/api/use-disposisi";

const props = defineProps<{
  loading: boolean;
  disposisiList: Disposisi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  columns: Array<{ accessorKey: string; header: string }>;
  formatDate: (value?: string | null) => string;
  getStatusColor: (value: string) => string;
  getPrioritasColor: (value: string) => string;
}>();

const emit = defineEmits<{
  "update:limit": [value: number];
  create: [];
  detail: [item: Disposisi];
  edit: [item: Disposisi];
  status: [item: Disposisi, status: DisposisiStatus];
  delete: [item: Disposisi];
  page: [value: number];
}>();

const limitModel = computed({
  get: () => props.pagination.limit,
  set: (value: number | string) => emit("update:limit", Number(value)),
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div
      class="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h3 class="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">
          Daftar Disposisi
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          Menampilkan data disposisi terbaru beserta penerima dan instruksi kerja.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs font-medium text-slate-500">
          Tampilkan
        </span>
        <USelectMenu
          v-model="limitModel"
          :items="[10, 25, 50, 100]"
          size="sm"
          class="w-24"
        />
      </div>
    </div>

    <div v-if="loading" class="space-y-4 p-6">
      <USkeleton v-for="i in 6" :key="i" class="h-14 rounded-xl" />
    </div>

    <div
      v-else-if="disposisiList.length === 0"
      class="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center"
    >
      <div class="rounded-full bg-slate-100 p-5">
        <Icon name="lucide:file-search" class="h-12 w-12 text-slate-300" />
      </div>
      <div class="space-y-1">
        <p class="text-lg font-semibold text-slate-900">
          Belum ada data disposisi
        </p>
        <p class="max-w-md text-sm text-slate-500">
          Buat disposisi baru atau ubah filter pencarian untuk menampilkan data yang tersedia.
        </p>
      </div>
      <UButton
        color="primary"
        class="rounded-xl bg-sky-600 font-semibold hover:bg-sky-700"
        @click="emit('create')"
      >
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        Buat Disposisi
      </UButton>
    </div>

    <UTable
      v-else
      :data="disposisiList"
      :columns="columns"
      :ui="{
        th: {
          base: 'bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider py-4',
        },
        td: { base: 'py-4 align-top' },
      }"
    >
      <template #surat_masuk-cell="{ row }">
        <div class="space-y-1">
          <p class="font-semibold text-slate-900">
            {{ row.original.surat_masuk?.nomor_surat || "-" }}
          </p>
          <p class="text-xs font-medium text-slate-500">
            {{ row.original.surat_masuk?.asal_surat || "-" }}
          </p>
          <p class="line-clamp-2 text-xs text-slate-400">
            {{ row.original.surat_masuk?.perihal || "-" }}
          </p>
        </div>
      </template>

      <template #tanggal_disposisi-cell="{ row }">
        <div class="space-y-1">
          <p class="font-medium text-slate-800">
            {{ formatDate(row.original.tanggal_disposisi) }}
          </p>
          <p class="text-xs text-slate-400">
            Dibuat {{ formatDate(row.original.created_at) }}
          </p>
        </div>
      </template>

      <template #penerima_disposisi_text-cell="{ row }">
        <div class="flex max-w-xs flex-wrap gap-1.5">
          <UBadge
            v-for="penerima in row.original.penerima_disposisi"
            :key="penerima"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ penerima }}
          </UBadge>
        </div>
      </template>

      <template #instruksi_labels-cell="{ row }">
        <div class="flex max-w-xs flex-wrap gap-1.5">
          <UBadge
            v-for="instruksi in row.original.instruksi_labels"
            :key="instruksi"
            color="info"
            variant="subtle"
            size="sm"
          >
            {{ instruksi }}
          </UBadge>
        </div>
      </template>

      <template #batas_waktu-cell="{ row }">
        <div class="space-y-1">
          <p class="font-medium text-slate-800">
            {{ row.original.batas_waktu ? formatDate(row.original.batas_waktu) : "-" }}
          </p>
          <p v-if="row.original.batas_waktu" class="text-xs text-slate-400">
            Tenggat tindak lanjut
          </p>
        </div>
      </template>

      <template #prioritas-cell="{ row }">
        <UBadge
          :color="getPrioritasColor(row.original.prioritas)"
          variant="subtle"
          size="sm"
          class="font-semibold"
        >
          {{ row.original.prioritas_label }}
        </UBadge>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :color="getStatusColor(row.original.status)"
          variant="subtle"
          size="sm"
          class="font-semibold"
        >
          {{ row.original.status_label }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            @click="emit('detail', row.original)"
          >
            <Icon name="lucide:eye" class="h-4 w-4" />
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            @click="emit('edit', row.original)"
          >
            <Icon name="lucide:pencil" class="h-4 w-4" />
          </UButton>
          <UButton
            v-if="row.original.status !== 'selesai'"
            variant="ghost"
            color="success"
            size="xs"
            @click="emit('status', row.original, 'selesai')"
          >
            <Icon name="lucide:badge-check" class="h-4 w-4" />
          </UButton>
          <UButton
            variant="ghost"
            color="error"
            size="xs"
            @click="emit('delete', row.original)"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
          </UButton>
        </div>
      </template>
    </UTable>

    <div
      class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-slate-500">
        Menampilkan
        {{ pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1 }}
        -
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        dari {{ pagination.total }} disposisi
      </p>

      <div class="flex items-center gap-2">
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          :disabled="pagination.page === 1"
          @click="emit('page', pagination.page - 1)"
        >
          Sebelumnya
        </UButton>
        <div class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
          Halaman {{ pagination.page }}
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          :disabled="pagination.page * pagination.limit >= pagination.total"
          @click="emit('page', pagination.page + 1)"
        >
          Berikutnya
        </UButton>
      </div>
    </div>
  </div>
</template>
