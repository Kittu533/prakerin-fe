<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/kunjungan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Input Kunjungan</h1>
      <p class="text-sm text-slate-500 mt-1">Catat kunjungan ke tempat PKL siswa</p>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <form @submit.prevent="submit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Siswa</label>
            <USelectMenu v-model="form.siswa" :options="siswaOptions" placeholder="Pilih siswa" option-attribute="nama" value-attribute="id" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Tanggal Kunjungan</label>
            <UInput v-model="form.tanggal" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Jam Kunjungan</label>
            <UInput v-model="form.jam" type="time" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Industri</label>
            <UInput v-model="form.industri" disabled placeholder="Otomatis terisi" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Catatan Kunjungan</label>
          <UTextarea v-model="form.catatan" rows="4" placeholder="Tuliskan hasil observasi dan catatan kunjungan..." />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Kondisi Siswa</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label v-for="kondisi in kondisiOptions" :key="kondisi.value" class="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors" :class="form.kondisi === kondisi.value ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'">
              <input type="radio" v-model="form.kondisi" :value="kondisi.value" class="sr-only" />
              <Icon :name="kondisi.icon" class="w-5 h-5" :class="form.kondisi === kondisi.value ? 'text-sky-600' : 'text-slate-400'" />
              <span class="text-sm" :class="form.kondisi === kondisi.value ? 'text-sky-700 font-medium' : 'text-slate-600'">{{ kondisi.label }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Dokumentasi (Opsional)</label>
          <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-sky-300 transition-colors cursor-pointer">
            <Icon name="lucide:upload" class="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p class="text-sm text-slate-600">Klik untuk upload foto</p>
            <p class="text-xs text-slate-400 mt-1">PNG, JPG max 5MB</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <UButton type="button" variant="ghost" color="neutral" to="/guru/kunjungan">Batal</UButton>
          <UButton type="submit" color="primary" :loading="submitting">
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
  { value: 'sangat-baik', label: 'Sangat Baik', icon: 'lucide:smile' },
  { value: 'baik', label: 'Baik', icon: 'lucide:meh' },
  { value: 'cukup', label: 'Cukup', icon: 'lucide:frown' },
  { value: 'perlu-perhatian', label: 'Perlu Perhatian', icon: 'lucide:alert-circle' }
]

watch(() => form.siswa, (val) => {
  const selected = siswaOptions.find(s => s.id === val)
  form.industri = selected?.industri || ''
})

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
