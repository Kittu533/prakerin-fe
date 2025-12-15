<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="$emit('update:open', false)"
      >
        <div class="w-full max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="bg-blue-600 px-4 sm:px-6 py-4 sm:py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-white">Upload Dokumen</h3>
                  <p class="text-xs sm:text-sm text-blue-100">Lengkapi informasi dokumen</p>
                </div>
              </div>
              <button
                @click="$emit('update:open', false)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-6 space-y-4">
            <!-- Placement Select -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Penempatan <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.placementId"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option :value="null" disabled>Pilih penempatan...</option>
                <option v-for="p in placements" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>

            <!-- Document Type Select -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Jenis Dokumen <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.documentType"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option :value="null" disabled>Pilih jenis dokumen...</option>
                <option v-for="d in documentTypes" :key="d.value" :value="d.value">{{ d.label }}</option>
              </select>
            </div>

            <!-- File Input -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                File <span class="text-red-500">*</span>
              </label>
              <input
                type="file"
                @change="handleFileChange"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                class="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:cursor-pointer"
              />
              <p class="mt-1.5 text-xs text-slate-500">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
              <p v-if="form.file" class="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ form.file.name }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 sm:px-6 py-3 sm:py-4">
            <button
              @click="$emit('update:open', false)"
              class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              @click="submitUpload"
              :disabled="isUploading || !isFormValid"
              class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isUploading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isUploading ? 'Uploading...' : 'Upload' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Placement {
  value: number
  label: string
}

interface DocumentType {
  value: string
  label: string
}

interface Props {
  open: boolean
  placements: Placement[]
  documentTypes: DocumentType[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:open', 'upload'])

const form = ref({
  placementId: null as number | null,
  documentType: null as string | null,
  file: null as File | null
})

const isUploading = ref(false)

const isFormValid = computed(() => {
  return form.value.placementId && form.value.documentType && form.value.file
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      target.value = ''
      return
    }
    form.value.file = file
  }
}

const submitUpload = async () => {
  if (!isFormValid.value) return
  
  isUploading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    emit('upload', { ...form.value })
    emit('update:open', false)
    
    // Reset form
    form.value = { placementId: null, documentType: null, file: null }
  } finally {
    isUploading.value = false
  }
}

// Reset form when modal closes
watch(() => props.open, (newVal) => {
  if (!newVal) {
    form.value = { placementId: null, documentType: null, file: null }
  }
})
</script>
