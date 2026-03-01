<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      <Icon name="lucide:calendar-days" class="w-5 h-5 text-slate-600" />
      <h3 class="font-semibold text-slate-900">Jadwal PKL</h3>
    </div>
    <div class="p-5">
      <div class="space-y-4">
        <!-- Tahun Ajaran -->
        <div>
          <p class="text-xs text-slate-500 mb-1">Tahun Ajaran</p>
          <p class="font-medium text-slate-900">{{ placement?.tahun_ajaran?.nama_tahun_ajaran || '-' }}</p>
        </div>

        <!-- Tanggal -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-500 mb-1">Tanggal Mulai</p>
            <p class="font-medium text-slate-900">{{ formatDate(placement?.tanggal_mulai) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 mb-1">Tanggal Selesai</p>
            <p class="font-medium text-slate-900">{{ formatDate(placement?.tanggal_selesai) }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-500">Progress</span>
            <span class="font-medium text-slate-900">{{ progress }}%</span>
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {{ daysElapsed }} dari {{ totalDays }} hari PKL
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlacementData } from './types'

interface Props {
  placement: PlacementData | null
}

const props = defineProps<Props>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const totalDays = computed(() => {
  if (!props.placement?.tanggal_mulai || !props.placement?.tanggal_selesai) return 180
  const start = new Date(props.placement.tanggal_mulai)
  const end = new Date(props.placement.tanggal_selesai)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

const daysElapsed = computed(() => {
  if (!props.placement?.tanggal_mulai) return 0
  const start = new Date(props.placement.tanggal_mulai)
  const today = new Date()
  return Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
})

const progress = computed(() => {
  if (totalDays.value === 0) return 0
  return Math.min(100, Math.round((daysElapsed.value / totalDays.value) * 100))
})
</script>
