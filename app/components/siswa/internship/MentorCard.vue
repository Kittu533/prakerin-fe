<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="lucide:users" class="w-5 h-5 text-slate-600" />
        <h3 class="font-semibold text-slate-900">Mentor Perusahaan</h3>
      </div>
      <UBadge color="primary" variant="subtle" size="sm">PIC</UBadge>
    </div>
    <div class="p-5 space-y-4">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
          <Icon name="lucide:user" class="w-7 h-7 text-amber-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-slate-900 text-lg">{{ placement?.mentor?.nama || '-' }}</h4>
          <p class="text-sm text-slate-500">{{ placement?.mentor?.jabatan || 'Mentor PKL' }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div v-if="placement?.mentor?.email" class="flex items-start gap-3">
          <Icon name="lucide:mail" class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-xs text-slate-500">Email</p>
            <p class="text-sm text-slate-900 truncate">{{ placement.mentor.email }}</p>
          </div>
        </div>
        <div v-if="placement?.mentor?.no_hp" class="flex items-start gap-3">
          <Icon name="lucide:phone" class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-xs text-slate-500">WhatsApp</p>
            <p class="text-sm text-slate-900 truncate">{{ placement.mentor.no_hp }}</p>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          v-if="placement?.mentor?.no_hp"
          variant="soft"
          color="success"
          size="sm"
          class="flex-1"
          @click="openWhatsApp"
        >
          <Icon name="lucide:message-circle" class="w-4 h-4 mr-2" />
          WhatsApp
        </UButton>
        <UButton
          v-if="placement?.mentor?.email"
          variant="soft"
          color="primary"
          size="sm"
          class="flex-1"
          @click="sendEmail"
        >
          <Icon name="lucide:mail" class="w-4 h-4 mr-2" />
          Email
        </UButton>
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

function openWhatsApp() {
  if (!props.placement?.mentor?.no_hp) return
  const cleanPhone = props.placement.mentor.no_hp.replace(/\D/g, '')
  window.open(`https://wa.me/${cleanPhone}`, '_blank')
}

function sendEmail() {
  if (!props.placement?.mentor?.email) return
  window.location.href = `mailto:${props.placement.mentor.email}`
}
</script>
