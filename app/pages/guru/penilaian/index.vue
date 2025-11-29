<script setup lang="ts">
import { computed, h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'
import penilaianData from '~/assets/data/guru_penilaian.json'

definePageMeta({
  layout: 'guru',
  title: 'Penilaian PKL'
})

interface PenilaianRow {
  idPenempatan: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  statusPenilaianTengah: 'SUDAH' | 'BELUM'
  statusPenilaianAkhir: 'SUDAH' | 'BELUM'
  nilaiTengah: number | null
  nilaiAkhir: number | null
}

const items = penilaianData.items as PenilaianRow[]

const filterStatus = ref<'ALL' | 'BELUM_AKHIR' | 'BELUM_TENGAH'>('ALL')

const filteredItems = computed(() =>
  items.filter((row) => {
    if (filterStatus.value === 'ALL') return true
    if (filterStatus.value === 'BELUM_AKHIR')
      return row.statusPenilaianAkhir === 'BELUM'
    if (filterStatus.value === 'BELUM_TENGAH')
      return row.statusPenilaianTengah === 'BELUM'
    return true
  })
)

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const badgeStatus = (s: 'SUDAH' | 'BELUM') =>
  s === 'SUDAH'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    : 'bg-amber-50 text-amber-700 border border-amber-100'

const columns = computed<TableColumn<PenilaianRow>[]>(() => [
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
    id: 'tengah',
    header: 'Penilaian tengah',
    cell: ({ row }) =>
      h('div', { class: 'space-y-0.5' }, [
        h(
          'span',
          {
            class:
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
              badgeStatus(row.original.statusPenilaianTengah)
          },
          row.original.statusPenilaianTengah
        ),
        h(
          'p',
          { class: 'text-[11px] text-slate-500' },
          row.original.nilaiTengah != null
            ? `Nilai: ${row.original.nilaiTengah.toFixed(1)}`
            : 'Belum ada nilai'
        )
      ])
  },
  {
    id: 'akhir',
    header: 'Penilaian akhir',
    cell: ({ row }) =>
      h('div', { class: 'space-y-0.5' }, [
        h(
          'span',
          {
            class:
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
              badgeStatus(row.original.statusPenilaianAkhir)
          },
          row.original.statusPenilaianAkhir
        ),
        h(
          'p',
          { class: 'text-[11px] text-slate-500' },
          row.original.nilaiAkhir != null
            ? `Nilai: ${row.original.nilaiAkhir.toFixed(1)}`
            : 'Belum ada nilai'
        )
      ])
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
            color: 'primary',
            variant: 'outline',
            onClick: () =>
              navigateTo(`/guru/penilaian/${row.original.idPenempatan}`)
          },
          { default: () => 'Isi / Edit' }
        )
      ])
  }
])
</script>

<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Penilaian PKL
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Rekap Penilaian Siswa Bimbingan
          </h1>
          <p class="mt-1 max-w-xl text-xs text-slate-500 sm:text-sm">
            Lihat status penilaian tengah dan akhir PKL untuk setiap penempatan.
          </p>
        </div>

        <USelect
          v-model="filterStatus"
          size="sm"
          :options="[
            { label: 'Semua penilaian', value: 'ALL' },
            { label: 'Belum dinilai akhir', value: 'BELUM_AKHIR' },
            { label: 'Belum dinilai tengah', value: 'BELUM_TENGAH' }
          ]"
        />
      </div>
    </div>

    <!-- TABLE -->
    <AppDataTable
      :items="filteredItems"
      :columns="columns"
      title="Daftar penilaian"
      description="Gunakan tombol Isi / Edit untuk membuka form penilaian penuh."
      :page-size="10"
      :searchable="true"
      search-placeholder="Cari nama siswa / perusahaan..."
      :search-keys="['namaSiswa','kelas','perusahaan']"
    />
  </section>
</template>
