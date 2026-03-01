<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="lucide:building-2" class="w-5 h-5 text-slate-600" />
        <h3 class="font-semibold text-slate-900">Perusahaan</h3>
      </div>
      <UBadge color="success" variant="subtle" size="sm">Aktif</UBadge>
    </div>
    <div class="p-5 space-y-4">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
          <Icon name="lucide:building" class="w-7 h-7 text-blue-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-slate-900 text-lg">{{ placement?.perusahaan?.nama_perusahaan || '-' }}</h4>
          <p class="text-sm text-slate-500 truncate">{{ placement?.perusahaan?.bidang_usaha || '-' }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <Icon name="lucide:map-pin" class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p class="text-xs text-slate-500">Alamat</p>
            <p class="text-sm text-slate-900">{{ placement?.perusahaan?.alamat || '-' }}</p>
          </div>
        </div>
        <div v-if="placement?.perusahaan?.no_hp" class="flex items-start gap-3">
          <Icon name="lucide:phone" class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p class="text-xs text-slate-500">Telepon</p>
            <p class="text-sm text-slate-900">{{ placement.perusahaan.no_hp }}</p>
          </div>
        </div>
      </div>

      <UButton
        v-if="hasLocation"
        variant="soft"
        color="neutral"
        size="sm"
        class="w-full"
        @click="openMap"
      >
        <Icon name="lucide:map" class="w-4 h-4 mr-2" />
        Lihat Lokasi di Map
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlacementData } from './types'

interface Props {
  placement: PlacementData | null
}

const props = defineProps<Props>()

const hasLocation = computed(() => {
  return !!(props.placement?.perusahaan?.latitude && props.placement?.perusahaan?.longitude)
})

function openMap() {
  if (!props.placement?.perusahaan?.latitude || !props.placement?.perusahaan?.longitude) return
  const lat = props.placement.perusahaan.latitude
  const lng = props.placement.perusahaan.longitude
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
}
</script>
