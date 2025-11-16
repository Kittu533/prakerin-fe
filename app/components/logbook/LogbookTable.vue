<script setup lang="ts">
import { h, ref, computed, reactive, resolveComponent, watch } from 'vue'
import type { TableColumn, FormError, FormSubmitEvent } from '@nuxt/ui'

type LogStatus = 'Sudah ACC' | 'Menunggu ACC'

export interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  status: LogStatus
}

/* v-model entries */
const props = defineProps<{
  modelValue: LogbookEntry[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LogbookEntry[]]
}>()

const entries = computed<LogbookEntry[]>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

/* ---- table & search & pagination ---- */

const search = ref('')
const page = ref(1)
const pageSize = ref(5)

const filtered = computed(() => {
  if (!search.value) return entries.value
  const q = search.value.toLowerCase()
  return entries.value.filter((row) =>
    [
      row.tanggal,
      row.jamMulai,
      row.jamSelesai,
      row.aktivitas,
      row.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})

const totalItems = computed(() => filtered.value.length)

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch(search, () => {
  page.value = 1
})

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const columns: TableColumn<LogbookEntry>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => (page.value - 1) * pageSize.value + row.index + 1,
    meta: {
      class: {
        th: 'w-10 text-center text-[11px] font-semibold text-slate-500',
        td: 'text-center text-[12px] text-slate-700',
      },
    },
  },
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    meta: {
      class: {
        th: 'text-left text-[11px] font-semibold text-slate-500',
        td: 'text-left text-[12px] text-slate-800',
      },
    },
  },
  {
    accessorKey: 'jamMulai',
    header: 'Jam',
    cell: ({ row }) =>
      `${row.getValue('jamMulai')} - ${row.getValue('jamSelesai')} WIB`,
    meta: {
      class: {
        th: 'text-left text-[11px] font-semibold text-slate-500',
        td: 'text-left text-[12px] text-slate-800',
      },
    },
  },
  {
    accessorKey: 'aktivitas',
    header: 'Aktivitas',
    meta: {
      class: {
        th: 'text-left text-[11px] font-semibold text-slate-500',
        td: 'text-left text-[12px] text-slate-800 leading-relaxed',
      },
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as LogStatus
      const color = status === 'Sudah ACC' ? 'success' : 'warning'
      return h(
        UBadge,
        {
          color,
          variant: 'subtle',
          size: 'xs',
          class: 'text-[11px] font-medium',
        },
        () => status,
      )
    },
    meta: {
      class: {
        th: 'text-center text-[11px] font-semibold text-slate-500',
        td: 'text-center',
      },
    },
  },
  {
    id: 'actions',
    header: () =>
      h(
        'div',
        { class: 'text-right text-[11px] font-semibold text-slate-500' },
        'Aksi',
      ),
    cell: ({ row }) => {
      const entry = row.original as LogbookEntry

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(
          UButton,
          {
            size: 'xs',
            color: 'primary',
            variant: 'soft',
            onClick: () => openEdit(entry),
          },
          { default: () => 'Edit' },
        ),
        h(
          UButton,
          {
            size: 'xs',
            color: 'error',
            variant: 'soft',
            onClick: () => openDelete(entry),
          },
          { default: () => 'Hapus' },
        ),
      ])
    },
    meta: {
      class: {
        th: 'text-right w-32',
        td: 'text-right',
      },
    },
  },
]

/* ---- form add / edit ---- */

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
  aktivitas: '',
})

const editState = reactive<LogbookFormState>({
  tanggal: '',
  jamMulai: '',
  jamSelesai: '',
  aktivitas: '',
})

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selected = ref<LogbookEntry | null>(null)

function validateForm(state: Partial<LogbookFormState>): FormError[] {
  const errors: FormError[] = []
  if (!state.tanggal) errors.push({ name: 'tanggal', message: 'Tanggal wajib diisi' })
  if (!state.jamMulai) errors.push({ name: 'jamMulai', message: 'Jam mulai wajib diisi' })
  if (!state.jamSelesai) errors.push({ name: 'jamSelesai', message: 'Jam selesai wajib diisi' })
  if (!state.aktivitas) errors.push({ name: 'aktivitas', message: 'Aktivitas wajib diisi' })
  return errors
}

function openAdd() {
  addState.tanggal = ''
  addState.jamMulai = ''
  addState.jamSelesai = ''
  addState.aktivitas = ''
  isAddOpen.value = true
}

async function onAddSubmit(event: FormSubmitEvent<LogbookFormState>) {
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
    },
    ...entries.value,
  ]

  isAddOpen.value = false
  page.value = 1
}

function openEdit(entry: LogbookEntry) {
  selected.value = entry
  editState.tanggal = entry.tanggal
  editState.jamMulai = entry.jamMulai
  editState.jamSelesai = entry.jamSelesai
  editState.aktivitas = entry.aktivitas
  isEditOpen.value = true
}

async function onEditSubmit(event: FormSubmitEvent<LogbookFormState>) {
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
        }
      : row,
  )

  isEditOpen.value = false
}

function openDelete(entry: LogbookEntry) {
  selected.value = entry
  isDeleteOpen.value = true
}

function confirmDelete() {
  if (!selected.value) return
  entries.value = entries.value.filter((row) => row.id !== selected.value!.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <section class="space-y-4">
    <!-- Header + search + add -->
    <div
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <h2 class="text-sm font-semibold text-slate-800">
        Riwayat Logbook
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="search"
          size="sm"
          placeholder="Cari tanggal / aktivitas..."
          icon="i-lucide-search"
          class="w-56"
        />
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          @click="openAdd"
        >
          Tambah Logbook
        </UButton>
      </div>
    </div>

    <!-- TABLE: full white, garis halus abu -->
    <div
      class="rounded-2xl border border-slate-100 bg-white overflow-hidden"
    >
      <UTable
        :data="paginated"
        :columns="columns"
        sticky
        :ui="{
          wrapper: 'w-full',
          tr: 'border-b border-slate-100 last:border-b-0',
          th: 'bg-slate-50/60 text-[11px] font-semibold text-slate-500',
          td: 'bg-white'
        }"
      />
    </div>

    <!-- footer info + pagination -->
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500"
    >
      <p>
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
        :items-per-page="pageSize"
        :total="totalItems"
        size="sm"
        show-edges
      />
    </div>

    <!-- MODAL TAMBAH -->
    <UModal v-model:open="isAddOpen" title="Tambah Logbook">
      <template #body>
        <UForm
          :state="addState"
          :validate="validateForm"
          class="space-y-4"
          @submit="onAddSubmit"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          :validate="validateForm"
          class="space-y-4"
          @submit="onEditSubmit"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {{ selected?.tanggal }}
          </span>
          ?
        </p>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-2 w-full">
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
