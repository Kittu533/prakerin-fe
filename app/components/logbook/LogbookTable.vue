

<template>
  <section class="space-y-4 sm:space-y-6 max-w-none">
    <!-- Attendance Alert -->
    <div v-if="!hasAttendedToday" class="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-amber-900 mb-1">Belum Absen Hari Ini</h3>
          <p class="text-sm text-amber-800 mb-3">
            Lakukan absensi terlebih dahulu menggunakan kamera dan lokasi GPS sebelum menambahkan logbook.
          </p>
          <AbsensiModal ref="absensiModalRef" @success="onAttendanceSuccess" />
        </div>
      </div>
    </div>
    
    <!-- Attendance Pending Alert -->
    <div v-else-if="!canAddLogbook" class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div class="min-w-0">
          <h3 class="text-sm font-medium text-blue-900 mb-1">Menunggu Verifikasi Absensi</h3>
          <p class="text-sm text-blue-800">
            Absensi Anda sedang menunggu verifikasi dari pembimbing. Anda dapat menambahkan logbook setelah absensi diverifikasi.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Success Alert -->
    <div v-else class="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
      <div class="flex items-start space-x-3">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div class="min-w-0">
          <h3 class="text-sm font-medium text-green-900 mb-1">Absensi Terverifikasi</h3>
          <p class="text-sm text-green-800">
            Anda sudah melakukan absensi dan dapat menambahkan logbook kegiatan hari ini.
          </p>
        </div>
      </div>
    </div>

    <!-- Header + search + add -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <h2 class="text-lg font-semibold text-slate-800 sm:text-xl">
        {{ props.title }}
      </h2>

      <div class="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
        <UInput
          v-model="search"
          size="md"
          placeholder="Cari tanggal / aktivitas..."
          icon="i-lucide-search"
          class="w-full xs:w-64"
        />
        <UButton
          icon="i-lucide-plus"
          size="md"
          color="primary"
          :disabled="!canAddLogbook"
          :variant="canAddLogbook ? 'solid' : 'outline'"
          @click="openAdd"
          class="shrink-0"
        >
          <span class="hidden sm:inline">Tambah Logbook</span>
          <span class="sm:hidden">Tambah</span>
        </UButton>
      </div>
    </div>

    <!-- TABLE -->
    <div class="rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <UTable
          :data="paginated"
          :columns="columns"
          sticky
          :ui="{
            base: 'min-w-[800px] sm:min-w-[1000px] lg:min-w-[1400px]',
            tr: 'border-b border-slate-100 last:border-b-0',
          th: 'bg-slate-50 text-sm font-semibold text-slate-600 px-3 py-3',
          td: 'bg-white px-3 py-3 align-top'
        }"
      />
    </div>

    <!-- footer info + pagination -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-slate-500"
    >
      <p class="text-center sm:text-left">
        Menampilkan
        <span class="font-semibold text-slate-700">
          {{ paginated.length }}
        </span>
        dari
        <span class="font-semibold text-slate-700">
          {{ totalItems }}
        </span>
        entri.
      </p>

      <UPagination
        v-model:page="page"
        :items-per-page="props.pageSize"
        :total="totalItems"
        size="md"
        :show-edges="true"
        :show-first="true"
        :show-last="true"
        class="justify-center sm:justify-end"
        :ui="{
          wrapper: 'flex items-center gap-1',
          base: 'min-h-[2rem] min-w-[2rem] text-sm'
        }"
      />
    </div>

    <!-- MODALS -->
    <!-- Add Modal -->
    <UModal 
      v-model:open="isAddOpen" 
      title="Tambah Logbook" 
      :ui="{ 
        width: 'max-w-2xl',
        container: 'p-6',
        header: 'px-6 py-4 border-b border-gray-200',
        body: 'px-6 py-6',
        footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3'
      }"
    >
      <template #body>
        <div class="space-y-6">
          <UForm :state="addState" @submit="onAddSubmit" class="space-y-6">
            <div class="grid gap-6">
              <UFormGroup label="Tanggal" required class="space-y-2">
                <UInput 
                  v-model="addState.tanggal" 
                  type="date" 
                  size="lg"
                  class="w-full"
                />
              </UFormGroup>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="Jam Mulai" required class="space-y-2">
                  <UInput 
                    v-model="addState.jamMulai" 
                    type="time" 
                    size="lg"
                    class="w-full"
                  />
                </UFormGroup>
                <UFormGroup label="Jam Selesai" required class="space-y-2">
                  <UInput 
                    v-model="addState.jamSelesai" 
                    type="time" 
                    size="lg"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              
              <UFormGroup label="Aktivitas" required class="space-y-2">
                <UTextarea 
                  v-model="addState.aktivitas" 
                  rows="5" 
                  placeholder="Deskripsikan aktivitas yang dilakukan secara detail..."
                  class="w-full resize-none"
                  :ui="{ wrapper: 'relative' }"
                />
              </UFormGroup>
            </div>
          </UForm>
        </div>
      </template>
      
      <template #footer="{ close }">
        <UButton 
          label="Batal" 
          color="neutral" 
          variant="outline" 
          size="lg"
          class="px-6 py-2"
          @click="close" 
        />
        <UButton 
          label="Simpan" 
          color="primary" 
          size="lg"
          class="px-6 py-2"
          @click="onAddSubmit({ data: addState })" 
        />
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal 
      v-model:open="isEditOpen" 
      title="Edit Logbook" 
      :ui="{ 
        width: 'max-w-2xl',
        container: 'p-6',
        header: 'px-6 py-4 border-b border-gray-200',
        body: 'px-6 py-6',
        footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3'
      }"
    >
      <template #body>
        <div class="space-y-6">
          <UForm :state="editState" @submit="onEditSubmit" class="space-y-6">
            <div class="grid gap-6">
              <UFormGroup label="Tanggal" required class="space-y-2">
                <UInput 
                  v-model="editState.tanggal" 
                  type="date" 
                  size="lg"
                  class="w-full"
                />
              </UFormGroup>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="Jam Mulai" required class="space-y-2">
                  <UInput 
                    v-model="editState.jamMulai" 
                    type="time" 
                    size="lg"
                    class="w-full"
                  />
                </UFormGroup>
                <UFormGroup label="Jam Selesai" required class="space-y-2">
                  <UInput 
                    v-model="editState.jamSelesai" 
                    type="time" 
                    size="lg"
                    class="w-full"
                  />
                </UFormGroup>
              </div>
              
              <UFormGroup label="Aktivitas" required class="space-y-2">
                <UTextarea 
                  v-model="editState.aktivitas" 
                  rows="5" 
                  placeholder="Deskripsikan aktivitas yang dilakukan secara detail..."
                  class="w-full resize-none"
                  :ui="{ wrapper: 'relative' }"
                />
              </UFormGroup>
            </div>
          </UForm>
        </div>
      </template>
      
      <template #footer="{ close }">
        <UButton 
          label="Batal" 
          color="neutral" 
          variant="outline" 
          size="lg"
          class="px-6 py-2"
          @click="close" 
        />
        <UButton 
          label="Simpan Perubahan" 
          color="primary" 
          size="lg"
          class="px-6 py-2"
          @click="onEditSubmit({ data: editState })" 
        />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal 
      v-model:open="isDeleteOpen" 
      title="Konfirmasi Hapus" 
      :ui="{ 
        width: 'max-w-lg',
        container: 'p-6',
        header: 'px-6 py-4 border-b border-gray-200',
        body: 'px-6 py-6',
        footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3'
      }"
    >
      <template #body>
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="shrink-0">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                Hapus Logbook?
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus logbook ini? Aksi ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
          
          <div v-if="selected" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-500">Tanggal:</span>
                <span class="text-sm font-semibold text-gray-900">{{ selected.tanggal }}</span>
              </div>
              <div class="flex justify-between items-start">
                <span class="text-sm font-medium text-gray-500 mt-1">Aktivitas:</span>
                <div class="text-sm text-gray-800 max-w-xs text-right">
                  {{ selected.aktivitas.length > 100 ? selected.aktivitas.substring(0, 100) + '...' : selected.aktivitas }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer="{ close }">
        <UButton 
          label="Batal" 
          color="neutral" 
          variant="outline" 
          size="lg"
          class="px-6 py-2"
          @click="close" 
        />
        <UButton 
          label="Hapus" 
          color="red" 
          size="lg"
          class="px-6 py-2"
          @click="confirmDelete" 
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, h, resolveComponent } from 'vue'
import logbookData from '~/assets/data/logbook-data.json'
import type { ColumnDef, Row } from '@tanstack/vue-table'
import AbsensiModal from './AbsensiModal.vue'

type LogStatus = 'Sudah ACC' | 'Menunggu ACC'

interface AttendanceRecord {
  id: string
  date: string
  checkInTime: string
  photo: string
  location: { lat: number; lng: number } | null
  status: 'pending' | 'approved' | 'rejected'
}

interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  status: LogStatus
  pembimbing: 'Lihat Verifikasi' | 'Belum Verifikasi'
  mitra: 'Lihat Verifikasi' | 'Belum Verifikasi'
}

interface LogbookFormState {
  tanggal?: string
  jamMulai?: string
  jamSelesai?: string
  aktivitas?: string
  pembimbing?: 'Lihat Verifikasi' | 'Belum Verifikasi'
  mitra?: 'Lihat Verifikasi' | 'Belum Verifikasi'
}

interface Props {
  title?: string
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Riwayat Logbook',
  pageSize: 5
})

/* ---- state utama ---- */
const entries = ref<LogbookEntry[]>(logbookData as LogbookEntry[])
const search = ref('')
const page = ref(1)

// Attendance validation
const attendanceStore = useState<AttendanceRecord[]>('attendance-records', () => [])
const absensiModalRef = ref<InstanceType<typeof AbsensiModal> | null>(null)

const checkTodayAttendance = () => {
  const today = new Date().toISOString().split('T')[0]
  return attendanceStore.value.find(record => record.date === today)
}

const canAddLogbook = computed(() => {
  const todayAttendance = checkTodayAttendance()
  return todayAttendance && todayAttendance.status === 'approved'
})

const hasAttendedToday = computed(() => {
  return !!checkTodayAttendance()
})

/* ---- filter & pagination ---- */
const filtered = computed(() => {
  if (!search.value) return entries.value

  const q = search.value.toLowerCase()
  return entries.value.filter((row) => {
    return (
      row.tanggal.toLowerCase().includes(q) ||
      row.aktivitas.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  })
})

const totalItems = computed(() => filtered.value.length)

const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

watch(search, () => {
  page.value = 1
})

/* ---- komponen dinamis untuk cell ---- */
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

/* ---- debugging modal ---- */
function debugModal(action: string, entry?: LogbookEntry) {
  console.log(`Modal ${action}:`, { entry, isAddOpen: isAddOpen.value, isEditOpen: isEditOpen.value, isDeleteOpen: isDeleteOpen.value })
}

const columns: ColumnDef<LogbookEntry>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }: { row: Row<LogbookEntry> }) => (page.value - 1) * props.pageSize + row.index + 1,
    meta: {
      class: {
        th: 'w-16 text-center text-sm font-semibold text-slate-500',
        td: 'text-center text-sm text-slate-700 min-w-16'
      }
    }
  },
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const tanggal = row.getValue('tanggal') as string
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    meta: {
      class: {
        th: 'w-28 text-left text-sm font-semibold text-slate-500',
        td: 'text-left text-sm text-slate-800 min-w-28'
      }
    }
  },
  {
    accessorKey: 'jamMulai',
    header: 'Jam',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const data = row.original
      return data && data.jamMulai && data.jamSelesai 
        ? `${data.jamMulai} - ${data.jamSelesai}`
        : '-'
    },
    meta: {
      class: {
        th: 'w-32 text-left text-sm font-semibold text-slate-500',
        td: 'text-left text-sm text-slate-800 min-w-32'
      }
    }
  },
  {
    accessorKey: 'aktivitas',
    header: 'Aktivitas',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const aktivitas = row.getValue('aktivitas') as string
      return aktivitas
    },
    meta: {
      class: {
        th: 'text-left text-sm font-semibold text-slate-500 w-80',
        td: 'text-left text-sm text-slate-800 leading-relaxed max-w-80 w-80 whitespace-normal break-words p-3'
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const status = row.getValue('status') as LogStatus
      const badgeProps = status === 'Sudah ACC' 
        ? { color: 'green' as const, class: 'bg-green-500 text-white border-green-500' }
        : { color: 'yellow' as const, class: 'bg-yellow-500 text-white border-yellow-500' }
      
      return h(
        UBadge,
        {
          ...badgeProps,
          variant: 'solid',
          size: 'sm',
          class: `text-xs font-medium px-2 py-1 ${badgeProps.class}`
        },
        () => status
      )
    },
    meta: {
      class: {
        th: 'text-center text-sm font-semibold text-slate-500 w-32',
        td: 'text-center min-w-32'
      }
    }
  },
  {
    accessorKey: 'pembimbing',
    header: 'Pembimbing',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const status = row.getValue('pembimbing') as string
      const isVerified = status === 'Lihat Verifikasi'
      const badgeProps = isVerified
        ? { color: 'blue' as const, class: 'bg-blue-500 text-white border-blue-500' }
        : { color: 'red' as const, class: 'bg-red-500 text-white border-red-500' }
      
      return h(
        UBadge,
        {
          ...badgeProps,
          variant: 'solid',
          size: 'sm',
          class: `text-xs font-medium px-2 py-1 ${badgeProps.class}`
        },
        () => isVerified ? 'Lihat Verifikasi' : 'Belum Verifikasi'
      )
    },
    meta: {
      class: {
        th: 'text-center text-sm font-semibold text-slate-500 w-36',
        td: 'text-center min-w-36'
      }
    }
  },
  {
    accessorKey: 'mitra',
    header: 'Mitra',
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const status = row.getValue('mitra') as string
      const isVerified = status === 'Lihat Verifikasi'
      const badgeProps = isVerified
        ? { color: 'blue' as const, class: 'bg-blue-500 text-white border-blue-500' }
        : { color: 'red' as const, class: 'bg-red-500 text-white border-red-500' }
      
      return h(
        UBadge,
        {
          ...badgeProps,
          variant: 'solid',
          size: 'sm',
          class: `text-xs font-medium px-2 py-1 ${badgeProps.class}`
        },
        () => isVerified ? 'Lihat Verifikasi' : 'Belum Verifikasi'
      )
    },
    meta: {
      class: {
        th: 'text-center text-sm font-semibold text-slate-500 w-36',
        td: 'text-center min-w-36'
      }
    }
  },
  {
    id: 'actions',
    header: () =>
      h(
        'div',
        { class: 'text-center text-sm font-semibold text-slate-500' },
        'Aksi'
      ),
    cell: ({ row }: { row: Row<LogbookEntry> }) => {
      const entry = row.original as LogbookEntry

      return h('div', { class: 'flex justify-center gap-1' }, [
        h(
          UButton,
          {
            size: 'sm',
            color: 'blue',
            variant: 'solid',
            class: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 px-3 py-1 text-xs',
            onClick: (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Edit button clicked for entry:', entry)
              openEdit(entry)
            }
          },
          { default: () => 'Edit' }
        ),
        h(
          UButton,
          {
            size: 'sm',
            color: 'red',
            variant: 'solid',
            class: 'bg-red-500 hover:bg-red-600 text-white border-red-500 px-3 py-1 text-xs',
            onClick: (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Delete button clicked for entry:', entry)
              openDelete(entry)
            }
          },
          { default: () => 'Hapus' }
        )
      ])
    },
    meta: {
      class: {
        th: 'text-center w-28 sticky right-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]',
        td: 'text-center sticky right-0 bg-white backdrop-blur-sm z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] min-w-28'
      }
    }
  }
]

/* ---- form add / edit ---- */
const addState = reactive<LogbookFormState>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: '',
  pembimbing: 'Belum Verifikasi',
  mitra: 'Belum Verifikasi'
})

const editState = reactive<LogbookFormState>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: '',
  pembimbing: 'Belum Verifikasi',
  mitra: 'Belum Verifikasi'
})

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selected = ref<LogbookEntry | null>(null)

// Debug watch untuk modal states
watch(isAddOpen, (val) => {
  console.log('isAddOpen changed to:', val)
})

watch(isEditOpen, (val) => {
  console.log('isEditOpen changed to:', val)
})

watch(isDeleteOpen, (val) => {
  console.log('isDeleteOpen changed to:', val)
})

watch(selected, (val) => {
  console.log('selected entry changed to:', val)
})

function openAdd() {
  console.log('Opening add modal...')
  
  // Check attendance first
  if (!hasAttendedToday.value) {
    const toast = typeof useToast === 'function' ? useToast() : null
    toast?.add({
      title: 'Absensi diperlukan',
      description: 'Anda harus absen terlebih dahulu sebelum dapat menambahkan logbook.',
      color: 'amber'
    })
    return
  }
  
  if (!canAddLogbook.value) {
    const toast = typeof useToast === 'function' ? useToast() : null
    toast?.add({
      title: 'Menunggu verifikasi',
      description: 'Absensi Anda masih menunggu verifikasi dari pembimbing.',
      color: 'blue'
    })
    return
  }
  
  // Close other modals first
  isEditOpen.value = false
  isDeleteOpen.value = false
  selected.value = null
  
  Object.assign(addState, {
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    aktivitas: '',
    pembimbing: 'Belum Verifikasi',
    mitra: 'Belum Verifikasi'
  })
  isAddOpen.value = true
  debugModal('add opened')
}

async function onAddSubmit(event: { data: LogbookFormState }) {
  const data = event.data
  const nextId = (entries.value.at(-1)?.id ?? 0) + 1

  entries.value = [
    {
      id: nextId,
      tanggal: data.tanggal ?? '',
      jamMulai: data.jamMulai ?? '',
      jamSelesai: data.jamSelesai ?? '',
      aktivitas: data.aktivitas ?? '',
      status: 'Menunggu ACC',
      pembimbing: 'Belum Verifikasi',
      mitra: 'Belum Verifikasi'
    },
    ...entries.value
  ]

  isAddOpen.value = false
  page.value = 1
}

function openEdit(entry: LogbookEntry) {
  console.log('Opening edit modal for entry:', entry)
  // Close other modals first
  isAddOpen.value = false
  isDeleteOpen.value = false
  
  selected.value = entry
  Object.assign(editState, {
    tanggal: entry.tanggal,
    jamMulai: entry.jamMulai,
    jamSelesai: entry.jamSelesai,
    aktivitas: entry.aktivitas,
    pembimbing: entry.pembimbing || 'Belum Verifikasi',
    mitra: entry.mitra || 'Belum Verifikasi'
  })
  isEditOpen.value = true
  debugModal('edit opened', entry)
}

async function onEditSubmit(event: { data: LogbookFormState }) {
  if (!selected.value) return
  const id = selected.value.id
  const data = event.data

  entries.value = entries.value.map((row) =>
    row.id === id
      ? {
          ...row,
          tanggal: data.tanggal ?? row.tanggal,
          jamMulai: data.jamMulai ?? row.jamMulai,
          jamSelesai: data.jamSelesai ?? row.jamSelesai,
          aktivitas: data.aktivitas ?? row.aktivitas,
          pembimbing: data.pembimbing ?? row.pembimbing,
          mitra: data.mitra ?? row.mitra
        }
      : row
  )

  isEditOpen.value = false
}

function openDelete(entry: LogbookEntry) {
  console.log('Opening delete modal for entry:', entry)
  // Close other modals first
  isAddOpen.value = false
  isEditOpen.value = false
  
  selected.value = entry
  isDeleteOpen.value = true
  debugModal('delete opened', entry)
}

function confirmDelete() {
  if (!selected.value) return
  entries.value = entries.value.filter((row) => row.id !== selected.value!.id)
  isDeleteOpen.value = false
}

// Attendance success handler
function onAttendanceSuccess(attendanceRecord: AttendanceRecord) {
  console.log('Attendance successful:', attendanceRecord)
  const toast = typeof useToast === 'function' ? useToast() : null
  toast?.add({
    title: 'Absensi berhasil',
    description: 'Menunggu verifikasi pembimbing untuk dapat menambah logbook.',
    color: 'green'
  })
}
</script>