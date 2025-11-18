<!-- components/siswa/LogbookForm.vue -->
<template>
  <section>
    <h3 class="text-sm font-semibold text-slate-700 mb-3">
      Silakan isi logbook
    </h3>

    <form @submit.prevent="onSubmit" class="space-y-3">
      <dl class="divide-y divide-slate-100 text-sm">
        <!-- Tanggal -->
        <div class="flex flex-col sm:flex-row py-2">
          <dt class="sm:w-1/3 text-slate-500 flex items-center">
            Tanggal
          </dt>
          <dd class="sm:flex-1 sm:pl-6 w-full">
            <div class="relative max-w-xs">
              <input
                v-model="form.tanggal"
                type="date"
                class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </dd>
        </div>

        <!-- Jam Mulai -->
        <div class="flex flex-col sm:flex-row py-2">
          <dt class="sm:w-1/3 text-slate-500 flex items-center">
            Jam Mulai
          </dt>
          <dd class="sm:flex-1 sm:pl-6 w-full">
            <div class="max-w-xs">
              <input
                v-model="form.jamMulai"
                type="time"
                class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </dd>
        </div>

        <!-- Jam Selesai -->
        <div class="flex flex-col sm:flex-row py-2">
          <dt class="sm:w-1/3 text-slate-500 flex items-center">
            Jam Selesai
          </dt>
          <dd class="sm:flex-1 sm:pl-6 w-full">
            <div class="max-w-xs">
              <input
                v-model="form.jamSelesai"
                type="time"
                class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </dd>
        </div>

        <!-- Aktivitas -->
        <div class="flex flex-col sm:flex-row py-2">
          <dt class="sm:w-1/3 text-slate-500 flex items-start pt-2">
            Aktivitas
          </dt>
          <dd class="sm:flex-1 sm:pl-6 w-full">
            <textarea
              v-model="form.aktivitas"
              rows="4"
              class="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Tuliskan aktivitas yang dilakukan..."
              required
            ></textarea>
          </dd>
        </div>
      </dl>

      <div class="flex justify-center pt-2">
        <button
          type="submit"
          class="inline-flex items-center px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
        >
          Simpan Logbook
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
interface LogbookFormPayload {
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
}

const emit = defineEmits<{
  (e: 'submit', payload: LogbookFormPayload): void
}>()

const form = reactive<LogbookFormPayload>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: ''
})

function onSubmit() {
  emit('submit', { ...form })

  // reset form setelah submit
  form.tanggal = ''
  form.jamMulai = ''
  form.jamSelesai = ''
  form.aktivitas = ''
}
</script>
