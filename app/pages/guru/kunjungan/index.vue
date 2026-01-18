<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Monitoring Kunjungan</h1>
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
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:map-pin" class="w-4 h-4" />
            <span class="text-sm">Total Kunjungan</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:calendar" class="w-4 h-4" />
            <span class="text-sm">Bulan Ini</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.bulanIni }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:users" class="w-4 h-4" />
            <span class="text-sm">Siswa Dikunjungi</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.dikunjungi }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:alert-circle" class="w-4 h-4" />
            <span class="text-sm">Belum Dikunjungi</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.belum }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa, industri, atau catatan..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterIndustri" :options="industriOptions" placeholder="Filter Industri"
          class="w-full sm:w-48" />
        <USelectMenu v-model="itemsPerPage" :options="perPageOptions" class="w-full sm:w-28" />
      </div>
    </div>

    <!-- Data Table (Desktop) -->
    <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal & Jam</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Siswa & Kelas</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Industri</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Catatan</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in paginatedVisits" :key="item.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 text-sm text-slate-600">{{ startIndex + index + 1 }}</td>
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-900 whitespace-nowrap">{{ item.tanggal }}</p>
                <p class="text-xs text-slate-500">{{ item.jam }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-xs shrink-0">
                    {{ item.inisial }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900 whitespace-nowrap">{{ item.siswa }}</p>
                    <p class="text-xs text-slate-500 whitespace-nowrap">{{ item.kelas }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:building-2" class="w-4 h-4 text-slate-400" />
                  <span class="text-sm text-slate-700 font-medium truncate max-w-[200px]">{{ item.industri }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-600 truncate max-w-[200px]" :title="item.catatan">{{ item.catatan }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <UButton size="2xs" color="gray" variant="ghost" :to="`/guru/kunjungan/${item.id}`">
                  <Icon name="lucide:eye" class="w-4 h-4" />
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!paginatedVisits.length" class="py-12 text-center">
          <Icon name="lucide:map" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada kunjungan</p>
        </div>
      </div>
    </div>

    <!-- Card List (Mobile) -->
    <div class="lg:hidden space-y-3">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-3/4 mb-2" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </template>
      <template v-else>
        <div v-for="item in paginatedVisits" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold shrink-0">
                {{ item.inisial }}
              </div>
              <div>
                <p class="font-medium text-slate-900">{{ item.siswa }}</p>
                <div class="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="lucide:building-2" class="w-3 h-3" />
                  <span class="truncate max-w-[150px]">{{ item.industri }}</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-medium text-slate-900">{{ item.tanggal }}</p>
              <p class="text-xs text-slate-500">{{ item.jam }}</p>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg mb-3">
            <p class="text-sm text-slate-600 line-clamp-2">{{ item.catatan }}</p>
          </div>

          <UButton block size="xs" variant="soft" color="primary" :to="`/guru/kunjungan/${item.id}`">
            Lihat Detail
          </UButton>
        </div>

        <div v-if="!paginatedVisits.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:map" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Belum ada kunjungan</p>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1"
      class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p class="text-sm text-slate-500">
        Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ totalItems }} data
      </p>
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" size="sm" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const loading = ref(true)
const search = ref('')
const filterIndustri = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const perPageOptions = [5, 10, 25, 50]
const industriOptions = ['PT. Telkom Indonesia', 'PT. Gojek Indonesia', 'CV. Digital Nusantara', 'PT. Media Kreasi']
const stats = reactive({ total: 0, bulanIni: 0, dikunjungi: 0, belum: 0 })
const visits = ref([])

const filteredVisits = computed(() => {
  return visits.value.filter(item => {
    const matchSearch = !search.value ||
      item.siswa.toLowerCase().includes(search.value.toLowerCase()) ||
      item.catatan.toLowerCase().includes(search.value.toLowerCase()) ||
      item.industri.toLowerCase().includes(search.value.toLowerCase())
    const matchIndustri = !filterIndustri.value || item.industri === filterIndustri.value
    return matchSearch && matchIndustri
  })
})

// Pagination computed
const totalItems = computed(() => filteredVisits.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedVisits = computed(() => filteredVisits.value.slice(startIndex.value, endIndex.value))

// Reset page when filter changes
watch([search, filterIndustri, itemsPerPage], () => { currentPage.value = 1 })

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { total: 18, bulanIni: 6, dikunjungi: 20, belum: 4 })

  // Create more mock data for pagination demo
  const baseVisits = [
    { id: 1, industri: 'PT. Telkom Indonesia', siswa: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', tanggal: '12 Des 2024', jam: '10:00', catatan: 'Siswa menunjukkan progress yang baik dalam mengerjakan project frontend.' },
    { id: 2, industri: 'PT. Gojek Indonesia', siswa: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', tanggal: '10 Des 2024', jam: '14:00', catatan: 'Diskusi dengan mentor industri mengenai kendala teknis yang dihadapi siswa.' },
    { id: 3, industri: 'CV. Digital Nusantara', siswa: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', tanggal: '8 Des 2024', jam: '09:30', catatan: 'Evaluasi tengah periode PKL, performa siswa cukup memuaskan.' },
    { id: 4, industri: 'PT. Media Kreasi', siswa: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', tanggal: '5 Des 2024', jam: '11:00', catatan: 'Monitoring kegiatan harian siswa di divisi desain grafis.' }
  ]

  // Generate more data
  visits.value = [...baseVisits, ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 5,
    industri: industriOptions[i % 4],
    siswa: `Siswa ${i + 5}`,
    inisial: `S${i}`,
    kelas: 'XII RPL 1',
    tanggal: `${24 - i} Nov 2024`,
    jam: `09:${10 + i}`,
    catatan: 'Kunjungan rutin monitoring kegiatan siswa.'
  }))]

  loading.value = false
})

useHead({ title: 'Monitoring Kunjungan | Guru PKL' })
</script>
