<template>
  <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="p-4 sm:p-5" :class="bgColorClass">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl shrink-0" :class="iconBgClass">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span :class="statusClass" class="rounded-full px-3 py-1 text-xs font-semibold shrink-0">
          {{ status }}
        </span>
      </div>
      <h3 class="text-base sm:text-lg font-bold text-slate-800 truncate">{{ name }}</h3>
      <p class="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{{ description }}</p>
    </div>
    
    <!-- Footer -->
    <div class="px-4 sm:px-5 py-3 sm:py-4 bg-white border-t border-slate-100 space-y-3">
      <div class="flex items-center justify-between text-xs sm:text-sm text-slate-600">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="iconColorClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ uploadDate }}</span>
        </div>
        <span class="font-medium">{{ fileSize }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <button 
          :disabled="status === 'Belum Upload'"
          class="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Lihat</span>
        </button>
        <button 
          :disabled="status === 'Belum Upload'"
          :class="buttonColorClass"
          class="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  description: string
  status: 'Disetujui' | 'Perlu Review' | 'Belum Upload' | string
  uploadDate: string
  fileSize: string
  color?: 'warning' | 'blue' | 'purple' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const bgColorClass = computed(() => {
  const colors = {
    amber: 'bg-amber-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50'
  }
  return colors[props.color] || colors.blue
})

const iconBgClass = computed(() => {
  const colors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  }
  return colors[props.color] || colors.blue
})

const iconColorClass = computed(() => {
  const colors = {
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600'
  }
  return colors[props.color] || colors.blue
})

const buttonColorClass = computed(() => {
  const colors = {
    amber: 'bg-amber-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600'
  }
  return colors[props.color] || colors.blue
})

const statusClass = computed(() => {
  if (props.status === 'Disetujui') return 'bg-green-100 text-green-700'
  if (props.status === 'Perlu Review') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
})
</script>
