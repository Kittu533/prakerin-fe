<template>
  <div class="space-y-4">
    <!-- Status Banner -->
    <div :class="[
      'rounded-2xl p-6 text-white shadow-lg',
      isRejected
        ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200'
        : 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200'
    ]">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon :name="isRejected ? 'lucide:x-circle' : 'lucide:clock'" class="w-7 h-7 text-white" />
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1">
            {{ isRejected ? 'Pengajuan Ditolak' : 'Pengajuan Sedang Diproses' }}
          </h2>
          <p class="text-white/80 text-sm">
            {{ isRejected
              ? 'Maaf, pengajuan PKL Anda ditolak oleh admin. Silakan ajukan kembali dengan perusahaan lain.'
              : 'Pengajuan Anda sedang ditinjau dan diverifikasi oleh admin. Mohon tunggu informasi selanjutnya.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Application Detail Card -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">Detail Pengajuan</h3>
        <UBadge :color="statusBadgeColor" variant="subtle" size="sm">
          {{ formattedStatus }}
        </UBadge>
      </div>
      <div class="p-5 space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-500 mb-1">Perusahaan</p>
            <p class="text-sm font-medium text-slate-900">{{ application?.perusahaan?.nama_perusahaan || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Alamat</p>
            <p class="text-sm text-slate-900">{{ application?.perusahaan?.alamat || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Bidang Usaha</p>
            <p class="text-sm text-slate-900">{{ application?.perusahaan?.bidang_usaha || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Tanggal Pengajuan</p>
            <p class="text-sm text-slate-900">{{ formatDate(application?.tanggal_pengajuan) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Jalur Pengajuan</p>
            <p class="text-sm text-slate-900">{{ application?.is_mandiri ? 'Mandiri (Perusahaan Sendiri)' : 'Mitra Sekolah' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Tahun Ajaran</p>
            <p class="text-sm text-slate-900">{{ tahunAjaranName || '-' }}</p>
          </div>
        </div>

        <!-- Rejection Reason -->
        <div v-if="isRejected && application?.catatan" class="bg-red-50 rounded-xl p-4 border border-red-200">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-red-900">Alasan Penolakan</p>
              <p class="text-sm text-red-700 mt-1">{{ application.catatan }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Progress -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="bg-slate-50 px-5 py-3 border-b border-slate-200">
        <h3 class="font-semibold text-slate-900">Progress Pengajuan</h3>
      </div>
      <div class="p-5">
        <div class="flex items-center gap-2 overflow-x-auto pb-2">
          <template v-for="(step, i) in timelineSteps" :key="i">
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all" :class="step.class">
                <Icon v-if="step.done" name="lucide:check" class="w-5 h-5" />
                <Icon v-else-if="step.current" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-sm font-medium whitespace-nowrap hidden sm:inline" :class="step.done || step.current ? 'text-slate-900' : 'text-slate-400'">{{ step.label }}</span>
            </div>
            <div v-if="i < timelineSteps.length - 1" class="w-12 sm:w-20 h-1 shrink-0 transition-all" :class="step.done ? 'bg-emerald-500' : 'bg-slate-200'" />
          </template>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="flex justify-end">
      <UButton
        v-if="isRejected"
        color="primary"
        size="lg"
        @click="$emit('retry')"
      >
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
        Ajukan Ulang
      </UButton>
      <UButton
        v-else
        color="neutral"
        variant="outline"
        size="lg"
        disabled
      >
        <Icon name="lucide:clock" class="w-4 h-4 mr-2" />
        Menunggu Proses...
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApplicationData, TimelineStep } from './types'

interface Props {
  application: ApplicationData | null
  tahunAjaranName?: string | null
}

const props = defineProps<Props>()

defineEmits<{
  retry: []
}>()

const isRejected = computed(() => {
  return props.application?.status_pengajuan?.toLowerCase() === 'ditolak'
})

const formattedStatus = computed(() => {
  const status = props.application?.status_pengajuan?.toLowerCase()
  const statusMap: Record<string, string> = {
    'menunggu': 'Menunggu Verifikasi',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak'
  }
  return statusMap[status || ''] || props.application?.status_pengajuan || '-'
})

const statusBadgeColor = computed(() => {
  const status = props.application?.status_pengajuan?.toLowerCase()
  if (status === 'disetujui') return 'success'
  if (status === 'menunggu') return 'warning'
  if (status === 'ditolak') return 'error'
  return 'neutral'
})

const timelineSteps = computed((): TimelineStep[] => {
  const status = props.application?.status_pengajuan?.toLowerCase()

  return [
    {
      label: 'Diajukan',
      done: true,
      current: false,
      class: 'bg-emerald-100 text-emerald-600'
    },
    {
      label: 'Verifikasi',
      done: status === 'disetujui' || status === 'ditolak',
      current: status === 'menunggu',
      class: status === 'menunggu'
        ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-500 ring-offset-2'
        : status === 'ditolak'
          ? 'bg-red-100 text-red-600'
          : 'bg-emerald-100 text-emerald-600'
    },
    {
      label: status === 'disetujui' ? 'Diterima' : status === 'ditolak' ? 'Ditolak' : 'Keputusan',
      done: status === 'disetujui' || status === 'ditolak',
      current: false,
      class: status === 'disetujui'
        ? 'bg-emerald-100 text-emerald-600'
        : status === 'ditolak'
          ? 'bg-red-100 text-red-600'
          : 'bg-slate-100 text-slate-400'
    }
  ]
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
