<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Pengajuan PKL</h1>
      <p class="text-sm text-slate-500 mt-1">Kelola pengajuan tempat PKL</p>
    </div>

    <!-- Loading Skeleton -->
    <template v-if="pageLoading">
      <div class="grid lg:grid-cols-3 gap-4">
        <USkeleton class="h-32 rounded-xl" />
        <USkeleton class="h-32 rounded-xl" />
        <USkeleton class="h-32 rounded-xl" />
      </div>
      <USkeleton class="h-64 rounded-xl" />
    </template>

    <template v-else>
      <!-- Has Application: Show Status -->
      <template v-if="application && !showApplyForm">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                <Icon name="lucide:building" class="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ application.companyName }}</h3>
                <p class="text-sm text-slate-500">{{ application.address }}</p>
                <div class="flex gap-2 mt-2">
                  <UBadge :color="application.type === 'mitra' ? 'primary' : 'warning'" variant="subtle" size="xs">
                    {{ application.type === 'mitra' ? 'Mitra Sekolah' : 'Mandiri' }}
                  </UBadge>
                  <UBadge :color="statusColor" variant="subtle" size="xs">{{ application.status }}</UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UAlert v-if="application.status === 'Ditolak'" color="error" icon="lucide:x-circle" class="mb-4">
          <template #title>Pengajuan Ditolak</template>
          <template #description>{{ application.rejectionReason }}</template>
        </UAlert>

        <!-- Timeline -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Progress</h3>
          <div class="flex items-center gap-2">
            <template v-for="(step, i) in timelineSteps" :key="i">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs" :class="step.class">
                  <Icon v-if="step.done" name="lucide:check" class="w-4 h-4" />
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="text-sm hidden sm:inline" :class="step.done ? 'text-slate-900' : 'text-slate-400'">{{ step.label }}</span>
              </div>
              <div v-if="i < 2" class="flex-1 h-0.5 max-w-16" :class="step.done ? 'bg-green-400' : 'bg-slate-200'" />
            </template>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500">Periode</p>
            <p class="font-medium text-slate-900">{{ application.period }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500">Tanggal Pengajuan</p>
            <p class="font-medium text-slate-900">{{ application.submittedAt }}</p>
          </div>
        </div>

        <UButton v-if="application.status === 'Ditolak'" color="primary" block @click="showApplyForm = true">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Ajukan Ulang
        </UButton>
      </template>

      <!-- No Application or Apply Form -->
      <template v-else>
        <!-- Stepper -->
        <div class="flex items-center justify-center gap-2 bg-white rounded-xl border border-slate-200 p-4">
          <template v-for="(s, i) in ['Pilih Jalur', 'Isi Data', 'Konfirmasi']" :key="i">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" :class="step > i ? 'bg-green-500 text-white' : step === i ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'">
                <Icon v-if="step > i" name="lucide:check" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-sm hidden sm:inline" :class="step >= i ? 'text-slate-900 font-medium' : 'text-slate-400'">{{ s }}</span>
            </div>
            <div v-if="i < 2" class="w-8 lg:w-12 h-0.5" :class="step > i ? 'bg-green-500' : 'bg-slate-200'" />
          </template>
        </div>

        <!-- Step 0: Pilih Jalur -->
        <div v-if="step === 0" class="grid md:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border-2 p-5 cursor-pointer hover:shadow-md transition-all" :class="mode === 'mitra' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'" @click="mode = 'mitra'">
            <div class="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-3">
              <Icon name="lucide:building-2" class="w-6 h-6 text-sky-600" />
            </div>
            <h3 class="font-semibold text-slate-900">Mitra Sekolah</h3>
            <p class="text-sm text-slate-500 mt-1">Pilih dari daftar perusahaan mitra</p>
          </div>
          <div class="bg-white rounded-xl border-2 p-5 cursor-pointer hover:shadow-md transition-all" :class="mode === 'mandiri' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'" @click="mode = 'mandiri'">
            <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
              <Icon name="lucide:user" class="w-6 h-6 text-amber-600" />
            </div>
            <h3 class="font-semibold text-slate-900">Mandiri</h3>
            <p class="text-sm text-slate-500 mt-1">Ajukan perusahaan pilihanmu</p>
          </div>
        </div>

        <!-- Step 1: Mitra -->
        <div v-else-if="step === 1 && mode === 'mitra'" class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex flex-col sm:flex-row gap-3">
              <UInput v-model="search" placeholder="Cari perusahaan..." class="flex-1">
                <template #leading><Icon name="lucide:search" class="w-4 h-4 text-slate-400" /></template>
              </UInput>
              <USelectMenu v-model="filterCity" :items="cities" placeholder="Kota" class="w-full sm:w-28" />
              <USelectMenu v-model="filterField" :items="fields" placeholder="Bidang" class="w-full sm:w-28" />
            </div>
          </div>
          <div v-if="loadingCompanies" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <USkeleton v-for="i in 6" :key="i" class="h-40 rounded-xl" />
          </div>
          <div v-else-if="filteredCompanies.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="c in filteredCompanies" :key="c.id" class="bg-white rounded-xl border-2 p-4 cursor-pointer hover:shadow-md transition-all" :class="selectedId === c.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'" @click="!c.full && (selectedId = c.id)">
              <h4 class="font-semibold text-slate-900 text-sm truncate">{{ c.name }}</h4>
              <p class="text-xs text-slate-500 truncate mb-2">{{ c.address }}</p>
              <div class="flex gap-1 mb-2">
                <UBadge color="primary" variant="subtle" size="xs">{{ c.field }}</UBadge>
              </div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Kuota</span>
                <span :class="c.full ? 'text-red-600' : 'text-green-600'">{{ c.applied }}/{{ c.quota }}</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full"><div class="h-full rounded-full" :class="c.full ? 'bg-red-500' : 'bg-green-500'" :style="{width: `${(c.applied/c.quota)*100}%`}" /></div>
              <p v-if="c.full" class="text-xs text-red-500 mt-1">Kuota Penuh</p>
            </div>
          </div>
          <div v-else class="bg-white rounded-xl border border-slate-200 py-10 text-center">
            <Icon name="lucide:search-x" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p class="text-slate-500">Tidak ditemukan</p>
          </div>
        </div>

        <!-- Step 1: Mandiri -->
        <div v-else-if="step === 1 && mode === 'mandiri'" class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Data Perusahaan</h3>
          <div class="grid gap-4">
            <UFormField label="Nama Perusahaan" required>
              <UInput v-model="form.name" placeholder="PT. Contoh" />
            </UFormField>
            <UFormField label="Alamat Lengkap" required>
              <UTextarea v-model="form.address" placeholder="Jl. Contoh No. 1..." :rows="2" />
            </UFormField>
            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Bidang Usaha" required>
                <USelectMenu v-model="form.field" :items="fields" placeholder="Pilih" />
              </UFormField>
              <UFormField label="Kota" required>
                <USelectMenu v-model="form.city" :items="cities" placeholder="Pilih" />
              </UFormField>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Nama Contact Person" required>
                <UInput v-model="form.pic" placeholder="Nama CP" />
              </UFormField>
              <UFormField label="No HP/WA" required>
                <UInput v-model="form.phone" type="tel" placeholder="08xxx" />
              </UFormField>
            </div>
            <UFormField label="Bukti Surat (PDF/Gambar)" required>
              <div class="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-sky-400" @click="($refs.fileInput as HTMLInputElement).click()">
                <input ref="fileInput" type="file" accept=".pdf,image/*" class="hidden" @change="onFile" />
                <Icon :name="form.fileName ? 'lucide:file-check' : 'lucide:upload'" class="w-6 h-6 mx-auto mb-1" :class="form.fileName ? 'text-green-500' : 'text-slate-300'" />
                <p class="text-sm" :class="form.fileName ? 'text-slate-700' : 'text-slate-500'">{{ form.fileName || 'Klik untuk upload (max 2MB)' }}</p>
              </div>
            </UFormField>
          </div>
        </div>

        <!-- Step 2: Konfirmasi -->
        <div v-else-if="step === 2" class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Konfirmasi Pengajuan</h3>
          <div class="grid gap-3 text-sm">
            <template v-if="mode === 'mitra' && selectedCompany">
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Perusahaan</p><p class="font-medium text-slate-900">{{ selectedCompany.name }}</p></div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Alamat</p><p class="font-medium text-slate-900">{{ selectedCompany.address }}</p></div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Bidang</p><p class="font-medium text-slate-900">{{ selectedCompany.field }}</p></div>
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Jalur</p><p class="font-medium text-slate-900">Mitra Sekolah</p></div>
              </div>
            </template>
            <template v-else>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Perusahaan</p><p class="font-medium text-slate-900">{{ form.name }}</p></div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Alamat</p><p class="font-medium text-slate-900">{{ form.address }}</p></div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Bidang</p><p class="font-medium text-slate-900">{{ form.field }}</p></div>
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Jalur</p><p class="font-medium text-slate-900">Mandiri</p></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Contact Person</p><p class="font-medium text-slate-900">{{ form.pic }}</p></div>
                <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">No HP</p><p class="font-medium text-slate-900">{{ form.phone }}</p></div>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg"><p class="text-slate-500">Dokumen</p><p class="font-medium text-slate-900">{{ form.fileName }}</p></div>
            </template>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between">
          <UButton v-if="step > 0" variant="outline" color="neutral" @click="step--">
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />Kembali
          </UButton>
          <UButton v-else-if="application" variant="outline" color="neutral" @click="showApplyForm = false">
            <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />Kembali ke Status
          </UButton>
          <div v-else />
          <UButton v-if="step < 2" color="primary" :disabled="!canNext" @click="nextStep">
            Lanjutkan<Icon name="lucide:arrow-right" class="w-4 h-4 ml-2" />
          </UButton>
          <UButton v-else color="primary" :loading="submitting" @click="submit">
            <Icon name="lucide:send" class="w-4 h-4 mr-2" />Kirim Pengajuan
          </UButton>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'siswa' })

const toast = useToast()

// Page state
const pageLoading = ref(true)
const showApplyForm = ref(false)
const application = ref<any>(null)

// Apply form state
const step = ref(0)
const mode = ref<'mitra' | 'mandiri' | ''>('')
const search = ref('')
const filterCity = ref<string | null>(null)
const filterField = ref<string | null>(null)
const selectedId = ref<number | null>(null)
const loadingCompanies = ref(true)
const companies = ref<any[]>([])
const submitting = ref(false)

const form = reactive({ name: '', address: '', field: null as string | null, city: null as string | null, pic: '', phone: '', file: null as File | null, fileName: '' })

const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta']
const fields = ['IT & Software', 'Jaringan', 'Multimedia', 'Bisnis', 'Otomotif']

const statusColor = computed(() => ({ 'Menunggu Verifikasi': 'warning', 'Diterima': 'success', 'Ditolak': 'error' })[application.value?.status] || 'neutral')

const timelineSteps = computed(() => {
  const s = application.value?.status
  return [
    { label: 'Diajukan', done: true, class: 'bg-green-100 text-green-600' },
    { label: 'Review', done: s !== 'Menunggu Verifikasi', class: s === 'Menunggu Verifikasi' ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-500' : s === 'Ditolak' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600' },
    { label: 'Keputusan', done: s === 'Diterima' || s === 'Ditolak', class: s === 'Diterima' ? 'bg-green-100 text-green-600' : s === 'Ditolak' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400' }
  ]
})

const filteredCompanies = computed(() => companies.value.filter(c => 
  (!search.value || c.name.toLowerCase().includes(search.value.toLowerCase())) &&
  (!filterCity.value || c.city === filterCity.value) &&
  (!filterField.value || c.field === filterField.value)
))

const selectedCompany = computed(() => companies.value.find(c => c.id === selectedId.value))

const canNext = computed(() => {
  if (step.value === 0) return !!mode.value
  if (step.value === 1 && mode.value === 'mitra') return !!selectedId.value
  if (step.value === 1 && mode.value === 'mandiri') return form.name && form.address.length >= 20 && form.field && form.pic && /^08\d{8,}$/.test(form.phone) && form.file
  return true
})

function nextStep() {
  if (step.value === 1 && mode.value === 'mandiri') {
    if (form.address.length < 20) { toast.add({ title: 'Alamat minimal 20 karakter', color: 'error' }); return }
    if (!/^08\d{8,}$/.test(form.phone)) { toast.add({ title: 'Format nomor HP tidak valid', color: 'error' }); return }
    if (!form.file) { toast.add({ title: 'Upload bukti surat', color: 'error' }); return }
  }
  step.value++
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (f.size > 2 * 1024 * 1024) { toast.add({ title: 'Max 2MB', color: 'error' }); return }
  form.file = f
  form.fileName = f.name
}

async function submit() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 1500))
  application.value = {
    companyName: mode.value === 'mitra' ? selectedCompany.value?.name : form.name,
    address: mode.value === 'mitra' ? selectedCompany.value?.address : form.address,
    type: mode.value,
    status: 'Menunggu Verifikasi',
    period: '1 Jan - 31 Mar 2025',
    submittedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  showApplyForm.value = false
  step.value = 0
  submitting.value = false
  toast.add({ title: 'Pengajuan berhasil dikirim!', color: 'success' })
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  // Mock: set to null to show apply form, or set data to show status
  application.value = null // Change to test different states
  
  // Load companies
  companies.value = [
    { id: 1, name: 'PT. Telkom Indonesia', address: 'Jl. Japati No. 1, Bandung', city: 'Bandung', field: 'IT & Software', quota: 5, applied: 3, full: false },
    { id: 2, name: 'PT. Astra International', address: 'Jl. Gaya Motor, Jakarta', city: 'Jakarta', field: 'Otomotif', quota: 3, applied: 3, full: true },
    { id: 3, name: 'CV. Digital Kreatif', address: 'Jl. Malioboro, Yogyakarta', city: 'Yogyakarta', field: 'Multimedia', quota: 4, applied: 1, full: false },
    { id: 4, name: 'PT. Infomedia Nusantara', address: 'Jl. Fatmawati, Jakarta', city: 'Jakarta', field: 'IT & Software', quota: 6, applied: 4, full: false },
    { id: 5, name: 'PT. Biznet Networks', address: 'Jl. Raya Bogor, Jakarta', city: 'Jakarta', field: 'Jaringan', quota: 4, applied: 2, full: false }
  ]
  loadingCompanies.value = false
  pageLoading.value = false
  
  if (!application.value) showApplyForm.value = true
})

useHead({ title: 'Pengajuan PKL | Siswa' })
</script>
