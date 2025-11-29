<script setup lang="ts">
import penempatanData from '~/assets/data/guru_penempatan.json'

definePageMeta({
  layout: 'guru',
  title: 'Detail Penempatan Siswa'
})

const route = useRoute()
const id = Number(route.params.id)

const penempatan = computed(() =>
  (penempatanData.items as any[]).find((p) => p.idPenempatan === id)
)
</script>

<template>
  <section v-if="penempatan" class="space-y-6 sm:space-y-8">
    <!-- HEADER + BREADCRUMB -->
    <div
      class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Detail Penempatan
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {{ penempatan.namaSiswa }} • {{ penempatan.kelas }}
          </h1>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            Penempatan di {{ penempatan.perusahaan }} bersama mentor
            {{ penempatan.mentor }}.
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru" class="hover:text-blue-600">Dashboard</NuxtLink>
          <span>›</span>
          <NuxtLink to="/guru/penempatan" class="hover:text-blue-600">
            Penempatan
          </NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Detail</span>
        </nav>
      </div>
    </div>

    <!-- OVERVIEW GRID -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Periode PKL
        </h3>
        <p class="mt-2 text-sm font-semibold text-slate-900">
          {{ penempatan.periodeMulai }} – {{ penempatan.periodeSelesai }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Status: <span class="font-semibold">{{ penempatan.statusPenempatan }}</span>
        </p>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Perusahaan & Mentor
        </h3>
        <p class="mt-2 text-sm font-semibold text-slate-900">
          {{ penempatan.perusahaan }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Mentor lapangan: <span class="font-semibold">{{ penempatan.mentor }}</span>
        </p>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 class="text-xs font-semibold uppercase text-slate-500">
          Ringkasan Kehadiran
        </h3>
        <p class="mt-2 text-2xl font-bold text-emerald-600">
          {{ penempatan.persenKehadiran.toFixed(1) }}%
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Perkiraan kehadiran berdasarkan data absensi (dummy).
        </p>
      </div>
    </div>

    <!-- PLACEHOLDER TAB SECTION -->
    <div
      class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-500 sm:text-sm"
    >
      Bagian ini bisa diisi tabel:
      <span class="font-semibold">Absensi, Logbook, Dokumen, Penilaian</span>
      khusus untuk penempatan ini setelah backend siap. Saat ini hanya menampilkan
      ringkasan dari JSON.
    </div>
  </section>

  <section v-else class="rounded-2xl bg-white p-6 text-center text-sm text-slate-600">
    Data penempatan tidak ditemukan.
    <NuxtLink to="/guru/penempatan" class="ml-1 text-blue-600 underline">
      Kembali ke daftar
    </NuxtLink>
  </section>
</template>
