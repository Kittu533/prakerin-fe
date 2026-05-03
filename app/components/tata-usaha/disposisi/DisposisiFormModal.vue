<script setup lang="ts">
import type {
  DisposisiFormMeta,
  DisposisiInstruksi,
  DisposisiPrioritas,
} from "~/composables/api/use-disposisi";

interface SuratMasukSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface ManagementOption {
  id: string;
  name: string;
  role: string;
}

interface DisposisiFormModel {
  surat_masuk_id: string;
  tanggal_disposisi: string;
  penerima_disposisi_ids: string[];
  instruksi: DisposisiInstruksi[];
  instruksi_tambahan: string;
  batas_waktu: string;
  prioritas: DisposisiPrioritas;
}

const props = defineProps<{
  open: boolean;
  isEditing: boolean;
  saving: boolean;
  form: DisposisiFormModel;
  formMeta: DisposisiFormMeta;
  suratMasukSelectOptions: SuratMasukSelectOption[];
  managementList: ManagementOption[];
  selectedRecipientNames: string[];
  formError: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  toggleRecipient: [id: string];
  toggleInstruksi: [value: string];
  save: [];
}>();

const title = computed(() =>
  props.isEditing ? "Edit Disposisi" : "Buat Disposisi Baru",
);

const description = computed(() =>
  props.isEditing
    ? "Perbarui penerima, instruksi, dan prioritas disposisi surat."
    : "Lengkapi formulir disposisi untuk meneruskan surat masuk ke pihak terkait.",
);

function isInstruksiSelected(value: string) {
  return props.form.instruksi.includes(value as DisposisiInstruksi);
}
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :ui="{ content: 'w-[calc(100vw-2rem)] max-w-6xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="w-full space-y-6 p-4 sm:p-6">
        <UAlert
          v-if="formError"
          color="error"
          variant="soft"
          icon="lucide:circle-alert"
          :description="formError"
        />

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <UFormField label="Surat masuk" class="w-full">
            <USelectMenu
              v-model="form.surat_masuk_id"
              :items="suratMasukSelectOptions"
              value-key="value"
              placeholder="Pilih surat masuk"
              size="lg"
              class="w-full"
              :disabled="isEditing"
            />
          </UFormField>

          <UFormField label="Tanggal disposisi" class="w-full">
            <UInput
              v-model="form.tanggal_disposisi"
              type="date"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <UFormField label="Batas waktu" class="w-full">
            <UInput
              v-model="form.batas_waktu"
              type="date"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Prioritas" class="w-full">
            <USelectMenu
              v-model="form.prioritas"
              :items="formMeta.prioritas_options"
              value-key="value"
              size="lg"
              placeholder="Pilih prioritas"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="space-y-2">
              <p class="text-sm font-semibold text-slate-700">
                Penerima disposisi
              </p>
              <p class="text-sm text-slate-500">
                Pilih penerima dari daftar manajemen sekolah.
              </p>
            </div>

            <div
              class="mt-4 grid max-h-[360px] grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 lg:grid-cols-2"
            >
              <div
                v-for="staff in managementList"
                :key="staff.id"
                class="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                @click="emit('toggleRecipient', staff.id)"
              >
                <input
                  type="checkbox"
                  :checked="form.penerima_disposisi_ids.includes(staff.id)"
                  @change.stop="emit('toggleRecipient', staff.id)"
                  @click.stop
                  class="h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <div class="flex min-w-0 flex-col">
                  <span class="truncate text-sm font-bold text-slate-800">
                    {{ staff.name }}
                  </span>
                  <div
                    class="flex items-center gap-1.5 text-xs font-medium text-sky-600"
                  >
                    <Icon
                      name="lucide:user-cog"
                      class="h-3.5 w-3.5"
                    />
                    <span class="truncate">{{ staff.role }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="managementList.length === 0"
                class="px-3 py-2 text-xs text-slate-500"
              >
                Data manajemen belum tersedia.
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
              <p class="text-sm font-semibold text-slate-700">
                Penerima terpilih
              </p>
              <div class="mt-3 flex min-h-16 flex-wrap gap-2">
                <UBadge
                  v-for="penerima in selectedRecipientNames"
                  :key="penerima"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ penerima }}
                </UBadge>
                <p
                  v-if="form.penerima_disposisi_ids.length === 0"
                  class="text-sm text-slate-400"
                >
                  Belum ada penerima yang dipilih.
                </p>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="mb-3 text-sm font-semibold text-slate-700">
                Instruksi disposisi
              </p>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  v-for="option in formMeta.instruksi_options"
                  :key="option.value"
                  type="button"
                  class="flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition"
                  :class="
                    isInstruksiSelected(option.value)
                      ? 'border-sky-300 bg-sky-50 text-sky-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  "
                  @click="emit('toggleInstruksi', option.value)"
                >
                  <span class="font-medium">
                    {{ option.label }}
                  </span>
                  <Icon
                    :name="
                      isInstruksiSelected(option.value)
                        ? 'lucide:check-circle-2'
                        : 'lucide:circle'
                    "
                    class="h-4 w-4"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <UFormField label="Instruksi tambahan" class="w-full">
          <UTextarea
            v-model="form.instruksi_tambahan"
            :rows="4"
            placeholder="Catatan tambahan untuk penerima disposisi..."
            class="w-full"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          variant="soft"
          color="neutral"
          @click="emit('update:open', false)"
        >
          Batal
        </UButton>
        <UButton
          color="primary"
          class="bg-sky-600 font-semibold hover:bg-sky-700"
          :loading="saving"
          @click="emit('save')"
        >
          {{ isEditing ? "Simpan Perubahan" : "Simpan Disposisi" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
