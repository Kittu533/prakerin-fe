<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-5 lg:p-6 text-white">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl lg:text-2xl font-bold">Penempatan Siswa</h1>
          <p class="text-sky-100 text-sm mt-1">Kelola penempatan guru pembimbing dan mentor industri</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg backdrop-blur">
            <Icon name="lucide:users" class="w-4 h-4" />
            <span class="text-sm font-medium">{{ pendingCount }} Menunggu</span>
          </div>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mt-4">
        <div class="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
          <p class="text-2xl font-bold">{{ pendingCount }}</p>
          <p class="text-xs text-sky-100">Perlu Penempatan</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
          <p class="text-2xl font-bold">{{ scheduledCount }}</p>
          <p class="text-xs text-sky-100">Sudah Terjadwal</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
          <p class="text-2xl font-bold">{{ data.length }}</p>
          <p class="text-xs text-sky-100">Total Siswa</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl border border-slate-200 p-1.5">
      <div class="flex gap-1">
        <button 
          v-for="tabItem in tabs" 
          :key="tabItem.value"
          @click="activeTab = tabItem.value"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === tabItem.value 
            ? 'bg-sky-500 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-slate-50'"
        >
          <Icon :name="tabItem.icon" class="w-4 h-4" />
          <span>{{ tabItem.label }}</span>
          <span 
            v-if="tabItem.count > 0"
            class="px-1.5 py-0.5 text-xs rounded-full"
            :class="activeTab === tabItem.value ? 'bg-white/20' : 'bg-amber-100 text-amber-700'"
          >
            {{ tabItem.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa atau perusahaan..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterJurusan" :items="['Semua Jurusan', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-40">
          <template #leading><Icon name="lucide:filter" class="w-4 h-4 text-slate-400" /></template>
        </USelectMenu>
      </div>
    </div>

    <!-- Table / Cards -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-20 rounded-lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredData.length === 0" class="py-12 text-center">
        <div class="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="lucide:inbox" class="w-8 h-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-medium text-slate-900">Tidak ada data</h3>
        <p class="text-sm text-slate-500 mt-1">
          {{ activeTab === 'pending' ? 'Semua siswa sudah ditempatkan' : 'Tidak ada siswa yang terjadwal' }}
        </p>
      </div>

      <!-- Card View for Mobile, Table for Desktop -->
      <div v-else>
        <!-- Mobile Card View -->
        <div class="lg:hidden divide-y divide-slate-100">
          <div v-for="item in filteredData" :key="item.id" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-sm font-semibold shrink-0">
                  {{ item.siswa.split(' ').map((n: string) => n[0]).join('') }}
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ item.siswa }}</p>
                  <p class="text-xs text-slate-500">{{ item.kelas }} • {{ item.jurusan }}</p>
                </div>
              </div>
              <UBadge v-if="item.status === 'pending'" color="warning" variant="subtle" size="xs">Pending</UBadge>
              <UBadge v-else color="success" variant="subtle" size="xs">Terjadwal</UBadge>
            </div>
            
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-xs text-slate-500">Perusahaan</p>
                <p class="font-medium text-slate-900 truncate">{{ item.perusahaan }}</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-2">
                <p class="text-xs text-slate-500">Guru</p>
                <p class="font-medium" :class="item.guru ? 'text-slate-900' : 'text-slate-400'">
                  {{ item.guru || 'Belum ada' }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <UButton 
                v-if="item.status === 'pending'" 
                size="sm" 
                color="primary" 
                class="flex-1"
                @click="openModal(item)"
              >
                <Icon name="lucide:user-plus" class="w-4 h-4 mr-2" />
                Atur Penempatan
              </UButton>
              <UButton 
                v-else 
                size="sm" 
                color="neutral" 
                variant="outline" 
                class="flex-1"
                @click="openModal(item)"
              >
                <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
                Edit
              </UButton>
            </div>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Siswa</th>
                <th class="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Perusahaan</th>
                <th class="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Guru Pembimbing</th>
                <th class="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Mentor</th>
                <th class="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide px-4 py-3">Status</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in filteredData" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
                      {{ item.siswa.split(' ').map((n: string) => n[0]).join('') }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900">{{ item.siswa }}</p>
                      <p class="text-xs text-slate-500">{{ item.kelas }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon name="lucide:building-2" class="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span class="text-sm text-slate-700">{{ item.perusahaan }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div v-if="item.guru" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                    </div>
                    <span class="text-sm text-slate-700">{{ item.guru }}</span>
                  </div>
                  <span v-else class="text-sm text-slate-400 italic">Belum ditentukan</span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="item.mentor" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                    </div>
                    <span class="text-sm text-slate-700">{{ item.mentor }}</span>
                  </div>
                  <span v-else class="text-sm text-slate-400 italic">Belum ditentukan</span>
                </td>
                <td class="px-4 py-3">
                  <UBadge 
                    :color="item.status === 'pending' ? 'warning' : 'success'" 
                    variant="subtle" 
                    size="xs"
                  >
                    {{ item.status === 'pending' ? 'Menunggu' : 'Terjadwal' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">
                  <UButton 
                    v-if="item.status === 'pending'" 
                    size="xs" 
                    color="primary"
                    @click="openModal(item)"
                  >
                    <Icon name="lucide:user-plus" class="w-3.5 h-3.5 mr-1" />
                    Proses
                  </UButton>
                  <UButton 
                    v-else 
                    size="xs" 
                    color="neutral" 
                    variant="ghost"
                    @click="openModal(item)"
                  >
                    <Icon name="lucide:edit" class="w-3.5 h-3.5" />
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" />
    </div>

    <!-- Placement Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard v-if="selected" class="w-full max-w-lg">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Icon name="lucide:user-plus" class="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">Atur Penempatan</h3>
                <p class="text-xs text-slate-500">Tetapkan guru dan mentor untuk siswa</p>
              </div>
            </div>
          </template>

          <div class="space-y-5">
            <!-- Student Info Card -->
            <div class="bg-gradient-to-r from-sky-50 to-sky-100/50 rounded-xl p-4 border border-sky-100">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center text-white font-semibold">
                  {{ selected.siswa.split(' ').map((n: string) => n[0]).join('') }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-900">{{ selected.siswa }}</p>
                  <p class="text-sm text-slate-600">{{ selected.kelas }} • {{ selected.jurusan }}</p>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Icon name="lucide:building-2" class="w-4 h-4" />
                <span>{{ selected.perusahaan }}</span>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Penempatan Pembimbing</p>
              
              <UFormField label="Guru Pembimbing" required>
                <USelectMenu v-model="form.guru" :items="guruOptions" placeholder="Pilih guru pembimbing" class="w-full">
                  <template #leading>
                    <Icon name="lucide:graduation-cap" class="w-4 h-4 text-slate-400" />
                  </template>
                </USelectMenu>
              </UFormField>

              <UFormField label="Mentor Industri" required>
                <USelectMenu v-model="form.mentor" :items="mentorOptions" placeholder="Pilih mentor" class="w-full">
                  <template #leading>
                    <Icon name="lucide:briefcase" class="w-4 h-4 text-slate-400" />
                  </template>
                </USelectMenu>
              </UFormField>
            </div>

            <!-- Date Fields -->
            <div class="space-y-4 pt-2 border-t border-slate-100">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Periode PKL</p>
              
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Tanggal Mulai">
                  <UInput v-model="form.startDate" type="date" class="w-full">
                    <template #leading>
                      <Icon name="lucide:calendar" class="w-4 h-4 text-slate-400" />
                    </template>
                  </UInput>
                </UFormField>
                <UFormField label="Tanggal Selesai">
                  <UInput v-model="form.endDate" type="date" class="w-full">
                    <template #leading>
                      <Icon name="lucide:calendar" class="w-4 h-4 text-slate-400" />
                    </template>
                  </UInput>
                </UFormField>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <UButton variant="outline" color="neutral" @click="modalOpen = false" class="sm:w-auto w-full">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                Batal
              </UButton>
              <UButton color="primary" :loading="processing" @click="savePlacement" class="sm:w-auto w-full">
                <Icon name="lucide:check" class="w-4 h-4 mr-2" />
                Simpan Penempatan
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const loading = ref(true)
const search = ref('')
const filterJurusan = ref('Semua Jurusan')
const activeTab = ref('pending')
const modalOpen = ref(false)
const selected = ref<any>(null)
const processing = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const form = reactive({ guru: null, mentor: null, startDate: '2025-01-01', endDate: '2025-03-31' })

const data = ref([
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII RPL 1', jurusan: 'RPL', perusahaan: 'PT Telkom', guru: null, mentor: null, status: 'pending' },
  { id: 2, siswa: 'Ani Wijaya', kelas: 'XII TKJ 2', jurusan: 'TKJ', perusahaan: 'PT Biznet', guru: null, mentor: null, status: 'pending' },
  { id: 3, siswa: 'Deni Pratama', kelas: 'XII MM 1', jurusan: 'MM', perusahaan: 'CV Digital', guru: 'Siti Aminah', mentor: 'Pak Joko', status: 'scheduled' },
  { id: 4, siswa: 'Rudi Hermawan', kelas: 'XII AKL 1', jurusan: 'AKL', perusahaan: 'PT Bank BCA', guru: null, mentor: null, status: 'pending' },
  { id: 5, siswa: 'Eka Putri', kelas: 'XII RPL 2', jurusan: 'RPL', perusahaan: 'PT Astra', guru: 'Budi Santoso', mentor: 'Bu Rina', status: 'scheduled' }
])

const pendingCount = computed(() => data.value.filter(d => d.status === 'pending').length)
const scheduledCount = computed(() => data.value.filter(d => d.status === 'scheduled').length)

const tabs = computed(() => [
  { label: 'Perlu Penempatan', value: 'pending', icon: 'lucide:clock', count: pendingCount.value },
  { label: 'Sudah Terjadwal', value: 'scheduled', icon: 'lucide:check-circle', count: 0 }
])

const guruOptions = [
  'Siti Aminah, S.Pd',
  'Budi Santoso, S.Kom',
  'Ahmad Wijaya, M.Pd',
  'Dewi Lestari, S.Pd',
  'Joko Prasetyo, S.Pd'
]

const mentorOptions = computed(() => {
  if (!selected.value) return []
  const mentors: Record<string, string[]> = {
    'PT Telkom': ['Pak Joko (IT Manager)', 'Bu Sari (HR)'],
    'PT Biznet': ['Pak Andi (Network Engineer)'],
    'CV Digital': ['Pak Joko (Creative Director)'],
    'PT Bank BCA': ['Bu Rina (Finance)', 'Pak Dedi (IT)'],
    'PT Astra': ['Bu Rina (Supervisor)']
  }
  return mentors[selected.value.perusahaan] || []
})

const allFilteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || 
    d.siswa.toLowerCase().includes(search.value.toLowerCase()) ||
    d.perusahaan.toLowerCase().includes(search.value.toLowerCase())
  const matchJurusan = filterJurusan.value === 'Semua Jurusan' || d.jurusan === filterJurusan.value
  const matchTab = d.status === activeTab.value
  return matchSearch && matchJurusan && matchTab
}))

const totalItems = computed(() => allFilteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const filteredData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allFilteredData.value.slice(start, start + itemsPerPage)
})

watch([search, filterJurusan, activeTab], () => { currentPage.value = 1 })

const openModal = (item: any) => {
  selected.value = item
  form.guru = item.guru
  form.mentor = item.mentor
  modalOpen.value = true
}

const savePlacement = async () => {
  if (!form.guru || !form.mentor) {
    toast.add({ title: 'Lengkapi semua field', color: 'error' })
    return
  }
  processing.value = true
  await new Promise(r => setTimeout(r, 1000))
  selected.value.guru = form.guru
  selected.value.mentor = form.mentor
  selected.value.status = 'scheduled'
  processing.value = false
  modalOpen.value = false
  toast.add({ title: 'Penempatan berhasil disimpan', color: 'success' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Penempatan | Admin' })
</script>
