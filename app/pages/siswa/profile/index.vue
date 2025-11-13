<!-- pages/siswa/profile.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header + breadcrumb -->
      <header class="mb-6">
        <p class="text-xs text-slate-500 flex items-center gap-1">
          <span class="font-medium">Program Kampus Merdeka</span>
          <span>/</span>
          <span class="text-slate-700">Data Diri</span>
        </p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-800">
          Data Diri Peserta
        </h1>
      </header>

      <!-- Card profil (component terpisah) -->
      <SiswaProfileCard :profile="profile" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'siswa'
})

const profile = {
  namaLengkap: 'RYOBI SURYA ATMAJA',
  nim: '5220311063',
  fakultas: 'Sains & Teknologi',
  prodi: 'Sistem Informasi Sarjana',
  jenisKelamin: 'Laki–Laki',
  tempatTanggalLahir: 'Wonogiri, 05/03/2003',
  noKtp: '3312010503030001',
  alamatDomisili: 'TAMBAKAN RT 1 RW 8, KARANGLOR',
  noHp: '082241908389',
  email: 'ryobisuryaatmaja@gmail.com',
  ipk: '3.79',
  totalSks: '124 SKS'
}
</script>
