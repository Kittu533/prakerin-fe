<!--
  Penempatan Form Modal Component
  Handles create and edit for penempatan
-->
<script setup lang="ts">
import { usePenempatanApi, type Penempatan } from '~/composables/api/use-internship'

export interface SiswaOption {
  label: string
  value: number
}

export interface PerusahaanOption {
  label: string
  value: number
}

export interface GuruOption {
  label: string
  value: number
}

const props = defineProps<{
  open: boolean
  editing: boolean
  siswaOptions: SiswaOption[]
  perusahaanOptions: PerusahaanOption[]
  guruOptions: GuruOption[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: PenempatanFormData]
  'update:editing': [value: boolean]
}>()

const toast = useToast()
const penempatanApi = usePenempatanApi()
const processing = ref(false)

export interface PenempatanFormData {
  id_penempatan: number | null
  siswa_id: number | undefined
  perusahaan_id: number | undefined
  guru_pembimbing_id: number | undefined
  tahun_ajaran_id: number
  tanggal_mulai: string
  tanggal_selesai: string
  status_penempatan: string
}

const form = reactive<PenempatanFormData>({
  id_penempatan: null,
  siswa_id: undefined,
  perusahaan_id: undefined,
  guru_pembimbing_id: undefined,
  tahun_ajaran_id: 1,
  tanggal_mulai: '',
  tanggal_selesai: '',
  status_penempatan: 'aktif',
})

// Watch for open prop changes to reset form when opening new
watch(() => props.open, (isOpen) => {
  if (!isOpen && !props.editing) {
    resetForm()
  }
})

// Set form data for editing
function setFormData(data: Penempatan) {
  Object.assign(form, {
    id_penempatan: data.id_penempatan,
    siswa_id: data.siswa_id,
    perusahaan_id: data.perusahaan_id,
    guru_pembimbing_id: data.guru_pembimbing_id || undefined,
    tanggal_mulai: data.tanggal_mulai?.split('T')[0] || '',
    tanggal_selesai: data.tanggal_selesai?.split('T')[0] || '',
    status_penempatan: data.status_penempatan,
  })
}

function resetForm() {
  Object.assign(form, {
    id_penempatan: null,
    siswa_id: undefined,
    perusahaan_id: undefined,
    guru_pembimbing_id: undefined,
    tanggal_mulai: '',
    tanggal_selesai: '',
    status_penempatan: 'aktif',
  })
}

async function handleSubmit() {
  const requiredFields = [form.siswa_id, form.perusahaan_id, form.guru_pembimbing_id, form.tanggal_mulai, form.tanggal_selesai]
  if (requiredFields.some(v => !v)) {
    toast.add({ title: 'Lengkapi semua field wajib', color: 'error' })
    return
  }

  // Validate dates
  if (new Date(form.tanggal_selesai) <= new Date(form.tanggal_mulai)) {
    toast.add({ title: 'Tanggal selesai harus lebih besar dari tanggal mulai', color: 'error' })
    return
  }

  processing.value = true
  try {
    emit('save', form)
  } finally {
    processing.value = false
  }
}

function closeModal() {
  emit('update:open', false)
  emit('update:editing', false)
  resetForm()
}

// Expose setFormData method
defineExpose({
  setFormData,
  resetForm,
})
</script>

<template>
  <UModal :open="open" @update:open="closeModal">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">
              {{ editing ? 'Edit Penempatan' : 'Tambah Penempatan' }}
            </h3>
            <UButton variant="ghost" color="neutral" size="xs" @click="closeModal">
              <Icon name="lucide:x" class="w-4 h-4" />
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Siswa" required>
            <USelectMenu
              v-model="form.siswa_id"
              :items="siswaOptions"
              value-key="value"
              placeholder="Pilih siswa"
              :disabled="editing"
            />
          </UFormField>

          <UFormField label="Perusahaan" required>
            <USelectMenu
              v-model="form.perusahaan_id"
              :items="perusahaanOptions"
              value-key="value"
              placeholder="Pilih perusahaan"
            />
          </UFormField>

          <UFormField label="Guru Pembimbing" required>
            <USelectMenu
              v-model="form.guru_pembimbing_id"
              :items="guruOptions"
              value-key="value"
              placeholder="Pilih guru"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Tanggal Mulai" required>
              <UInput v-model="form.tanggal_mulai" type="date" />
            </UFormField>
            <UFormField label="Tanggal Selesai" required>
              <UInput v-model="form.tanggal_selesai" type="date" />
            </UFormField>
          </div>

          <UFormField v-if="editing" label="Status">
            <USelectMenu
              v-model="form.status_penempatan"
              :items="[
                { label: 'Aktif', value: 'aktif' },
                { label: 'Selesai', value: 'selesai' },
                { label: 'Dibatalkan', value: 'dibatalkan' },
              ]"
              value-key="value"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex gap-3">
            <UButton variant="outline" color="neutral" class="flex-1" @click="closeModal">
              Batal
            </UButton>
            <UButton color="primary" class="flex-1" :loading="processing" @click="handleSubmit">
              {{ editing ? 'Simpan' : 'Tambah' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
