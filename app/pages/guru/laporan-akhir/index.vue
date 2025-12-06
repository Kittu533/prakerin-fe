<template>
  <div class="bg-white min-h-screen">
    <section class="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <!-- HEADER -->
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-3">
            <nav class="flex items-center gap-2 text-base text-slate-500 mb-6">
              <NuxtLink to="/guru" class="hover:text-blue-600 transition-colors">
                Dashboard
              </NuxtLink>
              <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
              <span class="text-slate-900 font-medium">Laporan Akhir</span>
            </nav>
            
            <UBadge color="primary" variant="subtle" size="lg" class="mb-4">
              Laporan Akhir PKL
            </UBadge>
            <h1 class="text-2xl font-bold text-slate-900 sm:text-3xl">
              Rekap Laporan Akhir Siswa Bimbingan
            </h1>
            <p class="text-base text-slate-600 max-w-xl">
              Pantau status draft, review, dan final laporan akhir PKL siswa bimbingan Anda.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UButton 
              color="green" 
              variant="outline" 
              size="lg"
              @click="exportAllReports"
            >
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 mr-2" />
              Export Semua
            </UButton>
            
            <USelectMenu
              v-model="filterStatus"
              :options="statusOptions"
              size="lg"
              placeholder="Filter Status"
              class="min-w-[180px]"
            >
              <template #item="{ item }">
                <div v-if="item" class="flex items-center gap-3">
                  <UIcon :name="(item as StatusOption).icon" :class="`w-4 h-4 text-${(item as StatusOption).color}-500`" />
                  <span class="text-base font-medium">{{ (item as StatusOption).label }}</span>
                </div>
              </template>
              <template #label>
                <div v-if="filterStatus !== 'ALL'" class="flex items-center gap-2">
                  <UIcon :name="getStatusIcon(filterStatus)" :class="`w-4 h-4 text-${getStatusColor(filterStatus)}-500`" />
                  <span class="text-base">{{ getStatusLabel(filterStatus) }}</span>
                </div>
                <span v-else class="text-slate-500 text-base">Semua Status</span>
              </template>
            </USelectMenu>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <AppDataTable
        :items="filteredItems"
        :columns="columns"
        :page-size="15"
        :searchable="true"
        search-placeholder="Cari nama siswa, perusahaan, atau status..."
        :search-keys="['namaSiswa', 'kelas', 'perusahaan', 'statusLaporan']"
        class="text-base"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import AppDataTable from "~/components/common/AppDataTable.vue";
import laporanData from "~/assets/data/guru_laporan_akhir.json";
import type { StatusLaporan, LaporanRow, StatusOption } from '~/types/laporan-akhir';

definePageMeta({
  layout: "guru",
  title: "Laporan Akhir PKL",
});

const items = laporanData.items as LaporanRow[];

const filterStatus = ref<"ALL" | StatusLaporan>("ALL");

// Enhanced status options with icons
const statusOptions = computed((): StatusOption[] => [
  { label: 'Semua Status', value: 'ALL', color: 'gray', icon: 'i-heroicons-list-bullet' },
  { label: 'Draft', value: 'DRAFT', color: 'slate', icon: 'i-heroicons-document' },
  { label: 'Review', value: 'REVIEW', color: 'yellow', icon: 'i-heroicons-eye' },
  { label: 'Final', value: 'FINAL', color: 'green', icon: 'i-heroicons-check-circle' },
])

// Helper functions for status display
const getStatusIcon = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 'i-heroicons-document'
    case 'REVIEW': return 'i-heroicons-eye'
    case 'FINAL': return 'i-heroicons-check-circle'
    default: return 'i-heroicons-question-mark-circle'
  }
}

const getStatusColor = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 'slate'
    case 'REVIEW': return 'yellow'
    case 'FINAL': return 'green'
    default: return 'gray'
  }
}

const getStatusLabel = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 'Draft'
    case 'REVIEW': return 'Review'
    case 'FINAL': return 'Final'
    default: return status
  }
}

// Export function
const exportAllReports = () => {
  console.log('Exporting all reports...')
  // TODO: Implement export functionality
}

const filteredItems = computed(() =>
  items.filter((row) =>
    filterStatus.value === "ALL"
      ? true
      : row.statusLaporan === filterStatus.value
  )
);

const UButton = resolveComponent("UButton");

const badgeStatus = (s: StatusLaporan) => {
  if (s === "FINAL")
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (s === "REVIEW")
    return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-slate-100 text-slate-700 border border-slate-200";
};

// Download individual report function
const downloadReport = (row: LaporanRow) => {
  console.log(`Downloading report for: ${row.namaSiswa} - LAP-${String(row.idLaporan).padStart(3, '0')}`)
  // TODO: Implement actual download functionality
  alert(`Mengunduh laporan ${row.namaSiswa} - LAP-${String(row.idLaporan).padStart(3, '0')}...`)
}

const columns = computed<TableColumn<LaporanRow>[]>(() => {
  const UButton = resolveComponent('UButton');
  
  return [
    {
      accessorKey: "namaSiswa",
      header: "Siswa",
      cell: ({ row }) => `${row.original.namaSiswa} • ${row.original.kelas}`,
      meta: {
        class: { td: 'text-base font-medium' },
      },
    },
    {
      accessorKey: "perusahaan",
      header: "Perusahaan",
      meta: {
        class: { td: 'text-base' },
      },
    },
    {
      accessorKey: "statusLaporan",
      header: "Status laporan",
      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold " +
              badgeStatus(row.original.statusLaporan),
          },
          row.original.statusLaporan
        ),
    },
    {
      id: "nilai",
      header: "Nilai akhir",
      cell: ({ row }) =>
        row.original.nilaiAkhir != null
          ? `${row.original.nilaiAkhir.toFixed(1)} (${row.original.grade})`
          : "-",
      meta: {
        class: { td: 'text-base font-medium' },
      },
    },
    {
      id: "kehadiran",
      header: "Kehadiran",
      cell: ({ row }) =>
        `${row.original.persentaseKehadiran.toFixed(1)}% (${row.original.totalKehadiran}/${row.original.totalHariKerja})`,
      meta: {
        class: { td: 'text-base' },
      },
    },
    {
      id: "actions",
      header: "Aksi",
      meta: {
        class: { th: "text-right w-48", td: "text-right" },
      },
      cell: ({ row }) =>
        h("div", { class: "flex justify-end gap-2" }, [
          h(
            UButton,
            {
              size: "sm",
              color: "neutral",
              variant: "outline",
              onClick: () =>
                navigateTo(`/guru/laporan-akhir/LAP-${String(row.original.idLaporan).padStart(3, '0')}`),
            },
            { default: () => "Detail" }
          ),
          h(
            UButton,
            {
              size: "sm",
              color: "success",
              variant: "outline",
              onClick: () => downloadReport(row.original),
            },
            { default: () => "Download" }
          ),
        ]),
    },
  ];
});
</script>
