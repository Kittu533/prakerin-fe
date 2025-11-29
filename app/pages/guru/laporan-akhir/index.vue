<script setup lang="ts">
import { computed, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'
import laporanData from '~/assets/data/guru_laporan_akhir.json'

definePageMeta({
  layout: 'guru',
  title: 'Laporan Akhir PKL'
})

type StatusLaporan = 'DRAFT' | 'REVIEW' | 'FINAL'

interface LaporanRow {
  idLaporan: number
  idPenempatan: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  statusLaporan: StatusLaporan
  nilaiAkhir: number | null
  grade: string | null
  persentaseKehadiran: number
  totalHariKerja: number
  totalKehadiran: number
}

const items = laporanData.items as LaporanRow[]

const filterStatus = ref<'ALL' | StatusLaporan>('ALL')

const filteredItems = computed(() =>
  items.filter((row) =>
    filterStatus.value === 'ALL'
      ? true
      : row.statusLaporan === filterStatus.value
  )
)

const UButton = resolveComponent('UButton')

const badgeStatus = (s: StatusLaporan) => {
  if (s === 'FINAL')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (s === 'REVIEW')
    return 'bg-amber-50 text-amber-700 border border-amber-100'
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

const columns = computed<TableColumn<LaporanRow>[]>(() => [
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) =>
      `${row.original.namaSiswa} • ${row.original.kelas}`
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan'
  },
  {
    accessorKey: 'statusLaporan',
    header: 'Status laporan',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
            badgeStatus(row.original.statusLaporan)
        },
        row.original.statusLaporan
      )
  },
  {
    id: 'nilai',
    header: 'Nilai akhir',
    cell: ({ row }) =>
      row.original.nilaiAkhir != null
        ? `${row.original.nilaiAkhir.toFixed(1)} (${row.original.grade})`
        : '-'
  },
  {
    id: 'kehadiran',
    header: 'Kehadiran',
    cell: ({ row }) =>
      `${row.original.persentaseKehadiran.toFixed(1)}% (${row.original.totalKehadiran}/${row.original.totalHariKerja})`
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: { th: 'text-right w-40', td: 'text-right' }
    },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          UButton as any,
          {
            size: 'xs',
            color: 'neutral',
            variant: 'outline',
            onClick: () =>
              navigateTo(`/guru/laporan-akhir/${row.original.idLaporan}`)
          },
          { default: () => 'Detail' }
        ),
        h(
          UButton as any,
          {
            size: 'xs',
            color: 'primary',
            variant: 'outline',
            onClick: () => alert('Simulasi download PDF')
          },
          { default: () => 'Download' }
        )
      ])
  }
])
</script>

<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div class="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Laporan Akhir PKL
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Rekap Laporan Akhir Siswa Bimbingan
          </h1>
          <p class="mt-1 max-w-xl text-xs text-slate-500 sm:text-sm">
            Pantau status draft, review, dan final laporan akhir PKL.
          </p>
        </div>

        <USelect
          v-model="filterStatus"
          size="sm"
          :options="[
            { label: 'Semua status', value: 'ALL' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Review', value: 'REVIEW' },
            { label: 'Final', value: 'FINAL' }
          ]"
        />
      </div>
    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredItems"
      :columns="columns"
      title="Daftar laporan akhir"
      description="Gunakan tombol Detail untuk melihat ringkasan lengkap per siswa."
      :page-size="10"
      :searchable="true"
      search-placeholder="Cari nama siswa / perusahaan..."
      :search-keys="['namaSiswa','kelas','perusahaan']"
    />
  </section>
</template>
