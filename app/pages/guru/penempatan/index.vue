<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'
import penempatanData from '~/assets/data/guru_penempatan.json'

definePageMeta({
  layout: 'guru',
  title: 'Penempatan & Siswa Bimbingan'
})

type StatusPenempatan = 'AKTIF' | 'SELESAI' | 'DIBATALKAN'

interface PenempatanRow {
  idPenempatan: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  mentor: string
  periodeMulai: string
  periodeSelesai: string
  statusPenempatan: StatusPenempatan
  persenKehadiran: number
}

const allItems = ref<PenempatanRow[]>(penempatanData.items as PenempatanRow[])

/* ------ FILTER ------ */
const filterStatus = ref<'ALL' | StatusPenempatan>('ALL')
const filterPerusahaan = ref('')
const filterSiswa = ref('')

const filteredItems = computed(() =>
  allItems.value.filter((row) => {
    const matchStatus =
      filterStatus.value === 'ALL'
        ? true
        : row.statusPenempatan === filterStatus.value

    const matchPerusahaan = filterPerusahaan.value
      ? row.perusahaan
          .toLowerCase()
          .includes(filterPerusahaan.value.toLowerCase())
      : true

    const matchSiswa = filterSiswa.value
      ? row.namaSiswa.toLowerCase().includes(filterSiswa.value.toLowerCase())
      : true

    return matchStatus && matchPerusahaan && matchSiswa
  })
)

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const badgeStatus = (status: StatusPenempatan) => {
  if (status === 'AKTIF')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  if (status === 'SELESAI')
    return 'bg-sky-50 text-sky-700 border border-sky-100'
  return 'bg-rose-50 text-rose-700 border border-rose-100'
}

/* ------ COLUMNS ------ */
const columns = computed<TableColumn<PenempatanRow>[]>(() => [
  {
    accessorKey: 'namaSiswa',
    header: 'Siswa',
    cell: ({ row }) =>
      `${row.original.namaSiswa} • ${row.original.kelas}`
  },
  {
    accessorKey: 'perusahaan',
    header: 'Perusahaan / Mentor',
    cell: ({ row }) =>
      h('div', { class: 'space-y-0.5' }, [
        h('p', { class: 'font-medium text-slate-800 text-sm' }, row.original.perusahaan),
        h('p', { class: 'text-[11px] text-slate-500' }, `Mentor: ${row.original.mentor}`)
      ])
  },
  {
    id: 'periode',
    header: 'Periode',
    cell: ({ row }) =>
      `${row.original.periodeMulai} – ${row.original.periodeSelesai}`
  },
  {
    accessorKey: 'statusPenempatan',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ' +
            badgeStatus(row.original.statusPenempatan)
        },
        row.original.statusPenempatan
      )
  },
  {
    accessorKey: 'persenKehadiran',
    header: 'Kehadiran',
    cell: ({ row }) =>
      h('span', { class: 'font-semibold text-slate-900 text-sm' }, `${row.original.persenKehadiran.toFixed(1)}%`)
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: {
      class: { th: 'text-right w-28', td: 'text-right' }
    },
    cell: ({ row }) =>
      h(
        UButton as any,
        {
          size: 'xs',
          color: 'primary',
          variant: 'outline',
          onClick: () =>
            navigateTo(`/guru/penempatan/${row.original.idPenempatan}`)
        },
        { default: () => 'Detail' }
      )
  }
])
</script>

<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
    >
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Penempatan & Monitoring
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Daftar Siswa Bimbingan PKL
          </h1>
          <p class="mt-1 max-w-xl text-xs text-slate-500 sm:text-sm">
            Lihat penempatan aktif maupun selesai, lengkap dengan perusahaan mitra,
            mentor, dan persentase kehadiran.
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru" class="hover:text-blue-600">Dashboard</NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Penempatan</span>
        </nav>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
    >
      <div
        class="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:items-end md:gap-4"
      >
        <UFormGroup label="Cari siswa" class="text-xs sm:text-sm">
          <UInput
            v-model="filterSiswa"
            size="sm"
            placeholder="Nama siswa…"
          />
        </UFormGroup>

        <UFormGroup label="Perusahaan" class="text-xs sm:text-sm">
          <UInput
            v-model="filterPerusahaan"
            size="sm"
            placeholder="Nama perusahaan…"
          />
        </UFormGroup>

        <UFormGroup label="Status penempatan" class="text-xs sm:text-sm">
          <USelect
            v-model="filterStatus"
            size="sm"
            :options="[
              { label: 'Semua status', value: 'ALL' },
              { label: 'Aktif', value: 'AKTIF' },
              { label: 'Selesai', value: 'SELESAI' },
              { label: 'Dibatalkan', value: 'DIBATALKAN' }
            ]"
          />
        </UFormGroup>
      </div>
    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredItems"
      :columns="columns"
      title="Penempatan siswa"
      description="Ringkasan penempatan PKL yang dibimbing oleh Anda."
      :page-size="10"
      :searchable="true"
      search-placeholder="Cari di semua kolom..."
      :search-keys="['namaSiswa','kelas','perusahaan','mentor']"
    />
  </section>
</template>
