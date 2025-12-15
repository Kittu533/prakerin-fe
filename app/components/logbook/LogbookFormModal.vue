<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

interface LogbookFormState {
  tanggal?: string
  jamMulai?: string
  jamSelesai?: string
  aktivitas?: string
}

interface Props {
  isOpen: boolean
  title: string
  state: LogbookFormState
  submitText?: string
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', event: FormSubmitEvent<LogbookFormState>): void
}

const props = withDefaults(defineProps<Props>(), {
  submitText: 'Simpan'
})

const emit = defineEmits<Emits>()

function validateForm(state: Partial<LogbookFormState>): FormError[] {
  const errors: FormError[] = []
  if (!state.tanggal) errors.push({ name: 'tanggal', message: 'Tanggal wajib diisi' })
  if (!state.jamMulai) errors.push({ name: 'jamMulai', message: 'Jam mulai wajib diisi' })
  if (!state.jamSelesai) errors.push({ name: 'jamSelesai', message: 'Jam selesai wajib diisi' })
  if (!state.aktivitas) errors.push({ name: 'aktivitas', message: 'Aktivitas wajib diisi' })
  return errors
}

function handleClose() {
  emit('update:isOpen', false)
}

function handleSubmit(event: FormSubmitEvent<LogbookFormState>) {
  emit('submit', event)
}
</script>

<template>
  <UModal :model-value="isOpen" :title="title" @update:model-value="handleClose">
    <template #body>
      <UForm
        :state="state"
        :validate="validateForm"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Tanggal" name="tanggal">
            <UInput v-model="state.tanggal" type="date" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Jam Mulai" name="jamMulai">
              <UInput v-model="state.jamMulai" placeholder="08:00" />
            </UFormField>
            <UFormField label="Jam Selesai" name="jamSelesai">
              <UInput v-model="state.jamSelesai" placeholder="16:00" />
            </UFormField>
          </div>
        </div>

        <UFormField label="Aktivitas" name="aktivitas">
          <UTextarea
            v-model="state.aktivitas"
            :rows="4"
            placeholder="Tuliskan ringkasan aktivitas yang Anda kerjakan..."
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            type="button"
            color="gray"
            variant="outline"
            @click="handleClose"
          >
            Batal
          </UButton>
          <UButton type="submit" color="primary">
            {{ submitText }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>