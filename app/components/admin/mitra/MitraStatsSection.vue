<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
    <button 
      @click="toggle"
      class="w-full px-6 py-4 flex items-center justify-between text-blue-700 font-bold bg-blue-50/50 hover:bg-blue-50 transition-all"
    >
      <div class="flex items-center gap-2">
        <Icon name="lucide:line-chart" class="w-5 h-5" />
        {{ title }}
      </div>
      <Icon 
        name="lucide:chevron-down" 
        class="w-5 h-5 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    
    <div v-show="isOpen" class="p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
