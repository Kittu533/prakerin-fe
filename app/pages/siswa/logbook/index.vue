<!-- pages/siswa/logbook.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header + breadcrumb -->
      <header class="mb-6">
        <p class="text-xs text-slate-500 flex items-center gap-1">
          <span class="font-medium">Program Kampus Merdeka</span>
          <span>/</span>
          <span class="text-slate-700">Logbook Mahasiswa</span>
        </p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-800">
          Logbook Mahasiswa
        </h1>
      </header>

      <!-- Card: Informasi diri + form logbook -->
      <section
        class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden mb-8"
      >
        <div class="border-b border-slate-200 px-6 py-4">
          <h2 class="text-base font-semibold text-slate-800">
            Logbook Mahasiswa
          </h2>
        </div>

        <div class="px-6 py-5 space-y-8">
          <SiswaLogbookInfoSection :profile="profile" />

          <SiswaLogbookForm @submit="handleSubmitLogbook" />
        </div>
      </section>

      <!-- Tabel daftar logbook -->
      <SiswaLogbookTable
        :entries="entries"
        @delete="handleDeleteEntry"
        @save="handleSaveAll"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'siswa'
})

interface Profile {
  namaLengkap: string
  nim: string
  fakultas: string
  prodi: string
}

interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  pembimbingStatus: 'verified' | 'unverified'
  mitraStatus: 'verified' | 'unverified'
}

interface LogbookFormPayload {
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
}

const profile: Profile = {
  namaLengkap: 'RYOBI SURYA ATMAJA',
  nim: '5220311063',
  fakultas: 'Sains & Teknologi',
  prodi: 'Sistem Informasi Sarjana'
}

const entries = ref<LogbookEntry[]>([
  {
    id: 1,
    tanggal: '08/11/2025',
    jamMulai: '09:06:00',
    jamSelesai: '15:06:00',
    aktivitas: 'LIBUR',
    pembimbingStatus: 'verified',
    mitraStatus: 'unverified'
  },
  {
    id: 2,
    tanggal: '07/11/2025',
    jamMulai: '13:00:00',
    jamSelesai: '21:00:00',
    aktivitas:
      'meeting dengan tim klinik hewan dengan pemberian file penting untuk menunjang development fixing bug',
    pembimbingStatus: 'verified',
    mitraStatus: 'unverified'
  },
  {
    id: 3,
    tanggal: '06/11/2025',
    jamMulai: '13:00:00',
    jamSelesai: '21:00:00',
    aktivitas:
      'meeting dengan tim klinik hewan mengenai tugas dan tanggung jawab selama bergabung dengan tim serta mempelajari repository klinik hewan',
    pembimbingStatus: 'verified',
    mitraStatus: 'unverified'
  }
])

function handleSubmitLogbook(payload: LogbookFormPayload) {
  // Tambah data baru ke tabel (dummy di sisi front-end)
  const nextId = entries.value.length
    ? Math.max(...entries.value.map((e) => e.id)) + 1
    : 1

  entries.value.unshift({
    id: nextId,
    tanggal: payload.tanggal,
    jamMulai: payload.jamMulai,
    jamSelesai: payload.jamSelesai,
    aktivitas: payload.aktivitas,
    pembimbingStatus: 'unverified',
    mitraStatus: 'unverified'
  })
}

function handleDeleteEntry(id: number) {
  entries.value = entries.value.filter((entry) => entry.id !== id)
}

function handleSaveAll() {
  // Nanti bisa diganti dengan pemanggilan API.
  console.log('Simpan logbook ke server (dummy):', entries.value)
  alert('Logbook disimpan (dummy). Nanti hubungkan ke API backend.')
}
</script>
