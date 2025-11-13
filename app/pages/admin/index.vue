<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500">
    <!-- Header/Navbar -->
    <header class="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
      <UContainer>
        <div class="flex items-center justify-between py-4">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">
              <span class="text-yellow-400">UTY</span>
            </span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <UButton variant="ghost" color="white" size="lg">Program</UButton>
            <UButton variant="ghost" color="white" size="lg">Profil</UButton>
            <UButton variant="ghost" color="white" size="lg">Logbook Kegiatan</UButton>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <UButton color="white" variant="outline" size="md">
              BYOBI SURYA ATMAJA
            </UButton>
            <UButton icon="i-heroicons-x-mark" color="white" variant="ghost" size="md" />
            <UButton color="white" variant="solid" size="md">Keluar</UButton>
          </div>
        </div>
      </UContainer>
    </header>

    <!-- Hero Section -->
    <div class="py-12">
      <UContainer>
        <div class="text-white">
          <h1 class="text-4xl font-bold mb-4">Program Kampus Merdeka</h1>
          
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-white/80">
            <UIcon name="i-heroicons-home" class="w-4 h-4" />
            <span>•</span>
            <span>Program Kampus Merdeka</span>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Content -->
    <div class="pb-16">
      <UContainer>
        <!-- Title Card -->
        <UCard class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 text-center">
            Program yang akan dibuka
          </h2>
        </UCard>

        <!-- Programs Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Program Card -->
          <UCard v-for="program in programs" :key="program.id" class="hover:shadow-xl transition-shadow duration-300">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ program.date }}</span>
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <UIcon :name="program.icon" class="w-8 h-8 text-white" />
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <h3 class="text-xl font-bold text-gray-800">{{ program.title }}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">{{ program.description }}</p>
            </div>

            <template #footer>
              <UButton 
                color="primary" 
                variant="solid" 
                block 
                size="lg"
                icon="i-heroicons-arrow-right"
                trailing
              >
                Lihat Detail
              </UButton>
            </template>
          </UCard>
        </div>
      </UContainer>
    </div>

    <!-- Footer -->
    <footer class="bg-white/10 backdrop-blur-lg border-t border-white/20 py-6">
      <UContainer>
        <div class="text-center text-white/80 text-sm">
          <p>© {{ new Date().getFullYear() }} PUSKOM UTY</p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Program {
  id: number
  title: string
  description: string
  date: string
  icon: string
}

const programs = ref<Program[]>([
  {
    id: 1,
    title: 'Magang/Kerja Praktik',
    description: 'Sambut karir masa depan dengan pengalaman kerja yang berharga',
    date: 'Dibuka sampai 23 Maret 2023',
    icon: 'i-heroicons-briefcase'
  },
  {
    id: 2,
    title: 'Studi Independen',
    description: 'Belajar mandiri dengan kurikulum yang fleksibel dan praktis',
    date: 'Dibuka sampai 30 Maret 2023',
    icon: 'i-heroicons-academic-cap'
  },
  {
    id: 3,
    title: 'Pertukaran Mahasiswa',
    description: 'Rasakan pengalaman belajar di kampus lain dalam dan luar negeri',
    date: 'Dibuka sampai 15 April 2023',
    icon: 'i-heroicons-globe-alt'
  },
  {
    id: 4,
    title: 'Proyek Kemanusiaan',
    description: 'Berkontribusi untuk masyarakat melalui proyek sosial bermakna',
    date: 'Dibuka sampai 20 April 2023',
    icon: 'i-heroicons-heart'
  },
  {
    id: 5,
    title: 'KKN Tematik',
    description: 'Kuliah Kerja Nyata dengan tema spesifik untuk pemberdayaan masyarakat',
    date: 'Dibuka sampai 25 April 2023',
    icon: 'i-heroicons-user-group'
  },
  {
    id: 6,
    title: 'Membangun Desa',
    description: 'Terlibat langsung dalam pembangunan dan pengembangan desa',
    date: 'Dibuka sampai 30 April 2023',
    icon: 'i-heroicons-home-modern'
  }
])
</script>

<style scoped>
/* Custom styles if needed */
</style>