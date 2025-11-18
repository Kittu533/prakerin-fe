<template>
  <div
    class="group rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:p-7 shadow-sm
           hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            Deadline: {{ deadline }}
          </p>
        </div>
      </div>
      <div class="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 
                  group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-md">
        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
    </div>

    <!-- Title -->
    <h3 class="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 leading-tight
               group-hover:text-blue-600 transition-colors">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
      {{ description }}
    </p>

    <!-- Tags -->
    <div v-if="tags?.length" class="flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 
               px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700
               group-hover:bg-blue-100 transition-colors"
      >
        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        {{ tag }}
      </span>
    </div>

    <!-- Action Button -->
    <div class="mt-5 pt-4 border-t border-slate-100">
      <button class="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold 
                     py-2.5 sm:py-3 px-4 rounded-xl text-sm sm:text-base
                     hover:from-blue-700 hover:to-blue-800 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-all duration-300 shadow-md hover:shadow-lg
                     group-hover:scale-105">
        Lihat Detail Program
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: String, required: true },
  tags: {
    type: Array,
    default: () => [],
  },
})
</script>
