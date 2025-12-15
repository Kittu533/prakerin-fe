<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/penempatan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Header Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <div v-if="loading" class="flex flex-col md:flex-row gap-6">
        <USkeleton class="w-16 h-16 rounded-xl" />
        <div class="flex-1 space-y-3">
          <USkeleton class="h-6 w-64" />
          <USkeleton class="h-4 w-48" />
          <USkeleton class="h-4 w-32" />
        </div>
      </div>
      <div v-else class="flex flex-col md:flex-row gap-6">
        <div class="w-16 h-16 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
          <Icon name="lucide:building-2" class="w-8 h-8" />
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 class="text-xl font-bold text-slate-900">{{ industri.nama }}</h1>
              <p class="text-slate-500">{{ industri.alamat }}</p>
            </div>
            <UBadge :color="industri.status === 'Aktif' ? 'success' : 'primary'" variant="subtle">{{ industri.status }}</UBadge>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
            <span class="flex items-center gap-1">
              <Icon name="lucide:user" class="w-4 h-4" />
              Mentor: {{ industri.mentor }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:phone" class="w-4 h-4" />
              {{ industri.phone }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              {{ industri.periode }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-20 mb-2" />
          <USkeleton class="h-6 w-12" />
        </div>
      </template>
      <template v-else>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Jumlah Siswa</p>
          <p class="text-xl font-bold text-slate-900">{{ siswaList.length }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Rata-rata Kehadiran</p>
          <p class="text-xl font-bold text-green-600">{{ avgKehadiran }}%</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Total Kunjungan</p>
          <p class="text-xl font-bold text-sky-600">{{ industri.kunjungan }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Hari Berjalan</p>
          <p class="text-xl font-bold text-amber-600">{{ industri.hariBerjalan }}</p>
        </div>
      </template>
    </div>

    <!-- Students List -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-900">Daftar Siswa</h2>
      </div>

      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="w-10 h-10 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-24" />
          </div>
          <USkeleton class="h-4 w-16" />
        </div>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="siswa in siswaList" :key="siswa.id" class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm">
            {{ siswa.inisial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900">{{ siswa.nama }}</p>
            <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.nis }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium" :class="siswa.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">{{ siswa.kehadiran }}%</p>
              <p class="text-xs text-slate-500">Kehadiran</p>
            </div>
            <UButton size="xs" variant="ghost" color="neutral" @click="navigateTo(`/guru/siswa-bimbingan/${siswa.id}`)">
              <Icon name="lucide:eye" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const route = useRoute()
const loading = ref(true)

const industri = ref({})
const siswaList = ref([])

const avgKehadiran = computed(() => {
  if (!siswaList.value.length) return 0
  const total = siswaList.value.reduce((sum, s) => sum + s.kehadiran, 0)
  return Math.round(total / siswaList.value.length)
})

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  industri.value = {
    id: route.params.id,
    nama: 'PT. Telkom Indonesia',
    alamat: 'Jl. Gatot Subroto Kav. 52, Jakarta Selatan',
    mentor: 'Pak Agus Santoso',
    phone: '021-12345678',
    status: 'Aktif',
    periode: '1 Juli - 31 Desember 2024',
    kunjungan: 6,
    hariBerjalan: 120
  }
  siswaList.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', nis: '2023010563', kehadiran: 95 },
    { id: 2, nama: 'Budi Prasetyo', inisial: 'BP', kelas: 'XII RPL 1', nis: '2023010567', kehadiran: 90 },
    { id: 3, nama: 'Andi Wijaya', inisial: 'AW', kelas: 'XII RPL 2', nis: '2023010570', kehadiran: 88 }
  ]
  loading.value = false
})

useHead({ title: 'Detail Penempatan | Guru PKL' })
</script>
