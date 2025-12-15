<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Dashboard Mentor</h1>
      <p class="text-sm text-slate-500">Selamat datang, Pak Joko</p>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bg">
            <Icon :name="stat.icon" class="w-5 h-5" :class="stat.color" />
          </div>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Pending Verifications -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Menunggu Verifikasi</h3>
          <UButton variant="ghost" color="primary" size="xs" to="/mentor/absensi">Lihat Semua</UButton>
        </div>
        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
        </div>
        <div v-else class="space-y-3">
          <div v-for="item in pendingItems" :key="item.id" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="item.type === 'absensi' ? 'bg-warning-100 text-warning-600' : 'bg-primary-100 text-primary-600'">
              <Icon :name="item.type === 'absensi' ? 'lucide:calendar-check' : 'lucide:book-open'" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ item.siswa }}</p>
              <p class="text-xs text-slate-500">{{ item.desc }}</p>
            </div>
            <UBadge color="warning" variant="subtle" size="xs">Pending</UBadge>
          </div>
        </div>
      </div>

      <!-- Siswa Bimbingan -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Siswa Bimbingan</h3>
          <UButton variant="ghost" color="primary" size="xs" to="/mentor/siswa">Lihat Semua</UButton>
        </div>
        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="space-y-3">
          <div v-for="siswa in siswaList" :key="siswa.id" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
              {{ siswa.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-xs text-slate-500">{{ siswa.kelas }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium" :class="siswa.absensi >= 80 ? 'text-success-600' : 'text-error-600'">{{ siswa.absensi }}%</p>
              <p class="text-xs text-slate-500">Kehadiran</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h3 class="font-semibold text-slate-900 mb-4">Aksi Cepat</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NuxtLink to="/mentor/absensi" class="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div class="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
            <Icon name="lucide:calendar-check" class="w-5 h-5 text-warning-600" />
          </div>
          <span class="text-sm text-slate-700">Verifikasi Absensi</span>
        </NuxtLink>
        <NuxtLink to="/mentor/logbook" class="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <Icon name="lucide:book-open" class="w-5 h-5 text-primary-600" />
          </div>
          <span class="text-sm text-slate-700">Verifikasi Logbook</span>
        </NuxtLink>
        <NuxtLink to="/mentor/penilaian" class="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div class="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
            <Icon name="lucide:star" class="w-5 h-5 text-success-600" />
          </div>
          <span class="text-sm text-slate-700">Input Penilaian</span>
        </NuxtLink>
        <NuxtLink to="/mentor/siswa" class="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <div class="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Icon name="lucide:users" class="w-5 h-5 text-neutral-600" />
          </div>
          <span class="text-sm text-slate-700">Lihat Siswa</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const loading = ref(true)

const stats = ref([
  { label: 'Siswa Bimbingan', value: 5, icon: 'lucide:users', bg: 'bg-primary-100', color: 'text-primary-600' },
  { label: 'Absensi Pending', value: 8, icon: 'lucide:calendar-check', bg: 'bg-warning-100', color: 'text-warning-600' },
  { label: 'Logbook Pending', value: 12, icon: 'lucide:book-open', bg: 'bg-warning-100', color: 'text-warning-600' },
  { label: 'Sudah Dinilai', value: 3, icon: 'lucide:star', bg: 'bg-success-100', color: 'text-success-600' }
])

const pendingItems = ref([
  { id: 1, siswa: 'Budi Santoso', type: 'absensi', desc: 'Absensi 16 Des 2024' },
  { id: 2, siswa: 'Ani Wijaya', type: 'logbook', desc: 'Logbook: Membuat UI Dashboard' },
  { id: 3, siswa: 'Deni Pratama', type: 'absensi', desc: 'Absensi 15 Des 2024' }
])

const siswaList = ref([
  { id: 1, nama: 'Budi Santoso', kelas: 'XII RPL 1', absensi: 95 },
  { id: 2, nama: 'Ani Wijaya', kelas: 'XII RPL 1', absensi: 88 },
  { id: 3, nama: 'Deni Pratama', kelas: 'XII RPL 2', absensi: 72 },
  { id: 4, nama: 'Siti Aminah', kelas: 'XII TKJ 1', absensi: 90 }
])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Dashboard | Mentor' })
</script>
