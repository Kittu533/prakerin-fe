<script setup lang="ts">
import laporanData from '~/assets/data/guru_laporan_akhir.json'

definePageMeta({
  layout: 'guru',
  title: 'Detail Laporan Akhir PKL'
})

const route = useRoute()
const id = Number(route.params.id)

const laporan = computed(() =>
  (laporanData.items as any[]).find((l) => l.idLaporan === id)
)
</script>

<template>
  <section v-if="laporan" class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div class="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Detail Laporan Akhir
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {{ laporan.namaSiswa }} • {{ laporan.kelas }}
          </h1>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            Perusahaan: {{ laporan.perusahaan }}
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru/laporan-akhir" class="hover:text-blue-600">
            Laporan Akhir
          </NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Detail</span>
        </nav>
      </div>
    </div>

    <!-- RINGKASAN -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Status laporan
        </h3>
        <p class="mt-2 text-sm font-semibold text-slate-900">
          {{ laporan.statusLaporan }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Nilai akhir:
          <span class="font-semibold">
            {{ laporan.nilaiAkhir ?? '-' }} {{ laporan.grade ? '(' + laporan.grade + ')' : '' }}
          </span>
        </p>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Kehadiran
        </h3>
        <p class="mt-2 text-2xl font-bold text-emerald-600">
          {{ laporan.persentaseKehadiran.toFixed(1) }}%
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ laporan.totalKehadiran }} dari {{ laporan.totalHariKerja }} hari kerja.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Aksi cepat
        </h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            @click="navigateTo('/guru/laporan-akhir')"
          >
            Kembali
          </UButton>
          <UButton
            size="xs"
            color="primary"
            variant="outline"
            @click="() => alert('Simulasi generate / download laporan')"
          >
            Download PDF (Dummy)
          </UButton>
        </div>
      </div>
    </div>

    <!-- PLACEHOLDER DETAIL -->
    <div
      class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-500 sm:text-sm"
    >
      Di sini nanti bisa ditampilkan isi ringkasan laporan akhir (abstrak, bab,
      dan catatan akhir) yang diambil dari tabel <code>Laporan</code> di backend.
      Untuk saat ini, halaman hanya menampilkan ringkasan angka dari JSON dummy.
    </div>
  </section>

  <section v-else class="rounded-2xl bg-white p-6 text-center text-sm text-slate-600">
    Data laporan tidak ditemukan.
    <NuxtLink to="/guru/laporan-akhir" class="ml-1 text-blue-600 underline">
      Kembali ke daftar
    </NuxtLink>
  </section>
</template>
