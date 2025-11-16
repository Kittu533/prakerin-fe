<template>
  <section class="rounded-[32px] bg-white px-4 py-6 shadow-sm sm:px-8">
    <!-- Breadcrumb -->
    <nav class="text-xs text-slate-400 md:text-sm">
      <span class="cursor-pointer hover:text-blue-500">Home</span>
      <span class="mx-1">›</span>
      <span class="cursor-pointer hover:text-blue-500">Profile</span>
      <span class="mx-1">›</span>
      <span class="font-semibold text-blue-500">Data Diri</span>
    </nav>

    <!-- CARD DATA DIRI: full width di dalam section -->
    <div
      class="mt-6 rounded-[24px] border border-slate-100 bg-white
             px-5 py-5 shadow-sm sm:px-8 sm:py-7"
    >
      <!-- Header profil -->
      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <!-- Avatar + nama -->
        <div class="flex flex-1 gap-4">
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl
                   border-2 border-blue-500 bg-blue-50"
          >
            <!-- Avatar placeholder -->
            <span class="text-2xl font-bold text-blue-600">RS</span>
          </div>

          <div class="space-y-2">
            <!-- Heading utama -->
            <h2 class="text-base font-semibold text-slate-900 md:text-lg uppercase">
              RYOBI SURYA ATMAJA
            </h2>
            <!-- Subtitle -->
            <p class="text-xs leading-relaxed text-slate-500 md:text-sm">
              Siswa SMK Negeri 2 Wonogiri - Program Praktik Kerja Lapangan
            </p>
          </div>
        </div>
      </div>

      <hr class="my-5 border-slate-100" />

      <!-- Data Identitas Utama -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-700 md:text-base">
          Informasi Identitas
        </h3>
        
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div
            v-for="item in identitasData"
            :key="item.label"
            class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <p class="text-xs text-slate-500 md:text-sm">{{ item.label }}</p>
            <p class="mt-1 text-sm font-semibold text-slate-800 md:text-base">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>

      <hr class="my-6 border-slate-100" />

      <!-- Data Akademik -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-700 md:text-base">
          Informasi Akademik
        </h3>
        
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="item in akademikData"
            :key="item.label"
            class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <p class="text-xs text-slate-500 md:text-sm">{{ item.label }}</p>
            <p class="mt-1 text-sm font-semibold text-slate-800 md:text-base">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>

      <hr class="my-6 border-slate-100" />

      <!-- Data Kontak -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-700 md:text-base">
          Informasi Kontak
        </h3>
        
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="item in kontakData"
            :key="item.label"
            class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <p class="text-xs text-slate-500 md:text-sm">{{ item.label }}</p>
            <p class="mt-1 text-sm font-semibold text-slate-800 md:text-base break-all">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>

      <hr class="my-6 border-slate-100" />

      <!-- Status Kelengkapan -->
      <div class="mt-6">
        <h3 class="mb-3 text-sm font-semibold text-slate-700 md:text-base">
          Status Kelengkapan Data
        </h3>

        <div class="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div
            class="flex items-center rounded-xl bg-[#D5F5E8] px-4 py-3"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F9E69]"
            >
              <span class="text-sm text-white">✓</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-[#16654A] md:text-base">
                Data Pribadi
              </p>
              <p class="text-xs text-[#3C8264] md:text-sm">
                Lengkap
              </p>
            </div>
          </div>

          <div
            class="flex items-center rounded-xl bg-[#D5F5E8] px-4 py-3"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F9E69]"
            >
              <span class="text-sm text-white">✓</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-[#16654A] md:text-base">
                Data Akademik
              </p>
              <p class="text-xs text-[#3C8264] md:text-sm">
                Lengkap
              </p>
            </div>
          </div>

          <div
            class="flex items-center rounded-xl bg-[#D5F5E8] px-4 py-3"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F9E69]"
            >
              <span class="text-sm text-white">✓</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-[#16654A] md:text-base">
                Data Kontak
              </p>
              <p class="text-xs text-[#3C8264] md:text-sm">
                Lengkap
              </p>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- end card -->
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'siswa',
})

// Data identitas utama
const identitasData = ref([
  { label: 'NIM', value: '5220311063' },
  { label: 'Jenis Kelamin', value: 'Laki-Laki' },
  { label: 'Tempat Lahir', value: 'Wonogiri' },
  { label: 'Tanggal Lahir', value: '05/03/2003' },
  { label: 'No. KTP', value: '3312010503030001' },
  { label: 'Alamat', value: 'TAMBAKAN RT 1 RW 8, KARANGLOR' },
])

// Data akademik
const akademikData = ref([
  { label: 'Fakultas', value: 'Sains & Teknologi' },
  { label: 'Program Studi', value: 'Sistem Informasi Sarjana' },
  { label: 'IPK', value: '3.79' },
  { label: 'Total SKS', value: '124 SKS' },
])

// Data kontak
const kontakData = ref([
  { label: 'No. HP', value: '082241908389' },
  { label: 'Email', value: 'ryobisuryaatmaja@gmail.com' },
])

onMounted(() => {
  console.log('✅ Halaman Data Diri berhasil dimuat!')
  console.log('📍 Current Route:', useRoute().path)
})
</script>
