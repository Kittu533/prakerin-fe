<template>
  <div class="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center gap-3">
      <div class="p-2 sm:p-3 rounded-xl shrink-0" :class="bgColorClass">
        <UIcon :name="icon" class="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs sm:text-sm text-slate-500 truncate">{{ label }}</p>
        <p class="text-lg sm:text-2xl font-bold text-slate-900">{{ value }}</p>
        <p v-if="sub" class="text-xs text-slate-500 truncate">{{ sub }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'success' | 'warning' | 'error' | 'purple'
}

const props = withDefaults(defineProps<Props>(), { color: 'blue' })

const bgColorClass = computed(() => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }
  return colors[props.color] || colors.blue
})
</script>
