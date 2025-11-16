<template>
  <section class="rounded-[32px] bg-white px-4 py-6 shadow-sm sm:px-8">
    <!-- Breadcrumb -->
    <nav class="text-xs text-slate-400 md:text-sm">
      <span class="cursor-pointer hover:text-blue-500">Home</span>
      <span class="mx-1">›</span>
      <span class="cursor-pointer hover:text-blue-500">Profile</span>
      <span class="mx-1">›</span>
      <span class="font-semibold text-blue-500">Daftar Program</span>
    </nav>

    <!-- CARD PROGRAM: full width di dalam section -->
    <div
      class="mt-6 rounded-[24px] border border-slate-100 bg-white
             px-5 py-5 shadow-sm sm:px-8 sm:py-7"
    >
      <!-- Header perusahaan -->
      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <!-- Logo + nama + deskripsi -->
        <div class="flex flex-1 gap-4">
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl
                   border border-slate-200 bg-slate-50"
          >
            <!-- ganti dengan <img> kalau ada logo -->
            <span class="text-3xl">🏢</span>
          </div>

          <div class="space-y-2">
            <!-- Heading utama -->
            <h2 class="text-base font-semibold text-slate-900 md:text-lg">
              PT. Gama Integra Informatika (GAMA INFORMATIKA)
            </h2>
            <!-- Deskripsi -->
            <p class="text-xs leading-relaxed text-slate-500 md:text-sm">
              Gama Informatika merupakan satu-satunya tempat kursus dan pelatihan
              yang memiliki keunggulan dalam mencetak lulusan kursus yang berkompeten.
              Kami telah berdiri sejak tahun 1988 dan terus eksis mengembangkan kurikulum
              terkini dan paling up to date. Kurikulum yang kami terapkan sangat berbeda
              dengan yang lainnya. Kami memiliki keunggulan berupa jaminan kerja bagi
              lulusan Gama Informatika.
            </p>
          </div>
        </div>

        <!-- Tombol DETAIL -->
        <div class="flex justify-end">
          <button
            class="rounded-[999px] bg-[#4C6FFF] px-4 py-1.5 text-xs font-semibold
                   tracking-wide text-white shadow-sm md:text-sm"
          >
            DETAIL
          </button>
        </div>
      </div>

      <hr class="my-5 border-slate-100" />

      <!-- Info Posisi / Jenis / Deskripsi -->
      <div
        class="grid gap-4 text-xs text-slate-500 sm:grid-cols-3 sm:gap-6 md:text-sm"
      >
        <div>
          <div class="flex items-center gap-2 text-sm font-medium md:text-base">
            <span class="text-lg">🏷️</span>
            <span>Posisi</span>
          </div>
          <p class="mt-1 text-xs text-slate-400 md:text-sm">-</p>
        </div>

        <div>
          <div class="flex items-center gap-2 text-sm font-medium md:text-base">
            <span class="text-lg">🧑‍💻</span>
            <span>Jenis Kegiatan</span>
          </div>
          <p class="mt-1 text-sm font-semibold text-slate-700 md:text-base">
            Magang/Kerja Praktik
          </p>
        </div>

        <div>
          <div class="flex items-center gap-2 text-sm font-medium md:text-base">
            <span class="text-lg">📄</span>
            <span>Deskripsi Pekerjaan</span>
          </div>
          <p class="mt-1 text-xs text-slate-400 md:text-sm">-</p>
        </div>
      </div>

      <!-- Tahun ajaran + semester -->
      <div
        class="mt-6 grid gap-4 text-xs text-slate-500 sm:grid-cols-2 sm:gap-8 md:text-sm"
      >
        <div>
          <p class="text-sm font-medium md:text-base">Tahun Ajaran</p>
          <p class="mt-1 text-sm font-semibold text-slate-800 md:text-base">
            2024/2025
          </p>
        </div>
        <div>
          <p class="text-sm font-medium md:text-base">Semester</p>
          <p class="mt-1 text-sm font-semibold text-slate-800 md:text-base">
            Genap
          </p>
        </div>
      </div>

      <hr class="mt-6 border-slate-100" />

      <!-- Keterangan status -->
      <div class="mt-6">
        <h3 class="mb-3 text-sm font-semibold text-slate-700 md:text-base">
          Keterangan Status
        </h3>

        <div class="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div
            v-for="status in statuses"
            :key="status.label"
            class="flex items-center rounded-xl bg-[#D5F5E8] px-4 py-3"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F9E69]"
            >
              <span class="text-sm text-white">✓</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-[#16654A] md:text-base">
                {{ status.label }}
              </p>
              <p class="text-xs text-[#3C8264] md:text-sm">
                {{ status.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- end card -->
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: 'siswa',
})

const statuses = [
  { label: 'DPA', note: 'Sudah ACC' },
  { label: 'Prodi', note: 'Sudah ACC' },
  { label: 'Mitra', note: 'Sudah ACC' },
]

onMounted(() => {
  console.log('✅ Halaman Daftar Program berhasil dimuat!')
  console.log('📍 Current Route:', useRoute().path)
})
</script>
