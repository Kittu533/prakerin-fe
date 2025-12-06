<template>
  <NuxtLayout name="mentor">
    <div class="p-6">
      <!-- Header with Back Button -->
      <div class="mb-6">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="$router.back()"
            class="flex items-center text-slate-600 hover:text-slate-900"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            Kembali
          </button>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Detail Penilaian Siswa</h1>
        <p class="text-slate-600 mt-1">Riwayat dan analisis penilaian PKL</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Overview -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-start space-x-4">
                <img 
                  :src="`https://ui-avatars.com/api/?name=${siswa.nama}&background=0ea5e9&color=fff`" 
                  :alt="siswa.nama"
                  class="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">{{ siswa.nama }}</h2>
                  <p class="text-slate-600">{{ siswa.kelas }} • {{ siswa.nis }}</p>
                  <p class="text-sm text-slate-500">{{ siswa.perusahaan }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-blue-600">{{ siswa.nilaiAkhir }}</div>
                <div class="text-sm text-slate-500">Nilai Akhir</div>
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2"
                  :class="getGradeColor(siswa.nilaiAkhir)"
                >
                  {{ getGradeText(siswa.nilaiAkhir) }}
                </span>
              </div>
            </div>

            <!-- Score Chart -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Grafik Penilaian per Aspek</h3>
              <canvas ref="chartRef" class="w-full h-64"></canvas>
            </div>
          </div>

          <!-- Detailed Scores -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Rincian Penilaian</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(score, aspek) in siswa.detailNilai" :key="aspek" class="p-4 border border-slate-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-slate-900">{{ formatAspek(aspek) }}</h4>
                  <span class="text-lg font-bold" :class="getScoreColor(score.rata)">{{ score.rata }}</span>
                </div>
                <div class="flex items-center mb-2">
                  <div class="flex-1 bg-slate-200 rounded-full h-2 mr-3">
                    <div 
                      class="h-2 rounded-full transition-all"
                      :class="getProgressBarColor(score.rata)"
                      :style="`width: ${score.rata}%`"
                    ></div>
                  </div>
                </div>
                <div class="text-xs text-slate-500">
                  {{ score.jumlah }} penilaian • Terakhir: {{ formatDate(score.terakhirDinilai) }}
                </div>
              </div>
            </div>
          </div>

          <!-- History Table -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900">Riwayat Penilaian</h3>
              <button
                @click="showAddModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                + Tambah Penilaian
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aspek</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nilai</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Catatan</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Penilai</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="penilaian in siswa.riwayatPenilaian" :key="penilaian.id" class="hover:bg-slate-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {{ formatDate(penilaian.tanggal) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {{ formatAspek(penilaian.aspek) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getScoreColor(penilaian.nilai)"
                      >
                        {{ penilaian.nilai }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {{ penilaian.catatan || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {{ penilaian.penilai }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Progress Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Progress PKL</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-sm text-slate-600">Keseluruhan</span>
                  <span class="text-sm font-medium">{{ siswa.progress }}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    class="h-3 rounded-full"
                    :class="getProgressColor(siswa.progress)"
                    :style="`width: ${siswa.progress}%`"
                  ></div>
                </div>
              </div>
              
              <div class="pt-4 border-t border-slate-200">
                <div class="grid grid-cols-2 gap-4 text-center">
                  <div class="p-3 bg-blue-50 rounded-lg">
                    <div class="text-lg font-bold text-blue-600">{{ siswa.hariMasuk }}</div>
                    <div class="text-xs text-blue-600">Hari Masuk</div>
                  </div>
                  <div class="p-3 bg-green-50 rounded-lg">
                    <div class="text-lg font-bold text-green-600">{{ siswa.logbookCount }}</div>
                    <div class="text-xs text-green-600">Logbook</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Info -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Informasi Perusahaan</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-slate-500">Nama Perusahaan</p>
                <p class="font-medium">{{ siswa.perusahaan }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Mentor Lapangan</p>
                <p class="font-medium">{{ siswa.mentorLapangan }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Periode PKL</p>
                <p class="font-medium">{{ formatDateRange(siswa.tanggalMulai, siswa.tanggalSelesai) }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button
                @click="exportReport"
                class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4 mr-2" />
                Export Report
              </button>
              <button
                @click="viewLogbook"
                class="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-2" />
                Lihat Logbook
              </button>
              <button
                @click="contactSiswa"
                class="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <UIcon name="i-heroicons-phone" class="w-4 h-4 mr-2" />
                Hubungi Siswa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Penilaian Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto" @click="showAddModal = false">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-slate-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" @click.stop>
          <div class="mb-4">
            <h3 class="text-lg font-medium text-slate-900">Tambah Penilaian</h3>
            <p class="text-sm text-slate-600">{{ siswa.nama }}</p>
          </div>
          
          <form @submit.prevent="submitPenilaian" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Aspek Penilaian</label>
              <select
                v-model="newPenilaian.aspek"
                required
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Aspek</option>
                <option value="kedisiplinan">Kedisiplinan</option>
                <option value="kualitas_kerja">Kualitas Kerja</option>
                <option value="inisiatif">Inisiatif</option>
                <option value="kerjasama">Kerjasama</option>
                <option value="komunikasi">Komunikasi</option>
                <option value="tanggung_jawab">Tanggung Jawab</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Nilai (1-100)</label>
              <input
                v-model="newPenilaian.nilai"
                type="number"
                min="1"
                max="100"
                required
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
              <textarea
                v-model="newPenilaian.catatan"
                rows="3"
                placeholder="Catatan penilaian..."
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Simpan Penilaian
              </button>
              <button
                type="button"
                @click="showAddModal = false"
                class="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const route = useRoute()
const siswaId = route.params.id

const chartRef = ref(null)
const showAddModal = ref(false)
const newPenilaian = ref({
  aspek: '',
  nilai: null,
  catatan: ''
})

// Mock data
const siswa = ref({
  id: 1,
  nama: 'Ahmad Wijaya',
  nis: '2021001',
  kelas: 'XII RPL 1',
  perusahaan: 'PT. Maju Bersama',
  mentorLapangan: 'Budi Santoso',
  progress: 85,
  nilaiAkhir: 87,
  hariMasuk: 55,
  logbookCount: 8,
  tanggalMulai: new Date('2024-01-15'),
  tanggalSelesai: new Date('2024-04-15'),
  detailNilai: {
    kedisiplinan: { rata: 90, jumlah: 5, terakhirDinilai: new Date('2024-11-25') },
    kualitas_kerja: { rata: 85, jumlah: 4, terakhirDinilai: new Date('2024-11-20') },
    inisiatif: { rata: 88, jumlah: 3, terakhirDinilai: new Date('2024-11-18') },
    kerjasama: { rata: 92, jumlah: 4, terakhirDinilai: new Date('2024-11-22') },
    komunikasi: { rata: 83, jumlah: 3, terakhirDinilai: new Date('2024-11-15') },
    tanggung_jawab: { rata: 87, jumlah: 4, terakhirDinilai: new Date('2024-11-23') }
  },
  riwayatPenilaian: [
    {
      id: 1,
      tanggal: new Date('2024-11-25'),
      aspek: 'kedisiplinan',
      nilai: 90,
      catatan: 'Selalu datang tepat waktu dan disiplin dalam mengerjakan tugas',
      penilai: 'Mentor PKL'
    },
    {
      id: 2,
      tanggal: new Date('2024-11-23'),
      aspek: 'tanggung_jawab',
      nilai: 87,
      catatan: 'Bertanggung jawab penuh terhadap tugas yang diberikan',
      penilai: 'Mentor PKL'
    },
    // Add more history items...
  ]
})

// Helper functions
const formatAspek = (aspek: string) => {
  const aspekMap = {
    'kedisiplinan': 'Kedisiplinan',
    'kualitas_kerja': 'Kualitas Kerja',
    'inisiatif': 'Inisiatif',
    'kerjasama': 'Kerjasama',
    'komunikasi': 'Komunikasi',
    'tanggung_jawab': 'Tanggung Jawab'
  }
  return aspekMap[aspek] || aspek
}

const getGradeColor = (nilai: number) => {
  if (nilai >= 85) return 'bg-green-100 text-green-800'
  if (nilai >= 75) return 'bg-blue-100 text-blue-800'
  if (nilai >= 65) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getGradeText = (nilai: number) => {
  if (nilai >= 85) return 'Excellent'
  if (nilai >= 75) return 'Good'
  if (nilai >= 65) return 'Fair'
  return 'Poor'
}

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-green-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 65) return 'text-yellow-600'
  return 'text-red-600'
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getProgressBarColor = (score: number) => {
  if (score >= 85) return 'bg-green-500'
  if (score >= 75) return 'bg-blue-500'
  if (score >= 65) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateRange = (start: Date, end: Date) => {
  return `${formatDate(start)} - ${formatDate(end)}`
}

// Chart initialization
onMounted(() => {
  if (chartRef.value) {
    const ctx = chartRef.value.getContext('2d')
    const detailNilai = siswa.value.detailNilai
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(detailNilai).map(formatAspek),
        datasets: [{
          label: 'Nilai',
          data: Object.values(detailNilai).map(item => item.rata),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        }
      }
    })
  }
})

// Action methods
const submitPenilaian = () => {
  // Add the new assessment to history
  siswa.value.riwayatPenilaian.unshift({
    id: Date.now(),
    tanggal: new Date(),
    aspek: newPenilaian.value.aspek,
    nilai: newPenilaian.value.nilai,
    catatan: newPenilaian.value.catatan,
    penilai: 'Mentor PKL'
  })
  
  // Update the detailed scores
  const aspek = newPenilaian.value.aspek
  if (siswa.value.detailNilai[aspek]) {
    siswa.value.detailNilai[aspek].jumlah++
    siswa.value.detailNilai[aspek].terakhirDinilai = new Date()
    // Recalculate average (simplified)
    siswa.value.detailNilai[aspek].rata = Math.round(
      (siswa.value.detailNilai[aspek].rata + newPenilaian.value.nilai) / 2
    )
  }
  
  showAddModal.value = false
  newPenilaian.value = { aspek: '', nilai: null, catatan: '' }
}

const exportReport = () => {
  console.log('Export report for student:', siswaId)
}

const viewLogbook = () => {
  navigateTo(`/mentor/verifikasi/logbook?siswa=${siswaId}`)
}

const contactSiswa = () => {
  console.log('Contact student:', siswaId)
}

definePageMeta({
  layout: false
})
</script>