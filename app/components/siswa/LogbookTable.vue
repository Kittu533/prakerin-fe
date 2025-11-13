<!-- app/components/siswa/LogbookTable.vue -->
<template>
  <section
    class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden"
  >
    <div class="px-6 pt-5 pb-4 space-y-4">
      <div class="flex justify-center">
        <button
          type="button"
          class="inline-flex items-center px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          @click="$emit('save')"
        >
          Simpan Logbook
        </button>
      </div>

      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm"
      >
        <div class="flex items-center gap-2 text-slate-600">
          <span>Show</span>
          <select
            v-model.number="pageSize"
            class="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
          </select>
          <span>entries</span>
        </div>

        <div class="flex items-center gap-2 text-slate-600">
          <label class="whitespace-nowrap">Search:</label>
          <input
            v-model="search"
            type="text"
            class="block rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Cari tanggal / aktivitas..."
          />
        </div>
      </div>
    </div>

    <div class="px-6 pb-6 overflow-x-auto">
      <table class="min-w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr class="bg-slate-100 text-slate-700">
            <th class="py-2 px-3 text-left w-12">No</th>
            <th class="py-2 px-3 text-left">Tanggal</th>
            <th class="py-2 px-3 text-left">Jam</th>
            <th class="py-2 px-3 text-left min-w-60">Aktivitas</th>
            <th class="py-2 px-3 text-left">Pembimbing</th>
            <th class="py-2 px-3 text-left">Mitra</th>
            <th class="py-2 px-3 text-left whitespace-nowrap">
              Catatan Pembimbing
            </th>
            <th class="py-2 px-3 text-left whitespace-nowrap">
              Catatan Mitra
            </th>
            <th class="py-2 px-3 text-center w-16">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in paginatedEntries"
            :key="entry.id"
            class="border-b border-slate-100 odd:bg-slate-50/50"
          >
            <td class="py-2 px-3 align-top">
              {{ index + 1 + (currentPage - 1) * pageSize }}
            </td>
            <td class="py-2 px-3 align-top">
              {{ entry.tanggal }}
            </td>
            <td class="py-2 px-3 align-top whitespace-nowrap">
              {{ entry.jamMulai }} s/d {{ entry.jamSelesai }}
            </td>
            <td class="py-2 px-3 align-top">
              {{ entry.aktivitas }}
            </td>
            <td class="py-2 px-3 align-top">
              <button
                type="button"
                class="px-3 py-1 rounded-full text-[11px] font-medium text-white"
                :class="
                  entry.pembimbingStatus === 'verified'
                    ? 'bg-sky-500'
                    : 'bg-red-500'
                "
              >
                {{
                  entry.pembimbingStatus === 'verified'
                    ? 'Lihat Verifikasi'
                    : 'Belum Verifikasi'
                }}
              </button>
            </td>
            <td class="py-2 px-3 align-top">
              <button
                type="button"
                class="px-3 py-1 rounded-full text-[11px] font-medium text-white"
                :class="
                  entry.mitraStatus === 'verified'
                    ? 'bg-sky-500'
                    : 'bg-red-500'
                "
              >
                {{
                  entry.mitraStatus === 'verified'
                    ? 'Lihat Verifikasi'
                    : 'Belum Verifikasi'
                }}
              </button>
            </td>
            <td class="py-2 px-3 align-top">
              <button
                type="button"
                class="px-3 py-1 rounded-full bg-sky-500 text-white text-[11px] font-medium"
              >
                Lihat Catatan
              </button>
            </td>
            <td class="py-2 px-3 align-top">
              <button
                type="button"
                class="px-3 py-1 rounded-full bg-sky-500 text-white text-[11px] font-medium"
              >
                Lihat Catatan
              </button>
            </td>
            <td class="py-2 px-3 align-top text-center">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                @click="$emit('delete', entry.id)"
              >
                🗑
              </button>
            </td>
          </tr>

          <tr v-if="!paginatedEntries.length">
            <td
              class="py-4 px-3 text-center text-slate-500"
              colspan="9"
            >
              Belum ada data logbook.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  pembimbingStatus: 'verified' | 'unverified'
  mitraStatus: 'verified' | 'unverified'
}

const props = defineProps<{
  entries: LogbookEntry[]
}>()

defineEmits<{
  (e: 'delete', id: number): void
  (e: 'save'): void
}>()

const search = ref('')
const pageSize = ref(10)
const currentPage = ref(1)

const filteredEntries = computed<LogbookEntry[]>(() => {
  if (!search.value.trim()) return props.entries
  const term = search.value.toLowerCase()
  return props.entries.filter((entry: LogbookEntry) => {
    return (
      entry.aktivitas.toLowerCase().includes(term) ||
      entry.tanggal.toLowerCase().includes(term)
    )
  })
})

const paginatedEntries = computed<LogbookEntry[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEntries.value.slice(start, end)
})
</script>
