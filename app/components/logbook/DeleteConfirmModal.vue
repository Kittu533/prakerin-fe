<script setup lang="ts">
interface LogbookEntry {
  id: number
  tanggal: string
  jamMulai: string
  jamSelesai: string
  aktivitas: string
  status: string
}

interface Props {
  isOpen: boolean
  entry: LogbookEntry | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleClose() {
  emit('update:isOpen', false)
}

function handleConfirm() {
  emit('confirm')
  handleClose()
}
</script>

<template>
  <UModal :model-value="isOpen" title="Hapus Logbook" @update:model-value="handleClose">
    <template #body>
      <p class="text-sm text-slate-600">
        Apakah Anda yakin ingin menghapus logbook tanggal
        <span class="font-semibold text-slate-800">
          {{ entry?.tanggal }}
        </span>
        ?
      </p>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-2 w-full">
        <UButton
          color="gray"
          variant="outline"
          size="sm"
          @click="close"
        >
          Batal
        </UButton>
        <UButton
          color="red"
          size="sm"
          @click="handleConfirm"
        >
          Hapus
        </UButton>
      </div>
    </template>
  </UModal>
</template>