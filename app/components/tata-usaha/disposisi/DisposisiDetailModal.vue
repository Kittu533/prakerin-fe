<script setup lang="ts">
import type { Disposisi, DisposisiStatus } from "~/composables/api/use-disposisi";

const props = defineProps<{
  open: boolean;
  disposisi: Disposisi | null;
  formatDate: (value?: string | null) => string;
  getStatusColor: (value: string) => string;
  getPrioritasColor: (value: string) => string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  setStatus: [disposisi: Disposisi, status: DisposisiStatus];
}>();

function closeModal() {
  emit("update:open", false);
}

function emitStatus(status: DisposisiStatus) {
  if (!props.disposisi) return;
  emit("setStatus", props.disposisi, status);
}
</script>

<template>
  <UModal
    :open="open"
    title="Detail Disposisi"
    description="Informasi lengkap disposisi surat yang sedang dipilih."
    :ui="{ content: 'w-[calc(100vw-2rem)] max-w-5xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div v-if="disposisi" class="space-y-5 p-4 sm:p-6">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div
            class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Surat Terkait
              </p>
              <h3 class="text-lg font-bold text-slate-900">
                {{ disposisi.surat_masuk?.nomor_surat || "-" }}
              </h3>
              <p class="text-sm text-slate-600">
                {{ disposisi.surat_masuk?.asal_surat || "-" }}
              </p>
              <p class="text-sm text-slate-500">
                {{ disposisi.surat_masuk?.perihal || "-" }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                :color="getPrioritasColor(disposisi.prioritas)"
                variant="subtle"
                size="sm"
              >
                {{ disposisi.prioritas_label }}
              </UBadge>
              <UBadge
                :color="getStatusColor(disposisi.status)"
                variant="subtle"
                size="sm"
              >
                {{ disposisi.status_label }}
              </UBadge>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tanggal Disposisi
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ formatDate(disposisi.tanggal_disposisi) }}
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Batas Waktu
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ disposisi.batas_waktu ? formatDate(disposisi.batas_waktu) : "-" }}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-slate-700">
            Penerima Disposisi
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="penerima in disposisi.penerima_disposisi"
              :key="penerima"
              color="neutral"
              variant="soft"
              size="sm"
            >
              {{ penerima }}
            </UBadge>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-slate-700">
            Instruksi
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="instruksi in disposisi.instruksi_labels"
              :key="instruksi"
              color="info"
              variant="subtle"
              size="sm"
            >
              {{ instruksi }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="disposisi.instruksi_tambahan"
          class="rounded-2xl border border-slate-200 p-4"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Catatan Tambahan
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-700">
            {{ disposisi.instruksi_tambahan }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="disposisi && disposisi.status !== 'sedang_diproses'"
            color="warning"
            variant="soft"
            @click="emitStatus('sedang_diproses')"
          >
            Proseskan
          </UButton>
          <UButton
            v-if="disposisi && disposisi.status !== 'selesai'"
            color="success"
            variant="soft"
            @click="emitStatus('selesai')"
          >
            Tandai Selesai
          </UButton>
          <UButton
            v-if="disposisi && disposisi.status !== 'dibatalkan'"
            color="error"
            variant="soft"
            @click="emitStatus('dibatalkan')"
          >
            Batalkan
          </UButton>
        </div>

        <UButton
          variant="soft"
          color="neutral"
          @click="closeModal"
        >
          Tutup
        </UButton>
      </div>
    </template>
  </UModal>
</template>
