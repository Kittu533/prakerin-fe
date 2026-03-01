<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="text-sm text-slate-500 mt-1">Informasi data diri</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-xl" />
      <USkeleton class="h-48 w-full rounded-xl" />
    </div>

    <template v-else>
      <!-- Profile Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-sky-500 flex items-center justify-center text-white text-xl font-bold">
            {{ initials }}
          </div>
          <div>
            <p class="font-semibold text-slate-900 text-lg">{{ profile.name }}</p>
            <p class="text-sm text-slate-500">{{ profile.nis }}</p>
            <UBadge color="primary" variant="subtle" class="mt-1">{{ profile.class }}</UBadge>
          </div>
        </div>
      </div>

      <!-- Personal Info -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Informasi Pribadi</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in personalInfo" :key="item.label" class="px-5 py-3 flex justify-between">
            <p class="text-sm text-slate-500">{{ item.label }}</p>
            <p class="text-sm font-medium text-slate-900">{{ item.value || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- PKL Info -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Informasi PKL</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in pklInfo" :key="item.label" class="px-5 py-3 flex justify-between">
            <p class="text-sm text-slate-500">{{ item.label }}</p>
            <p class="text-sm font-medium text-slate-900">{{ item.value || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <UButton color="primary" variant="outline" class="flex-1" @click="showEditModal = true">
          <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
          Edit Profil
        </UButton>
        <UButton color="error" variant="ghost" @click="handleLogout">
          <Icon name="lucide:log-out" class="w-4 h-4" />
        </UButton>
      </div>
    </template>

    <!-- Edit Profile Modal -->
    <UModal v-model:open="showEditModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Edit Profil</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="showEditModal = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <form @submit.prevent="submitEdit" class="space-y-4">
            <UFormField label="Alamat">
              <UTextarea v-model="editForm.alamat" placeholder="Alamat lengkap" :rows="2" class="w-full" />
            </UFormField>

            <UFormField label="No. HP">
              <UInput v-model="editForm.no_hp" type="tel" placeholder="08xxxxxxxxxx" class="w-full" />
            </UFormField>

            <UFormField label="Email">
              <UInput v-model="editForm.email" type="email" placeholder="email@example.com" class="w-full" />
            </UFormField>

            <div class="flex gap-3 pt-2">
              <UButton type="button" variant="outline" color="neutral" class="flex-1" @click="showEditModal = false">Batal</UButton>
              <UButton type="submit" color="primary" class="flex-1" :loading="submitting">Simpan</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  useSiswaProfileApi,
  useSiswaPenempatanApi,
  type SiswaProfile,
  type SiswaPenempatan
} from '~/composables/api/use-siswa'
import { useDataStore } from '~/stores/data-store'

definePageMeta({ layout: 'siswa' })

const toast = useToast()
const router = useRouter()
const config = useRuntimeConfig()

// Store
const dataStore = useDataStore()

// API composables
const profileApi = useSiswaProfileApi()
const penempatanApi = useSiswaPenempatanApi()

// State
const loading = ref(true)
const submitting = ref(false)
const showEditModal = ref(false)
const siswaData = ref<SiswaProfile | null>(null)
const penempatanData = ref<SiswaPenempatan | null>(null)
const debugInfo = ref<{ userId?: number; role?: string; hasToken: boolean }>({})

const profile = reactive({
  name: '',
  nis: '',
  class: ''
})

const personalInfo = ref<{ label: string; value: string }[]>([])
const pklInfo = ref<{ label: string; value: string }[]>([])

const editForm = reactive({
  alamat: '',
  no_hp: '',
  email: ''
})

const initials = computed(() => {
  if (!profile.name) return 'S'
  return profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

// Load data from API
async function loadData() {
  loading.value = true

  // Debug info
  debugInfo.value = {
    userId: dataStore.userId,
    role: dataStore.userRole,
    hasToken: !!dataStore.token
  }
  console.log('[Profile Page] Debug info:', debugInfo.value)

  try {
    // Get profile
    console.log('[Profile Page] Fetching profile...')
    const profileRes = await profileApi.getMyProfile()
    console.log('[Profile Page] Profile response:', profileRes)

    if (profileRes.success && profileRes.data) {
      siswaData.value = profileRes.data
      const p = profileRes.data

      profile.name = p.nama_siswa || 'Siswa'
      profile.nis = p.nis || '-'
      profile.class = p.kelas?.nama_kelas || '-'

      // Set edit form defaults
      editForm.alamat = p.alamat || ''
      editForm.no_hp = p.no_hp || ''
      editForm.email = p.email || ''

      // Build personal info
      personalInfo.value = [
        { label: 'NIS', value: p.nis || '-' },
        { label: 'Jenis Kelamin', value: getJenisKelamin(p.jenis_kelamin) },
        { label: 'Tanggal Lahir', value: formatDate(p.tanggal_lahir) },
        { label: 'Alamat', value: p.alamat || '-' },
        { label: 'No. HP', value: p.no_hp || '-' },
        { label: 'Email', value: p.email || '-' }
      ]

      console.log('[Profile Page] Personal info loaded:', personalInfo.value.length)
    } else {
      console.warn('[Profile Page] Profile fetch failed:', profileRes.message)
      toast.add({ title: 'Gagal memuat profil', description: profileRes.message, color: 'error' })
    }

    // Get penempatan
    console.log('[Profile Page] Fetching penempatan...')
    const penempatanRes = await penempatanApi.getMyPenempatan()
    console.log('[Profile Page] Penempatan response:', penempatanRes)

    if (penempatanRes.success && penempatanRes.data) {
      penempatanData.value = penempatanRes.data
      const pen = penempatanRes.data

      // Format periode
      const periode = pen.tanggal_mulai && pen.tanggal_selesai
        ? `${formatDate(pen.tanggal_mulai)} - ${formatDate(pen.tanggal_selesai)}`
        : '-'

      pklInfo.value = [
        { label: 'Tempat PKL', value: pen.perusahaan?.nama_perusahaan || '-' },
        { label: 'Periode', value: periode },
        { label: 'Guru Pembimbing', value: pen.guru?.nama_guru || '-' },
        { label: 'Pembimbing Industri', value: pen.mentor?.nama_mentor || '-' },
        { label: 'Status', value: formatStatusPenempatan(pen.status_penempatan) }
      ]

      console.log('[Profile Page] PKL info loaded:', pklInfo.value.length)
    } else {
      pklInfo.value = [
        { label: 'Status', value: 'Belum ada penempatan' }
      ]
    }
  } catch (err: any) {
    console.error('[Profile Page] Error loading data:', err)
    toast.add({ title: 'Gagal memuat data', description: err.message, color: 'error' })
    // Load mock data as fallback
    loadMockData()
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

function getJenisKelamin(jk: string | undefined): string {
  if (!jk) return '-'
  if (jk === 'L' || jk.toLowerCase() === 'laki-laki') return 'Laki-laki'
  if (jk === 'P' || jk.toLowerCase() === 'perempuan') return 'Perempuan'
  return jk
}

function formatStatusPenempatan(status: string | undefined): string {
  if (!status) return '-'
  const statusMap: Record<string, string> = {
    'aktif': 'Aktif',
    'selesai': 'Selesai',
    'dibatalkan': 'Dibatalkan'
  }
  return statusMap[status.toLowerCase()] || status
}

function loadMockData() {
  console.log('[Profile Page] Loading mock data')
  Object.assign(profile, { name: 'Ryobi Surya Atmaja', nis: '0012345678', class: 'XII RPL 1' })
  personalInfo.value = [
    { label: 'NIS', value: '0012345678' },
    { label: 'Jenis Kelamin', value: 'Laki-laki' },
    { label: 'Tanggal Lahir', value: '15 Januari 2007' },
    { label: 'Alamat', value: 'Jl. Merdeka No. 123, Jakarta' },
    { label: 'No. HP', value: '081234567890' },
    { label: 'Email', value: 'ryobi@example.com' }
  ]
  pklInfo.value = [
    { label: 'Tempat PKL', value: 'PT. Teknologi Nusantara' },
    { label: 'Periode', value: '1 Nov 2024 - 31 Jan 2025' },
    { label: 'Guru Pembimbing', value: 'Budi Santoso, S.Pd' },
    { label: 'Pembimbing Industri', value: 'Ahmad Wijaya' },
    { label: 'Status', value: 'Aktif' }
  ]
}

async function submitEdit() {
  if (!siswaData.value) return

  submitting.value = true

  try {
    const res = await profileApi.updateProfile(siswaData.value.id_siswa, {
      alamat: editForm.alamat,
      no_hp: editForm.no_hp,
      email: editForm.email
    })

    if (res.success) {
      // Update local state
      personalInfo.value = personalInfo.value.map(item => {
        if (item.label === 'Alamat') return { ...item, value: editForm.alamat || '-' }
        if (item.label === 'No. HP') return { ...item, value: editForm.no_hp || '-' }
        if (item.label === 'Email') return { ...item, value: editForm.email || '-' }
        return item
      })

      toast.add({ title: 'Profil berhasil diperbarui', color: 'success' })
      showEditModal.value = false
    } else {
      toast.add({ title: 'Gagal memperbarui profil', description: res.message, color: 'error' })
    }
  } catch (err) {
    console.error('Update error:', err)
    toast.add({ title: 'Gagal memperbarui profil', color: 'error' })
  } finally {
    submitting.value = false
  }
}

function handleLogout() {
  // Use dataStore to clear auth
  dataStore.clearAuth()
  toast.add({ title: 'Berhasil logout', color: 'success' })
  router.push('/login')
}

onMounted(() => {
  loadData()
})

useHead({ title: 'Profil | Siswa PKL' })
</script>
