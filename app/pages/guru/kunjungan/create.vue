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
            <UFormField label="Siswa" required>
              <USelectMenu v-model="form.siswa" :options="siswaOptions" placeholder="Pilih siswa yang dikunjungi"
                option-attribute="nama" value-attribute="id" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Tanggal Kunjungan" required>
              <UInput v-model="form.tanggal" type="date" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Jam Kunjungan" required>
              <UInput v-model="form.jam" type="time" class="w-full" size="lg" />
            </UFormField>

            <UFormField label="Industri/Perusahaan">
              <UInput v-model="form.industri" disabled placeholder="Otomatis terisi setelah pilih siswa"
                class="w-full bg-slate-50" size="lg" />
            </UFormField>
          </div>
        </div>

        <!-- Catatan -->
        <div class="p-4 lg:p-6">
          <h3 class="font-medium text-slate-900 mb-4">Catatan Kunjungan</h3>
          <UFormField label="Hasil Observasi" required>
            <UTextarea v-model="form.catatan" :rows="4"
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
                  :class="form.kondisi === kondisi.value ? kondisi.color : 'text-slate-400'" />
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
            :class="files.length ? 'border-sky-300 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'"
            @click="triggerUpload">
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleUpload" />
            <div v-if="!files.length">
              <Icon name="lucide:upload-cloud" class="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p class="text-sm font-medium text-slate-600">Klik untuk upload foto</p>
              <p class="text-xs text-slate-400 mt-1">PNG, JPG max 5MB per file</p>
            </div>
            <div v-else class="flex flex-wrap justify-center gap-2">
              <div v-for="(file, i) in files" :key="i" class="relative">
                <div class="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                  <Icon name="lucide:image" class="w-8 h-8 text-slate-400" />
                </div>
                <button type="button"
                  class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  @click.stop="removeFile(i)">
                  ×
                </button>
              </div>
              <div
                class="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-sky-400 hover:text-sky-500">
                <Icon name="lucide:plus" class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 lg:p-6 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
          <UButton type="button" variant="outline" color="neutral" class="w-full sm:w-auto" to="/guru/kunjungan">
            Batal
          </UButton>
          <UButton type="submit" color="primary" class="w-full sm:w-auto" :loading="submitting">
            <Icon name="lucide:save" class="w-4 h-4 mr-2" />
            Simpan Kunjungan
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const submitting = ref(false)
const fileInput = ref(null)
const files = ref([])

const form = reactive({
  siswa: null,
  tanggal: '',
  jam: '',
  industri: '',
  catatan: '',
  kondisi: ''
})

const siswaOptions = [
  { id: 1, nama: 'Ryobi Surya Atmaja - XII RPL 1', industri: 'PT. Telkom Indonesia' },
  { id: 2, nama: 'Dewi Sartika - XII RPL 2', industri: 'PT. Gojek Indonesia' },
  { id: 3, nama: 'Ahmad Fauzi - XII TKJ 1', industri: 'CV. Digital Nusantara' },
  { id: 4, nama: 'Siti Nurhaliza - XII MM 1', industri: 'PT. Media Kreasi' }
]

const kondisiOptions = [
  { value: 'sangat-baik', label: 'Sangat Baik', icon: 'lucide:smile', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'baik', label: 'Baik', icon: 'lucide:thumbs-up', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { value: 'cukup', label: 'Cukup', icon: 'lucide:minus-circle', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'perlu-perhatian', label: 'Perlu Perhatian', icon: 'lucide:alert-triangle', color: 'text-red-600', bgColor: 'bg-red-100' }
]

watch(() => form.siswa, (val) => {
  const selected = siswaOptions.find(s => s.id === val)
  form.industri = selected?.industri || ''
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleUpload = (e) => {
  const newFiles = Array.from(e.target.files || [])
  files.value.push(...newFiles)
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const submit = async () => {
  if (!form.siswa || !form.tanggal || !form.catatan) {
    toast.add({ title: 'Lengkapi semua field wajib', color: 'error' })
    return
  }

  submitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  submitting.value = false
  toast.add({ title: 'Kunjungan berhasil disimpan', color: 'success' })
  navigateTo('/guru/kunjungan')
}

useHead({ title: 'Input Kunjungan | Guru PKL' })
</script>
