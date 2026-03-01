<template>
  <div class="space-y-4">
    <!-- Success Banner -->
    <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon name="lucide:badge-check" class="w-7 h-7 text-white" />
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1">Anda Sudah Ditempatkan!</h2>
          <p class="text-emerald-100 text-sm">
            Selamat menjalani PKL di {{ placement?.perusahaan?.nama_perusahaan || 'perusahaan mitra' }}. Semoga mendapatkan pengalaman yang bermanfaat.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Info Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon name="lucide:building" class="w-4 h-4 text-blue-600" />
          </div>
          <span class="text-xs text-slate-500">Perusahaan</span>
        </div>
        <p class="font-semibold text-slate-900 text-sm truncate">{{ placement?.perusahaan?.nama_perusahaan || '-' }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Icon name="lucide:calendar" class="w-4 h-4 text-green-600" />
          </div>
          <span class="text-xs text-slate-500">Mulai</span>
        </div>
        <p class="font-semibold text-slate-900 text-sm">{{ formatDate(placement?.tanggal_mulai) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Icon name="lucide:user" class="w-4 h-4 text-amber-600" />
          </div>
          <span class="text-xs text-slate-500">Mentor</span>
        </div>
        <p class="font-semibold text-slate-900 text-sm truncate">{{ placement?.mentor?.nama || '-' }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Icon name="lucide:graduation-cap" class="w-4 h-4 text-purple-600" />
          </div>
          <span class="text-xs text-slate-500">Pembimbing</span>
        </div>
        <p class="font-semibold text-slate-900 text-sm truncate">{{ placement?.guru?.nama_guru || '-' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlacementData } from './types'

interface Props {
  placement: PlacementData | null
}

defineProps<Props>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
