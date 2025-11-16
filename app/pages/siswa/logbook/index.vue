<script setup lang="ts">
import { h, reactive, ref, resolveComponent } from 'vue'
import type { TableColumn, FormError, FormSubmitEvent } from '@nuxt/ui'
import AppDataTable from '~/components/common/AppDataTable.vue'

definePageMeta({
  layout: 'siswa',
  title: 'Logbook'
})

type LogStatus = 'Sudah ACC' | 'Menunggu ACC'

interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  status: LogStatus
}

const profile = {
  nama: 'RYOBI SURYA ATMAJA',
  nim: '5220311063',
  fakultas: 'Sains & Teknologi',
  prodi: 'Sistem Informasi Sarjana'
}

const logbook = ref<LogbookEntry[]>([
  {
    id: 1,
    tanggal: '16/11/2025',
    jamMulai: '09:00',
    jamSelesai: '12:00',
    aktivitas:
      'Briefing awal bersama pembimbing dan penjelasan aturan kerja di perusahaan.',
    status: 'Sudah ACC'
  },
  {
    id: 2,
    tanggal: '17/11/2025',
    jamMulai: '08:30',
    jamSelesai: '12:00',
    aktivitas:
      'Setup environment pengembangan (Git, VS Code, akses repository) dan testing koneksi.',
    status: 'Sudah ACC'
  },
  {
    id: 3,
    tanggal: '18/11/2025',
    jamMulai: '09:00',
    jamSelesai: '15:00',
    aktivitas:
      'Menganalisis modul logbook lama dan membuat draft perbaikan alur input aktivitas.',
    status: 'Menunggu ACC'
  },
  {
    id: 4,
    tanggal: '19/11/2025',
    jamMulai: '09:00',
    jamSelesai: '14:30',
    aktivitas:
      'Implementasi halaman daftar logbook dan ujicoba pagination pada sisi front-end.',
    status: 'Menunggu ACC'
  }
])

/* ---------- Kolom tabel (TanStack) ---------- */

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const columns: TableColumn<LogbookEntry>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => row.index + 1,
    meta: {
      class: {
        th: 'text-center w-10',
        td: 'text-center'
      }
    }
  },
  {
    accessorKey: 'tanggal',
    header: 'Tanggal'
  },
  {
    accessorKey: 'jamMulai',
    header: 'Jam',
    cell: ({ row }) =>
      `${row.original.jamMulai} - ${row.original.jamSelesai} WIB`
  },
  {
    accessorKey: 'aktivitas',
    header: 'Aktivitas',
    meta: {
      class: {
        td: 'leading-relaxed'
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const color = status === 'Sudah ACC' ? 'success' : 'warning'
      return h(
        UBadge,
        {
          color,
          variant: 'subtle',
          size: 'xs',
          class: 'text-[11px] font-medium'
        },
        () => status
      )
    },
    meta: {
      class: {
        th: 'text-center',
        td: 'text-center'
      }
    }
  },
  {
    id: 'actions', // <- kolom aksi, otomatis di-freeze/ sticky di AppDataTable
    header: 'Aksi',
    meta: {
      class: {
        th: 'text-right w-32',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const entry = row.original
      return h(
        'div',
        { class: 'flex justify-end gap-2' },
        [
          h(
            UButton,
            {
              size: 'xs',
              color: 'primary',
              variant: 'soft',
              onClick: () => openEdit(entry)
            },
            { default: () => 'Edit' }
          ),
          h(
            UButton,
            {
              size: 'xs',
              color: 'error',
              variant: 'soft',
              onClick: () => openDelete(entry)
            },
            { default: () => 'Hapus' }
          )
        ]
      )
    }
  }
]

/* ---------- Form & Modal Add / Edit / Delete ---------- */

interface LogbookFormState {
  tanggal?: string
  jamMulai?: string
  jamSelesai?: string
  aktivitas?: string
}

const addState = reactive<LogbookFormState>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: ''
})

const editState = reactive<LogbookFormState>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: ''
})

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedEntry = ref<LogbookEntry | null>(null)

function validateLogbook(state: Partial<LogbookFormState>): FormError[] {
  const errors: FormError[] = []
  if (!state.tanggal) errors.push({ name: 'tanggal', message: 'Tanggal wajib diisi' })
  if (!state.jamMulai) errors.push({ name: 'jamMulai', message: 'Jam mulai wajib diisi' })
  if (!state.jamSelesai) errors.push({ name: 'jamSelesai', message: 'Jam selesai wajib diisi' })
  if (!state.aktivitas) errors.push({ name: 'aktivitas', message: 'Aktivitas wajib diisi' })
  return errors
}

const openAdd = () => {
  addState.tanggal = ''
  addState.jamMulai = ''
  addState.jamSelesai = ''
  addState.aktivitas = ''
  isAddOpen.value = true
}

const onAddSubmit = (event: FormSubmitEvent<LogbookFormState>) => {
  const data = event.data
  const nextId = (logbook.value.at(-1)?.id ?? 0) + 1
  logbook.value = [
    {
      id: nextId,
      tanggal: data.tanggal ?? '',
      jamMulai: data.jamMulai ?? '',
      jamSelesai: data.jamSelesai ?? '',
      aktivitas: data.aktivitas ?? '',
      status: 'Menunggu ACC'
    },
    ...logbook.value
  ]
  isAddOpen.value = false
}

const openEdit = (entry: LogbookEntry) => {
  selectedEntry.value = entry
  editState.tanggal = entry.tanggal
  editState.jamMulai = entry.jamMulai
  editState.jamSelesai = entry.jamSelesai
  editState.aktivitas = entry.aktivitas
  isEditOpen.value = true
}

const onEditSubmit = (event: FormSubmitEvent<LogbookFormState>) => {
  if (!selectedEntry.value) return
  const id = selectedEntry.value.id
  const data = event.data

  logbook.value = logbook.value.map((row) =>
    row.id === id
      ? {
          ...row,
          tanggal: data.tanggal ?? row.tanggal,
          jamMulai: data.jamMulai ?? row.jamMulai,
          jamSelesai: data.jamSelesai ?? row.jamSelesai,
          aktivitas: data.aktivitas ?? row.aktivitas
        }
      : row
  )

  isEditOpen.value = false
}

const openDelete = (entry: LogbookEntry) => {
  selectedEntry.value = entry
  isDeleteOpen.value = true
}

const confirmDelete = () => {
  if (!selectedEntry.value) return
  logbook.value = logbook.value.filter(
    (row) => row.id !== selectedEntry.value!.id
  )
  isDeleteOpen.value = false
}
</script>

<template>
  <section
    class="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-[32px] bg-white px-3 py-4 sm:px-6 md:px-8 sm:py-6 shadow-sm"
  >
    <!-- Breadcrumb -->
    <div class="text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-primary-600">Home</NuxtLink>
      <span class="mx-1">›</span>
      <span class="font-medium text-slate-700">Logbook</span>
    </div>

    <!-- Informasi diri -->
    <div class="space-y-4">
      <header>
        <h1 class="text-lg font-semibold text-slate-800">
          Logbook Mahasiswa
        </h1>
        <p class="mt-1 text-xs text-slate-500">
          Catat aktivitas harian prakerin / PKL Anda dengan rapi dan terstruktur.
        </p>
      </header>

      <div
        class="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/60"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-[11px] sm:text-[12px]">
            <tbody>
              <tr class="bg-slate-50">
                <td class="w-32 sm:w-52 px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-slate-600">
                  Nama Lengkap
                </td>
                <td class="w-4 sm:w-6 text-center text-slate-400">:</td>
                <td
                  class="px-3 sm:px-4 py-2 sm:py-2.5 font-semibold uppercase tracking-wide text-slate-800"
                >
                  {{ profile.nama }}
                </td>
              </tr>
              <tr>
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-slate-600">NIM</td>
                <td class="text-center text-slate-400">:</td>
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-700">
                  {{ profile.nim }}
                </td>
              </tr>
              <tr class="bg-slate-50">
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-slate-600">
                  Fakultas
                </td>
                <td class="text-center text-slate-400">:</td>
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-700">
                  {{ profile.fakultas }}
                </td>
              </tr>
              <tr>
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-slate-600">
                  Program Studi
                </td>
                <td class="text-center text-slate-400">:</td>
                <td class="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-700">
                  {{ profile.prodi }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TABEL UMUM -->
    <AppDataTable
      :items="logbook"
      :columns="columns"
      title="Riwayat Logbook"
      description="Data aktivitas harian selama pelaksanaan prakerin."
      :page-size="5"
      :searchable="true"
      search-placeholder="Cari tanggal / aktivitas..."
      :search-keys="['tanggal', 'jamMulai', 'jamSelesai', 'aktivitas', 'status']"
    >
      <template #toolbar-right>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          @click="openAdd"
        >
          Tambah Logbook
        </UButton>
      </template>
    </AppDataTable>

    <!-- MODAL TAMBAH -->
    <UModal v-model:open="isAddOpen" title="Tambah Logbook">
      <template #body>
        <UForm
          :state="addState"
          :validate="validateLogbook"
          class="space-y-4"
          @submit="onAddSubmit"
        >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <UFormField label="Tanggal" name="tanggal">
              <UInput v-model="addState.tanggal" type="date" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Jam Mulai" name="jamMulai">
                <UInput v-model="addState.jamMulai" placeholder="08:00" />
              </UFormField>
              <UFormField label="Jam Selesai" name="jamSelesai">
                <UInput v-model="addState.jamSelesai" placeholder="16:00" />
              </UFormField>
            </div>
          </div>

          <UFormField label="Aktivitas" name="aktivitas">
            <UTextarea
              v-model="addState.aktivitas"
              :rows="4"
              placeholder="Tuliskan ringkasan aktivitas yang Anda kerjakan..."
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              @click="isAddOpen = false"
            >
              Batal
            </UButton>
            <UButton type="submit" color="primary">
              Simpan
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- MODAL EDIT -->
    <UModal v-model:open="isEditOpen" title="Edit Logbook">
      <template #body>
        <UForm
          :state="editState"
          :validate="validateLogbook"
          class="space-y-4"
          @submit="onEditSubmit"
        >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <UFormField label="Tanggal" name="tanggal">
              <UInput v-model="editState.tanggal" type="date" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Jam Mulai" name="jamMulai">
                <UInput v-model="editState.jamMulai" />
              </UFormField>
              <UFormField label="Jam Selesai" name="jamSelesai">
                <UInput v-model="editState.jamSelesai" />
              </UFormField>
            </div>
          </div>

          <UFormField label="Aktivitas" name="aktivitas">
            <UTextarea v-model="editState.aktivitas" :rows="4" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              @click="isEditOpen = false"
            >
              Batal
            </UButton>
            <UButton type="submit" color="primary">
              Simpan Perubahan
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- MODAL HAPUS -->
    <UModal v-model:open="isDeleteOpen" title="Hapus Logbook">
      <template #body>
        <p class="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus logbook tanggal
          <span class="font-semibold text-slate-800">
            {{ selectedEntry?.tanggal }}
          </span>
          ?
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            @click="close"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            size="sm"
            @click="confirmDelete"
          >
            Hapus
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>
