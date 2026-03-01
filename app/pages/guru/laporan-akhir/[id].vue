<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/laporan-akhir" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Header -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <div v-if="loading" class="flex flex-col md:flex-row gap-6">
        <USkeleton class="w-14 h-14 rounded-xl" />
        <div class="flex-1 space-y-3">
          <USkeleton class="h-6 w-48" />
          <USkeleton class="h-4 w-32" />
          <div class="flex gap-2">
            <USkeleton class="h-6 w-20 rounded-full" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div v-else-if="data" class="flex flex-col md:flex-row gap-6">
        <div class="w-14 h-14 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold shrink-0">
          {{ getInisial(data.siswa?.nama_siswa) }}
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 class="text-xl font-bold text-slate-900">{{ data.siswa?.nama_siswa || '-' }}</h1>
              <p class="text-slate-500">
                {{ data.siswa?.kelas?.nama_kelas || '-' }}
                <span v-if="data.siswa?.kelas?.jurusan"> • {{ data.siswa.kelas.jurusan.nama_jurusan }}</span>
                • NIS: {{ data.siswa?.nis || '-' }}
              </p>
            </div>
            <UBadge :color="getStatusColor(data.status_penempatan)" variant="subtle">
              {{ data.status_penempatan }}
            </UBadge>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
            <span class="flex items-center gap-1">
              <Icon name="lucide:building-2" class="w-4 h-4" />
              {{ data.perusahaan?.nama_perusahaan || '-' }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              {{ formatDate(data.tanggal_mulai) }} - {{ formatDate(data.tanggal_selesai) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!loading && data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-sky-600">{{ data.stats?.kehadiran || 0 }}%</p>
            <p class="text-xs text-slate-500 mt-1">Kehadiran</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-purple-600">{{ data.logbook?.length || 0 }}</p>
            <p class="text-xs text-slate-500 mt-1">Logbook</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-amber-600">{{ data.monitoring?.length || 0 }}</p>
            <p class="text-xs text-slate-500 mt-1">Monitoring</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold" :class="data.penilaian?.nilai_akhir ? 'text-green-600' : 'text-slate-400'">
              {{ data.penilaian?.nilai_akhir ? Number(data.penilaian.nilai_akhir).toFixed(1) : '-' }}
            </p>
            <p class="text-xs text-slate-500 mt-1">Nilai Akhir</p>
          </div>
        </div>

        <!-- Absensi Breakdown -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Rekap Absensi</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-4 gap-4 text-center">
              <div>
                <p class="text-lg font-bold text-green-600">{{ absensiBreakdown.hadir }}</p>
                <p class="text-xs text-slate-500">Hadir</p>
              </div>
              <div>
                <p class="text-lg font-bold text-amber-600">{{ absensiBreakdown.izin }}</p>
                <p class="text-xs text-slate-500">Izin</p>
              </div>
              <div>
                <p class="text-lg font-bold text-sky-600">{{ absensiBreakdown.sakit }}</p>
                <p class="text-xs text-slate-500">Sakit</p>
              </div>
              <div>
                <p class="text-lg font-bold text-red-600">{{ absensiBreakdown.alpa }}</p>
                <p class="text-xs text-slate-500">Alpa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Logbook Summary -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Status Logbook</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-lg font-bold text-amber-600">{{ logbookBreakdown.menunggu }}</p>
                <p class="text-xs text-slate-500">Menunggu</p>
              </div>
              <div>
                <p class="text-lg font-bold text-green-600">{{ logbookBreakdown.disetujui }}</p>
                <p class="text-xs text-slate-500">Disetujui</p>
              </div>
              <div>
                <p class="text-lg font-bold text-red-600">{{ logbookBreakdown.ditolak }}</p>
                <p class="text-xs text-slate-500">Ditolak</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Monitoring List -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Riwayat Monitoring</h2>
          </div>
          <div v-if="!data.monitoring?.length" class="p-6 text-center text-slate-400">
            <Icon name="lucide:eye-off" class="w-8 h-8 mx-auto mb-2" />
            <p class="text-sm">Belum ada monitoring</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="m in data.monitoring" :key="m.id_monitoring" class="px-6 py-3">
              <div class="flex items-center justify-between mb-1">
                <p class="font-medium text-slate-900 text-sm">{{ formatDate(m.tanggal_monitoring) }}</p>
              </div>
              <p v-if="m.hasil_monitoring" class="text-sm text-slate-600">{{ m.hasil_monitoring }}</p>
              <p v-if="m.kendala" class="text-sm text-amber-600 mt-1">Kendala: {{ m.kendala }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Penilaian Detail -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Detail Penilaian</h3>
          <div v-if="!data.penilaian" class="text-center text-slate-400 py-4">
            <Icon name="lucide:star-off" class="w-8 h-8 mx-auto mb-2" />
            <p class="text-sm">Belum ada penilaian</p>
          </div>
          <div v-else class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Kedisiplinan</span>
              <span class="font-medium text-slate-900">{{ data.penilaian.nilai_kedisiplinan ?? '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Keterampilan</span>
              <span class="font-medium text-slate-900">{{ data.penilaian.nilai_keterampilan ?? '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sikap</span>
              <span class="font-medium text-slate-900">{{ data.penilaian.nilai_sikap ?? '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Pembimbing Perusahaan</span>
              <span class="font-medium text-slate-900">{{ data.penilaian.nilai_pembimbing_perusahaan ?? '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Pembimbing Sekolah</span>
              <span class="font-medium text-slate-900">{{ data.penilaian.nilai_pembimbing_sekolah ?? '-' }}</span>
            </div>
            <hr class="border-slate-100">
            <div class="flex justify-between">
              <span class="text-slate-700 font-medium">Nilai Akhir</span>
              <span class="font-bold text-lg text-green-600">{{ data.penilaian.nilai_akhir ? Number(data.penilaian.nilai_akhir).toFixed(1) : '-' }}</span>
            </div>
            <div v-if="data.penilaian.catatan_penilaian" class="mt-2 p-3 bg-slate-50 rounded-lg">
              <p class="text-xs text-slate-500 mb-1">Catatan:</p>
              <p class="text-sm text-slate-700">{{ data.penilaian.catatan_penilaian }}</p>
            </div>
          </div>
        </div>

        <!-- Penempatan Info -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Info Penempatan</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Perusahaan</span>
              <span class="font-medium text-slate-900 text-right max-w-[60%]">{{ data.perusahaan?.nama_perusahaan || '-' }}</span>
            </div>
            <div v-if="data.perusahaan?.mentor?.length" class="flex justify-between">
              <span class="text-slate-500">Mentor</span>
              <span class="font-medium text-slate-900 text-right max-w-[60%]">{{ data.perusahaan.mentor[0]?.nama_mentor || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Guru Pembimbing</span>
              <span class="font-medium text-slate-900 text-right max-w-[60%]">{{ data.guru?.nama_guru || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tahun Ajaran</span>
              <span class="font-medium text-slate-900">{{ data.tahun_ajaran?.nama_tahun_ajaran || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Status</span>
              <UBadge :color="getStatusColor(data.status_penempatan)" variant="subtle" size="xs">
                {{ data.status_penempatan }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Completeness Checklist -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Kelengkapan</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <Icon :name="data.absensi?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" 
                class="w-5 h-5" :class="data.absensi?.length > 0 ? 'text-green-500' : 'text-slate-300'" />
              <span class="text-sm" :class="data.absensi?.length > 0 ? 'text-slate-900' : 'text-slate-400'">
                Absensi ({{ data.absensi?.length || 0 }} hari)
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Icon :name="data.logbook?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" 
                class="w-5 h-5" :class="data.logbook?.length > 0 ? 'text-green-500' : 'text-slate-300'" />
              <span class="text-sm" :class="data.logbook?.length > 0 ? 'text-slate-900' : 'text-slate-400'">
                Logbook ({{ data.logbook?.length || 0 }} entry)
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Icon :name="data.monitoring?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" 
                class="w-5 h-5" :class="data.monitoring?.length > 0 ? 'text-green-500' : 'text-slate-300'" />
              <span class="text-sm" :class="data.monitoring?.length > 0 ? 'text-slate-900' : 'text-slate-400'">
                Monitoring ({{ data.monitoring?.length || 0 }} kunjungan)
              </span>
            </div>
            <div class="flex items-center gap-3">
              <Icon :name="data.penilaian ? 'lucide:check-circle' : 'lucide:circle'" 
                class="w-5 h-5" :class="data.penilaian ? 'text-green-500' : 'text-slate-300'" />
              <span class="text-sm" :class="data.penilaian ? 'text-slate-900' : 'text-slate-400'">
                Penilaian Akhir
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-if="!loading && !data" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
      <Icon name="lucide:user-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-500">Data penempatan tidak ditemukan</p>
      <UButton to="/guru/laporan-akhir" variant="soft" color="primary" class="mt-4">Kembali</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'

definePageMeta({ layout: 'guru' })

const route = useRoute()
const toast = useToast()
const guruApi = useGuruApi()
const loading = ref(true)
const data = ref<any>(null)

const absensiBreakdown = computed(() => {
  const absensi = data.value?.absensi || []
  return {
    hadir: absensi.filter((a: any) => a.status_absensi === 'hadir').length,
    izin: absensi.filter((a: any) => a.status_absensi === 'izin').length,
    sakit: absensi.filter((a: any) => a.status_absensi === 'sakit').length,
    alpa: absensi.filter((a: any) => a.status_absensi === 'alpa').length,
  }
})

const logbookBreakdown = computed(() => {
  const logbook = data.value?.logbook || []
  return {
    menunggu: logbook.filter((l: any) => l.status_persetujuan === 'menunggu').length,
    disetujui: logbook.filter((l: any) => l.status_persetujuan === 'disetujui').length,
    ditolak: logbook.filter((l: any) => l.status_persetujuan === 'ditolak').length,
  }
})

function getInisial(nama?: string) {
  if (!nama) return '?'
  return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function getStatusColor(status?: string) {
  const colors: Record<string, string> = { aktif: 'primary', selesai: 'success', dibatalkan: 'error' }
  return colors[status || ''] || 'neutral'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const penempatanId = route.params.id as string
    // Get all siswa bimbingan and find matching penempatan
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })
    const allData = res?.data || []
    data.value = allData.find((p: any) => p.id_penempatan === penempatanId) || null
    
    if (!data.value) {
      toast.add({ title: 'Data penempatan tidak ditemukan', color: 'error' })
    }
  } catch (e: any) {
    console.error('Failed to load data:', e)
    toast.add({ title: 'Gagal memuat data', color: 'error' })
  } finally {
    loading.value = false
  }
})

useHead({ title: 'Detail Laporan Akhir | Guru PKL' })
</script>
