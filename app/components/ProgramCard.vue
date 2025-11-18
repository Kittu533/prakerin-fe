<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
    <div class="p-6">
      <!-- Header with Date and Icon -->
      <div class="flex items-start justify-between mb-4">
        <span class="text-sm text-gray-500">{{ date }}</span>
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 text-sm leading-relaxed mb-6">
        {{ description }}
      </p>

      <!-- Action Button -->
      <button 
        class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
        @click="handleClick"
      >
        <span>Lihat Detail</span>
        <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  date: string
  icon?: string
  programId?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [id: number | undefined]
}>()

const handleClick = () => {
  emit('click', props.programId)
}
</script>