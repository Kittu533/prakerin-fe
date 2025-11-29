<script setup lang="ts">
import penilaianData from '~/assets/data/guru_penilaian.json'

definePageMeta({
  layout: 'guru',
  title: 'Form Penilaian PKL'
})

const route = useRoute()
const id = Number(route.params.id)

const penempatan = computed(() =>
  (penilaianData.items as any[]).find((p) => p.idPenempatan === id)
)

// state form dummy (nanti ganti dengan real data dari backend)
const form = reactive({
  kedisiplinan: 80,
  tanggungJawab: 85,
  kerjasama: 82,
  inisiatif: 78,
  komunikasi: 84,
  technical: 83,
  problemSolving: 81,
  catatan: '',
  kelebihan: '',
  kekurangan: '',
  saran: ''
})
</script>

<template>
  <section v-if="penempatan" class="space-y-6 sm:space-y-8">
    <!-- HEADER -->
    <div class="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Form Penilaian PKL
          </p>
          <h1 class="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {{ penempatan.namaSiswa }} • {{ penempatan.kelas }}
          </h1>
          <p class="mt-1 text-xs text-slate-500 sm:text-sm">
            Perusahaan: {{ penempatan.perusahaan }}
          </p>
        </div>

        <nav class="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
          <NuxtLink to="/guru/penilaian" class="hover:text-blue-600">
            Penilaian
          </NuxtLink>
          <span>›</span>
          <span class="font-semibold text-blue-600">Form</span>
        </nav>
      </div>
    </div>

    <!-- FORM (dummy) -->
    <form
      class="space-y-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      @submit.prevent="() => alert('Simulasi submit form penilaian')"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup label="Kedisiplinan" help="0 - 100">
          <UInput v-model.number="form.kedisiplinan" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Tanggung jawab" help="0 - 100">
          <UInput v-model.number="form.tanggungJawab" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Kerjasama" help="0 - 100">
          <UInput v-model.number="form.kerjasama" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Inisiatif" help="0 - 100">
          <UInput v-model.number="form.inisiatif" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Komunikasi" help="0 - 100">
          <UInput v-model.number="form.komunikasi" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Technical skill" help="0 - 100">
          <UInput v-model.number="form.technical" type="number" min="0" max="100" />
        </UFormGroup>
        <UFormGroup label="Problem solving" help="0 - 100">
          <UInput v-model.number="form.problemSolving" type="number" min="0" max="100" />
        </UFormGroup>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormGroup label="Kelebihan siswa">
          <UTextarea v-model="form.kelebihan" :rows="3" />
        </UFormGroup>
        <UFormGroup label="Kekurangan siswa">
          <UTextarea v-model="form.kekurangan" :rows="3" />
        </UFormGroup>
      </div>

      <UFormGroup label="Catatan umum">
        <UTextarea v-model="form.catatan" :rows="3" />
      </UFormGroup>
      <UFormGroup label="Saran untuk siswa / sekolah">
        <UTextarea v-model="form.saran" :rows="3" />
      </UFormGroup>

      <div class="flex justify-end gap-2">
        <UButton type="button" color="neutral" variant="outline" @click="navigateTo('/guru/penilaian')">
          Batal
        </UButton>
        <UButton type="submit" color="primary">
          Simpan (Dummy)
        </UButton>
      </div>
    </form>
  </section>

  <section v-else class="rounded-2xl bg-white p-6 text-center text-sm text-slate-600">
    Data penilaian tidak ditemukan.
    <NuxtLink to="/guru/penilaian" class="ml-1 text-blue-600 underline">
      Kembali ke daftar
    </NuxtLink>
  </section>
</template>
