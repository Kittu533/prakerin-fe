<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import dokumenSeed from '~/assets/data/dokumen-pkl.json'

interface DokumenPkl {
  id: number
  id_penempatan: number
  penempatan_label: string
  jenis_file: string
  nama_file: string
  file_url: string
  uploaded_at: string
}

const documents = ref<DokumenPkl[]>([...(dokumenSeed as DokumenPkl[])])

/* ------------------ OPTIONS PENEMPATAN & JENIS DOKUMEN ------------------ */

const placementOptions = computed(() => {
  const map = new Map<number, string>()
  for (const doc of documents.value) {
    if (!map.has(doc.id_penempatan)) {
      map.set(doc.id_penempatan, doc.penempatan_label)
    }
  }
  if (map.size === 0) {
    map.set(1, 'PT Contoh Sejahtera - Software Engineer')
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
})

const jenisOptions = [
  { value: 'SURAT_PERMOHONAN', label: 'Surat Permohonan' },
  { value: 'SURAT_BALASAN', label: 'Surat Balasan' },
  { value: 'SURAT_PENGANTAR', label: 'Surat Pengantar' },
  { value: 'LAPORAN_AKHIR', label: 'Laporan Akhir' },
  { value: 'DOKUMENTASI', label: 'Dokumentasi' },
  { value: 'SERTIFIKAT', label: 'Sertifikat' },
  { value: 'LAINNYA', label: 'Lainnya' }
]

const allowedExtByJenis: Record<string, string[]> = {
  SURAT_PERMOHONAN: ['pdf', 'doc', 'docx'],
  SURAT_BALASAN: ['pdf'],
  SURAT_PENGANTAR: ['pdf', 'doc', 'docx'],
  LAPORAN_AKHIR: ['pdf'],
  DOKUMENTASI: ['jpg', 'jpeg', 'png'],
  SERTIFIKAT: ['pdf', 'jpg', 'jpeg', 'png'],
  LAINNYA: ['pdf', 'jpg', 'jpeg', 'png']
}

/* ------------------ STATE FORM ------------------ */

const formState = reactive({
  idPenempatan: placementOptions.value[0]?.value ?? null as number | null,
  jenisDokumen: null as string | null,
  keterangan: ''
})

const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isUploading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const filteredDocuments = computed(() => {
  return documents.value
    .filter(doc =>
      formState.idPenempatan ? doc.id_penempatan === formState.idPenempatan : true
    )
    .sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    )
})

const hasAnyDocument = computed(() => documents.value.length > 0)

/* ------------------ HANDLERS ------------------ */

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
  errorMessage.value = null
  successMessage.value = null
}

const handleUpload = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (!formState.idPenempatan) {
    errorMessage.value = 'Silakan pilih penempatan aktif terlebih dahulu.'
    return
  }
  if (!formState.jenisDokumen) {
    errorMessage.value = 'Silakan pilih jenis dokumen.'
    return
  }
  if (!selectedFile.value) {
    errorMessage.value = 'Silakan pilih file yang akan diunggah.'
    return
  }

  const file = selectedFile.value
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const allowedExt = allowedExtByJenis[formState.jenisDokumen] ?? []

  if (!allowedExt.includes(ext)) {
    errorMessage.value =
      `Tipe file tidak diizinkan untuk dokumen ini. Gunakan: ${allowedExt.join(', ')}.`
    return
  }

  // simulasi upload (dummy)
  isUploading.value = true
  try {
    const newId = (documents.value.at(-1)?.id ?? 0) + 1
    const placementLabel =
      placementOptions.value.find(p => p.value === formState.idPenempatan)?.label
      ?? 'Penempatan Aktif'

    documents.value = [
      {
        id: newId,
        id_penempatan: formState.idPenempatan,
        penempatan_label: placementLabel,
        jenis_file: formState.jenisDokumen,
        nama_file: file.name,
        file_url: '#',
        uploaded_at: new Date().toISOString()
      },
      ...documents.value
    ]

    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }

    successMessage.value =
      'Dokumen berhasil ditambahkan (dummy). Di sistem nyata, file akan diunggah dan notifikasi dikirim ke pembimbing.'
  } finally {
    isUploading.value = false
  }
}

/* ------------------ HELPERS ------------------ */

const formatJenis = (jenis: string) => {
  const found = jenisOptions.find(j => j.value === jenis)
  return found ? found.label : jenis
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <section
    class="mx-auto max-w-5xl space-y-5 rounded-3xl bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-7"
  >
    <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 md:text-xl">
          Dokumen PKL
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          Unggah dan kelola dokumen pendukung PKL Anda (surat, laporan, dokumentasi, sertifikat).
        </p>
      </div>
    </header>

    <div class="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)]">
      <!-- Form upload -->
      <div
        class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:py-5"
      >
        <div class="space-y-3 text-sm">
          <div>
            <label class="block text-[13px] font-medium text-slate-700">
              Penempatan aktif
            </label>
            <select
              v-model="formState.idPenempatan"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
            >
              <option
                v-for="opt in placementOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-slate-700">
              Jenis dokumen
            </label>
            <select
              v-model="formState.jenisDokumen"
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
            >
              <option disabled value="">
                -- Pilih jenis dokumen --
              </option>
              <option
                v-for="opt in jenisOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-slate-700">
              Pilih file & unggah
            </label>
            <input
              ref="fileInputRef"
              type="file"
              class="mt-1 block w-full cursor-pointer text-sm text-slate-600
                     file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-200
                     file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium
                     file:text-slate-700 hover:file:bg-slate-50"
              @change="handleFileChange"
            />
            <p class="mt-1 text-xs text-slate-400">
              Tipe file mengikuti jenis dokumen (mis. PDF untuk surat/laporan, JPG/PNG untuk dokumentasi).
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-blue-300"
            :disabled="isUploading"
            @click="handleUpload"
          >
            <span v-if="!isUploading">Unggah Dokumen</span>
            <span v-else>Mengunggah...</span>
          </button>

          <p
            v-if="errorMessage"
            class="text-xs text-red-500"
          >
            {{ errorMessage }}
          </p>
          <p
            v-if="successMessage"
            class="text-xs text-emerald-600"
          >
            {{ successMessage }}
          </p>
        </div>
      </div>

      <!-- Daftar dokumen -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:text-sm">
            Daftar dokumen terkirim
          </h3>
          <span class="text-xs text-slate-400">
            {{ filteredDocuments.length }} dokumen
          </span>
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60"
        >
          <div class="max-h-80 overflow-auto">
            <table class="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-slate-500">
                    Dokumen
                  </th>
                  <th class="px-3 py-2 text-left font-medium text-slate-500">
                    Jenis
                  </th>
                  <th class="hidden px-3 py-2 text-left font-medium text-slate-500 sm:table-cell">
                    Penempatan
                  </th>
                  <th class="px-3 py-2 text-left font-medium text-slate-500">
                    Diunggah
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="border-t border-slate-100 bg-white hover:bg-slate-50/80"
                >
                  <td class="px-3 py-2 align-top">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">
                        {{ doc.nama_file }}
                      </span>
                      <a
                        :href="doc.file_url"
                        class="mt-0.5 text-xs text-blue-600 hover:underline"
                      >
                        Lihat / unduh
                      </a>
                    </div>
                  </td>
                  <td class="px-3 py-2 align-top">
                    <span class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {{ formatJenis(doc.jenis_file) }}
                    </span>
                  </td>
                  <td class="hidden px-3 py-2 align-top text-slate-600 sm:table-cell">
                    {{ doc.penempatan_label }}
                  </td>
                  <td class="px-3 py-2 align-top text-slate-500">
                    {{ formatDate(doc.uploaded_at) }}
                  </td>
                </tr>
                <tr v-if="filteredDocuments.length === 0">
                  <td
                    colspan="4"
                    class="px-3 py-6 text-center text-xs text-slate-400"
                  >
                    Belum ada dokumen untuk penempatan ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- STATUS -->
        <div
          v-if="!hasAnyDocument"
          class="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 md:text-sm"
        >
          Status Dokumen PKL:
          <span class="font-semibold">Belum ada dokumen yang diunggah.</span>
          Silakan unggah minimal satu dokumen pendukung.
        </div>
        <div
          v-else
          class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 md:text-sm"
        >
          Status Dokumen PKL:
          <span class="font-semibold">Sudah mengunggah {{ documents.length }} dokumen.</span>
          Detail dapat dilihat pada daftar di atas.
        </div>
      </div>
    </div>
  </section>
</template>
