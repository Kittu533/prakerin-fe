<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/kunjungan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Header -->
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Input Kunjungan</h1>
      <p class="text-sm text-slate-500 mt-1">Catat kunjungan ke tempat PKL siswa</p>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-xl border border-slate-200">
      <form @submit.prevent="submit" class="divide-y divide-slate-100">
        <!-- Siswa & Tanggal -->
        <div class="p-4 lg:p-6">
          <h3 class="font-medium text-slate-900 mb-4">Informasi Kunjungan</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UFormField label="Siswa yang Dikunjungi" required>
              <USelectMenu 
                v-model="selectedOption" 
                :items="siswaOptions" 
                placeholder="Pilih siswa yang dikunjungi"
                :loading="loadingSiswa"
                class="w-full" 
                size="lg"
                value-attribute="value"
              >
                <template #option="{ item }">
                  <div class="flex flex-col">
                    <span class="font-medium">{{ item.label }}</span>
                    <span class="text-xs text-slate-500">{{ item.perusahaan }}</span>
                  </div>
                </template>
              </USelectMenu>
            </UFormField>

            <UFormField label="Tanggal Kunjungan" required>
              <UInput v-model="form.tanggal" type="date" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Industri/Perusahaan" class="lg:col-span-2">
              <UInput :model-value="selectedPerusahaan" disabled placeholder="Otomatis terisi setelah pilih siswa"
                class="w-full bg-slate-50" size="lg" />
            </UFormField>
          </div>
        </div>

        <!-- Catatan -->
        <div class="p-4 lg:p-6">
          <h3 class="font-medium text-slate-900 mb-4">Catatan Kunjungan</h3>
          <UFormField label="Hasil Observasi" required>
            <UTextarea v-model="form.hasil_monitoring" :rows="4"
              placeholder="Tuliskan hasil observasi, kondisi lingkungan kerja, dan catatan penting lainnya..."
              class="w-full" />
          </UFormField>
        </div>

        <!-- Kondisi Siswa -->
        <div class="p-4 lg:p-6">
          <h3 class="font-medium text-slate-900 mb-4">Kondisi Siswa</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label v-for="kondisi in kondisiOptions" :key="kondisi.value"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="form.kondisi === kondisi.value
                ? 'border-sky-500 bg-sky-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
              <input type="radio" v-model="form.kondisi" :value="kondisi.value" class="sr-only" />
              <div class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="form.kondisi === kondisi.value ? kondisi.bgColor : 'bg-slate-100'">
                <Icon :name="kondisi.icon" class="w-6 h-6"
                  :class="form.kondisi === kondisi.value ? kondisi.iconColor : 'text-slate-400'" />
              </div>
              <span class="text-sm font-medium text-center"
                :class="form.kondisi === kondisi.value ? 'text-sky-700' : 'text-slate-600'">
                {{ kondisi.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Dokumentasi -->
        <div class="p-4 lg:p-6">
          <h3 class="font-medium text-slate-900 mb-4">Dokumentasi (Opsional)</h3>
          <div class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
            :class="form.foto_monitoring ? 'border-sky-300 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'"
            @click="triggerUpload">
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />
            <div v-if="!form.foto_monitoring">
              <Icon name="lucide:upload-cloud" class="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-slate-600">Klik untuk upload foto</p>
              <p class="text-xs text-slate-400 mt-1">PNG, JPG max 5MB</p>
            </div>
            <div v-else class="flex flex-col items-center gap-2">
              <Icon name="lucide:image" class="w-12 h-12 text-sky-500" />
              <p class="text-sm text-sky-600">Foto siap diupload</p>
              <UButton size="xs" variant="soft" color="error" @click.stop="form.foto_monitoring = ''">
                Hapus Foto
              </UButton>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 lg:p-6 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
          <UButton type="button" variant="outline" color="neutral" class="w-full sm:w-auto" to="/guru/kunjungan">
            Batal
          </UButton>
          <UButton type="submit" color="primary" class="w-full sm:w-auto" :loading="submitting" :disabled="!isFormValid">
            <Icon name="lucide:save" class="w-4 h-4 mr-2" />
            Simpan Kunjungan
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { useMonitoringApi } from '~/composables/api/use-internship'

definePageMeta({ layout: 'guru' })

const toast = useToast()
const guruApi = useGuruApi()
const { create: createMonitoring } = useMonitoringApi()

const submitting = ref(false)
const loadingSiswa = ref(true)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id_penempatan: null as string | null,
  tanggal: '',
  hasil_monitoring: '',
  kondisi: '',
  foto_monitoring: ''
})

interface SiswaOption {
  value: string
  label: string
  perusahaan: string
}

const siswaOptions = ref<SiswaOption[]>([])
const selectedOption = ref<string | null>(null)

// Sync selectedOption to form.id_penempatan
watch(selectedOption, (val) => {
  form.id_penempatan = val
})

const selectedPerusahaan = computed(() => {
  if (!selectedOption.value) return ''
  const selected = siswaOptions.value.find(s => s.value === selectedOption.value)
  return selected?.perusahaan || ''
})

const kondisiOptions = [
  { value: 'sangat-baik', label: 'Sangat Baik', icon: 'lucide:smile', iconColor: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'baik', label: 'Baik', icon: 'lucide:thumbs-up', iconColor: 'text-sky-600', bgColor: 'bg-sky-100' },
  { value: 'cukup', label: 'Cukup', icon: 'lucide:minus-circle', iconColor: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'perlu-perhatian', label: 'Perlu Perhatian', icon: 'lucide:alert-triangle', iconColor: 'text-red-600', bgColor: 'bg-red-100' }
]

const isFormValid = computed(() => {
  return form.id_penempatan && form.tanggal && form.hasil_monitoring
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    form.foto_monitoring = file.name
  }
}

async function loadSiswaOptions() {
  loadingSiswa.value = true
  try {
    // Only fetch the current guru's students (1 API call)
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    if (res?.data) {
      siswaOptions.value = res.data
        .filter((p: any) => p.status_penempatan === 'aktif')
        .map((p: any) => ({
          value: p.id_penempatan,
          label: p.siswa?.nama_siswa || '-',
          perusahaan: p.perusahaan?.nama_perusahaan || '-'
        }))
    }
  } catch (error) {
    console.error('Failed to load siswa options:', error)
    toast.add({ title: 'Gagal memuat data siswa', color: 'error' })
  } finally {
    loadingSiswa.value = false
  }
}

const submit = async () => {
  const penempatanId = typeof form.id_penempatan === 'object' && form.id_penempatan !== null
    ? (form.id_penempatan as any).value 
    : form.id_penempatan

  if (!penempatanId || !form.tanggal || !form.hasil_monitoring) {
    toast.add({ title: 'Lengkapi semua field wajib', color: 'error' })
    return
  }

  submitting.value = true
  try {
    const hasilMonitoring = form.kondisi 
      ? `[Kondisi: ${form.kondisi}] ${form.hasil_monitoring}`
      : form.hasil_monitoring

    await createMonitoring({
      id_penempatan: String(penempatanId),
      tanggal_monitoring: form.tanggal,
      hasil_monitoring: hasilMonitoring,
      foto_monitoring: form.foto_monitoring || undefined
    })

    toast.add({ title: 'Kunjungan berhasil disimpan', color: 'success' })
    navigateTo('/guru/kunjungan')
  } catch (error: any) {
    console.error('Failed to create monitoring:', error)
    toast.add({ title: error?.message || 'Gagal menyimpan kunjungan', color: 'error' })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadSiswaOptions()
})

useHead({ title: 'Input Kunjungan | Guru PKL' })
</script>
