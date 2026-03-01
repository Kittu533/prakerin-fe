<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      <Icon name="lucide:graduation-cap" class="w-5 h-5 text-slate-600" />
      <h3 class="font-semibold text-slate-900">Guru Pembimbing</h3>
    </div>
    <div class="p-5">
      <div class="flex items-start gap-4 mb-4">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center shrink-0">
          <Icon name="lucide:user" class="w-7 h-7 text-purple-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-slate-900 text-lg">{{ placement?.guru?.nama_guru || '-' }}</h4>
          <p class="text-sm text-slate-500">Guru Pembimbing PKL</p>
        </div>
      </div>

      <div class="space-y-2">
        <div v-if="placement?.guru?.nip" class="flex items-center gap-3 text-sm">
          <Icon name="lucide:badge" class="w-4 h-4 text-slate-400" />
          <span class="text-slate-600">NIP: {{ placement.guru.nip }}</span>
        </div>
        <div v-if="placement?.guru?.email" class="flex items-center gap-3 text-sm">
          <Icon name="lucide:mail" class="w-4 h-4 text-slate-400" />
          <span class="text-slate-600 truncate">{{ placement.guru.email }}</span>
        </div>
        <div v-if="placement?.guru?.no_hp" class="flex items-center gap-3 text-sm">
          <Icon name="lucide:phone" class="w-4 h-4 text-slate-400" />
          <span class="text-slate-600">{{ placement.guru.no_hp }}</span>
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

defineProps<Props>()
</script>
