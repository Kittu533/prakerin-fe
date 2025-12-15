<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Penempatan Siswa</h1>
        <p class="text-sm text-slate-500">Kelola penempatan guru dan mentor</p>
      </div>
    </div>

    <!-- Tabs -->
    <UTabs :items="tabs" v-model="activeTab" />

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari siswa..." class="flex-1">
          <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
        </UInput>
        <USelectMenu v-model="filterJurusan" :items="['Semua', 'RPL', 'TKJ', 'MM', 'AKL']" class="w-full sm:w-32" />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
      </div>
      <UTable v-else :data="filteredData" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('') }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</p>
              <p class="text-xs text-slate-500">{{ row.original.kelas }}</p>
            </div>
          </div>
        </template>
        <template #guru-cell="{ row }">
          <span v-if="row.original.guru" class="text-sm">{{ row.original.guru }}</span>
          <span v-else class="text-sm text-slate-400">-</span>
        </template>
        <template #mentor-cell="{ row }">
          <span v-if="row.original.mentor" class="text-sm">{{ row.original.mentor }}</span>
          <span v-else class="text-sm text-slate-400">-</span>
        </template>
        <template #aksi-cell="{ row }">
          <UButton v-if="!row.original.guru" size="xs" color="primary" @click="openModal(row.original)">Proses</UButton>
          <UButton v-else size="xs" color="neutral" variant="ghost" @click="openModal(row.original)">
            <Icon name="lucide:edit" class="w-4 h-4" />
          </UButton>
        </template>
      </UTable>
    </div>

    <!-- Placement Modal -->
    <UModal v-model:open="modalOpen">
      <template #content>
        <UCard v-if="selected">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Penempatan Siswa</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="modalOpen = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Student Info -->
            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="text-sm text-slate-500">Siswa</p>
              <p class="font-semibold text-slate-900">{{ selected.siswa }} ({{ selected.kelas }})</p>
            </div>

            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="text-sm text-slate-500">Perusahaan</p>
              <p class="font-semibold text-slate-900">{{ selected.perusahaan }}</p>
            </div>

            <UFormField label="Guru Pembimbing" required>
              <USelectMenu v-model="form.guru" :items="guruOptions" placeholder="Pilih guru">
                <template #option="{ option }">
                  <span>{{ option.label }}</span>
                  <span class="text-xs text-slate-400 ml-2">({{ option.beban }} siswa)</span>
                </template>
              </USelectMenu>
            </UFormField>

            <UFormField label="Mentor Industri" required>
              <USelectMenu v-model="form.mentor" :items="mentorOptions" placeholder="Pilih mentor" :disabled="!selected.perusahaan" />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Tanggal Mulai">
                <UInput v-model="form.startDate" type="date" />
              </UFormField>
              <UFormField label="Tanggal Selesai">
                <UInput v-model="form.endDate" type="date" />
              </UFormField>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="modalOpen = false">Batal</UButton>
              <UButton color="primary" class="flex-1" :loading="processing" @click="savePlacement">
                <Icon name="lucide:check" class="w-4 h-4 mr-2" />Simpan
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
const filterJurusan = ref('Semua')
const activeTab = ref('pending')
const modalOpen = ref(false)
const selected = ref<any>(null)
const processing = ref(false)

const form = reactive({ guru: null, mentor: null, startDate: '2025-01-01', endDate: '2025-03-31' })

const tabs = [
  { label: 'Perlu Penempatan', value: 'pending', badge: 3 },
  { label: 'Terjadwal', value: 'scheduled' }
]

const data = ref([
  { id: 1, siswa: 'Budi Santoso', kelas: 'XII RPL 1', jurusan: 'RPL', perusahaan: 'PT Telkom', guru: null, mentor: null, status: 'pending' },
  { id: 2, siswa: 'Ani Wijaya', kelas: 'XII TKJ 2', jurusan: 'TKJ', perusahaan: 'PT Biznet', guru: null, mentor: null, status: 'pending' },
  { id: 3, siswa: 'Deni Pratama', kelas: 'XII MM 1', jurusan: 'MM', perusahaan: 'CV Digital', guru: 'Siti Aminah', mentor: 'Pak Joko', status: 'scheduled' },
  { id: 4, siswa: 'Rudi Hermawan', kelas: 'XII AKL 1', jurusan: 'AKL', perusahaan: 'PT Bank BCA', guru: null, mentor: null, status: 'pending' },
  { id: 5, siswa: 'Eka Putri', kelas: 'XII RPL 2', jurusan: 'RPL', perusahaan: 'PT Astra', guru: 'Budi Santoso', mentor: 'Bu Rina', status: 'scheduled' }
])

const guruOptions = [
  { label: 'Siti Aminah', value: 'Siti Aminah', beban: 5 },
  { label: 'Budi Santoso', value: 'Budi Santoso', beban: 12 },
  { label: 'Ahmad Wijaya', value: 'Ahmad Wijaya', beban: 8 }
]

const mentorOptions = computed(() => {
  if (!selected.value) return []
  const mentors: Record<string, string[]> = {
    'PT Telkom': ['Pak Joko', 'Bu Sari'],
    'PT Biznet': ['Pak Andi'],
    'CV Digital': ['Pak Joko'],
    'PT Bank BCA': ['Bu Rina', 'Pak Dedi'],
    'PT Astra': ['Bu Rina']
  }
  return mentors[selected.value.perusahaan] || []
})

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'guru', header: 'Guru Pembimbing' },
  { accessorKey: 'mentor', header: 'Mentor' },
  { accessorKey: 'aksi', header: '' }
]

const filteredData = computed(() => data.value.filter(d => {
  const matchSearch = !search.value || d.siswa.toLowerCase().includes(search.value.toLowerCase())
  const matchJurusan = filterJurusan.value === 'Semua' || d.jurusan === filterJurusan.value
  const matchTab = d.status === activeTab.value
  return matchSearch && matchJurusan && matchTab
}))

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
