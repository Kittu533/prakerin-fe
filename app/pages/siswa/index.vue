<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <!-- Hero Section -->
      <div class="text-black mb-8">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Praktik Kerja Industri</h1>
        
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-black/90">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span> > </span>
          <span>Program Kampus Merdeka</span>
        </div>
      </div>

      <!-- Title Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 class="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
          Program yang akan dibuka
        </h2>
      </div>

      <!-- Programs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProgramCard
          v-for="program in programs"
          :key="program.id"
          :title="program.title"
          :description="program.description"
          :date="program.date"
          :program-id="program.id"
          @click="handleProgramClick"
        />
      </div>

      <!-- Empty State -->
      <div v-if="programs.length === 0" class="text-center py-16">
        <div class="text-white/60">
          <svg class="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-xl font-medium">Belum ada program yang tersedia</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'siswa'
})

interface Program {
  id: number
  title: string
  description: string
  date: string
}

const programs = ref<Program[]>([
  {
    id: 1,
    title: 'Magang/Kerja Praktik',
    description: 'Sambut karir masa depan dengan pengalaman kerja yang berharga',
    date: 'Dibuka sampai 23 Maret 2023'
  },
  {
    id: 2,
    title: 'Studi Independen',
    description: 'Belajar mandiri dengan kurikulum yang fleksibel dan praktis',
    date: 'Dibuka sampai 30 Maret 2023'
  },
  {
    id: 3,
    title: 'Pertukaran Mahasiswa',
    description: 'Rasakan pengalaman belajar di kampus lain dalam dan luar negeri',
    date: 'Dibuka sampai 15 April 2023'
  },
  {
    id: 4,
    title: 'Proyek Kemanusiaan',
    description: 'Berkontribusi untuk masyarakat melalui proyek sosial bermakna',
    date: 'Dibuka sampai 20 April 2023'
  },
  {
    id: 5,
    title: 'KKN Tematik',
    description: 'Kuliah Kerja Nyata dengan tema spesifik untuk pemberdayaan masyarakat',
    date: 'Dibuka sampai 25 April 2023'
  },
  {
    id: 6,
    title: 'Membangun Desa',
    description: 'Terlibat langsung dalam pembangunan dan pengembangan desa',
    date: 'Dibuka sampai 30 April 2023'
  }
])

const handleProgramClick = (id: number | undefined) => {
  console.log('Program clicked:', id)
  // Navigate to program detail
  navigateTo(`/siswa/program/${id}`)
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>