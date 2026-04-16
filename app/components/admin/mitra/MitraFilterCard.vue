<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-600">
    <div class="flex items-center gap-2 mb-4 text-blue-800 font-bold uppercase text-xs tracking-widest">
      <Icon name="lucide:filter" class="w-4 h-4" />
      {{ title }}
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <slot />
    </div>
  </div>
</template>
