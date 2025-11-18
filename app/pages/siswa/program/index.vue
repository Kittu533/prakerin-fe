<template>
  <section class="space-y-6 sm:space-y-8">
    <!-- Header Section -->
    <div class="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg">
      <div class="flex items-center gap-4 mb-4">
        <div class="hidden sm:flex w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">Program Prakerin</h1>
          <p class="text-blue-100 text-sm sm:text-base md:text-lg">Pilih program yang sesuai dengan minat dan jurusan Anda</p>
        </div>
      </div>
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-blue-100">
        <span class="hover:text-white cursor-pointer transition-colors">Home</span>
        <span>›</span>
        <span class="font-semibold text-white">Program</span>
      </nav>
    </div>

    <!-- Info Banner -->
    <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100 shadow-sm">
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-1">Program yang Tersedia</h3>
          <p class="text-sm sm:text-base text-slate-600">Total {{ programs.length }} program dibuka untuk pendaftaran</p>
        </div>
      </div>
    </div>

    <!-- List Card Program -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <ProgramCard
        v-for="program in programs"
        :key="program.id"
        :title="program.title"
        :description="program.description"
        :deadline="program.deadline"
        :tags="program.tags"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ProgramCard from '~/components/siswa/ProgramCard.vue'

definePageMeta({
  layout: 'siswa',
})

const programs = ref([
  {
    id: 1,
    title: 'Praktik Kerja Industri',
    description:
      'Sambut karir masa depan dengan pengalaman kerja langsung di perusahaan mitra pilihan.',
    deadline: '23 Maret 2026',
    tags: ['Teknik Mesin', 'Kuota 30 siswa'],
  },
  {
    id: 2,
    title: 'Bootcamp Web Developer',
    description:
      'Belajar membangun website modern dengan HTML, CSS, dan JavaScript bersama mentor industri.',
    deadline: '15 Februari 2026',
    tags: ['RPL / TKJ', '8 Minggu', 'Hybrid'],
  },
  {
    id: 3,
    title: 'Program Magang Startup Digital',
    description:
      'Terlibat dalam pengembangan produk digital di startup teknologi dan rasakan budaya kerja agile.',
    deadline: '10 April 2026',
    tags: ['Semua Jurusan', 'Remote Friendly'],
  },
])
</script>
