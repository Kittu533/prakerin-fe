<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Monitoring Kunjungan</h1>
        <p class="text-sm text-slate-500 mt-1">Riwayat kunjungan ke tempat PKL siswa</p>
      </div>
      <UButton color="primary" to="/guru/kunjungan/create">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Input Kunjungan
      </UButton>
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
          <p class="text-sm text-slate-500 mb-1">Total Kunjungan</p>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Bulan Ini</p>
          <p class="text-xl font-bold text-sky-600">{{ stats.bulanIni }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Siswa Dikunjungi</p>
          <p class="text-xl font-bold text-green-600">{{ stats.dikunjungi }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-sm text-slate-500 mb-1">Belum Dikunjungi</p>
          <p class="text-xl font-bold text-amber-600">{{ stats.belum }}</p>
        </div>
      </template>
    </div>

    <!-- List -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-900">Riwayat Kunjungan</h2>
      </div>

      <div v-if="loading" class="divide-y divide-slate-100">
        <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="w-10 h-10 rounded-xl" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-32" />
          </div>
          <USkeleton class="h-4 w-24" />
        </div>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="item in visits" :key="item.id" class="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
          <div class="p-2 rounded-xl bg-sky-100 text-sky-600 shrink-0">
            <Icon name="lucide:map-pin" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900">{{ item.industri }}</p>
            <p class="text-sm text-slate-500">{{ item.siswa }} • {{ item.kelas }}</p>
            <p class="text-sm text-slate-600 mt-1">{{ item.catatan }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-medium text-slate-900">{{ item.tanggal }}</p>
            <p class="text-xs text-slate-500">{{ item.jam }}</p>
          </div>
        </div>

        <div v-if="!visits.length" class="py-12 text-center">
          <Icon name="lucide:map" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada kunjungan</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const loading = ref(true)
const stats = reactive({ total: 0, bulanIni: 0, dikunjungi: 0, belum: 0 })
const visits = ref([])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 18, bulanIni: 6, dikunjungi: 20, belum: 4 })
  visits.value = [
    { id: 1, industri: 'PT. Telkom Indonesia', siswa: 'Ryobi Surya Atmaja', kelas: 'XII RPL 1', tanggal: '12 Des 2024', jam: '10:00', catatan: 'Siswa menunjukkan progress yang baik' },
    { id: 2, industri: 'PT. Gojek Indonesia', siswa: 'Dewi Sartika', kelas: 'XII RPL 2', tanggal: '10 Des 2024', jam: '14:00', catatan: 'Diskusi dengan mentor industri' },
    { id: 3, industri: 'CV. Digital Nusantara', siswa: 'Ahmad Fauzi', kelas: 'XII TKJ 1', tanggal: '8 Des 2024', jam: '09:30', catatan: 'Evaluasi tengah periode PKL' }
  ]
  loading.value = false
})

useHead({ title: 'Monitoring Kunjungan | Guru PKL' })
</script>
