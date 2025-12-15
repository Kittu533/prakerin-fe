<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton variant="ghost" color="neutral" size="sm" to="/mentor/siswa">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </UButton>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Detail Siswa</h1>
        <p class="text-sm text-slate-500">Informasi lengkap siswa PKL</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-32 rounded-xl" />
      <USkeleton class="h-48 rounded-xl" />
    </div>

    <template v-else>
      <!-- Profile Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
            {{ siswa.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-slate-900">{{ siswa.nama }}</h2>
            <p class="text-sm text-slate-500">{{ siswa.nisn }} • {{ siswa.kelas }}</p>
            <div class="flex gap-2 mt-2">
              <UBadge color="success" variant="subtle">Aktif</UBadge>
              <UBadge color="primary" variant="subtle">{{ siswa.jurusan }}</UBadge>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-2xl font-bold" :class="siswa.absensi >= 80 ? 'text-success-600' : 'text-error-600'">{{ siswa.absensi }}%</p>
          <p class="text-sm text-slate-500">Kehadiran</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-2xl font-bold text-primary-600">{{ siswa.logbook }}</p>
          <p class="text-sm text-slate-500">Logbook</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-2xl font-bold text-slate-900">{{ siswa.nilai || '-' }}</p>
          <p class="text-sm text-slate-500">Nilai</p>
        </div>
      </div>

      <!-- Recent Logbook -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-900">Logbook Terbaru</h3>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="log in recentLogbook" :key="log.id" class="px-5 py-3 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-900">{{ log.judul }}</p>
              <p class="text-xs text-slate-500">{{ log.tanggal }}</p>
            </div>
            <UBadge :color="log.status === 'Disetujui' ? 'success' : log.status === 'Pending' ? 'warning' : 'error'" variant="subtle" size="xs">{{ log.status }}</UBadge>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <UButton color="primary" class="flex-1" :to="`/mentor/penilaian?siswa=${siswa.id}`">
          <Icon name="lucide:star" class="w-4 h-4 mr-2" />
          Beri Penilaian
        </UButton>
        <UButton color="neutral" variant="outline">
          <Icon name="lucide:phone" class="w-4 h-4" />
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const route = useRoute()
const loading = ref(true)

const siswa = ref({
  id: 1,
  nama: 'Budi Santoso',
  nisn: '0012345678',
  kelas: 'XII RPL 1',
  jurusan: 'RPL',
  absensi: 95,
  logbook: 45,
  nilai: 87
})

const recentLogbook = ref([
  { id: 1, judul: 'Membuat UI Dashboard', tanggal: '16 Des 2024', status: 'Pending' },
  { id: 2, judul: 'Meeting Tim Development', tanggal: '15 Des 2024', status: 'Disetujui' },
  { id: 3, judul: 'Implementasi REST API', tanggal: '14 Des 2024', status: 'Disetujui' }
])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
})

useHead({ title: `${siswa.value.nama} | Mentor` })
</script>
